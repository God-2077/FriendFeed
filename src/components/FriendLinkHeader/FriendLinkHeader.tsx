import type { FC } from 'react';
import type { FriendLink } from '../../config/type';
import type { CrawlStatus } from '../../utils/crawler';
import { RiLoader4Line, RiCheckboxCircleFill, RiErrorWarningFill, RiQuestionMark } from '@remixicon/react';

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
        return RiLoader4Line;
      case 'success':
        return RiCheckboxCircleFill;
      case 'error':
        return RiErrorWarningFill;
      default:
        return RiQuestionMark;
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
            {(() => {
              const IconComponent = getStatusIcon(link.status);
              return (
                <span className="status-icon">
                  <IconComponent 
                    size={14} 
                    color="currentColor" 
                    className={link.status === 'loading' ? 'spin' : ''} 
                  />
                </span>
              );
            })()}
            <span className="link-name">{link.friendLink.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FriendLinkHeader;