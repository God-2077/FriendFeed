import { useState, useEffect, useMemo, useRef } from 'react';
import { RiExternalLinkLine } from '@remixicon/react';
import type { PostItem, CrawlDelta } from '@config/type';
import type { CrawlStatus } from '@utils/crawler';
import { postsConfig } from '@config/config';
import { parseDate } from '@utils/utils';
import { useAppContext } from '../../context/AppContext';
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
  const store = useAppContext();
  const { activeGroup, appData, crawlVersion, deltaRef } = store;
  const currentLinks = activeGroup.links;
  const [posts, setPosts] = useState<PostItem[]>([]);
  const postsRef = useRef(posts);
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);
  const [friendLinkStatuses, setFriendLinkStatuses] = useState<FriendLinkStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(postsConfig.maxCount);
  const groupRef = useRef(currentLinks);

  const cacheRef = useRef<Map<number, PostItem[]>>(new Map());

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
    return filtered.slice(0, displayCount);
  }, [posts, selectedFriend, displayCount]);

  const hasMore = useMemo(() => {
    const total = selectedFriend
      ? posts.filter(post => post.friendLinkName === selectedFriend).length
      : totalCrawledCount;
    return filteredPosts.length < total;
  }, [posts, selectedFriend, filteredPosts.length, totalCrawledCount]);

  useEffect(() => {
    setSelectedFriend(null);
    setDisplayCount(postsConfig.maxCount);
  }, [currentLinks]);

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

  const activeGroupIndex = appData.activeGroupIndex;
  const groupsLen = appData.groups.length;

  useEffect(() => {
    const links = currentLinks;
    groupRef.current = links;

    const cache = cacheRef.current;
    const cachedPosts = cache.get(activeGroupIndex);

    if (cachedPosts) {
      setPosts(cachedPosts);
      setFriendLinkStatuses(
        links.map((fl) => ({
          name: fl.name,
          url: fl.url,
          status: 'success' as CrawlStatus,
        }))
      );
      setIsLoading(false);
      return;
    }

    if (links.length === 0) {
      setPosts([]);
      setFriendLinkStatuses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchPosts = async () => {
      const initialStatuses: FriendLinkStatus[] = links.map((fl) => ({
        name: fl.name,
        url: fl.url,
        status: 'loading' as CrawlStatus,
      }));
      setFriendLinkStatuses(initialStatuses);

      try {
        const { crawlFriendLink } = await import('../../utils/crawler');

        const results = await Promise.all(
          links.map(friendLink => crawlFriendLink(friendLink))
        );

        if (groupRef.current !== links) return;

        const allPosts: PostItem[] = [];
        results.forEach(result => {
          allPosts.push(...result.posts);
        });

        allPosts.sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB.getTime() - dateA.getTime();
        });

        const updatedStatuses: FriendLinkStatus[] = links.map((fl, index) => ({
          name: fl.name,
          url: fl.url,
          status: results[index].status,
          error: results[index].error,
        }));

        cache.set(activeGroupIndex, allPosts);

        setPosts(allPosts);
        setFriendLinkStatuses(updatedStatuses);
      } catch (error) {
        if (groupRef.current !== links) return;
        const errorStatuses: FriendLinkStatus[] = links.map((fl) => ({
          name: fl.name,
          url: fl.url,
          status: 'error' as CrawlStatus,
          error: error instanceof Error ? error.message : '获取文章失败',
        }));
        setFriendLinkStatuses(errorStatuses);
      } finally {
        if (groupRef.current === links) {
          setIsLoading(false);
        }
      }
    };

    fetchPosts();
  }, [activeGroupIndex, groupsLen]);

  useEffect(() => {
    const delta: CrawlDelta | null = deltaRef.current;
    if (!delta) return;
    deltaRef.current = null;

    const { added, removed, edited } = delta;
    if (added.length === 0 && removed.length === 0 && edited.length === 0) return;

    setIsLoading(true);

    const currentPosts = postsRef.current;

    (async () => {
      try {
        const { crawlFriendLink } = await import('../../utils/crawler');

        const editedNames = new Set(edited.map((l) => l.name));
        const removedNames = new Set(removed);

        let newPosts = currentPosts.filter(
          (p) => !removedNames.has(p.friendLinkName ?? '') && !editedNames.has(p.friendLinkName ?? '')
        );

        const toCrawl = [...added, ...edited];
        const results = await Promise.all(
          toCrawl.map((link) => crawlFriendLink(link))
        );

        results.forEach((result) => {
          newPosts = [...newPosts, ...result.posts];
        });

        newPosts.sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB.getTime() - dateA.getTime();
        });

        setPosts(newPosts);

        setFriendLinkStatuses((prev) => {
          let next = prev.filter((s) => !removed.includes(s.name));
          edited.forEach((editedLink) => {
            const idx = next.findIndex((s) => s.name === editedLink.name);
            const target: FriendLinkStatus = { name: editedLink.name, url: editedLink.url, status: 'loading' };
            if (idx >= 0) next[idx] = target;
            else next.push(target);
          });
          added.forEach((addedLink) => {
            if (!next.some((s) => s.name === addedLink.name)) {
              next = [...next, { name: addedLink.name, url: addedLink.url, status: 'loading' }];
            }
          });
          return next;
        });

        for (let i = 0; i < results.length; i++) {
          const crawledLink = toCrawl[i];
          const result = results[i];
          setFriendLinkStatuses((prev) =>
            prev.map((s) =>
              s.name === crawledLink.name
                ? { ...s, status: result.status, error: result.error }
                : s
            )
          );
        }

        cacheRef.current.set(appData.activeGroupIndex, newPosts);
      } catch {
        // failed crawl is tracked per-link via friendLinkStatuses
      } finally {
        setIsLoading(false);
      }
    })();
  }, [crawlVersion]);

  return (
    <main className="feed-content">
      <div className="content-header">
        <h2>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13.5 1.5L15 0h6l1.5 1.5v21L21 24h-6l-1.5-1.5v-21zM21 1.5h-6v21h6v-21zM0 4.5h12v3H0v-3zm0 6h12v3H0v-3zm0 6h12v3H0v-3z"/></svg>
          {activeGroup.name} · 最新动态
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
      
      {isLoading && (
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

      {!isLoading && hasMore && (
        <div className="load-more-wrapper">
          <button
            className="load-more-btn"
            onClick={() => setDisplayCount((c) => c + postsConfig.maxCount)}
          >
            加载更多
          </button>
        </div>
      )}

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
