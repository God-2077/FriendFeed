// 友站爬虫配置
export interface FriendLinkCrawl {
  url: string;
  type: 'rss' | 'html';
  html?: {
    posts: string;
    // 以下各项基于 posts 元素的 xpath
    title: string;
    url: string;
    content?: string;
    date?: string;
    tags?: string;
    categorys?: string;
  };
}

// 友站接口
export interface FriendLink {
  name: string;
  url: string;
  crawl: FriendLinkCrawl;
}

// 类型定义
export interface SocialLink {
  type: 'github' | 'email' | 'rss' | 'bilibili' | 'twitter' | 'custom';
  url: string;
  label: string;
}

export interface PostItem {
  id: string;
  title: string;
  content: string;
  date: string;
  path: string;
  category?: string;
  tags?: string[];
  friendLinkName?: string;
  friendLinkUrl?: string;
}

export interface SiteConfig {
  pageTitle: string;
  title: string;
  author: string;
  subtitle: string;
  bio: string;
  avatar: string;
  baseUrl: string;
}

export interface SocialConfig {
  links: SocialLink[];
}

export interface PostsConfig {
  desc: string;
  content: PostItem[];
  maxCount: number;
  summaryLength: number;
}
