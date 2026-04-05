import type { FC } from 'react';
import type { SocialLink } from '../../config/config';

interface SocialLinksProps {
  links: SocialLink[];
}

/**
 * 获取社交链接图标类名
 */
const getIconClass = (type: SocialLink['type']): string => {
  const iconMap: Record<SocialLink['type'], string> = {
    github: 'ri-github-fill',
    email: 'ri-mail-line',
    rss: 'ri-rss-line',
    bilibili: 'ri-bilibili-line',
    twitter: 'ri-twitter-x-fill',
    custom: 'ri-links-line',
  };
  return iconMap[type] || 'ri-link';
};

/**
 * 社交链接组件
 */
const SocialLinks: FC<SocialLinksProps> = ({ links }) => {
  return (
    <div className="social-links">
      {links.map((link) => (
        <a
          key={link.type}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`social-btn ${link.type}`}
          title={link.label}
          aria-label={link.label}
        >
          <i className={getIconClass(link.type)} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
