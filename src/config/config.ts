import type {
    FriendLink,
    SiteConfig,
    SocialConfig,
    PostsConfig,
    RobotsConfigList,
    ProfileConfig,
} from './type';

// 网站配置
export const siteConfig: SiteConfig = {
  title: "FriendFeed - RSS Feed Preview",
  description: "一个基于 RSS Feed 的博客，分享技术、生活、工作等。",
  openGraphImage: 'https://assets.ksable.top/me/gravatar.jpg',
  baseUrl: 'https://friendfeed.ksable.top/',
};

export const profileConfig: ProfileConfig = {
  title: 'Ksable\'s 小屋',
  author: 'kissablecho',
  subtitle: '一个记录生活，分享技术的博客',
  bio: "kissablecho 的个人博客 / 记录生活，分享技术 / 喜欢二次元和白丝。",
  avatar: 'https://assets.ksable.top/me/gravatar.jpg',
  url: 'https://blog.ksable.top/',
};

// 友站
export const friendLinks: FriendLink[] = [
//   {
//     name: "Ksable' 小屋",
//     url: 'https://blog.ksable.top/',
//     crawl: {
//       url: 'https://blog.ksable.top/rss.xml',
//       type: 'rss',
//     },
//   },
  {
    name: "CC米饭",
    url: "https://www.ccrice.com",
    crawl: {
      url: "https://world.ccrice.com/feed/",
      type: "rss"
    }
  },
  {
    name: "鸦鸦的巢穴",
    url: "https://crowya.com",
    crawl: {
      url: "https://crowya.com/feed",
      type: "rss"
    }
  },
  {
    name: "Bensz",
    url: "https://blognas.hwb0307.com",
    crawl: {
      url: "https://blognas.hwb0307.com/feed/",
      type: "rss"
    }
  },
  {
    name: "小稚生活志",
    url: "https://ihello.cc",
    crawl: {
      url: "https://ihello.cc/feed",
      type: "rss"
    }
  },
  {
    name: "Mimosa的小站",
    url: "https://loneapex.cn/",
    crawl: {
      url: "https://loneapex.cn/feed",
      type: "rss"
    }
  },
  {
    name: "湘铭`Blog",
    url: "https://xiangming.site",
    crawl: {
      url: "https://xiangming.site/feed/",
      type: "rss"
    }
  },
  {
    name: "墨希MoXiify",
    url: "https://note.moxiify.cn/",
    crawl: {
      url: "https://note.moxiify.cn/feed/",
      type: "rss"
    }
  },
  {
    name: "obaby",
    url: "https://zhongxiaojie.cn/",
    crawl: {
      url: "https://zhongxiaojie.cn/feed",
      type: "rss"
    }
  },
  {
    name: "拂晓不辍",
    url: "https://eggk.net/",
    crawl: {
      url: "https://eggk.net/feed/",
      type: "rss"
    }
  },
  {
    name: "云藉",
    url: "https://kumosya.top/",
    crawl: {
      url: "https://kumosya.top/atom.xml",
      type: "rss"
    }
  },
  {
    name: "彬红茶日记",
    url: "https://note.redcha.cn/",
    crawl: {
      url: "https://note.redcha.cn/rss.xml",
      type: "rss"
    }
  },
  {
    name: "Horean's Blog",
    url: "https://blog.hxrch.top",
    crawl: {
      url: "https://blog.hxrch.top/rss.xml",
      type: "rss"
    }
  },
  {
    name: "傲雪の",
    url: "https://b.oxue.de",
    crawl: {
      url: "https://b.oxue.de/rss.xml",
      type: "rss"
    }
  }
];

// 爬虫配置
export const crawlConfig = {
  crosAPI: 'https://cros-api.rowwus.eu.org/?{url}',
  timeout:8000, // 超时时间，单位毫秒
};


// 社交链接配置
export const socialConfig: SocialConfig = {
  links: [
    { type: 'github', url: 'https://github.com/God-2077', label: 'Github' },
    { type: 'email', url: 'mailto:kissablecho@qq.com', label: 'Email' },
    { type: 'rss', url: siteConfig.baseUrl + 'rss.xml', label: 'Rss' },
  ],
};


// 文章列表配置（初始为空，由浏览器端动态获取）
export const postsConfig: PostsConfig = {
  desc: '友链文章聚合，按发布时间倒序排序',
  content: [],
  maxCount: 30,
  summaryLength: 200,
};

// Robots 配置
export const robotsConfig: RobotsConfigList = {
  robots: [
    {
      userAgent: '*',
      disallow: ['/'],
    },
  ],
};



// 完整配置对象
export const config = {
  site: siteConfig,
  social: socialConfig,
  posts: postsConfig,
  profile: profileConfig,
  robots: robotsConfig,
};

export default config;
