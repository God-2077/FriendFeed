// 导入工具函数
import { parseDate } from './utils';
import { crawlConfig } from '../config/config';
import type { FriendLink, PostItem } from '../config/type';
import axios from 'axios';

/**
 * 友站爬取相关类型定义
 */
export type CrawlStatus = 'loading' | 'success' | 'error';

export interface CrawlResult {
  posts: PostItem[];
  status: CrawlStatus;
  error?: string;
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
  
  // 检查是否是 Atom 格式
  const isAtom = doc.querySelector('feed') !== null;
  const isRss1 = doc.querySelector('rdf\\:RDF, RDF') !== null;
  
  if (isAtom) {
    // 处理 Atom 格式
    const entries = doc.querySelectorAll('entry');
    
    entries.forEach((entry, index) => {
      const title = entry.querySelector('title')?.textContent?.trim() || '';
      const link = getAtomLink(entry);
      const content = getAtomContent(entry);
      const pubDate = entry.querySelector('published, updated')?.textContent?.trim() || '';
      const categoryNodes = entry.querySelectorAll('category');
      const tags = Array.from(categoryNodes)
        .map(c => c.getAttribute('term') || c.textContent?.trim())
        .filter((t): t is string => !!t);

      // 提取纯文本内容作为摘要
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainContent = tempDiv.textContent || tempDiv.innerText || '';

      posts.push({
        id: `atom-${index}-${Date.now()}`,
        title,
        content: plainContent,
        date: pubDate,
        path: link,
        tags: tags.length > 0 ? tags : undefined,
      });
    });
    
  } else if (isRss1) {
    // 处理 RSS 1.0 (RDF) 格式
    const items = doc.querySelectorAll('item');
    
    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      
      // RSS 1.0 的 link 可能在 rdf:about 属性中
      let link = item.querySelector('link')?.textContent?.trim() || '';
      if (!link) {
        link = item.getAttribute('rdf:about') || item.getAttribute('about') || '';
      }
      
      const description = item.querySelector('description')?.textContent?.trim() 
        || item.querySelector('content\\:encoded')?.textContent?.trim()
        || '';
      const pubDate = item.querySelector('dc\\:date, date, pubDate')?.textContent?.trim() || '';
      
      // RSS 1.0 的 category 可能在 dc:subject 中
      const subjectNodes = item.querySelectorAll('dc\\:subject');
      const categoryNodes = item.querySelectorAll('category');
      
      const tags: string[] = [];
      subjectNodes.forEach(s => {
        const text = s.textContent?.trim();
        if (text) tags.push(text);
      });
      categoryNodes.forEach(c => {
        const text = c.textContent?.trim();
        if (text) tags.push(text);
      });

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description;
      const plainContent = tempDiv.textContent || tempDiv.innerText || '';

      posts.push({
        id: `rss1-${index}-${Date.now()}`,
        title,
        content: plainContent,
        date: pubDate,
        path: link,
        tags: tags.length > 0 ? tags : undefined,
      });
    });
    
  } else {
    // 处理 RSS 2.0 格式
    const items = doc.querySelectorAll('item');
    
    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '';
      const description = item.querySelector('description')?.textContent?.trim() 
        || item.querySelector('content\\:encoded')?.textContent?.trim()
        || '';
      const pubDate = item.querySelector('pubDate, dc\\:date')?.textContent?.trim() || '';
      const categoryNodes = item.querySelectorAll('category');
      const tags = Array.from(categoryNodes)
        .map(c => c.textContent?.trim())
        .filter((t): t is string => !!t);

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description;
      const plainContent = tempDiv.textContent || tempDiv.innerText || '';

      posts.push({
        id: `rss2-${index}-${Date.now()}`,
        title,
        content: plainContent,
        date: pubDate,
        path: link,
        tags: tags.length > 0 ? tags : undefined,
      });
    });
  }

  return posts;
}

/**
 * 获取 Atom 格式的链接
 */
function getAtomLink(entry: Element): string {
  // Atom 的 link 元素可能有 href 属性
  const linkEl = entry.querySelector('link');
  if (linkEl) {
    const href = linkEl.getAttribute('href');
    if (href) {
      return href;
    }
  }
  
  // 如果没有 href 属性，尝试获取文本内容
  return linkEl?.textContent?.trim() || '';
}

/**
 * 获取 Atom 格式的内容
 */
function getAtomContent(entry: Element): string {
  // 优先尝试获取 content
  const contentEl = entry.querySelector('content');
  if (contentEl) {
    const type = contentEl.getAttribute('type');
    if (type === 'html' || type === 'xhtml') {
      return contentEl.textContent?.trim() || '';
    } else if (type === 'text') {
      return contentEl.textContent?.trim() || '';
    } else {
      // 默认处理为文本
      return contentEl.textContent?.trim() || '';
    }
  }
  
  // 如果没有 content，尝试获取 summary
  const summary = entry.querySelector('summary')?.textContent?.trim() || '';
  return summary;
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