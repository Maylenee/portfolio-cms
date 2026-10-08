import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import Avatar from '../components/Avatar';
import { DEFAULT_LAYOUT, LAYOUTS } from '../components/PostGallery';
import { ICON_NAMES } from '../components/ServiceIcon';
import { normalizeContent } from '../hooks/useContent';
import { fonts } from '../theme';
import { hostOf } from '../utils/links';
import { relativeTime } from '../utils/time';
import ListEditor from './ListEditor';
import MarkdownEditor from './MarkdownEditor';
import { A, Button, Field, FieldRow, ImageField, Section, SettingRow } from './ui';

const hint = { color: A.muted, fontFamily: fonts.main, fontSize: 15, lineHeight: 22 };
const clip = (text = '', n = 70) => (text.length > n ? `${text.slice(0, n)}…` : text);

export function ProfilePanel({ draft, set }) {
  const accent = draft.settings.accent || '';
  const validAccent = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(accent);
  return (
    <View>
      <Section title="Profile" first>
        <FieldRow
          title="Foto profil"
          description="Foto yang tampil di header dan kartu kegiatan."
          value={<Avatar uri={draft.profile.avatar} name={draft.profile.name} size={34} />}
        >
          <ImageField value={draft.profile.avatar} onChange={(v) => set(['profile', 'avatar'], v)} maxSize={256} />
        </FieldRow>
        <FieldRow title="Nama" description="Nama yang tampil di header situs." value={draft.profile.name}>
          <Field value={draft.profile.name} onChange={(v) => set(['profile', 'name'], v)} />
        </FieldRow>
        <FieldRow title="Judul tab browser" description="Teks yang muncul di tab browser." value={draft.settings.siteTitle}>
          <Field value={draft.settings.siteTitle} onChange={(v) => set(['settings', 'siteTitle'], v)} />
        </FieldRow>
      </Section>
      <Section title="Appearance">
        <FieldRow
          title="Warna aksen"
          description="Dipakai untuk titik, tahun, dan ikon di Resume dan About."
          value={
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
              <Text style={{ ...hint, fontSize: 17 }}>{accent}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: validAccent ? accent : A.line }} />
            </View>
          }
        >
          <Field
            value={accent}
            onChange={(v) => set(['settings', 'accent'], v)}
            placeholder="#ffdb70"
            hint={validAccent ? undefined : 'Gunakan format hex, mis. #ffdb70'}
          />
        </FieldRow>
      </Section>
    </View>
  );
}

