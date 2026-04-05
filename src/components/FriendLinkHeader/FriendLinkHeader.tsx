import type { FC } from 'react';
import type { FriendLink } from '../../config/config';
import type { CrawlStatus } from '../../utils/crawler';

interface FriendLinkStatus {
  friendLink: FriendLink;
  status: CrawlStatus;
  error?: string;
}

interface FriendLinkHeaderProps {
  links: FriendLinkStatus[];
}

/**
 * 友站状态标签组件
 */
const FriendLinkHeader: FC<FriendLinkHeaderProps> = ({ links }) => {
  const getStatusIcon = (status: CrawlStatus) => {
    switch (status) {
      case 'loading':
        return 'ri-loader-4-line';
      case 'success':
        return 'ri-checkbox-circle-fill';
      case 'error':
        return 'ri-error-warning-fill';
      default:
        return 'ri-question-mark';
    }
  };

  const getStatusText = (status: CrawlStatus) => {
    switch (status) {
      case 'loading':
        return '加载中';
      case 'success':
        return '成功';
      case 'error':
        return '失败';
      default:
        return '未知';
    }
  };

  const getStatusClass = (status: CrawlStatus) => {
    switch (status) {
      case 'loading':
        return 'status-loading';
      case 'success':
        return 'status-success';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  };

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="friend-link-header">
      <div className="friend-links">
        {links.map((link) => (
          <a
            key={link.friendLink.url}
            className={`friend-link-tag ${getStatusClass(link.status)}`}
            href={link.friendLink.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.error || `${link.friendLink.name}: ${getStatusText(link.status)}`}
          >
            <span className={`status-icon ${getStatusIcon(link.status)}`}>
              {link.status === 'loading' && <span className="spin" />}
            </span>
            <span className="link-name">{link.friendLink.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FriendLinkHeader;