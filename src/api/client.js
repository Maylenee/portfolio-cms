import { getItem, removeItem, setItem } from '../utils/storage';

// Di web, API satu origin (/api/...). Di native, set EXPO_PUBLIC_API_BASE=https://domain-anda.com
const BASE = (process.env.EXPO_PUBLIC_API_BASE || '').replace(/\/$/, '');
const TOKEN_KEY = 'portfolio.admin.token';

async function request(path, { method = 'GET', body, token, timeout = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!res.ok) {
      const error = new Error((data && data.error) || `Permintaan gagal (${res.status})`);
      error.status = res.status;
      throw error;
    }
    if (data === null) {
      // Mis. dev server mengembalikan HTML untuk /api/* karena edge function tidak jalan.
      throw new Error('API tidak mengembalikan JSON. Jalankan dengan `npm run dev:edge`.');
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  getContent: () => request('/api/content'),
  login: (password) => request('/api/login', { method: 'POST', body: { password } }),
  checkSession: (token) => request('/api/session', { token }),
  saveContent: (content, token) => request('/api/content', { method: 'PUT', body: content, token, timeout: 20000 }),
  resetContent: (token) => request('/api/content', { method: 'DELETE', token }),
};

export const tokenStore = {
  get: () => getItem(TOKEN_KEY, 'sessionStorage'),
  set: (token) => setItem(TOKEN_KEY, token, 'sessionStorage'),
  clear: () => removeItem(TOKEN_KEY, 'sessionStorage'),
};
