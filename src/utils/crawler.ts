// 导入工具函数
import { parseDate } from './utils';
import { crawlConfig } from '../config/config';


/**
 * 友站爬取相关类型定义
 */
export type CrawlStatus = 'loading' | 'success' | 'error';

export interface CrawlResult {
  posts: import('../config/type').PostItem[];
  status: CrawlStatus;
  error?: string;
}

/**
 * 爬取单个友站文章
 */
export async function crawlFriendLink(friendLink: import('../config/type').FriendLink): Promise<CrawlResult> {
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
export async function crawlAllFriendLinks(friendLinks: import('../config/type').FriendLink[]): Promise<import('../config/type').PostItem[]> {
  const results = await Promise.all(friendLinks.map(crawlFriendLink));
  
  // 合并所有文章
  const allPosts: import('../config/type').PostItem[] = [];
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
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.text();
}

/**
 * 解析 RSS XML 为文章列表
 */
function parseRss(xml: string): import('../config/type').PostItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');
  
  const posts: import('../config/type').PostItem[] = [];
  items.forEach((item, index) => {
    const title = item.querySelector('title')?.textContent?.trim() || '';
    const link = item.querySelector('link')?.textContent?.trim() || '';
    const description = item.querySelector('description')?.textContent?.trim() 
      || item.querySelector('content\\:encoded')?.textContent?.trim()
      || '';
    const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
    const categoryNodes = item.querySelectorAll('category');
    const tags = Array.from(categoryNodes)
      .map(c => c.textContent?.trim())
      .filter((t): t is string => !!t);

    // 提取纯文本内容作为摘要
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    const plainContent = tempDiv.textContent || tempDiv.innerText || '';

    posts.push({
      id: `rss-${index}-${Date.now()}`,
      title,
      content: plainContent,
      date: pubDate,
      path: link,
      tags: tags.length > 0 ? tags : undefined,
    });
  });

  return posts;
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
function parseHtml(_html: string, _htmlConfig: HtmlCrawlConfig): import('../config/type').PostItem[] {
  throw new Error('HTML crawling feature is under development');
}