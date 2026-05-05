import { AppProvider } from '../../context/AppContext';
import ArticleList from './ArticleList';
import AdminPanel from './AdminPanel';

export default function FeedIsland() {
  return (
    <AppProvider>
      <ArticleList />
      <AdminPanel />
    </AppProvider>
  );
}
