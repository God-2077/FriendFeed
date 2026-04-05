import type { FC } from 'react';
import type { PostItem } from '../../config/config';
import type { CrawlStatus } from '../../utils/crawler';
import ArticleCard from '../ArticleCard/ArticleCard';

interface FriendLinkStatus {
  name: string;
  url: string;
  status: CrawlStatus;
  error?: string;
}

interface ArticleListProps {
  posts: PostItem[];
  desc: string;
  friendLinksStatus?: FriendLinkStatus[];
  isLoading?: boolean;
}

/**
 * 文章列表组件
 */
const ArticleList: FC<ArticleListProps> = ({ posts, desc, friendLinksStatus, isLoading }) => {
  return (
    <main className="feed-content">
      <div className="content-header">
        <h2>
          <i className="ri-sparkling-fill" /> 最近更新
        </h2>
        <p className="feed-desc">{desc}</p>
        
        {/* 友站状态展示 */}
        {friendLinksStatus && friendLinksStatus.length > 0 && (
          <div className="friend-links-bar">
            {friendLinksStatus.map((link) => (
              <span
                key={link.url}
                className={`friend-link-status ${link.status}`}
                title={link.error || link.status}
              >
                <span className={`status-dot ${link.status}`} />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.name}
                </a>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {isLoading && posts.length === 0 && (
        <div className="loading-state">
          <i className="ri-loader-4-line spin" />
          <p>正在加载文章...</p>
        </div>
      )}
      
      <div className="articles-grid">
        {posts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>
      
      {!isLoading && posts.length === 0 && (
        <div className="empty-state">
          <p>暂无文章</p>
        </div>
      )}
    </main>
  );
};

export default ArticleList;