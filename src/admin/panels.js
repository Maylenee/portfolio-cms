import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { colors, fonts } from '../theme';
import { normalizeContent } from '../hooks/useContent';
import ListEditor from './ListEditor';
import { Button, Card, Field, H, ImageField } from './ui';

const muted = { color: colors.muted, fontFamily: fonts.main, fontSize: 13, lineHeight: 19 };

export function ProfilePanel({ draft, set }) {
  const accent = draft.settings.accent || '';
  const validAccent = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(accent);
  return (
    <View>
      <H>Profil & situs</H>
      <Card>
        <ImageField label="Foto profil" value={draft.profile.avatar} onChange={(v) => set(['profile', 'avatar'], v)} maxSize={256} />
        <Field label="Nama" value={draft.profile.name} onChange={(v) => set(['profile', 'name'], v)} />
        <Field label="Judul tab browser" value={draft.settings.siteTitle} onChange={(v) => set(['settings', 'siteTitle'], v)} />
        <Field
          label="Warna aksen resume (hex)"
          value={accent}
          onChange={(v) => set(['settings', 'accent'], v)}
          placeholder="#ffdb70"
          hint={validAccent ? 'Dipakai untuk titik, tahun, dan ikon di Resume.' : 'Gunakan format hex, mis. #ffdb70'}
        />
        <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: validAccent ? accent : colors.border }} />
      </Card>
    </View>
  );
}

export function TabsPanel({ draft, set }) {
  return (
    <View>
      <H>Tab navigasi</H>
      <Text style={[muted, { marginBottom: 14 }]}>Ubah nama, urutan, atau sembunyikan tab. Home selalu perlu ada minimal satu tab aktif.</Text>
      <ListEditor
        fixed
        items={draft.tabs}
        onChange={(v) => set(['tabs'], v)}
        itemTitle={(t) => `${t.label}${t.visible === false ? ' (disembunyikan)' : ''}`}
        fields={[
          { key: 'label', label: 'Nama tab' },
          { key: 'visible', label: 'Tampilkan tab', type: 'toggle' },
        ]}
      />
    </View>
  );
}

export function PostsPanel({ draft, set }) {
  return (
    <View>
      <H>Kegiatan (Home)</H>
      <ListEditor
        items={draft.posts}
        onChange={(v) => set(['posts'], v)}
        addLabel="Kegiatan"
        makeItem={() => ({ title: 'Judul baru', excerpt: '', body: '', image: '', publishedAt: new Date().toISOString(), published: true })}
        itemTitle={(p) => p.title}
        fields={[
          { key: 'title', label: 'Judul' },
          { key: 'excerpt', label: 'Kutipan (tampil di kartu)', type: 'multiline' },
          { key: 'body', label: 'Isi lengkap (pisahkan paragraf dengan baris kosong)', type: 'multiline' },
          { key: 'image', label: 'Gambar thumbnail', type: 'image' },
          { key: 'publishedAt', label: 'Waktu terbit', type: 'date' },
          { key: 'published', label: 'Diterbitkan', type: 'toggle' },
        ]}
      />
    </View>
  );
}

export function ResumePanel({ draft, set }) {
  return (
    <View>
      <H>Resume</H>
      <ListEditor
        items={draft.resume.sections}
        onChange={(v) => set(['resume', 'sections'], v)}
        addLabel="Grup"
        makeItem={() => ({ title: 'Grup baru', items: [] })}
        itemTitle={(s) => s.title}
        fields={[
          { key: 'title', label: 'Judul grup (mis. Education)' },
          {
            key: 'items',
            type: 'list',
            label: 'Entri',
            addLabel: 'Entri',
            makeItem: () => ({ title: 'Judul baru', period: '', description: '' }),
            itemTitle: (it) => it.title,
            fields: [
              { key: 'title', label: 'Judul' },
              { key: 'period', label: 'Periode', placeholder: '2015 — Present' },
              { key: 'description', label: 'Deskripsi', type: 'multiline' },
            ],
          },
        ]}
      />
    </View>
  );
}

