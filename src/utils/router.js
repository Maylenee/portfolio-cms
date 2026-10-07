import { Platform } from 'react-native';
import { useSyncExternalStore } from 'react';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
const listeners = new Set();

function parse(hash) {
  const path = (hash || '').replace(/^#/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

let current = isWeb ? parse(window.location.hash) : '/';

if (isWeb) {
  window.addEventListener('hashchange', () => {
    current = parse(window.location.hash);
    listeners.forEach((l) => l());
  });
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function navigate(path) {
  if (isWeb) {
    window.location.hash = `#${path}`;
    window.scrollTo(0, 0);
    return;
  }
  current = path;
  listeners.forEach((l) => l());
}

export function useRoute() {
  return useSyncExternalStore(subscribe, () => current, () => '/');
}

export function pathToUrl(path) {
  if (isWeb) return `${window.location.origin}${window.location.pathname}#${path}`;
  return path;
}
