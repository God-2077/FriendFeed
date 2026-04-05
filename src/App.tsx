import { useState, useEffect } from 'react';
import { Background, ProfileHeader, ArticleList, Footer } from './components';
import { siteConfig, socialConfig, friendLinks as configFriendLinks } from './config/config';
import { crawlAllFriendLinks, type CrawlStatus } from './utils/crawler';
import type { PostItem } from './config/config';
import './styles/feed.css';

interface FriendLinkStatus {
  name: string;
  url: string;
  status: CrawlStatus;
  error?: string;
}

/**
 * Feeds 网站主应用组件
 * 基于配置动态渲染网站内容
 */
function App() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [friendLinkStatuses, setFriendLinkStatuses] = useState<FriendLinkStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 网站加载后开始爬取友站文章
    const fetchPosts = async () => {
      // 初始化友站状态为加载中
      const initialStatuses: FriendLinkStatus[] = configFriendLinks.map((fl) => ({
        name: fl.name,
        url: fl.url,
        status: 'loading' as CrawlStatus,
      }));
      setFriendLinkStatuses(initialStatuses);

      try {
        // 爬取所有友站文章
        const crawledPosts = await crawlAllFriendLinks(configFriendLinks);
        setPosts(crawledPosts);

        // 更新友站状态为成功
        const successStatuses: FriendLinkStatus[] = configFriendLinks.map((fl) => ({
          name: fl.name,
          url: fl.url,
          status: 'success' as CrawlStatus,
        }));
        setFriendLinkStatuses(successStatuses);
      } catch (error) {
        // 更新友站状态为失败
        const errorStatuses: FriendLinkStatus[] = configFriendLinks.map((fl) => ({
          name: fl.name,
          url: fl.url,
          status: 'error' as CrawlStatus,
          error: error instanceof Error ? error.message : '获取文章失败',
        }));
        setFriendLinkStatuses(errorStatuses);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Background />
      <div className="container">
        <ProfileHeader 
          site={siteConfig} 
          socialLinks={socialConfig.links} 
        />
        <ArticleList 
          posts={posts} 
          desc="WA 的一声就哭了"
          friendLinksStatus={friendLinkStatuses}
          isLoading={isLoading}
        />
        <Footer author="余弦" />
      </div>
    </>
  );
}

export default App;