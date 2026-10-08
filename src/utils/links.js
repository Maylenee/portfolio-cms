import { Linking, Platform } from 'react-native';

// Terima "https://…" atau domain polos ("figma.com"). Skema lain (javascript:, dll) ditolak.
export function safeUrl(u = '') {
  const t = String(u || '').trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[\w-]+(\.[\w-]+)+(\/|\?|#|$)/.test(t)) return `https://${t}`;
  return '';
}

export function hostOf(u = '') {
  const m = safeUrl(u).match(/^https?:\/\/([^/?#:]+)/i);
  return m ? m[1].replace(/^www\./i, '') : '';
}

// Teks tampilan URL: tanpa skema/"www."/garis miring akhir, dipotong dengan "…" bila lebih dari `max` karakter.
// Hanya untuk tampilan; tujuan link tetap URL lengkap.
export function shortenUrl(u = '', max = 36) {
  const t = String(u || '').trim().replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

// Ikon diambil otomatis dari domain URL (favicon situs tersebut).
export function faviconFor(u = '', size = 64) {
  const host = hostOf(u);
  return host ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}` : '';
}

// Daftar link sebuah kegiatan: [{ label, url }]. Mendukung data lama (satu field `link`).
export function linksOf(post = {}) {
  const raw = Array.isArray(post.links) ? post.links : post.link ? [{ label: '', url: post.link }] : [];
  return raw
    .filter((l) => l && safeUrl(l.url))
    .map((l) => ({ label: String(l.label || '').trim(), url: safeUrl(l.url) }));
}

export function openUrl(u = '') {
  const url = safeUrl(u);
  if (!url) return;
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  else Linking.openURL(url);
}