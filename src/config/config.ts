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


// 文章列表配置
export const postsConfig: PostsConfig = {
  desc: 'WA 的一声就哭了',
  content: [
    {
      id: '1',
      title: '使用 React Compiler 优化应用性能',
      content: 'React Compiler 是 Facebook 推出的新一代编译器，它能够自动优化 React 组件的渲染性能，减少不必要的重渲染。通过对代码的静态分析，编译器可以生成更高效的 JavaScript 代码。',
      date: '2026-04-05',
      path: 'https://koharu.cosine.ren/post/react-compiler',
      category: '技术',
      tags: ['React', '性能优化', '前端'],
    },
    {
      id: '2',
      title: 'TypeScript 5.0 新特性解析',
      content: 'TypeScript 5.0 带来了众多新特性，包括装饰器标准支持、const 类型参数、速度提升等。本文将详细介绍这些新特性和使用场景。',
      date: '2026-04-03',
      path: 'https://koharu.cosine.ren/post/typescript-5',
      category: '技术',
      tags: ['TypeScript', 'JavaScript'],
    },
    {
      id: '3',
      title: 'Vite 生态工具链完全指南',
      content: 'Vite 不仅仅是一个构建工具，它背后有一整套完整的生态体系。本文将带你了解 Vite 生态中的各种工具和最佳实践。',
      date: '2026-04-01',
      path: 'https://koharu.cosine.ren/post/vite-ecosystem',
      category: '技术',
      tags: ['Vite', '前端工程化'],
    },
    {
      id: '4',
      title: 'CSS 动画与过渡效果实战',
      content: '现代 CSS 提供了强大的动画和过渡能力。本文通过多个实战案例，展示如何创建流畅、吸引人的交互动画效果。',
      date: '2026-03-28',
      path: 'https://koharu.cosine.ren/post/css-animation',
      category: '设计',
      tags: ['CSS', '动画', 'UI'],
    },
    {
      id: '5',
      title: 'Node.js 后端架构设计原则',
      content: '构建可扩展的 Node.js 后端服务需要遵循一些核心设计原则。本文讨论模块化、错误处理、性能优化等关键话题。',
      date: '2026-03-25',
      path: 'https://koharu.cosine.ren/post/node-architecture',
      category: '后端',
      tags: ['Node.js', '架构设计'],
    },
    {
      id: '6',
      title: 'Tailwind CSS 实用技巧分享',
      content: 'Tailwind CSS 的实用技巧与最佳实践，帮助你更高效地使用这个 utility-first CSS 框架。',
      date: '2026-03-20',
      path: 'https://koharu.cosine.ren/post/tailwind-tips',
      category: '设计',
      tags: ['Tailwind', 'CSS', '前端'],
    },
  ],
};

// 完整配置对象
export const config = {
  site: siteConfig,
  social: socialConfig,
  posts: postsConfig,
};

export default config;
