import type { FriendLink, PostItem } from '../config/config';
import { crawlConfig } from '../config/config';

/** 友站爬取状态 */
export type CrawlStatus = 'loading' | 'success' | 'error';

/** 友站爬取结果 */
export interface CrawlResult {
  posts: PostItem[];
  status: CrawlStatus;
  error?: string;
}

/**
 * 解析多种日期格式
 * 支持格式：
 * - "2026-04-05 10:00:00"
 * - "2026-04-04"
 * - "2026 年 4 月 5 日"
 * - "2026/04/05"
 * - "Apr 5, 2026"
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  const trimmed = dateStr.trim();
  
  // 格式1: "2026-04-05 10:00:00" 或 "2026-04-04"
  let match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?$/);
  if (match) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
  }

  // 格式2: "2026 年 4 月 5 日" (中文格式)
  match = trimmed.match(/^(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // 格式3: "2026/04/05"
  match = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // 格式4: "Apr 5, 2026" 或 "April 5, 2026"
  const englishDate = new Date(trimmed);
  if (!isNaN(englishDate.getTime())) {
    return englishDate;
  }

  // 格式5: "5 Apr 2026"
  match = trimmed.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (match) {
    const [, day, monthStr, year] = match;
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIndex = monthNames.findIndex(m => monthStr.toLowerCase().startsWith(m));
    if (monthIndex >= 0) {
      return new Date(parseInt(year), monthIndex, parseInt(day));
    }
  }

  // 尝试直接解析
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * 格式化日期用于比较（YYYY-MM-DD）
 */
