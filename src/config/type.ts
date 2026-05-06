
import { type GenerateSWOptions, type InjectManifestOptions } from "workbox-build";

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

export interface FriendLinkGroup {
  name: string;
  links: FriendLink[];
}

export interface AppData {
  groups: FriendLinkGroup[];
  activeGroupIndex: number;
}

// 类型定义
export interface SocialLink {
  type: 'github' | 'email' | 'rss' | 'bilibili' | 'twitter' | 'custom';
  url: string;
  label: string;
}

export interface CrawlDelta {
  added: FriendLink[];
  removed: string[];
  edited: FriendLink[];
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
  title: string;
  description: string;
  openGraphImage: string;
  baseUrl: string;
}

export interface ProfileConfig {
  title: string;
  author: string;
  subtitle: string;
  bio: string;
  avatar: string;
  url: string;
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


export interface RobotsConfig {
  userAgent: string;
  disallow?: string[];
  allow?: string[];
  Sitemap?: string;
}

export interface RobotsConfigList {
  robots: RobotsConfig[];
}


export interface ServiceWorkerConfig {
  enabled: boolean;
  workbox?: GenerateSWOptions | InjectManifestOptions;
}