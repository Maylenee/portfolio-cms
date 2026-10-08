import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api } from '../api/client';
import { defaultContent } from '../content/defaultContent';
import { getItem, setItem } from '../utils/storage';

const CACHE_KEY = 'portfolio.content.v1';
const ContentContext = createContext(null);

// Data lama punya satu `link`; sekarang `links` (banyak). Migrasi otomatis agar tidak hilang.
function normalizePost(p) {
  if (!p || typeof p !== 'object') return p;
  const { link, ...rest } = p;
  const links = Array.isArray(p.links) ? p.links : link ? [{ label: '', url: String(link) }] : [];
  return { ...rest, links: links.map((l, i) => ({ ...l, id: (l && l.id) || `link-${i}` })) };
}

/** Gabungkan dengan bawaan agar field baru tidak membuat tampilan error pada data lama. */
export function normalizeContent(raw) {
  const c = raw && typeof raw === 'object' ? raw : {};
  return {
    ...defaultContent,
    ...c,
    settings: { ...defaultContent.settings, ...(c.settings || {}) },
    profile: { ...defaultContent.profile, ...(c.profile || {}) },
    tabs: Array.isArray(c.tabs) && c.tabs.length ? c.tabs : defaultContent.tabs,
    posts: Array.isArray(c.posts) ? c.posts.map(normalizePost) : [],
    activity: Array.isArray(c.activity) ? c.activity : [],
    lists: Array.isArray(c.lists) ? c.lists : [],
    resume: { sections: Array.isArray(c.resume && c.resume.sections) ? c.resume.sections : [] },
    about: { ...defaultContent.about, ...(c.about || {}) },
  };
}

function readCache() {
  try {
    const raw = getItem(CACHE_KEY);
    return raw ? normalizeContent(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function ContentProvider({ children }) {
  const [content, setContentState] = useState(readCache);
  // loading → ready | offline (offline = pakai konten bawaan karena API tak terjangkau)
  const [status, setStatus] = useState(() => (readCache() ? 'ready' : 'loading'));

  const apply = useCallback((next) => {
    const normalized = normalizeContent(next);
    setContentState(normalized);
    setItem(CACHE_KEY, JSON.stringify(normalized));
  }, []);

  const load = useCallback(async () => {
    const res = await api.getContent();
    apply(res.content || defaultContent);
    setStatus('ready');
  }, [apply]);

  const reload = useCallback(async () => {
    try {
      await load();
    } catch {
      setContentState((prev) => prev || normalizeContent(defaultContent));
      setStatus((prev) => (prev === 'ready' ? prev : 'offline'));
    }
  }, [load]);

  // Muat saat dibuka; bila gagal, tampilkan konten bawaan lalu coba lagi otomatis (maks 4x, jeda bertambah).
  useEffect(() => {
    let cancelled = false;
    let timer = null;
    const attempt = async (n) => {
      try {
        await load();
      } catch {
        if (cancelled) return;
        setContentState((prev) => prev || normalizeContent(defaultContent));
        setStatus((prev) => (prev === 'ready' ? prev : 'offline'));
        if (n < 4) timer = setTimeout(() => attempt(n + 1), 4000 * (n + 1));
      }
    };
    attempt(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [load]);

  const value = useMemo(() => ({ content, status, setContent: apply, reload }), [content, status, apply, reload]);
  return createElement(ContentContext.Provider, { value }, children);
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent harus dipakai di dalam ContentProvider');
  return ctx;
}
