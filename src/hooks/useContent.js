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

  const reload = useCallback(async () => {
    try {
      const res = await api.getContent();
      apply(res.content || defaultContent);
      setStatus('ready');
    } catch {
      setContentState((prev) => prev || normalizeContent(defaultContent));
      setStatus((prev) => (prev === 'ready' ? prev : 'offline'));
    }
  }, [apply]);

  useEffect(() => {
    let cancelled = false;
    api
      .getContent()
      .then((res) => {
        if (cancelled) return;
        apply(res.content || defaultContent);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setContentState((prev) => prev || normalizeContent(defaultContent));
        setStatus((prev) => (prev === 'ready' ? prev : 'offline'));
      });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const value = useMemo(() => ({ content, status, setContent: apply, reload }), [content, status, apply, reload]);
  return createElement(ContentContext.Provider, { value }, children);
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent harus dipakai di dalam ContentProvider');
  return ctx;
}
