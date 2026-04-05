import { Background, ProfileHeader, ArticleList, Footer } from './components';
import { siteConfig, socialConfig, postsConfig } from './config/config';
import './styles/feed.css';

/**
 * Feeds 网站主应用组件
 * 基于配置动态渲染网站内容
 */
function App() {
  return (
    <>
      <Background />
      <div className="container">
        <ProfileHeader 
          site={siteConfig} 
          socialLinks={socialConfig.links} 
        />
        <ArticleList 
          posts={postsConfig.content} 
          desc={postsConfig.desc} 
        />
        <Footer author="余弦" />
      </div>
    </>
  );
}

export default App;
