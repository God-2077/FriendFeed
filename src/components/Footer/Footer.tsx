import type { FC } from 'react';

interface FooterProps {
  author?: string;
}

/**
 * 页脚组件
 */
const Footer: FC<FooterProps> = ({ author = '余弦' }) => {
  return (
    <footer className="page-footer">
      <p>
        Designed with <i className="ri-heart-3-fill heart-beat" /> by {author}
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
