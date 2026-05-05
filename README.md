<!--
<div align="center">
  <img src="https://socialify.git.ci/God-2077/FriendFeed/image?font=JetBrains+Mono&language=1&name=1&owner=1&pattern=Circuit+Board&theme=Auto" alt="FriendFeed" width="640" height="320" />
</div>
<div align="center">
  <a href="https://github.com/God-2077/FriendFeed/releases">
    <img src="https://img.shields.io/github/release/God-2077/FriendFeed.svg?color=0366d6" alt="Latest Release">
  </a>
  <a href="https://github.com/God-2077/FriendFeed/releases">
    <img src="https://img.shields.io/github/release-date/God-2077/FriendFeed.svg?color=28a745" alt="Release Date">
  </a>
  <a href="https://github.com/God-2077/FriendFeed/commits/main/">
    <img src="https://img.shields.io/github/commit-activity/t/God-2077/FriendFeed?color=6f42c1" alt="GitHub commit activity">
  </a>
  <a href="https://github.com/God-2077/FriendFeed#GPL-3.0-1-ov-file">
    <img src="https://img.shields.io/github/license/God-2077/FriendFeed?color=ff5722" alt="GitHub License">
  </a>
</div>
<br />
-->

# FriendFeed - 友链文章聚合平台

## 项目概述

FriendFeed 是一个基于 Astro + React 开发的友链文章聚合平台。它可以自动爬取并展示多个友站的最新 RSS/Atom 文章，按发布时间倒序排列，支持多级分组管理、交互式友站筛选，为用户提供一个集中浏览友链内容的高颜值工具。

平台采用 **Astro Islands 架构**，静态内容由 Astro 服务端渲染，动态交互（文章列表、管理面板）作为 React 客户端 Islands 运行，兼顾性能与交互体验。

**演示地址**：https://friendfeed.ksable.top/

