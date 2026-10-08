/**
 * EdgeOne Pages — Node Function (catch-all untuk /api/*)
 *
 * Penyimpanan memakai Pages Blob (@edgeone/pages-blob), yang hanya tersedia di Node Functions.
 *
 * Endpoint:
 *   GET    /api/health    cek status & ketersediaan Blob (publik)
 *   GET    /api/content   ambil konten portfolio (publik)
 *   PUT    /api/content   simpan konten (butuh token admin)
 *   DELETE /api/content   reset ke konten bawaan (butuh token admin)
 *   POST   /api/login     tukar password admin dengan token (dibatasi percobaannya)
 *   GET    /api/session   cek token masih valid (butuh token admin)
 *
 * Prasyarat di EdgeOne Pages Console: isi environment variables ADMIN_PASSWORD dan SESSION_SECRET.
 * Blob tidak perlu dibuat/di-bind manual; store dibuat otomatis saat pertama kali ditulis.
 */

import { webcrypto } from 'node:crypto';

import { getStore } from '@edgeone/pages-blob';

const CONTENT_KEY = 'site-content';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB (termasuk gambar yang diunggah)
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

const encoder = new TextEncoder();
const subtle = (globalThis.crypto || webcrypto).subtle;
const STORE_NAME = 'portfolio';

/* ------------------------------ helpers ------------------------------ */

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(),
      ...extra,
    },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Strong consistency: hasil simpan langsung terbaca (tanpa cache CDN).
 * `globalThis.__PORTFOLIO_TEST_STORE__` hanya dipakai oleh scripts/test-edge.mjs.
 */
function getBlobStore() {
  return globalThis.__PORTFOLIO_TEST_STORE__ || getStore({ name: STORE_NAME, consistency: 'strong' });
}

function envOf(context, name) {
  return (context.env && context.env[name]) || process.env[name];
}

function blobError(error) {
  const wrapped = new Error(`Penyimpanan Blob tidak tersedia: ${error.message}. Pastikan sudah deploy di EdgeOne Pages atau jalankan edgeone pages link.`);
  wrapped.status = 503;
  return wrapped;
}

function routeOf(request) {
  const { pathname } = new URL(request.url);
  return pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
}

function toBase64Url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(secret, data) {
  const key = await subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return new Uint8Array(await subtle.sign('HMAC', key, encoder.encode(data)));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function sha256(text) {
  return new Uint8Array(await subtle.digest('SHA-256', encoder.encode(text)));
}

async function passwordMatches(input, expected) {
  // Bandingkan hash agar panjang & waktu pembandingan tidak membocorkan password.
  const [a, b] = await Promise.all([sha256(String(input)), sha256(String(expected))]);
  return safeEqual(a, b);
}

async function signToken(secret) {
  const payload = toBase64Url(encoder.encode(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })));
  const sig = toBase64Url(await hmac(secret, payload));
  return { token: `${payload}.${sig}`, expiresAt: Date.now() + TOKEN_TTL_MS };
}

