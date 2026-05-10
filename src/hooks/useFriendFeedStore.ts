import { useState, useEffect, useCallback, useRef } from 'react';
import type { FriendLink, AppData, CrawlDelta, FriendLinkGroup } from '@config/type';
import { friendLinkGroups as defaultGroups } from '@config/config';

const STORAGE_KEY = 'friendfeed_data';

// ---- user-edit diff model (only user changes are persisted) ----

interface StoredEdits {
  _version: 2;
  activeGroupName: string;
  addedLinks: Record<string, FriendLink[]>;
  deletedUrls: Record<string, string[]>;
  modifiedLinks: Record<string, FriendLink[]>;
  addedGroups: FriendLinkGroup[];
  deletedGroupNames: string[];
}

function linksAreEqual(a: FriendLink, b: FriendLink): boolean {
  return a.name === b.name && a.url === b.url && JSON.stringify(a.crawl) === JSON.stringify(b.crawl);
}

function applyUserEdits(defaults: FriendLinkGroup[], edits: StoredEdits): AppData {
  let groups = defaults.filter((g) => !edits.deletedGroupNames.includes(g.name));

  groups = groups.map((g) => {
    const name = g.name;
    let links = [...g.links];

    const deletedSet = new Set(edits.deletedUrls[name] || []);
    links = links.filter((l) => !deletedSet.has(l.url));

    const modifiedMap = new Map((edits.modifiedLinks[name] || []).map((l) => [l.url, l]));
    links = links.map((l) => modifiedMap.get(l.url) || l);

    links = [...links, ...(edits.addedLinks[name] || [])];

    return { ...g, links };
  });

  groups = [...groups, ...edits.addedGroups];

  const activeGroupIndex = Math.max(0, groups.findIndex((g) => g.name === edits.activeGroupName));

  return { groups, activeGroupIndex };
}

function computeUserEdits(
  groups: FriendLinkGroup[],
  activeGroupIndex: number,
  defaults: FriendLinkGroup[],
): StoredEdits {
  const defaultGroupMap = new Map(defaults.map((g) => [g.name, g]));
  const currentGroupNames = new Set(groups.map((g) => g.name));

  const deletedGroupNames = defaults
    .filter((g) => !currentGroupNames.has(g.name))
    .map((g) => g.name);

  const addedLinks: Record<string, FriendLink[]> = {};
  const deletedUrls: Record<string, string[]> = {};
  const modifiedLinks: Record<string, FriendLink[]> = {};
  const addedGroups: FriendLinkGroup[] = [];

  for (const cg of groups) {
    if (!defaultGroupMap.has(cg.name)) {
      addedGroups.push(cg);
      continue;
    }

    const dg = defaultGroupMap.get(cg.name)!;
    const defaultUrlSet = new Set(dg.links.map((l) => l.url));

    // user-added links: present now but not in config defaults
    const added: FriendLink[] = cg.links.filter((l) => !defaultUrlSet.has(l.url));
    if (added.length > 0) addedLinks[cg.name] = added;

    const currentUrlSet = new Set(cg.links.map((l) => l.url));

    // user-deleted links: in config defaults but not present now
    const deleted: string[] = dg.links
      .filter((l) => !currentUrlSet.has(l.url))
      .map((l) => l.url);
    if (deleted.length > 0) deletedUrls[cg.name] = deleted;

    // user-modified links: same url but different data
    const modified: FriendLink[] = cg.links.filter((l) => {
      const def = dg.links.find((d) => d.url === l.url);
      return def && !linksAreEqual(def, l);
    });
    if (modified.length > 0) modifiedLinks[cg.name] = modified;
  }

  const activeGroupName = groups[activeGroupIndex]?.name ?? (defaults[0]?.name ?? '');

  return {
    _version: 2,
    activeGroupName,
    addedLinks,
    deletedUrls,
    modifiedLinks,
    addedGroups,
    deletedGroupNames,
  };
}

// ---- persistence ----

function loadFromStorage(): AppData {
  if (typeof window === 'undefined') {
    return { groups: defaultGroups, activeGroupIndex: 0 };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { groups: structuredClone(defaultGroups), activeGroupIndex: 0 };
  }
  try {
    const data = JSON.parse(raw);
    if (data._version === 2) {
      return applyUserEdits(defaultGroups, data as StoredEdits);
    }
    // legacy format — full AppData snapshot
    if (data.groups && Array.isArray(data.groups)) {
      return {
        groups: data.groups,
        activeGroupIndex: data.activeGroupIndex ?? 0,
      };
    }
  } catch {
    // corrupted data
  }
  return { groups: structuredClone(defaultGroups), activeGroupIndex: 0 };
}

export function useFriendFeedStore() {
  const [appData, setAppData] = useState<AppData>(loadFromStorage);

  useEffect(() => {
    const edits = computeUserEdits(appData.groups, appData.activeGroupIndex, defaultGroups);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
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
    localStorage.removeItem(STORAGE_KEY);
    setAppData({ groups: structuredClone(defaultGroups), activeGroupIndex: 0 });
  }, []);

  const [crawlVersion, setCrawlVersion] = useState(0);
  const deltaRef = useRef<CrawlDelta | null>(null);

  const requestCrawl = useCallback((delta: CrawlDelta) => {
    deltaRef.current = delta;
    setCrawlVersion((v) => v + 1);
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
    crawlVersion,
    deltaRef,
    requestCrawl,
  };
}