// Bersihkan input URL/path tab: link luar (http/https) dibiarkan, path internal
// dipaksa diawali "/" dan tanpa spasi.
const isExternal = (v = '') => /^https?:\/\//i.test(v.trim());
const cleanPath = (v = '') => {
  const t = v.trim();
  if (isExternal(t)) return t;
  const slug = t.replace(/\s+/g, '-').replace(/^\/*/, '');
  return `/${slug}`;
};
const newTabId = () => `tab-${Date.now().toString(36)}`;

export function TabsPanel({ draft, set }) {
  const onChange = (items) => set(['tabs'], items.map((t) => ({ ...t, path: cleanPath(t.path) })));
  return (
    <View>
      <Section title="Navigation" first>
        <Text style={[hint, { marginTop: 6 }]}>
          Ubah nama, URL, urutan, atau sembunyikan tab di situs. Tambah tab baru untuk halaman atau link luar.
        </Text>
        <ListEditor
          items={draft.tabs}
          onChange={onChange}
          addLabel="Tab"
          makeItem={() => {
            const id = newTabId();
            return { id, label: 'Tab baru', path: `/${id}`, visible: true };
          }}
          itemTitle={(t) => t.label}
          itemSubtitle={(t) => t.path}
          itemRight={(t) => (t.visible === false ? 'Hidden' : 'Shown')}
          fields={[
            { key: 'label', label: 'Nama tab' },
            { key: 'path', label: 'URL tab (mis. /sertifikat atau https://contoh.com)', placeholder: '/halaman' },
            { key: 'visible', label: 'Tampilkan tab', type: 'toggle' },
          ]}
        />
      </Section>
    </View>
  );
}

// Daftar logo saja (untuk Tools dan Client): tinggal upload gambar logonya.
const logoList = (key, label, addLabel) => ({
  key,
  type: 'list',
  label,
  addLabel,
  bulk: { key: 'logo' },
  makeItem: () => ({ logo: '' }),
  itemTitle: (it) => (it.logo ? 'Logo' : '(kosong)'),
  itemRight: () => 'Ubah',
  fields: [{ key: 'logo', label: 'Logo', type: 'image' }],
});

// Dulu "Stories", sekarang berfungsi sebagai Activity.
export function PostsPanel({ draft, set }) {
  return (
    <View>
      <Section title="Activity" first>
        <ListEditor
          items={draft.posts}
          onChange={(v) => set(['posts'], v)}
          addLabel="Kegiatan"
          makeItem={() => ({
            title: 'Judul baru',
            links: [],
            showLink: true,
            excerpt: '',
            body: '',
            image: '',
            images: [],
            layout: DEFAULT_LAYOUT,
            clients: [],
            showClient: true,
            tools: [],
            stack: [],
            publishedAt: new Date().toISOString(),
            published: true,
          })}
          itemTitle={(p) => p.title}
          itemSubtitle={(p) => clip(p.excerpt)}
          itemRight={(p) => (p.published === false ? 'Draft' : relativeTime(p.publishedAt))}
          fields={[
            { key: 'title', label: 'Judul' },
            { key: 'excerpt', label: 'Kutipan (tampil di kartu)', type: 'multiline' },
            { key: 'body', label: 'Isi lengkap (Markdown)', type: 'markdown' },
            { key: 'image', label: 'Gambar sampul (opsional, kosong = gambar pertama galeri)', type: 'image' },
            {
              key: 'images',
              type: 'list',
              label: 'Galeri gambar (bisa lebih dari satu)',
              addLabel: 'Gambar',
              makeItem: () => ({ src: '' }),
              itemTitle: (it) => (it.src ? 'Gambar' : '(kosong)'),
              itemRight: () => 'Ubah',
              fields: [{ key: 'src', label: 'Gambar', type: 'image' }],
            },
            { key: 'layout', label: 'Kolase galeri', type: 'choice', options: LAYOUTS },
            { key: 'showLink', label: 'Tampilkan link', type: 'toggle' },
            {
              key: 'links',
              type: 'list',
              label: 'Link (tampil di bawah, bisa lebih dari satu)',
              addLabel: 'Link',
              makeItem: () => ({ label: '', url: '' }),
              itemTitle: (it) => it.label || hostOf(it.url) || '(kosong)',
              itemSubtitle: (it) => (it.label ? it.url : ''),
              itemRight: () => 'Ubah',
              fields: [
                { key: 'label', label: 'Nama link (opsional, mis. Artikel Medium)', placeholder: 'Artikel Medium' },
                { key: 'url', label: 'URL', placeholder: 'https://' },
              ],
            },
            logoList('tools', 'Tools (logo)', 'Logo'),
            logoList('stack', 'Stack (logo)', 'Logo'),
            { key: 'showClient', label: 'Tampilkan client', type: 'toggle' },
            logoList('clients', 'Client (logo)', 'Logo'),
            { key: 'publishedAt', label: 'Waktu terbit', type: 'date' },
            { key: 'published', label: 'Diterbitkan', type: 'toggle' },
          ]}
        />
      </Section>
    </View>
  );
}

export function ResumePanel({ draft, set }) {
  return (
    <View>
      <Section title="Resume" first>
        <ListEditor
          items={draft.resume.sections}
          onChange={(v) => set(['resume', 'sections'], v)}
          addLabel="Grup"
          makeItem={() => ({ title: 'Grup baru', items: [] })}
          itemTitle={(s) => s.title}
          itemSubtitle={(s) => s.items.map((i) => i.title).join(', ')}
          itemRight={(s) => `${s.items.length} entri`}
          fields={[
            { key: 'title', label: 'Judul grup (mis. Education)' },
            {
              key: 'items',
              type: 'list',
              label: 'Entri',
              addLabel: 'Entri',
              makeItem: () => ({ title: 'Judul baru', period: '', description: '' }),
              itemTitle: (it) => it.title,
              itemSubtitle: (it) => it.period,
              itemRight: () => 'Ubah',
              fields: [
                { key: 'title', label: 'Judul' },
                { key: 'period', label: 'Periode', placeholder: '2015 — Present' },
                { key: 'description', label: 'Deskripsi', type: 'multiline' },
              ],
            },
          ]}
        />
      </Section>
    </View>
  );
}

// ActivityPanel lama (daftar teks pendek) dihapus; Activity kini memakai PostsPanel di atas.

export function ListsPanel({ draft, set }) {
  return (
    <View>
      <Section title="Lists" first>
        <ListEditor
          items={draft.lists}
          onChange={(v) => set(['lists'], v)}
          addLabel="Koleksi"
          makeItem={() => ({ title: 'Koleksi baru', description: 'Koleksi', image: '', postIds: [] })}
          itemTitle={(l) => l.title}
          itemSubtitle={(l) => l.description}
          itemRight={(l) => `${(l.postIds || []).length} cerita`}
          extra={{ posts: draft.posts }}
          fields={[
            { key: 'title', label: 'Judul' },
            { key: 'description', label: 'Keterangan singkat' },
            { key: 'image', label: 'Gambar', type: 'image' },
            { key: 'postIds', label: 'Isi koleksi', type: 'posts' },
          ]}
        />
      </Section>
    </View>
  );
}

export function AboutPanel({ draft, set }) {
  const { paragraphs } = draft.about;
  const [open, setOpen] = useState({});
  const setPara = (i, v) => set(['about', 'paragraphs'], paragraphs.map((p, idx) => (idx === i ? v : p)));
  return (
    <View>
      <Section title="Bio" first>
        <SettingRow
          title="Tambah paragraf"
          right="+"
          onPress={() => {
            set(['about', 'paragraphs'], ['', ...paragraphs]);
            setOpen({ 0: true });
          }}
        />
        {paragraphs.length === 0 ? <Text style={[hint, { paddingVertical: 12 }]}>Belum ada paragraf.</Text> : null}
        {paragraphs.map((p, i) => (
          <SettingRow
            key={i}
            title={clip(p, 80) || '(kosong)'}
            description={i === 0 ? 'Blok pertama tampil besar sebagai pembuka. Mendukung Markdown.' : 'Mendukung Markdown.'}
            right={open[i] ? undefined : 'Ubah'}
            expanded={Boolean(open[i])}
            onPress={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
          >
            <MarkdownEditor value={p} onChange={(v) => setPara(i, v)} minHeight={220} placeholder="Tulis bio… (mendukung **tebal**, *miring*, [tautan](url), daftar, judul)" />
            <Button small kind="danger" label="Hapus" onPress={() => set(['about', 'paragraphs'], paragraphs.filter((_, idx) => idx !== i))} />
          </SettingRow>
        ))}
      </Section>
      <Section title="Services">
        <FieldRow title="Judul bagian layanan" description="Kosongkan bila tidak ada layanan." value={draft.about.servicesTitle || '—'}>
          <Field value={draft.about.servicesTitle} onChange={(v) => set(['about', 'servicesTitle'], v)} />
        </FieldRow>
        <ListEditor
          items={draft.about.services}
          onChange={(v) => set(['about', 'services'], v)}
          addLabel="Layanan"
          makeItem={() => ({ title: 'Layanan baru', description: '', icon: 'star' })}
          itemTitle={(s) => s.title}
          itemSubtitle={(s) => clip(s.description)}
          fields={[
            { key: 'title', label: 'Nama layanan' },
            { key: 'icon', label: 'Ikon', type: 'choice', options: ICON_NAMES },
            { key: 'description', label: 'Deskripsi', type: 'multiline' },
          ]}
        />
      </Section>
    </View>
  );
}

export function DataPanel({ draft, replaceDraft, onResetRemote, onLogout, busy, notify }) {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const kb = Math.round(JSON.stringify(draft).length / 1024);

  const exportJson = () => {
    if (Platform.OS === 'web') {
      const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `portfolio-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      setText(JSON.stringify(draft, null, 2));
    }
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !parsed.profile) throw new Error('Struktur JSON tidak dikenali.');
      replaceDraft(normalizeContent(parsed));
      setMsg('');
      notify('Diimpor ke draft. Tekan Simpan untuk menerapkan.');
    } catch (e) {
      setMsg(`Gagal impor: ${e.message}`);
    }
  };

  return (
    <View>
      <Section title="Backup" first>
        <SettingRow title="Ekspor JSON" description="Unduh seluruh konten sebagai berkas JSON." arrow onPress={exportJson} />
        <FieldRow title="Impor JSON" description="Tempel JSON hasil ekspor untuk mengisi draft.">
          <Field value={text} onChange={setText} multiline />
          <Button small label="Impor ke draft" onPress={importJson} disabled={!text.trim()} />
          {msg ? <Text style={[hint, { marginTop: 10 }]}>{msg}</Text> : null}
        </FieldRow>
      </Section>
      <Section title="Storage">
        <SettingRow
          title="Ukuran konten"
          description="Disimpan di EdgeOne Pages Blob. Batas simpan 2048 KB, gambar yang diunggah ikut dihitung."
          right={`${kb} KB`}
        />
      </Section>
      <Section title="Account">
        <SettingRow title="Keluar" description="Akhiri sesi admin di perangkat ini." onPress={onLogout} danger />
        <SettingRow
          title="Reset ke konten bawaan"
          description="Menghapus konten tersimpan di Blob. Situs kembali memakai konten bawaan."
          onPress={busy ? undefined : onResetRemote}
          danger
        />
      </Section>
    </View>
  );
}