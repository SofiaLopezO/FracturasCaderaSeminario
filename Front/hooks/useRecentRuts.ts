'use client';

import { useEffect, useState } from 'react';

const KEY = 'recent_ruts_v1';

function readStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function useRecentRuts(limit = 8) {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(readStorage());
  }, []);

  const addRecent = (rut: string) => {
    const clean = rut.trim();
    if (!clean) return;
    setRecents((prev) => {
      const dedup = [clean, ...prev.filter((r) => r !== clean)].slice(0, limit);
      writeStorage(dedup);
      return dedup;
    });
  };

  const clearRecents = () => {
    writeStorage([]);
    setRecents([]);
  };

  return { recents, addRecent, clearRecents };
}
