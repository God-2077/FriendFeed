import type { FC } from 'react';
import type { SiteConfig, SocialLink } from '../../config/config';
import SocialLinks from '../SocialLinks/SocialLinks';

interface ProfileHeaderProps {
  site: SiteConfig;
  socialLinks: SocialLink[];
}

/**
 * 个人资料头部组件
 */
const ProfileHeader: FC<ProfileHeaderProps> = ({ site, socialLinks }) => {
  return (
    <header className="profile-header">
      <div className="profile-card">
        <div className="avatar-wrapper">
          <div className="avatar-container">
            <img src={site.avatar} alt={site.title} className="avatar" />
            <div className="cat-ear left" />
            <div className="cat-ear right" />
          </div>
        </div>
        
        <div className="profile-info">
          <h1 className="site-title">{site.title}</h1>
          <p className="site-subtitle">{site.subtitle}</p>
          <p className="site-bio">{site.bio}</p>
          <SocialLinks links={socialLinks} />
        </div>
        
        <div className="feed-actions">
          <div className="feed-badge">
            <i className="ri-rss-fill" />
            RSS Feed Preview
          </div>
          <a 
            className="visit-btn" 
            target="_blank" 
            rel="noopener noreferrer" 
            href={site.baseUrl}
          >
            访问网站 
            <i className="ri-arrow-right-line" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