export function formatDateForCompare(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 截断文本到指定长度，超出部分显示省略号
 */
export function truncateText(text: string, maxLength: number = 200): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
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
function parseRss(xml: string): PostItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');
  
  const posts: PostItem[] = [];
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

/**
 * 将简易 xpath 转换为 CSS 选择器
 * 支持格式:
 * - /html/body/div[2]/main -> querySelector('html body main div:nth-child(2)')
 * - div[2]/div[1] -> querySelector('div:nth-child(2) div:nth-child(1)')
 * - @href -> getAttribute('href')
 * - text() -> textContent
 */
function xpathToSelector(xpath: string): { selector: string; isAttribute: boolean; attributeName?: string } {
  // 处理属性选择，如 @href, @src
  const attrMatch = xpath.match(/@(\w+)$/);
  if (attrMatch) {
    return {
      selector: xpath.replace(/@\w+$/, ''),
      isAttribute: true,
      attributeName: attrMatch[1],
    };
  }

  // 处理 text() 选择器
  if (xpath.endsWith('/text()')) {
    return {
      selector: xpath.replace(/\/text\(\)$/, ''),
      isAttribute: false,
    };
  }

  return { selector: xpath, isAttribute: false };
}

/**
 * 转换 xpath 为 DOM 选择器
 * 例如: "/html/body/div[2]/main/div/div[2]/div[2]/div[1]" 
 * 转换为: "html body main div:nth-child(2) div:nth-child(2) div:nth-child(1)"
 */
function convertXpathToCss(xpath: string): string {
  const parts = xpath.split('/').filter(Boolean);
  
  return parts.map((part, index) => {
    // 跳过根路径 /
    if (index === 0 && part === '') return '';
    
    // 处理带索引的选择器，如 div[2]
    const match = part.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      return `${match[1]}:nth-child(${match[2]})`;
    }
    
    // 普通标签选择器
    return part;
  }).join(' ')
    .replace(/^\\s+/, '')
    .replace(/\\s+/g, ' ')
    .trim();
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
function parseHtml(html: string, htmlConfig: HtmlCrawlConfig): PostItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // 获取文章列表容器
  const postsSelector = convertXpathToCss(htmlConfig.posts);
  const postsContainer = doc.querySelector(postsSelector);
  
  if (!postsContainer) {
    console.warn('Posts container not found:', postsSelector);
    return [];
  }
  
  // 获取每篇文章的容器（基于 children 或子选择器）
  // 简化处理：假设 posts 容器下的直接子元素是文章
  const articleElements = postsContainer.children;
  
  const posts: PostItem[] = [];
  Array.from(articleElements).forEach((article, index) => {
    try {
      // 解析 title
      let title = '';
      if (htmlConfig.title) {
        const titleCfg = xpathToSelector(htmlConfig.title);
        if (titleCfg.isAttribute && titleCfg.attributeName) {
          title = article.getAttribute(titleCfg.attributeName) || '';
        } else {
          const titleEl = article.querySelector(titleCfg.selector);
          title = titleEl?.textContent?.trim() || '';
        }
      }
      
      // 解析 url
      let url = '';
      if (htmlConfig.url) {
        const urlCfg = xpathToSelector(htmlConfig.url);
        if (urlCfg.isAttribute && urlCfg.attributeName) {
          url = article.getAttribute(urlCfg.attributeName) || '';
        } else {
          const urlEl = article.querySelector(urlCfg.selector);
          url = urlEl?.getAttribute('href') || urlEl?.getAttribute('src') || '';
        }
      }
      
      // 解析 content
      let content = '';
      if (htmlConfig.content) {
        const contentCfg = xpathToSelector(htmlConfig.content);
        if (contentCfg.isAttribute && contentCfg.attributeName) {
          content = article.getAttribute(contentCfg.attributeName) || '';
        } else {
          const contentEl = article.querySelector(contentCfg.selector);
          content = contentEl?.textContent?.trim() || '';
        }
      }
      
      // 解析 date
      let date = '';
      if (htmlConfig.date) {
        const dateCfg = xpathToSelector(htmlConfig.date);
        if (dateCfg.isAttribute && dateCfg.attributeName) {
          date = article.getAttribute(dateCfg.attributeName) || '';
        } else {
          const dateEl = article.querySelector(dateCfg.selector);
          date = dateEl?.textContent?.trim() || '';
        }
      }
      
      // 解析 tags
      let tags: string[] | undefined;
      if (htmlConfig.tags) {
        const tagsCfg = xpathToSelector(htmlConfig.tags);
        if (tagsCfg.isAttribute && tagsCfg.attributeName) {
          const tagValue = article.getAttribute(tagsCfg.attributeName);
          const splitTags = tagValue ? tagValue.split(',').map(t => t.trim()).filter((t): t is string => !!t) : undefined;
          tags = splitTags && splitTags.length > 0 ? splitTags : undefined;
        } else {
          const tagEls = article.querySelectorAll(tagsCfg.selector);
          tags = Array.from(tagEls)
            .map(el => el.textContent?.trim())
            .filter((t): t is string => !!t);
        }
      }
      
      // 解析 categorys
      let category: string | undefined;
      if (htmlConfig.categorys) {
        const catCfg = xpathToSelector(htmlConfig.categorys);
        if (catCfg.isAttribute && catCfg.attributeName) {
          category = article.getAttribute(catCfg.attributeName) || undefined;
        } else {
          const catEl = article.querySelector(catCfg.selector);
          category = catEl?.textContent?.trim() || undefined;
        }
      }
      
      if (title) {
        posts.push({
          id: `html-${index}-${Date.now()}`,
          title,
          content,
          date,
          path: url,
          tags,
          category,
        });
      }
    } catch (e) {
      console.warn('Failed to parse article:', index, e);
    }
  });
  
  return posts;
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
      
      // 按发布时间倒序排序
      posts.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime();
      });

      return { posts, status: 'success' };
    }
    
    if (friendLink.crawl.type === 'html') {
      if (!friendLink.crawl.html) {
        return { posts: [], status: 'error', error: 'Missing HTML config' };
      }
      
      const html = await fetchWithCros(crawlUrl);
      const posts = parseHtml(html, friendLink.crawl.html);
      
      // 按发布时间倒序排序
      posts.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime();
      });

      return { posts, status: 'success' };
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