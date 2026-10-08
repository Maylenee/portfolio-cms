// Helper untuk tab navigasi yang bisa diubah dari CMS (nama + URL).
// Dipakai oleh komponen nav utama dan router supaya keduanya membaca data yang sama.

// Path bawaan per id, dipakai bila tab lama belum punya field `path`.
const DEFAULT_PATHS = {
  home: '/',
  resume: '/resume',
  activity: '/activity',
  lists: '/lists',
  about: '/about',
};

export const isExternal = (p = '') => /^https?:\/\//i.test(p);

const trim = (p = '/') => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';

export function tabPath(tab) {
  return tab.path || DEFAULT_PATHS[tab.id] || `/${tab.id}`;
}

// Tab yang tampil di nav situs, sesuai urutan di CMS.
export function visibleTabs(tabs = []) {
  return tabs.filter((t) => t.visible !== false).map((t) => ({ ...t, path: tabPath(t) }));
}

// Cari tab dari pathname, mis. "/sertifikat" -> { id: 'lists', ... }.
// Dipakai router untuk memutuskan layar mana yang dirender.
export function findTabByPath(tabs = [], pathname = '/') {
  const target = trim(pathname);
  return tabs.find((t) => !isExternal(tabPath(t)) && trim(tabPath(t)) === target) || null;
}
