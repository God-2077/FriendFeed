import type { FC } from 'react';
import { RiHeart3Fill } from '@remixicon/react';

interface FooterProps {
  author?: string;
}

/**
 * 页脚组件
 */
const Footer: FC<FooterProps> = () => {
  return (
    <footer className="page-footer">
      <p>
        Powered by <a href='https://github.com/God-2077/FriendFeed' target="_blank" rel="noopener noreferrer">FriendFeed</a> · Inspired by <a href="https://github.com/amehime/hexo-theme-shoka" target="_blank" rel="noopener noreferrer">astro-koharu</a> ·  Designed with <RiHeart3Fill size={16} color="currentColor" className="heart-beat" /> by <a href="https://github.com/kissablecho" target="_blank" rel="noopener noreferrer">kissablecho</a>
      </p>
      <p className="copyright">
        <a href="https://aboutfeeds.com" target="_blank" rel="noopener noreferrer">
          About Feeds
        </a>
      </p>
    </footer>
  );
};

export default Footer;
