import type { FC } from 'react';
import type { SocialLink } from '../../config/type';
import { RiGithubFill, RiMailLine, RiRssLine, RiBilibiliLine, RiTwitterXFill, RiLinksLine, RiLink } from '@remixicon/react';

interface SocialLinksProps {
  links: SocialLink[];
}

/**
 * 获取社交链接图标组件
 */
const getIconComponent = (type: SocialLink['type']) => {
  const iconMap: Record<SocialLink['type'], React.ElementType> = {
    github: RiGithubFill,
    email: RiMailLine,
    rss: RiRssLine,
    bilibili: RiBilibiliLine,
    twitter: RiTwitterXFill,
    custom: RiLinksLine,
  };
  return iconMap[type] || RiLink;
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
          {(() => {
            const IconComponent = getIconComponent(link.type);
            return <IconComponent size={20} color="currentColor" />;
          })()}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
