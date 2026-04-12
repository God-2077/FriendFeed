<div align="center">
  <img src="https://socialify.git.ci/God-2077/FriendFeed/image?font=JetBrains+Mono&language=1&name=1&owner=1&pattern=Circuit+Board&theme=Auto" alt="python-code" width="640" height="320" />
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

<!-- # FriendFeed - 友链文章聚合平台 -->

## 项目概述

FriendFeed 是一个基于 React + TypeScript 开发的友链文章聚合平台，能够自动爬取并展示多个友链网站的最新文章，按发布时间倒序排列，为用户提供一个集中浏览友站内容的便捷方式。

## 核心功能

- **友链文章聚合**：自动爬取多个友站的 RSS 订阅源，聚合所有文章
- **智能排序**：按文章发布时间倒序排列，确保最新内容优先展示
- **友站状态监控**：实时显示各友站的爬取状态，包括成功、失败等状态
- **响应式设计**：适配不同屏幕尺寸，提供良好的移动端体验
- **自定义配置**：支持通过配置文件灵活添加、修改友站信息
- **多格式支持**：兼容 RSS 2.0、RSS 1.0 (RDF) 和 Atom 1.0 格式

## 技术栈

### 前端技术
- **框架**：React 19.2.4
- **语言**：TypeScript 5.9.3
- **构建工具**：Vite 8.0.1
- **HTTP 客户端**：Axios 1.15.0
- **图标库**：@remixicon/react 4.9.0
- **React 编译器**：启用 React Compiler 提升性能

### 核心功能实现
- **爬虫功能**：通过 `crawler.ts` 实现对友站 RSS 源的爬取和解析
- **数据处理**：使用 TypeScript 类型系统确保数据结构的一致性
- **状态管理**：使用 React useState 和 useEffect 管理应用状态
- **样式**：自定义 CSS 样式，实现现代化的 UI 设计

## 项目结构

```
├── public/            # 静态资源
│   ├── favicon.svg
│   ├── icons.svg
│   └── robots.txt
├── raw/              # 原始HTML和CSS
│   ├── feed.css
│   └── index.html
├── src/              # 源代码
│   ├── assets/       # 图片等资源
│   ├── components/   # React组件
│   │   ├── ArticleCard/     # 文章卡片组件
│   │   ├── ArticleList/     # 文章列表组件
│   │   ├── Background/      # 背景组件
│   │   ├── Footer/          # 页脚组件
│   │   ├── FriendLinkHeader/ # 友链头部组件
│   │   ├── ProfileHeader/   # 个人资料头部组件
│   │   └── SocialLinks/     # 社交链接组件
│   ├── config/       # 配置文件
│   │   ├── config.ts        # 主配置文件
│   │   └── type.ts          # 类型定义
│   ├── styles/       # 样式文件
│   │   └── feed.css
│   ├── utils/        # 工具函数
│   │   ├── crawler.ts        # 爬虫功能
│   │   └── utils.ts          # 通用工具函数
│   ├── App.tsx       # 主应用组件
│   ├── index.css
│   └── main.tsx      # 应用入口
├── .gitignore
├── .hintrc
├── README.md
├── ai.md
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 安装与配置

### 环境要求
- Node.js 18.0 或更高版本
- pnpm 7.0 或更高版本

### 安装步骤

1. **克隆项目**

   ```bash
   git clone <repository-url>
   cd friendfeed
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **配置友站**

   编辑 `src/config/config.ts` 文件，修改 `friendLinks` 数组，添加或删除友站信息：

   ```typescript
   // 友站配置示例
   export const friendLinks: FriendLink[] = [
     {
       name: "示例博客",
       url: "https://example.com",
       crawl: {
         url: "https://example.com/feed",
         type: "rss"
       }
     }
     // 添加更多友站...
   ];
   ```

4. **配置网站信息**

   修改 `siteConfig` 对象，设置网站标题、作者、副标题等信息：

   ```typescript
   export const siteConfig: SiteConfig = {
     title: '你的网站标题',
     author: '你的名字',
     subtitle: '网站副标题',
     bio: '网站简介',
     avatar: '你的头像URL',
     baseUrl: '你的网站基础URL',
   };
   ```

5. **配置社交链接**

   修改 `socialConfig` 对象，添加你的社交平台链接：

   ```typescript
   export const socialConfig: SocialConfig = {
     links: [
       { type: 'github', url: 'https://github.com/your-username', label: 'Github' },
       { type: 'email', url: 'mailto:your-email@example.com', label: 'Email' },
       { type: 'rss', url: siteConfig.baseUrl + 'rss.xml', label: 'Rss' },
       // 添加更多社交链接...
     ],
   };
   ```

## 使用方法

### 开发模式

```bash
pnpm dev
```

应用将在 `http://localhost:5173` 启动，支持热重载。

### 构建生产版本

```bash
pnpm build
```

构建产物将生成在 `dist` 目录中，可以部署到任何静态网站托管服务。

### 预览生产构建

```bash
pnpm preview
```

## 示例代码

### 添加新的友站

在 `src/config/config.ts` 文件中添加新的友站配置：

```typescript
// 添加新的友站
export const friendLinks: FriendLink[] = [
  // 现有友站...
  {
    name: "新博客",
    url: "https://new-blog.com",
    crawl: {
      url: "https://new-blog.com/feed",
      type: "rss"
    }
  }
];
```

### 调整文章显示数量

修改 `postsConfig` 中的 `maxCount` 值：

```typescript
export const postsConfig: PostsConfig = {
  desc: '友链文章聚合，按发布时间倒序排序',
  content: [],
  maxCount: 50, // 修改为你想要的数量
  summaryLength: 200,
};
```

## 常见问题解答

### Q: 为什么某些友站的文章没有显示？

A: 可能的原因包括：
- 友站的 RSS 源格式不正确或无法访问
- 爬取超时（默认超时时间为8秒）
- 友站的 RSS 源中没有文章数据

### Q: 如何添加需要登录的友站？

A: 目前不支持需要登录的友站，只能爬取公开的 RSS 源。

### Q: 如何自定义页面样式？

A: 可以修改 `src/styles/feed.css` 文件来自定义样式，或在组件中添加内联样式。

### Q: 如何提高爬取速度？

A: 爬取速度主要受限于网络请求速度和友站响应速度。可以尝试：
- 减少友站数量
- 增加 `crawlConfig` 中的 `timeout` 值

### Q: 如何部署到生产环境？

A: 可以将 `pnpm build` 生成的 `dist` 目录部署到任何静态网站托管服务，如 Vercel、Netlify、GitHub Pages 等。

## 注意事项

- 本项目仅用于个人学习和非商业用途
- 爬取友站内容时请遵守相关网站的 robots.txt 规则
- 建议合理设置爬取频率，避免对友站造成过大负担
- HTML 爬取功能目前处于开发中，暂不支持

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

本项目基于 **AGPL-3.0** 协议开源。

其中样式参考并衍生自 [cosZone/astro-koharu](https://github.com/cosZone/astro-koharu)，原项目协议为 AGPL-3.0。