export function ActivityPanel({ draft, set }) {
  return (
    <View>
      <H>Activity</H>
      <ListEditor
        items={draft.activity}
        onChange={(v) => set(['activity'], v)}
        addLabel="Aktivitas"
        makeItem={() => ({ text: '', date: new Date().toISOString() })}
        itemTitle={(a) => a.text}
        fields={[
          { key: 'text', label: 'Keterangan', type: 'multiline' },
          { key: 'date', label: 'Waktu', type: 'date' },
        ]}
      />
    </View>
  );
}

export function ListsPanel({ draft, set }) {
  return (
    <View>
      <H>Lists</H>
      <ListEditor
        items={draft.lists}
        onChange={(v) => set(['lists'], v)}
        addLabel="Koleksi"
        makeItem={() => ({ title: 'Koleksi baru', description: 'Koleksi', postIds: [] })}
        itemTitle={(l) => l.title}
        extra={{ posts: draft.posts }}
        fields={[
          { key: 'title', label: 'Judul' },
          { key: 'description', label: 'Keterangan singkat' },
          { key: 'postIds', label: 'Isi koleksi', type: 'posts' },
        ]}
      />
    </View>
  );
}

export function AboutPanel({ draft, set }) {
  const { paragraphs } = draft.about;
  const setPara = (i, v) => set(['about', 'paragraphs'], paragraphs.map((p, idx) => (idx === i ? v : p)));
  return (
    <View>
      <H>About</H>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: 16, fontWeight: '600' }}>Paragraf bio ({paragraphs.length})</Text>
        <Button small kind="primary" label="+ Paragraf" onPress={() => set(['about', 'paragraphs'], ['', ...paragraphs])} />
      </View>
      {paragraphs.map((p, i) => (
        <Card key={i}>
          <Field value={p} onChange={(v) => setPara(i, v)} multiline />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button small kind="danger" label="Hapus" onPress={() => set(['about', 'paragraphs'], paragraphs.filter((_, idx) => idx !== i))} />
          </View>
        </Card>
      ))}
      <View style={{ height: 14 }} />
      <Field label="Judul bagian layanan" value={draft.about.servicesTitle} onChange={(v) => set(['about', 'servicesTitle'], v)} />
      <ListEditor
        title="Layanan"
        items={draft.about.services}
        onChange={(v) => set(['about', 'services'], v)}
        addLabel="Layanan"
        makeItem={() => ({ title: 'Layanan baru', description: '' })}
        itemTitle={(s) => s.title}
        fields={[
          { key: 'title', label: 'Nama layanan' },
          { key: 'description', label: 'Deskripsi', type: 'multiline' },
        ]}
      />
    </View>
  );
}

export function DataPanel({ draft, replaceDraft, onResetRemote, busy }) {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const json = JSON.stringify(draft);
  const kb = Math.round(json.length / 1024);

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
      setMsg('Diimpor ke draft. Tekan Simpan untuk menerapkan.');
    } catch (e) {
      setMsg(`Gagal impor: ${e.message}`);
    }
  };

  return (
    <View>
      <H>Data</H>
      <Card>
        <Text style={muted}>Ukuran konten saat ini: {kb} KB (batas simpan 2048 KB). Gambar yang diunggah ikut dihitung.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <Button small label="Ekspor JSON" onPress={exportJson} />
        </View>
      </Card>
      <Card>
        <Field label="Impor JSON (tempel di sini)" value={text} onChange={setText} multiline />
        <Button small label="Impor ke draft" onPress={importJson} disabled={!text.trim()} />
        {msg ? <Text style={[muted, { marginTop: 10 }]}>{msg}</Text> : null}
      </Card>
      <Card>
        <Text style={[muted, { marginBottom: 12 }]}>Hapus konten tersimpan di KV. Situs akan kembali memakai konten bawaan.</Text>
        <Button small kind="danger" label="Reset ke konten bawaan" onPress={onResetRemote} disabled={busy} />
      </Card>
    </View>
  );
}

