import type { FC } from 'react';
import type { PostItem } from '../../config/config';

interface ArticleCardProps {
  post: PostItem;
}

/**
 * 格式化日期
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * 文章卡片组件
 */
const ArticleCard: FC<ArticleCardProps> = ({ post }) => {
  return (
    <article className="post-card">
      <div className="card-glow" />
      <div className="post-content">
        <h3 className="post-title">
          <a target="_blank" rel="noopener noreferrer" href={post.path}>
            {post.title}
          </a>
        </h3>
        <div className="post-meta">
          <span className="meta-item date">
            <i className="ri-calendar-2-line" />
            {formatDate(post.date)}
          </span>
          {post.category && (
            <span className="meta-item category">
              <i className="ri-folder-line" />
              {post.category}
            </span>
          )}
        </div>
        <p className="post-summary">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag-badge">
                <i className="ri-price-tag-3-line" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="post-footer">
        <a className="read-more" target="_blank" rel="noopener noreferrer" href={post.path}>
          阅读全文 <i className="ri-arrow-right-s-line" />
        </a>
      </div>
    </article>
  );
};

export default ArticleCard;