![screenshot](https://github.com/user-attachments/assets/b5a75194-bbd4-459a-b1ed-0133f7940f65)

## 核心功能

- **多格式 RSS/Atom 支持**：自动识别并解析 RSS 2.0、RSS 1.0 (RDF)、Atom 1.0 三种主流格式
- **多分组管理**：支持创建多组友链，每组独立展示，方便将友站按类型或个人喜好归类
- **文章实时聚合**：客户端并行爬取所有友站，合并后按发布时间倒序展示，确保最新内容优先
- **友站状态监控**：每个友站独立显示爬取进度（加载中 / 成功 / 失败），便于快速定位失效链接
- **按友站筛选**：一键切换只看某个友站的文章，支持 URL 参数 `?friend=友站名称` 直接定位
- **管理面板**：隐藏式管理后台（双击标题或 `Ctrl+Shift+K` 唤出），可随时添加/编辑/删除友站与分组
- **配置导入导出**：一键将当前分组或全部配置导出为 TypeScript 代码，方便直接粘贴到 `config.ts` 中持久化
- **响应式设计**：适配桌面端、平板、手机，移动端美化和手势优化
- **PWA 支持**：内置 Service Worker，支持离线访问和快速加载（需 HTTPS 环境）
- **动态 robots.txt**：根据配置自动生成爬虫规则，对搜索引擎友好
- **SEO 优化**：完整的 Open Graph 和 Twitter Card 元标签，提升分享预览效果

## 技术栈

| 技术 | 说明 |
|------|------|
| **框架** | Astro 5.0 |
| **动态交互** | React 19.2 (客户端 Islands) |
| **语言** | TypeScript (strict) |
| **样式** | CSS 自定义变量 + Remixicon 图标库 |
| **HTTP** | Axios |
| **爬虫** | 客户端 RSS/Atom 解析（DOMParser） |
| **状态管理** | React Context + useState/useEffect |
| **持久化** | localStorage（管理面板修改自动保存） |
| **PWA** | Workbox 6 + astrojs-service-worker |
| **包管理器** | pnpm |

## 项目结构

```
friendfeed/
├── public/                     # 静态资源
│   └── favicon.svg
├── raw/                        # 原始 HTML/CSS 模板（参考用）
│   ├── feed.css
│   └── index.html
├── src/
│   ├── components/
│   │   ├── react/              # React Islands（客户端动态组件）
│   │   │   ├── ArticleCard.tsx    # 文章卡片
│   │   │   ├── ArticleList.tsx    # 文章列表 + 友站筛选
│   │   │   ├── AdminPanel.tsx     # 管理面板（分组/友站 CRUD + 导出）
│   │   │   └── FeedIsland.tsx     # 客户端入口，包裹上下文
│   │   ├── Background.astro       # 动态背景
│   │   ├── Footer.astro
│   │   ├── ProfileHeader.astro    # 个人信息卡
│   │   └── SocialLinks.astro      # 社交链接
│   ├── config/
│   │   ├── config.ts              # 核心配置（站点、友链、爬虫、社交等）
│   │   └── type.ts                # 全部 TypeScript 类型定义
│   ├── context/
│   │   └── AppContext.tsx          # React Context 提供全局状态
│   ├── hooks/
│   │   └── useFriendFeedStore.ts   # 友链状态管理 Hook（localStorage 持久化）
│   ├── layouts/
│   │   └── Layout.astro           # 全局布局（HTML 头、SEO 元标签、全局样式引入）
│   ├── pages/
│   │   ├── index.astro            # 首页
│   │   └── robots.txt.ts          # 动态生成 robots.txt
│   ├── styles/
│   │   ├── feed.css               # 主样式（Kawaii ACG 主题）
│   │   └── index.css              # 全局重置与滚动条样式
│   └── utils/
│       ├── crawler.ts             # 爬虫核心（CORS代理 + RSS/Atom 解析）
│       └── utils.ts               # 通用工具（日期解析、文本截断）
├── astro.config.mjs               # Astro 配置（React集成、别名、PWA）
├── eslint.config.js
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── LICENSE                        # AGPL-3.0
└── README.md
```

## 安装与配置

### 环境要求

- Node.js 18.0 或更高版本
- pnpm 7.0 或更高版本

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd friendfeed

# 2. 安装依赖
pnpm install

# 3. 配置站点与友链（见下方说明）
# 编辑 src/config/config.ts

# 4. 启动开发服务器
pnpm dev
```

### 配置说明

所有主要配置集中在 `src/config/config.ts` 文件中。

#### 1. 网站元数据 `siteConfig`

```ts
export const siteConfig: SiteConfig = {
  title: "FriendFeed - RSS Feed Preview",
  description: "一个基于 RSS Feed 的博客聚合平台",
  openGraphImage: 'https://your-domain.com/og-image.jpg',
  baseUrl: 'https://your-domain.com/',
};
```

#### 2. 个人资料 `profileConfig`

```ts
export const profileConfig: ProfileConfig = {
  title: "你的标题",
  author: "你的名字",
  subtitle: "副标题",
  bio: "简介描述",
  avatar: "https://your-avatar.jpg",
  url: "https://your-blog.com",
};
```

#### 3. 多组友站 `friendLinkGroups`

支持多个分组，每个分组包含一组友站链接。

```ts
export const friendLinkGroups: FriendLinkGroup[] = [
  {
    name: '友站',
    links: [
      {
        name: "示例博客",
        url: "https://example.com",
        crawl: {
          url: "https://example.com/feed",
          type: "rss"
        }
      }
      // 更多友站...
    ]
  },
  {
    name: '技术圈',
    links: [ /* ... */ ]
  }
];
```

##### `FriendLink` 类型说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 友站显示名称 |
| `url` | string | 友站首页地址 |
| `crawl.url` | string | RSS/Atom 订阅地址 |
| `crawl.type` | `'rss'` \| `'html'` | 爬取类型（HTML 暂不可用） |

#### 4. 爬虫代理 `crawlConfig`

默认使用 CORS 代理访问跨域 RSS 源，可替换为自己的代理或直连（如允许 CORS）。

```ts
export const crawlConfig = {
  crosAPI: 'https://cros-api.rowwus.eu.org/?{url}',
  timeout: 8000, // 请求超时（毫秒）
};
```

#### 5. 社交链接 `socialConfig`

```ts
export const socialConfig: SocialConfig = {
  links: [
    { type: 'github', url: 'https://github.com/your-username', label: 'Github' },
    { type: 'email', url: 'mailto:you@example.com', label: 'Email' },
    { type: 'rss', url: siteConfig.baseUrl + 'rss.xml', label: 'Rss' },
  ],
};
```

支持的 `type`：`github`, `email`, `rss`, `bilibili`, `twitter`, `custom`。

#### 6. 文章配置 `postsConfig`

```ts
export const postsConfig: PostsConfig = {
  desc: '友链文章聚合，按发布时间倒序排序',
  content: [],          // 留空，由客户端动态获取
  maxCount: 30,         // 最大显示文章数
  summaryLength: 200,   // 摘要截断长度
};
```

#### 7. 爬虫规则 `robotsConfig`

自动生成 `/robots.txt`，可在此配置允许或禁止的爬虫。

```ts
export const robotsConfig: RobotsConfigList = {
  robots: [
    {
      userAgent: '*',
      disallow: ['/'],
    },
  ],
};
```

#### 8. Service Worker `serviceWorkerConfig`

```ts
export const serviceWorkerConfig: ServiceWorkerConfig = {
  enabled: true,
  // 可选：传入自定义 workbox 配置
  // workbox: { ... }
};
```

## 使用方法

### 开发模式

```bash
pnpm dev
```

访问 `http://localhost:4321`，支持热重载。

### 构建与预览

```bash
pnpm build      # 构建到 dist/
pnpm preview    # 本地预览生产构建
```

### 友链管理面板

管理面板是一个隐藏的 React 组件，用于增删改友站和分组，所有修改自动保存到浏览器 localStorage。

#### 打开方式

- **双击页面标题**（`.site-title` 元素）  
- **快捷键** `Ctrl + Shift + K`（Windows/Linux） / `Cmd + Shift + K`（macOS）

#### 面板功能

- **分组管理**：创建新分组、切换当前展示的分组、删除分组（至少保留一个）
- **友站管理**：添加、编辑、删除友站，支持修改名称、网站地址、Feed 地址
- **导出配置**：
  - **导出全部配置** – 复制所有分组的 JSON 配置到剪贴板，可直接粘贴到 `config.ts` 的 `friendLinkGroups` 数组
  - **导出当前组** – 仅复制当前组配置
- **重置为默认** – 清空所有修改，恢复到 `config.ts` 中的初始配置

### 友站筛选与 URL 分享

- 点击文章列表上方的友站按钮可筛选显示单个友站的文章
- 筛选状态会自动同步到 URL 参数，例如 `?friend=CC米饭`
- 复制该 URL 即可直接分享特定友站的文章视图

## 常见问题

<details>
<summary>Q: 为什么某些友站文章不显示？</summary>

- 检查其 RSS 地址是否可访问（可尝试直接浏览器打开）
- 确认格式是标准的 RSS 2.0 / Atom 1.0
- 查看友站状态按钮，若标记为红色（error）则可能超时或内容解析失败
</details>

<details>
<summary>Q: 如何更换 CORS 代理？</summary>

修改 `src/config/config.ts` 中的 `crawlConfig.crosAPI`，将 `{url}` 替换为你的代理服务格式。也可自行搭建代理或使用其他公共服务。
</details>

<details>
<summary>Q: 可以支持需要登录的友站吗？</summary>

目前仅支持公开的 RSS/Atom 订阅源，暂不支持需要认证的源。
</details>

<details>
<summary>Q: 如何自定义样式？</summary>

主要样式定义在 `src/styles/feed.css`，修改 CSS 变量即可快速调整配色。也可直接编辑组件文件的样式部分。
</details>

<details>
<summary>Q: 管理面板的修改如何持久化？</summary>

所有通过管理面板的修改（添加/编辑/删除友站和分组）会实时保存到浏览器的 `localStorage`。若清除浏览器数据，修改将丢失。若想永久保存，可通过管理面板的 **导出配置** 功能复制代码并手动粘贴到 `config.ts` 中。
</details>

<details>
<summary>Q: 如何启用 Service Worker 和 PWA？</summary>

默认已启用。部署时确保站点运行在 HTTPS 环境下，且构建产物正确部署（`dist/` 目录）。可在 `src/config/config.ts` 中通过 `serviceWorkerConfig.enabled` 控制开关。
</details>

## 注意事项

- 本项目仅供个人学习和非商业用途
- 爬取友站内容时请遵守目标网站的 `robots.txt` 规则，合理控制请求频率
- HTML 爬取功能目前处于开发中，暂不可用
- 管理面板的修改仅保存在本地浏览器，不会同步到服务器或其他设备，建议定期导出配置备份

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目基于 **AGPL-3.0** 协议开源。  
设计风格参考并衍生自 [cosZone/astro-koharu](https://github.com/cosZone/astro-koharu)（亦为 AGPL-3.0）。
```
