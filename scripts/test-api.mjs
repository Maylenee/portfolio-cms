/**
 * Uji cepat node function tanpa EdgeOne: Blob store ditiru dengan Map.
 * Jalankan: npm run test:api
 */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const file = path.resolve('node-functions/api/[[default]].js');
const mod = await import(pathToFileURL(file).href);

const data = new Map();
const store = {
  get: async (k) => (data.has(k) ? JSON.parse(data.get(k)) : null),
  setJSON: async (k, v) => void data.set(k, JSON.stringify(v)),
  delete: async (k) => void data.delete(k),
};
globalThis.__PORTFOLIO_TEST_STORE__ = store;
const env = { ADMIN_PASSWORD: 'rahasia-123', SESSION_SECRET: 'x'.repeat(40) };

const call = (handler, method, p, { body, token, headers = {} } = {}) =>
  handler({
    env,
    request: new Request(`https://site.test${p}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    }),
  });

const read = async (res) => ({ status: res.status, data: await res.json() });

const sample = {
  profile: { name: 'Tes' },
  tabs: [], posts: [], activity: [], lists: [],
  resume: { sections: [] },
  about: { paragraphs: [], services: [] },
};

let r = await read(await call(mod.onRequestGet, 'GET', '/api/health'));
assert.equal(r.status, 200);
assert.equal(r.data.blob, true);
assert.equal(r.data.storage, 'blob');

r = await read(await call(mod.onRequestGet, 'GET', '/api/content'));
assert.equal(r.data.content, null, 'Blob kosong → content null');

r = await read(await call(mod.onRequestPut, 'PUT', '/api/content', { body: sample }));
assert.equal(r.status, 401, 'PUT tanpa token ditolak');

r = await read(await call(mod.onRequestPost, 'POST', '/api/login', { body: { password: 'salah' } }));
assert.equal(r.status, 401, 'password salah ditolak');

r = await read(await call(mod.onRequestPost, 'POST', '/api/login', { body: { password: 'rahasia-123' } }));
assert.equal(r.status, 200);
const { token } = r.data;
assert.ok(token.includes('.'));

r = await read(await call(mod.onRequestGet, 'GET', '/api/session', { token }));
assert.equal(r.status, 200);

r = await read(await call(mod.onRequestGet, 'GET', '/api/session', { token: `${token}x` }));
assert.equal(r.status, 401, 'token dimodifikasi ditolak');

r = await read(await call(mod.onRequestPut, 'PUT', '/api/content', { body: { nope: 1 }, token }));
assert.equal(r.status, 422, 'validasi struktur');

r = await read(await call(mod.onRequestPut, 'PUT', '/api/content', { body: sample, token }));
assert.equal(r.status, 200);
assert.ok(r.data.content.updatedAt);

r = await read(await call(mod.onRequestGet, 'GET', '/api/content'));
assert.equal(r.data.content.profile.name, 'Tes', 'konten tersimpan terbaca publik');

r = await read(await call(mod.onRequestDelete, 'DELETE', '/api/content', { token }));
assert.equal(r.status, 200);
r = await read(await call(mod.onRequestGet, 'GET', '/api/content'));
assert.equal(r.data.content, null, 'reset berhasil');

// Rate limit: 5 percobaan salah → ke-6 diblokir
for (let i = 0; i < 5; i += 1) {
  await call(mod.onRequestPost, 'POST', '/api/login', { body: { password: 'salah' }, headers: { 'x-forwarded-for': '9.9.9.9' } });
}
r = await read(await call(mod.onRequestPost, 'POST', '/api/login', { body: { password: 'rahasia-123' }, headers: { 'x-forwarded-for': '9.9.9.9' } }));
assert.equal(r.status, 429, 'rate limit aktif');

// Blob tidak tersedia: baca tetap aman, tulis memberi 503 yang jelas
globalThis.__PORTFOLIO_TEST_STORE__ = {
  get: async () => { throw new Error('tidak terhubung'); },
  setJSON: async () => { throw new Error('tidak terhubung'); },
  delete: async () => { throw new Error('tidak terhubung'); },
};
const down = await read(await call(mod.onRequestGet, 'GET', '/api/content'));
assert.equal(down.data.blob, false, 'tanpa Blob tetap aman');
const { token: t2 } = (await read(await call(mod.onRequestPost, 'POST', '/api/login', { body: { password: 'rahasia-123' }, headers: { 'x-forwarded-for': '1.1.1.1' } }))).data;
assert.ok(t2, 'login tetap jalan tanpa Blob');
const put503 = await read(await call(mod.onRequestPut, 'PUT', '/api/content', { body: sample, token: t2 }));
assert.equal(put503.status, 503);

console.log('Semua uji API lulus.');
