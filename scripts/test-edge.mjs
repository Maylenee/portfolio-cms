/**
 * Uji cepat edge function tanpa EdgeOne: KV ditiru dengan Map.
 * Jalankan: npm run test:edge
 */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const file = path.resolve('edge-functions/api/[[default]].js');
const mod = await import(pathToFileURL(file).href);

const store = new Map();
const KV = {
  get: async (k) => (store.has(k) ? store.get(k) : null),
  put: async (k, v) => void store.set(k, v),
  delete: async (k) => void store.delete(k),
};
const env = { KV, ADMIN_PASSWORD: 'rahasia-123', SESSION_SECRET: 'x'.repeat(40) };

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
assert.equal(r.data.kv, true);

r = await read(await call(mod.onRequestGet, 'GET', '/api/content'));
assert.equal(r.data.content, null, 'KV kosong → content null');

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

const noKv = await read(await mod.onRequestGet({ env: {}, request: new Request('https://site.test/api/content') }));
assert.equal(noKv.data.kv, false, 'tanpa KV tetap aman');

console.log('Semua uji edge function lulus.');
