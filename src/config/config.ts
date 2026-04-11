import type {
    FriendLink,
    SiteConfig,
    SocialConfig,
    PostsConfig,
} from './type';

// 网站配置
export const siteConfig: SiteConfig = {
  title: 'Ksable\'s 小屋',
  subtitle: 'WA 的一声就哭了',
  bio: "一个记录生活，分享技术的博客",
  avatar: 'https://assets.ksable.top/me/gravatar.jpg',
  baseUrl: 'https://blog.ksable.top/',
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
    name: "Horean’s Blog",
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
  maxCount: 20,
};

// 完整配置对象
export const config = {
  site: siteConfig,
  social: socialConfig,
  posts: postsConfig,
};

export default config;
