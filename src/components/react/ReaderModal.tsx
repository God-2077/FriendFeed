import { useEffect, useCallback, useRef } from 'react';
import { RiCloseLine, RiExternalLinkLine } from '@remixicon/react';
import type { PostItem } from '@config/type';
import { parseDate } from '@utils/utils';

interface ReaderModalProps {
  post: PostItem | null;
  onClose: () => void;
}

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

export default function ReaderModal({ post, onClose }: ReaderModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!post) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [post, handleKeyDown]);

  useEffect(() => {
    if (!post || !contentRef.current) return;

    const root = contentRef.current;

    const imgs = root.querySelectorAll<HTMLImageElement>('img:not([data-lqip])');

    imgs.forEach((img) => {
      img.dataset.lqip = 'true';

      const parent = img.parentNode;
      const parentEl = parent instanceof Element ? parent : null;

      if (parentEl?.closest('figure')) return;
      if (img.width && img.width < 40) return;
      if (img.height && img.height < 40) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'lqip-wrapper';
      parent?.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
        img.addEventListener('error', () => {
          wrapper.classList.add('lqip-error');
        }, { once: true });
      }
    });

    const figures = root.querySelectorAll<HTMLElement>('figure:not([data-lqip])');
    figures.forEach((fig) => {
      const img = fig.querySelector<HTMLImageElement>('img');
      if (!img) return;
      fig.dataset.lqip = 'true';
      fig.classList.add('lqip-figure');

      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.4s ease';
        img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
        img.addEventListener('error', () => {
          fig.classList.add('lqip-error');
        }, { once: true });
      }
    });
  }, [post]);

  if (!post) return null;

  const handleOverlayClick = () => onClose();

  const handleOriginalClick = () => {
    window.open(post.path, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="reader-overlay" onClick={handleOverlayClick}>
      <div className="reader-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reader-glow" />

        <div className="reader-header">
          <h2 className="reader-title">{post.title || '无标题'}</h2>
          <button className="reader-close-btn" onClick={onClose} aria-label="关闭">
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="reader-meta">
          <span className="meta-item date">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17 3h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h4V1h2v2h6V1h2v2zm3 8H4v8h16v-8zm-5-6H9v2H7V5H4v4h16V5h-3v2h-2V5zm-9 8h2v2H6v-2zm5 0h2v2h-2v-2zm5 0h2v2h-2v-2z"/></svg>
            {formatDate(post.date)}
          </span>
          {post.category && (
            <span className="meta-item category">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M4 5v14h16V7h-8.414l-2-2H4zm8.414 0H21a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h7.414l2 2z"/></svg>
              {post.category}
            </span>
          )}
          {post.friendLinkName && (
            <span className="meta-item friend-link">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M13.06 8.11l1.415 1.415a7 7 0 010 9.9l-.354.353a7 7 0 01-9.9-9.9l1.415 1.415a5 5 0 107.07 7.07l.354-.353a5 5 0 000-7.07l-1.414-1.415 1.414-1.414zm6.718 6.011l-1.414-1.414a5 5 0 10-7.071-7.071l-.354.354a5 5 0 000 7.071l1.414 1.414-1.414 1.414-1.414-1.414a7 7 0 010-9.9l.354-.353a7 7 0 019.9 9.9z"/></svg>
              <a href={post.friendLinkUrl} target="_blank" rel="noopener noreferrer">
                {post.friendLinkName}
              </a>
            </span>
          )}
        </div>

        <div className="reader-content" ref={contentRef}>
          {post.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          ) : (
            <pre className="reader-plain">{post.content}</pre>
          )}
        </div>

        <div className="reader-footer">
          <button className="read-original-btn" onClick={handleOriginalClick}>
            <RiExternalLinkLine size={16} /> 阅读原文
          </button>
        </div>
      </div>
    </div>
  );
}
