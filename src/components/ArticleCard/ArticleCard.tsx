import type { FC } from 'react';
import type { PostItem } from '../../config/type';
import { truncateText, parseDate } from '../../utils/utils';
import { RiCalendar2Line, RiFolderLine, RiLink, RiPriceTag3Line, RiArrowRightSLine } from '@remixicon/react';

interface ArticleCardProps {
  post: PostItem;
}

/**
 * 格式化日期
 */
const formatDate = (dateStr: string): string => {
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  
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
  const summary = truncateText(post.content, 200);
  
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
            <RiCalendar2Line size={16} color="currentColor" />
            {formatDate(post.date)}
          </span>
          {post.category && (
            <span className="meta-item category">
              <RiFolderLine size={16} color="currentColor" />
              {post.category}
            </span>
          )}
          {post.friendLinkName && (
            <span className="meta-item friend-link">
              <RiLink size={16} color="currentColor" />
              <a href={post.friendLinkUrl} target="_blank" rel="noopener noreferrer">
                {post.friendLinkName}
              </a>
            </span>
          )}
        </div>
        <p className="post-summary">{summary}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag-badge">
                <RiPriceTag3Line size={14} color="currentColor" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="post-footer">
        <a className="read-more" target="_blank" rel="noopener noreferrer" href={post.path}>
          阅读全文 <RiArrowRightSLine size={14} color="currentColor" />
        </a>
      </div>
    </article>
  );
};

export default ArticleCard;
