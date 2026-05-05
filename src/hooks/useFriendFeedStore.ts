import { useState, useEffect, useCallback } from 'react';
import type { FriendLink, AppData } from '@config/type';
import { friendLinkGroups as defaultGroups } from '@config/config';

const STORAGE_KEY = 'friendfeed_data';

function loadFromStorage(): AppData {
  if (typeof window === 'undefined') {
    return { groups: defaultGroups, activeGroupIndex: 0 };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // corrupted data, fall through
    }
  }
  return {
    groups: structuredClone(defaultGroups),
    activeGroupIndex: 0,
  };
}

export function useFriendFeedStore() {
  const [appData, setAppData] = useState<AppData>(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }, [appData]);

  const activeGroup = appData.groups[appData.activeGroupIndex] ?? appData.groups[0];

  const setActiveGroup = useCallback((index: number) => {
    setAppData((prev) => ({
      ...prev,
      activeGroupIndex: Math.max(0, Math.min(index, prev.groups.length - 1)),
    }));
  }, []);

  const addLink = useCallback((link: FriendLink) => {
    setAppData((prev) => {
      const newGroups = [...prev.groups];
      const idx = prev.activeGroupIndex;
      if (!newGroups[idx]) return prev;
      newGroups[idx] = {
        ...newGroups[idx],
        links: [...newGroups[idx].links, link],
      };
      return { ...prev, groups: newGroups };
    });
  }, []);

  const updateLink = useCallback((index: number, link: FriendLink) => {
    setAppData((prev) => {
      const newGroups = [...prev.groups];
      const gIdx = prev.activeGroupIndex;
      if (!newGroups[gIdx]) return prev;
      const links = [...newGroups[gIdx].links];
      if (index < 0 || index >= links.length) return prev;
      links[index] = link;
      newGroups[gIdx] = { ...newGroups[gIdx], links };
      return { ...prev, groups: newGroups };
    });
  }, []);

  const deleteLink = useCallback((index: number) => {
    setAppData((prev) => {
      const newGroups = [...prev.groups];
      const gIdx = prev.activeGroupIndex;
      if (!newGroups[gIdx]) return prev;
      const links = newGroups[gIdx].links.filter((_, i) => i !== index);
      newGroups[gIdx] = { ...newGroups[gIdx], links };
      return { ...prev, groups: newGroups };
    });
  }, []);

  const addGroup = useCallback((name: string) => {
    setAppData((prev) => ({
      ...prev,
      groups: [...prev.groups, { name, links: [] }],
    }));
  }, []);

  const deleteGroup = useCallback((index: number) => {
    setAppData((prev) => {
      if (prev.groups.length <= 1) return prev;
      const newGroups = prev.groups.filter((_, i) => i !== index);
      const newIndex = Math.min(prev.activeGroupIndex, newGroups.length - 1);
      return { groups: newGroups, activeGroupIndex: newIndex };
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setAppData({ groups: structuredClone(defaultGroups), activeGroupIndex: 0 });
  }, []);

  return {
    appData,
    activeGroup,
    setActiveGroup,
    addLink,
    updateLink,
    deleteLink,
    addGroup,
    deleteGroup,
    resetToDefault,
  };
}
