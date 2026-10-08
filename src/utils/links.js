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

// Ikon diambil otomatis dari domain URL (favicon situs tersebut).
export function faviconFor(u = '', size = 64) {
  const host = hostOf(u);
  return host ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}` : '';
}

export function openUrl(u = '') {
  const url = safeUrl(u);
  if (!url) return;
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  else Linking.openURL(url);
}
