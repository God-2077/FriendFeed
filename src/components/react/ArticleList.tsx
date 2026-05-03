import { useState, useEffect, useMemo } from 'react';
import { RiExternalLinkLine } from '@remixicon/react';
import type { PostItem } from '@config/type';
import type { CrawlStatus } from '@utils/crawler';
import { friendLinks as configFriendLinks, postsConfig } from '@config/config';
import { parseDate } from '@utils/utils';
import ArticleCard from './ArticleCard';

interface FriendLinkStatus {
  name: string;
  url: string;
  status: CrawlStatus;
  error?: string;
}

/**
 * 文章列表组件 (React Island)
 * 在客户端加载 RSS 数据
 */
export default function ArticleList() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [friendLinkStatuses, setFriendLinkStatuses] = useState<FriendLinkStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const totalCrawledCount = posts.length;

  const friendPostCount = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach(post => {
      const name = post.friendLinkName;
      if (name) map.set(name, (map.get(name) || 0) + 1);
    });
    return map;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const filtered = selectedFriend
      ? posts.filter(post => post.friendLinkName === selectedFriend)
      : posts;
    return filtered.slice(0, postsConfig.maxCount);
  }, [posts, selectedFriend]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const friendParam = params.get('friend');
    if (friendParam && friendLinkStatuses.some(f => f.name === friendParam)) {
      setSelectedFriend(friendParam);
    }
  }, [friendLinkStatuses]);

  useEffect(() => {
    const newUrl = new URL(window.location.href);
    if (selectedFriend) {
      newUrl.searchParams.set('friend', selectedFriend);
    } else {
      newUrl.searchParams.delete('friend');
    }
    window.history.replaceState({}, '', newUrl.toString());
  }, [selectedFriend]);

  useEffect(() => {
    const fetchPosts = async () => {
      // 初始化友站状态为加载中
      const initialStatuses: FriendLinkStatus[] = configFriendLinks.map((fl) => ({
        name: fl.name,
        url: fl.url,
        status: 'loading' as CrawlStatus,
      }));
      setFriendLinkStatuses(initialStatuses);

      try {
        // 动态导入爬虫模块（仅在客户端执行）
        const { crawlFriendLink } = await import('../../utils/crawler');
        
        // 爬取每个友站的文章
        const results = await Promise.all(
          configFriendLinks.map(friendLink => crawlFriendLink(friendLink))
        );

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

        // 存储全部文章（计数用全量，展示按 maxCount 截取）
        setPosts(allPosts);

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
    <main className="feed-content">
      <div className="content-header">
        <h2>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13.5 1.5L15 0h6l1.5 1.5v21L21 24h-6l-1.5-1.5v-21zM21 1.5h-6v21h6v-21zM0 4.5h12v3H0v-3zm0 6h12v3H0v-3zm0 6h12v3H0v-3z"/></svg>
          最近更新
        </h2>
        <p className="feed-desc">{postsConfig.desc}</p>
        
        {friendLinkStatuses.length > 0 && (
          <div className="friend-links-bar">
            <button
              className={`friend-link-status ${!selectedFriend ? 'active' : ''}`}
              onClick={() => setSelectedFriend(null)}
              disabled={isLoading}
            >
              全部 ({totalCrawledCount})
            </button>
            {friendLinkStatuses.map((link) => {
              const count = friendPostCount.get(link.name) || 0;
              return (
                <button
                  key={link.url}
                  className={`friend-link-status ${link.status} ${selectedFriend === link.name ? 'active' : ''}`}
                  onClick={() => setSelectedFriend(link.name)}
                  disabled={isLoading}
                >
                  <span className={`status-dot ${link.status}`} />
                  {link.name}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="friend-external-link"
                    title={`访问 ${link.name}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RiExternalLinkLine size={14} />
                  </a>
                  {' '}({count})
                  {link.status === 'error' && link.error && (
                    <span className="error-message">({link.error})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedFriend && !isLoading && (
          <div className="filter-info">
            <span>当前筛选：<strong>{selectedFriend}</strong> · 共 {filteredPosts.length} 篇文章</span>
            <button className="clear-filter" onClick={() => setSelectedFriend(null)}>
              清除筛选
            </button>
          </div>
        )}
      </div>
      
      {isLoading && posts.length === 0 && (
        <div className="loading-state">
          <svg className="spin" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm-9-7a1 1 0 011-1h2a1 1 0 110 2H4a1 1 0 01-1-1zm16 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm-2.05-6.95a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414L16.95 5.636a1 1 0 010-1.414zm-9.9 9.9a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414L5.636 16.95a1 1 0 010-1.414zm9.9 0a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414l-1.414-1.414a1 1 0 010-1.414zm-9.9-9.9a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414L5.636 5.636a1 1 0 010-1.414z"/></svg>
          <p>正在加载文章...</p>
        </div>
      )}
      
      <div className="articles-grid">
        {filteredPosts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>

      {!isLoading && filteredPosts.length === 0 && (
        <div className="empty-state">
          {selectedFriend ? (
            <>
              <p>该友站暂无文章</p>
              <p className="empty-hint">可尝试切换其他友站或查看全部</p>
            </>
          ) : (
            <p>暂无文章</p>
          )}
        </div>
      )}
    </main>
  );
}
