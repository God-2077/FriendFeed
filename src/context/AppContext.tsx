import React from 'react';
import { useFriendFeedStore } from '../hooks/useFriendFeedStore';

export type StoreType = ReturnType<typeof useFriendFeedStore>;

export const AppContext = React.createContext<StoreType | null>(null);

export function useAppContext() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const store = useFriendFeedStore();
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}
