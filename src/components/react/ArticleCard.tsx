import { useState } from 'react';
import type { PostItem } from '@config/type';
import { truncateText, parseDate } from '@utils/utils';
import config from '@config/config';
import ReaderModal from './ReaderModal';

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
  return date.toLocaleDateString('zh-CN', options);
};

/**
 * 文章卡片组件
 */
export default function ArticleCard({ post }: ArticleCardProps) {
  const summary = truncateText(post.content, config.posts.summaryLength);
  const [readerOpen, setReaderOpen] = useState(false);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setReaderOpen(true);
  };
   
   return (
    <>
    <article className="post-card">
      <div className="card-glow" />
      <div className="post-content">
        <h3 className="post-title">
          <a target="_blank" rel="noopener noreferrer" href={post.path} onClick={handleTitleClick}>
            {post.title || '无标题'}
          </a>
        </h3>
        <div className="post-meta">
          <span className="meta-item date">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17 3h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h4V1h2v2h6V1h2v2zm3 8H4v8h16v-8zm-5-6H9v2H7V5H4v4h16V5h-3v2h-2V5zm-9 8h2v2H6v-2zm5 0h2v2h-2v-2zm5 0h2v2h-2v-2z"/></svg>
            {formatDate(post.date)}
          </span>
          {post.category && (
            <span className="meta-item category">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 5v14h16V7h-8.414l-2-2H4zm8.414 0H21a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h7.414l2 2z"/></svg>
              {post.category}
            </span>
          )}
          {post.friendLinkName && (
            <span className="meta-item friend-link">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13.06 8.11l1.415 1.415a7 7 0 010 9.9l-.354.353a7 7 0 01-9.9-9.9l1.415 1.415a5 5 0 107.07 7.07l.354-.353a5 5 0 000-7.07l-1.414-1.415 1.414-1.414zm6.718 6.011l-1.414-1.414a5 5 0 10-7.071-7.071l-.354.354a5 5 0 000 7.071l1.414 1.414-1.414 1.414-1.414-1.414a7 7 0 010-9.9l.354-.353a7 7 0 019.9 9.9z"/></svg>
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
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10.904 2.1l9.9 9.9a1.5 1.5 0 010 2.122l-7.07 7.071a1.5 1.5 0 01-2.122 0l-9.9-9.9A1.5 1.5 0 011 10.172V3.5A1.5 1.5 0 012.5 2h7.672a1.5 1.5 0 011.06.439l.672.661zM6.5 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="post-footer">
        <a className="read-more" target="_blank" rel="noopener noreferrer" href={post.path}>
          跳转原文 <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"/></svg>
        </a>
      </div>
    </article>
    <ReaderModal post={readerOpen ? post : null} onClose={() => setReaderOpen(false)} />
    </>
  );
}
