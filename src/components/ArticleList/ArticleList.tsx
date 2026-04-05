import type { FC } from 'react';
import type { PostItem } from '../../config/config';
import ArticleCard from '../ArticleCard/ArticleCard';

interface ArticleListProps {
  posts: PostItem[];
  desc: string;
}

/**
 * 文章列表组件
 */
const ArticleList: FC<ArticleListProps> = ({ posts, desc }) => {
  return (
    <main className="feed-content">
      <div className="content-header">
        <h2>
          <i className="ri-sparkling-fill" /> 最近更新
        </h2>
        <p className="feed-desc">{desc}</p>
      </div>
      <div className="articles-grid">
        {posts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
};

export default ArticleList;