async function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || !secret) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  try {
    const expected = await hmac(secret, payload);
    if (!safeEqual(expected, fromBase64Url(sig))) return false;
    const { exp } = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

async function isAuthorized(context) {
  const header = context.request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return verifyToken(token, envOf(context, 'SESSION_SECRET'));
}

function clientIp(request) {
  return (
    request.headers.get('eo-connecting-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  );
}

async function readJson(request) {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    const error = new Error('Payload terlalu besar (maks 2 MB). Kecilkan ukuran gambar.');
    error.status = 413;
    throw error;
  }
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error('Body bukan JSON yang valid.');
    error.status = 400;
    throw error;
  }
}

/* ------------------------------ slimming ------------------------------ */

// `image` (sampul) yang sama dengan gambar pertama galeri tidak perlu disimpan dua kali:
// klien sudah memakai gambar pertama galeri sebagai sampul bila `image` kosong.
function slimContent(c) {
  if (!c || !Array.isArray(c.posts)) return c;
  return {
    ...c,
    posts: c.posts.map((p) => {
      if (!p || !p.image || !Array.isArray(p.images)) return p;
      const first = p.images.find((i) => i && i.src);
      return first && first.src === p.image ? { ...p, image: '' } : p;
    }),
  };
}

/* ----------------------------- validation ----------------------------- */

const isStr = (v) => typeof v === 'string';
const isArr = (v) => Array.isArray(v);

function validateContent(c) {
  if (!c || typeof c !== 'object') return 'Konten harus berupa objek.';
  if (!c.profile || !isStr(c.profile.name)) return 'profile.name wajib diisi.';
  for (const key of ['tabs', 'posts', 'activity', 'lists']) {
    if (!isArr(c[key])) return `${key} harus berupa array.`;
  }
  if (!c.resume || !isArr(c.resume.sections)) return 'resume.sections harus berupa array.';
  if (!c.about || !isArr(c.about.paragraphs) || !isArr(c.about.services)) {
    return 'about.paragraphs dan about.services harus berupa array.';
  }
  return null;
}

/* ------------------------------ handlers ------------------------------ */

async function handleGet(context) {
  const route = routeOf(context.request);

  if (route === 'health') {
    let blob = true;
    try {
      await getBlobStore().get('__health');
    } catch {
      blob = false;
    }
    return json({ ok: true, storage: 'blob', blob, time: new Date().toISOString() });
  }

  if (route === 'content') {
    try {
      const content = await getBlobStore().get(CONTENT_KEY, { type: 'json' });
      return json({ content: content ? slimContent(content) : null, blob: true });
    } catch {
      // Blob belum siap (mis. dev lokal tanpa link): klien memakai konten bawaan.
      return json({ content: null, blob: false });
    }
  }

  if (route === 'session') {
    return (await isAuthorized(context)) ? json({ ok: true }) : json({ error: 'Unauthorized' }, 401);
  }

  return json({ error: 'Not found' }, 404);
}

async function handlePost(context) {
  const route = routeOf(context.request);
  if (route !== 'login') return json({ error: 'Not found' }, 404);

  const ADMIN_PASSWORD = envOf(context, 'ADMIN_PASSWORD');
  const SESSION_SECRET = envOf(context, 'SESSION_SECRET');
  if (!ADMIN_PASSWORD || !SESSION_SECRET) {
    return json({ error: 'ADMIN_PASSWORD dan SESSION_SECRET belum diatur di environment variables.' }, 500);
  }

  // Pembatasan percobaan login disimpan di Blob; bila Blob tak tersedia, login tetap jalan tanpa batas.
  const store = getBlobStore();
  const attemptKey = `login/${clientIp(context.request).replace(/[^a-zA-Z0-9.:_-]/g, '_')}`;
  let attempts = { count: 0, first: Date.now() };
  let canTrack = true;
  try {
    const saved = await store.get(attemptKey, { type: 'json' });
    if (saved) attempts = saved;
  } catch {
    canTrack = false;
  }
  if (Date.now() - attempts.first > LOGIN_WINDOW_MS) attempts = { count: 0, first: Date.now() };
  if (attempts.count >= LOGIN_MAX_ATTEMPTS) {
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' }, 429);
  }

  const body = await readJson(context.request);
  if (!(await passwordMatches(body && body.password, ADMIN_PASSWORD))) {
    if (canTrack) await store.setJSON(attemptKey, { ...attempts, count: attempts.count + 1 }).catch(() => {});
    return json({ error: 'Password salah.' }, 401);
  }

  if (canTrack) await store.delete(attemptKey).catch(() => {});
  return json(await signToken(SESSION_SECRET));
}

async function handlePut(context) {
  if (routeOf(context.request) !== 'content') return json({ error: 'Not found' }, 404);
  if (!(await isAuthorized(context))) return json({ error: 'Unauthorized' }, 401);

  const content = await readJson(context.request);
  const problem = validateContent(content);
  if (problem) return json({ error: problem }, 422);

  const saved = { ...slimContent(content), updatedAt: new Date().toISOString() };
  try {
    await getBlobStore().setJSON(CONTENT_KEY, saved);
  } catch (error) {
    throw blobError(error);
  }
  return json({ ok: true, content: saved });
}

async function handleDelete(context) {
  if (routeOf(context.request) !== 'content') return json({ error: 'Not found' }, 404);
  if (!(await isAuthorized(context))) return json({ error: 'Unauthorized' }, 401);

  try {
    await getBlobStore().delete(CONTENT_KEY);
  } catch (error) {
    throw blobError(error);
  }
  return json({ ok: true });
}

function guard(handler) {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      return json({ error: error.message || 'Server error' }, error.status || 500);
    }
  };
}

export const onRequestGet = guard(handleGet);
export const onRequestPost = guard(handlePost);
export const onRequestPut = guard(handlePut);
export const onRequestDelete = guard(handleDelete);
export const onRequestOptions = () => new Response(null, { status: 204, headers: corsHeaders() });
