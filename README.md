# Portfolio CMS (React Native + Expo + EdgeOne Pages)

Portfolio bergaya halaman profil (hitam, tipografi tebal) dengan **panel admin** untuk mengubah semua konten
tanpa menyentuh kode. Dibangun dengan React Native (Expo, target web via `react-native-web`), ESLint, dan
**EdgeOne Pages Node Functions + Blob Storage**.

## Fitur

- Tab: Home (kegiatan), Resume (timeline Education/Experience), Activity, Lists, About. Nama, urutan, dan visibilitas tab bisa diubah.
- Halaman detail kegiatan (`/#/post/<id>`), menu salin tautan/bagikan.
- Dashboard admin di `/#/admin` (layout bergaya Settings: tab, bagian, baris yang bisa dibuka): edit profil, kegiatan, resume, activity, lists, about; tambah, urutkan, duplikat, hapus; unggah gambar (otomatis dikecilkan); ekspor/impor JSON; reset ke bawaan.
- Login admin lewat password (env var), token bertanda tangan HMAC berlaku 12 jam, pembatasan percobaan login (5 per 10 menit per IP).
- Responsif dari iPhone X (375 px) sampai desktop, termasuk safe-area notch (`viewport-fit=cover`).

## Struktur

```
node-functions/api/[[default]].js   API (/api/*): content, login, session, health  → EdgeOne Node Function + Blob
edgeone.json                        build, redirects, headers (cache & keamanan)
public/index.html                   template web (font, viewport, safe-area)
src/App.js                          shell + routing (hash)
src/screens/                        Home, Resume, Activity, Lists, About, Post
src/components/                     Header, Tabs, PostCard, Timeline, dll
src/admin/                          panel admin (login, editor, panel per bagian)
src/content/defaultContent.js       konten bawaan (seed saja, bukan sumber utama)
scripts/test-api.mjs                uji API dengan Blob store tiruan
```

## Menjalankan lokal

```bash
npm install
npm run web          # UI saja, memakai konten bawaan (mode offline)
npm run lint
npm run test:api    # uji API
```

Untuk mencoba API + Blob lokal (admin berfungsi penuh):

```bash
npm i -g edgeone
edgeone pages link   # hubungkan ke project EdgeOne (Blob ikut terhubung)
edgeone pages dev
```

> Blob berjalan di production, dan secara lokal hanya setelah project di-`link`. Tanpa itu situs tetap tampil dengan konten bawaan.

## Deploy ke EdgeOne Pages

1. Push project ke Git, lalu import di EdgeOne Pages Console. Build command/output sudah ada di `edgeone.json` (`npm run build`, folder `dist`).
2. **Environment variables**: `ADMIN_PASSWORD` dan `SESSION_SECRET` (string acak ≥ 32 karakter). Lihat `.env.example`.
3. Tidak ada namespace yang perlu dibuat atau di-bind. Store Blob bernama `portfolio` dibuat otomatis saat pertama kali menyimpan.
4. Deploy. Buka `https://domain-anda/#/admin`, masuk, edit, tekan **Simpan**. Perubahan langsung tampil di situs.

Blob SDK (`@edgeone/pages-blob`) hanya tersedia di Node Functions, makanya API ada di `node-functions/`. Paket ini sudah ada di `package.json` dan terpasang saat build.

## API

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| GET | `/api/health` | – | status & ketersediaan Blob (`blob: true/false`) |
| GET | `/api/content` | – | konten publik (null bila Blob masih kosong) |
| PUT | `/api/content` | Bearer | simpan konten (divalidasi, maks 2 MB) |
| DELETE | `/api/content` | Bearer | reset ke bawaan |
| POST | `/api/login` | – | `{password}` → `{token, expiresAt}` |
| GET | `/api/session` | Bearer | cek token |

## Catatan

- Font: Inter (tab utama) dan Poppins (Resume) dari Google Fonts. Font referensi aslinya mirip Söhne (berlisensi).
- Routing memakai hash (`/#/resume`) agar tidak perlu rewrite server. `edgeone.json` menyediakan redirect `/admin`, `/resume`, `/about` ke versi hash.
- Konten disimpan sebagai satu berkas JSON (`site-content`) di Blob dengan strong consistency, jadi hasil simpan langsung terbaca. Gambar yang diunggah disimpan sebagai data-URI di dalamnya (otomatis ≤ 800 px). Untuk banyak gambar besar, pakai URL gambar eksternal.
- Aplikasi native (iOS/Android) memakai kode yang sama; set `EXPO_PUBLIC_API_BASE=https://domain-anda` agar bisa menjangkau API. Unggah gambar dari perangkat hanya tersedia di web.
- Satu password admin untuk satu pemilik. Untuk multi-user, perluas `node-functions/api/[[default]].js`.
