// 友站爬虫配置
export interface FriendLinkCrawl {
  url: string;
  type: 'rss' | 'html';
  html?: {
    posts: string;
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

// 友站
export const friendLinks: FriendLink[] = [
  {
    name: '余弦の博客',
    url: 'https://koharu.cosine.ren',
    crawl: {
      url: 'https://koharu.cosine.ren/rss.xml',
      type: 'rss',
    },
  },
];

// 爬虫配置
export const crawlConfig = {
  crosAPI: 'https://cros-api.rowwus.eu.org/?{url}',
};

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
}

export interface SiteConfig {
  title: string;
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
}

// 网站配置
export const siteConfig: SiteConfig = {
  title: '余弦の博客',
  subtitle: 'WA 的一声就哭了',
  bio: '一个基于 Astro 的现代化博客主题',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cos&backgroundColor=b6e3f4',
  baseUrl: 'https://koharu.cosine.ren',
};

// 社交链接配置
export const socialConfig: SocialConfig = {
  links: [
    { type: 'github', url: 'https://github.com/God-2077', label: 'Github' },
    { type: 'email', url: 'mailto:cos@koharu.top', label: 'Email' },
    { type: 'rss', url: '/rss.xml', label: 'Rss' },
  ],
};


// 文章列表配置（初始为空，由浏览器端动态获取）
export const postsConfig: PostsConfig = {
  desc: 'WA 的一声就哭了',
  content: [],
};

// 完整配置对象
export const config = {
  site: siteConfig,
  social: socialConfig,
  posts: postsConfig,
};

export default config;
