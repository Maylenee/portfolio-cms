import { Platform } from 'react-native';
import { useSyncExternalStore } from 'react';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

const readLocation = () => `${window.location.pathname}${window.location.search}`;

// Link lama berbentuk /#/resume dialihkan ke /resume tanpa reload (agar link yang sudah dibagikan tetap jalan).
function migrateHash() {
  const { hash } = window.location;
  if (hash.startsWith('#/')) window.history.replaceState(null, '', hash.slice(1));
}

let current = '/';

if (isWeb) {
  migrateHash();
  current = readLocation();
  window.addEventListener('popstate', () => {
    current = readLocation();
    emit();
  });
  window.addEventListener('hashchange', () => {
    migrateHash();
    current = readLocation();
    emit();
  });
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function navigate(path) {
  const next = path.startsWith('/') ? path : `/${path}`;
  if (isWeb) {
    if (next !== current) window.history.pushState(null, '', next);
    current = next;
    emit();
    window.scrollTo(0, 0);
    return;
  }
  current = next;
  emit();
}

export function useRoute() {
  return useSyncExternalStore(subscribe, () => current, () => '/');
}

export function pathToUrl(path) {
  if (isWeb) return `${window.location.origin}${path}`;
  return path;
}