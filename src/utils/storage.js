import { Platform } from 'react-native';

const memory = new Map();

function webStore(kind) {
  try {
    return typeof window !== 'undefined' ? window[kind] : null;
  } catch {
    return null;
  }
}

export function getItem(key, kind = 'localStorage') {
  if (Platform.OS === 'web') {
    try {
      const store = webStore(kind);
      if (store) return store.getItem(key);
    } catch {
      /* penyimpanan diblokir (mode privat) */
    }
  }
  return memory.get(key) ?? null;
}

export function setItem(key, value, kind = 'localStorage') {
  if (Platform.OS === 'web') {
    try {
      const store = webStore(kind);
      if (store) {
        store.setItem(key, value);
        return;
      }
    } catch {
      /* quota penuh / diblokir */
    }
  }
  memory.set(key, value);
}

export function removeItem(key, kind = 'localStorage') {
  if (Platform.OS === 'web') {
    try {
      const store = webStore(kind);
      if (store) store.removeItem(key);
    } catch {
      /* abaikan */
    }
  }
  memory.delete(key);
}
