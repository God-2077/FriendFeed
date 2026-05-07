// 导入工具函数
import { parseDate } from '@utils/utils';
import { crawlConfig } from '@config/config';
import type { FriendLink, PostItem } from '@config/type';
import axios from 'axios';
import sanitizeHtml from 'sanitize-html';

/**
 * 友站爬取相关类型定义
 */
export type CrawlStatus = 'loading' | 'success' | 'error';

export interface CrawlResult {
  posts: PostItem[];
  status: CrawlStatus;
  error?: string;
}

const sanitizeHtmlOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'figure', 'figcaption', 'video', 'source',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'del', 'sub', 'sup', 'hr', 'span', 'div', 'pre', 'code',
  ]),
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    video: ['src', 'controls', 'width', 'height'],
    source: ['src', 'type'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  ...(crawlConfig.proxyImages ? {
    transformTags: {
      img: (tagName: string, attribs: Record<string, string>) => {
        if (attribs.src && !attribs.src.startsWith('data:')) {
          attribs.src = crawlConfig.crosAPI.replace('{url}', encodeURIComponent(attribs.src));
        }
        return { tagName, attribs };
      },
    },
  } : {}),
};

function sanitizeContent(html: string): string {
  if (!html) return '';
  return sanitizeHtml(html, sanitizeHtmlOptions);
}

/**
 * 爬取单个友站文章
 */
export async function crawlFriendLink(friendLink: FriendLink): Promise<CrawlResult> {
  try {
    const crawlUrl = friendLink.crawl.url;
    
    if (friendLink.crawl.type === 'rss') {
      const xml = await fetchWithCros(crawlUrl);
      const posts = parseRss(xml);
      
      // 为每篇文章添加友站信息
      const postsWithFriendLink = posts.map(post => ({
        ...post,
        friendLinkName: friendLink.name,
        friendLinkUrl: friendLink.url
      }));
      
      // 按发布时间倒序排序
      postsWithFriendLink.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime();
      });

      if (postsWithFriendLink.length === 0) {
        return { posts: [], status: 'error', error: 'No posts found' };
      }

      return { posts: postsWithFriendLink, status: 'success' };
    }
    
    if (friendLink.crawl.type === 'html') {
      if (!friendLink.crawl.html) {
        return { posts: [], status: 'error', error: 'Missing HTML config' };
      }
      
      const html = await fetchWithCros(crawlUrl);
      const posts = parseHtml(html, friendLink.crawl.html);
      
      // 为每篇文章添加友站信息
      const postsWithFriendLink = posts.map(post => ({
        ...post,
        friendLinkName: friendLink.name,
        friendLinkUrl: friendLink.url
      }));
      
      // 按发布时间倒序排序
      postsWithFriendLink.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime();
      });

      if (postsWithFriendLink.length === 0) {
        return { posts: [], status: 'error', error: 'No posts found' };
      }

      return { posts: postsWithFriendLink, status: 'success' };
    }

    return { posts: [], status: 'error', error: 'Unsupported crawl type' };
  } catch (error) {
    return { 
      posts: [], 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 爬取所有友站文章
 */
export async function crawlAllFriendLinks(friendLinks: FriendLink[]): Promise<PostItem[]> {
  const results = await Promise.all(friendLinks.map(crawlFriendLink));
  
  // 合并所有文章
  const allPosts: PostItem[] = [];
  results.forEach(result => {
    allPosts.push(...result.posts);
  });

  // 按发布时间倒序排序
  allPosts.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.getTime() - dateA.getTime();
  });

  return allPosts;
}

/**
 * 通过 Cros API 获取远程内容
 */
async function fetchWithCros(url: string): Promise<string> {
  const proxyUrl = crawlConfig.crosAPI.replace('{url}', encodeURIComponent(url));
  const response = await axios.get(proxyUrl, { timeout: crawlConfig.timeout });
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.data;
}

/**
 * 解析 RSS/Atom XML 为文章列表
 * 兼容 RSS 2.0, RSS 1.0 (RDF), Atom 1.0
 */
