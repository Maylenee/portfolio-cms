import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import Avatar from '../components/Avatar';
import { ICON_NAMES } from '../components/ServiceIcon';
import { normalizeContent } from '../hooks/useContent';
import { fonts } from '../theme';
import { relativeTime } from '../utils/time';
import ListEditor from './ListEditor';
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

export function TabsPanel({ draft, set }) {
  return (
    <View>
      <Section title="Navigation" first>
        <Text style={[hint, { marginTop: 6 }]}>Ubah nama, urutan, atau sembunyikan tab di situs.</Text>
        <ListEditor
          fixed
          items={draft.tabs}
          onChange={(v) => set(['tabs'], v)}
          itemTitle={(t) => t.label}
          itemRight={(t) => (t.visible === false ? 'Hidden' : 'Shown')}
          fields={[
            { key: 'label', label: 'Nama tab' },
            { key: 'visible', label: 'Tampilkan tab', type: 'toggle' },
          ]}
        />
      </Section>
    </View>
  );
}

export function PostsPanel({ draft, set }) {
  return (
    <View>
      <Section title="Stories" first>
        <ListEditor
          items={draft.posts}
          onChange={(v) => set(['posts'], v)}
          addLabel="Kegiatan"
          makeItem={() => ({ title: 'Judul baru', excerpt: '', body: '', image: '', publishedAt: new Date().toISOString(), published: true })}
          itemTitle={(p) => p.title}
          itemSubtitle={(p) => clip(p.excerpt)}
          itemRight={(p) => (p.published === false ? 'Draft' : relativeTime(p.publishedAt))}
          fields={[
            { key: 'title', label: 'Judul' },
            { key: 'excerpt', label: 'Kutipan (tampil di kartu)', type: 'multiline' },
            { key: 'body', label: 'Isi lengkap (pisahkan paragraf dengan baris kosong)', type: 'multiline' },
            { key: 'image', label: 'Gambar thumbnail', type: 'image' },
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

export function ActivityPanel({ draft, set }) {
  return (
    <View>
      <Section title="Activity" first>
        <ListEditor
          items={draft.activity}
          onChange={(v) => set(['activity'], v)}
          addLabel="Aktivitas"
          makeItem={() => ({ text: '', date: new Date().toISOString() })}
          itemTitle={(a) => clip(a.text, 60)}
          itemRight={(a) => relativeTime(a.date)}
          fields={[
            { key: 'text', label: 'Keterangan', type: 'multiline' },
            { key: 'date', label: 'Waktu', type: 'date' },
          ]}
        />
      </Section>
    </View>
  );
}

export function ListsPanel({ draft, set }) {
  return (
    <View>
      <Section title="Certifications" first>
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
            description={i === 0 ? 'Paragraf pertama tampil besar sebagai pembuka.' : undefined}
            right={open[i] ? undefined : 'Ubah'}
            expanded={Boolean(open[i])}
            onPress={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
          >
            <Field value={p} onChange={(v) => setPara(i, v)} multiline />
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

export function DataPanel({ draft, replaceDraft, onResetRemote, onLogout, busy }) {
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
      setMsg('Diimpor ke draft. Tekan Simpan untuk menerapkan.');
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
