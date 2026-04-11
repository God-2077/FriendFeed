import { useState, useEffect } from 'react';
import { Background, ProfileHeader, ArticleList, Footer } from './components';
import { siteConfig, socialConfig, friendLinks as configFriendLinks, postsConfig } from './config/config';
import type { CrawlStatus } from './utils/crawler';
import type { PostItem } from './config/type';
import { parseDate } from './utils/utils';
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
        // 爬取每个友站的文章
        const results = await Promise.all(configFriendLinks.map(friendLink => {
          return import('./utils/crawler').then(({ crawlFriendLink }) => crawlFriendLink(friendLink));
        }));

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

        // Apply max count limit
        const limitedPosts = allPosts.slice(0, postsConfig.maxCount);
        setPosts(limitedPosts);

        // 更新友站状态
        const updatedStatuses: FriendLinkStatus[] = configFriendLinks.map((fl, index) => ({
          name: fl.name,
          url: fl.url,
          status: results[index].status,
          error: results[index].error,
        }));
        setFriendLinkStatuses(updatedStatuses);
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
          desc={postsConfig.desc}
          friendLinksStatus={friendLinkStatuses}
          isLoading={isLoading}
        />
        <Footer author={siteConfig.author} />
      </div>
    </>
  );
}

export default App;