function parseRss(xml: string): PostItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const posts: PostItem[] = [];

  const isAtom = doc.querySelector('feed') !== null;

  if (isAtom) {
    const entries = doc.querySelectorAll('entry');

    entries.forEach((entry, index) => {
      const title = entry.querySelector('title')?.textContent?.trim() || '';
      const link = getAtomLink(entry);
      const fullContentHtml = getAtomElementHtml(entry, 'content');
      const summaryHtml = getAtomElementHtml(entry, 'summary') || fullContentHtml;
      const pubDate = entry.querySelector('published, updated')?.textContent?.trim() || '';
      const categoryNodes = entry.querySelectorAll('category');
      const tags = Array.from(categoryNodes)
        .map(c => c.getAttribute('term') || c.textContent?.trim())
        .filter((t): t is string => !!t);

      // 从摘要提取纯文本用于卡片展示
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = summaryHtml;
      const plainContent = tempDiv.textContent || tempDiv.innerText || '';

      posts.push({
        id: `atom-${index}-${Date.now()}`,
        title,
        content: plainContent,
        contentHtml: sanitizeContent(fullContentHtml),
        date: pubDate,
        path: link,
        tags: tags.length > 0 ? tags : undefined,
      });
    });

  } else {
    // RSS 2.0 / RSS 1.0 (RDF) 统一处理
    const items = doc.querySelectorAll('item');

    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';

      // RSS 1.0 的 link 可能在 rdf:about 属性中
      let link = item.querySelector('link')?.textContent?.trim() || '';
      if (!link) {
        link = item.getAttribute('rdf:about') || item.getAttribute('about') || '';
      }

      const fullContentHtml = getContentEncodedHtml(item)
        || item.querySelector('description')?.textContent?.trim()
        || '';
      const summaryHtml = item.querySelector('description')?.textContent?.trim()
        || fullContentHtml;

      const pubDate = item.querySelector('pubDate, dc\\:date, date')?.textContent?.trim() || '';

      // 提取标签
      const tags: string[] = [];
      const subjectNodes = item.querySelectorAll('dc\\:subject');
      const categoryNodes = item.querySelectorAll('category');
      subjectNodes.forEach(s => {
        const text = s.textContent?.trim();
        if (text) tags.push(text);
      });
      categoryNodes.forEach(c => {
        const text = c.textContent?.trim();
        if (text) tags.push(text);
      });

      // 从摘要提取纯文本用于卡片展示
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = summaryHtml;
      const plainContent = tempDiv.textContent || tempDiv.innerText || '';

      const prefix = doc.querySelector('rdf\\:RDF, RDF') ? 'rss1' : 'rss2';

      posts.push({
        id: `${prefix}-${index}-${Date.now()}`,
        title,
        content: plainContent,
        contentHtml: sanitizeContent(fullContentHtml),
        date: pubDate,
        path: link,
        tags: tags.length > 0 ? tags : undefined,
      });
    });
  }

  return posts;
}

/**
 * 获取 Atom 元素的内容 (content 或 summary)
 * 对于 type="html"/"xhtml" 的子节点会被序列化为 HTML 字符串
 * 对于 type="text" 或无 type 属性返回 textContent
 */
function getAtomElementHtml(entry: Element, tagName: string): string {
  const el = entry.querySelector(tagName);
  if (!el) return '';

  const type = el.getAttribute('type') || 'text';

  if (type === 'html' || type === 'xhtml') {
    // 将 XML 子节点克隆到 HTML div 中以获得正确的 HTML 字符串
    if (el.childNodes.length === 0) return '';
    const container = document.createElement('div');
    for (const child of Array.from(el.childNodes)) {
      container.appendChild(child.cloneNode(true));
    }
    return container.innerHTML;
  }

  return el.textContent?.trim() || '';
}

/**
 * 获取 RSS content:encoded 元素的内容 (通过 localName 查找以兼容命名空间)
 */
function getContentEncodedHtml(item: Element): string {
  for (const child of Array.from(item.children)) {
    if (child.localName === 'encoded') {
      return child.textContent?.trim() || '';
    }
  }
  return '';
}

interface HtmlCrawlConfig {
  posts: string;
  title: string;
  url: string;
  content?: string;
  date?: string;
  tags?: string;
  categorys?: string;
}

/**
 * 解析 HTML 为文章列表（基于 xpath 配置）
 */
function parseHtml(_html: string, _htmlConfig: HtmlCrawlConfig): PostItem[] {
  throw new Error('HTML crawling feature is under development');
}
