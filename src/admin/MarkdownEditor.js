import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import Markdown, { ALIGN_ALIASES, RE_ALIGN_CLOSE, RE_ALIGN_OPEN, SIZE_KEYS_SRC } from '../components/Markdown';
import { fonts } from '../theme';
import { A } from './ui';

/* ---------- Operasi teks (murni, mudah diuji) ---------- */

// Bungkus pilihan dengan penanda (toggle: kalau sudah terbungkus, dilepas).
export function wrapSelection(text, { start, end }, pre, suf = pre, placeholder = 'teks') {
  const s = text.slice(start, end);
  const before = text.slice(start - pre.length, start);
  const after = text.slice(end, end + suf.length);
  // Hindari salah baca "*" di dalam "**" (miring vs tebal).
  const clash = pre.length === 1 && text[start - pre.length - 1] === pre;

  if (start >= pre.length && before === pre && after === suf && !clash) {
    return {
      text: text.slice(0, start - pre.length) + s + text.slice(end + suf.length),
      sel: { start: start - pre.length, end: end - pre.length },
    };
  }
  if (s.length >= pre.length + suf.length && s.startsWith(pre) && s.endsWith(suf)) {
    const inner = s.slice(pre.length, s.length - suf.length);
    return { text: text.slice(0, start) + inner + text.slice(end), sel: { start, end: start + inner.length } };
  }
  const inner = s || placeholder;
  return {
    text: text.slice(0, start) + pre + inner + suf + text.slice(end),
    sel: { start: start + pre.length, end: start + pre.length + inner.length },
  };
}

const STRIP = /^(#{1,4}\s+|>\s?|[-*+]\s+|\d+[.)]\s+)/;

// Beri/lepas awalan di setiap baris yang tersentuh pilihan (heading, kutipan, daftar).
export function toggleLinePrefix(text, { start, end }, kind) {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = text.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = text.length;
  const lines = text.slice(lineStart, lineEnd).split('\n');
  const prefixOf = (n) => (kind === 'ol' ? `${n + 1}. ` : kind);
  const filled = lines.filter((l) => l.trim());
  const has = filled.length > 0 && filled.every((l) => l.startsWith(prefixOf(lines.indexOf(l))));
  let n = -1;
  const next = lines.map((l) => {
    if (!l.trim()) return l;
    n += 1;
    return has ? l.slice(prefixOf(n).length) : prefixOf(n) + l.replace(STRIP, '');
  });
  const block = next.join('\n');
  const pos = lineStart + block.length;
  return {
    text: text.slice(0, lineStart) + block + text.slice(lineEnd),
    sel: start === end ? { start: pos, end: pos } : { start: lineStart, end: pos },
  };
}

export function insertLink(text, { start, end }) {
  const s = text.slice(start, end);
  if (/^https?:\/\/\S+$/.test(s)) {
    const out = `[teks](${s})`;
    return { text: text.slice(0, start) + out + text.slice(end), sel: { start: start + 1, end: start + 5 } };
  }
  const label = s || 'teks';
  const out = `[${label}](https://)`;
  const urlStart = start + label.length + 3;
  return { text: text.slice(0, start) + out + text.slice(end), sel: { start: urlStart, end: urlStart + 8 } };
}

/* ----- Ukuran huruf: {besar:teks} ----- */

const SIZE_OPEN_END = new RegExp(`\\{(${SIZE_KEYS_SRC}):$`);
const SIZE_WHOLE = new RegExp(`^\\{(${SIZE_KEYS_SRC}):([^}]*)\\}$`);
const LINE_PREFIX = /^\s*(?:#{1,4}\s+|>\s?|[-*+]\s+|\d+[.)]\s+)?/;

// Pilihan beberapa baris: bungkus isi tiap baris (awalan judul/daftar/kutipan dibiarkan utuh).
function setSizeLines(text, { start, end }, key) {
  const lineStart = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = text.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = text.length;
  const parts = text
    .slice(lineStart, lineEnd)
    .split('\n')
    .map((l) => {
      const prefix = l.match(LINE_PREFIX)[0];
      const rest = l.slice(prefix.length);
      return { l, prefix, rest, w: rest.match(SIZE_WHOLE), skip: !rest.trim() };
    });
  const active = parts.filter((p) => !p.skip);
  const all = active.length > 0 && active.every((p) => p.w && p.w[1] === key); // semua sudah ukuran ini → lepas
  const block = parts
    .map((p) => {
      if (p.skip) return p.l;
      const inner = p.w ? p.w[2] : p.rest;
      return all ? p.prefix + inner : `${p.prefix}{${key}:${inner}}`;
    })
    .join('\n');
  return {
    text: text.slice(0, lineStart) + block + text.slice(lineEnd),
    sel: { start: lineStart, end: lineStart + block.length },
  };
}

// Pasang / ganti / lepas ukuran huruf. Memilih ukuran lain menggantikan (tidak bersarang); ukuran sama = lepas.
export function setSize(text, { start, end }, key) {
  const s = text.slice(start, end);
  if (s.includes('\n')) return setSizeLines(text, { start, end }, key);
  const open = `{${key}:`;

  // 1) Penanda tepat di luar pilihan: {besar:[pilihan]}
  const m = text.slice(0, start).match(SIZE_OPEN_END);
  if (m && text[end] === '}' && !s.includes('}')) {
    const from = start - m[0].length;
    if (m[1] === key) return { text: text.slice(0, from) + s + text.slice(end + 1), sel: { start: from, end: from + s.length } };
    return {
      text: text.slice(0, from) + open + s + '}' + text.slice(end + 1),
      sel: { start: from + open.length, end: from + open.length + s.length },
    };
  }
  // 2) Pilihan sudah memuat penanda: [{besar:isi}]
  const w = s.match(SIZE_WHOLE);
  if (w) {
    if (w[1] === key) return { text: text.slice(0, start) + w[2] + text.slice(end), sel: { start, end: start + w[2].length } };
    return {
      text: text.slice(0, start) + open + w[2] + '}' + text.slice(end),
      sel: { start: start + open.length, end: start + open.length + w[2].length },
    };
  }
  // 3) Belum ada: bungkus baru
  const inner = s || 'teks';
  return {
    text: text.slice(0, start) + open + inner + '}' + text.slice(end),
    sel: { start: start + open.length, end: start + open.length + inner.length },
  };
}

/* ----- Rata teks: blok :::tengah … ::: ----- */

const ALIGN_NAME = { left: 'kiri', center: 'tengah', right: 'kanan', justify: 'justify' }; // nama kanonik di dokumen
const canon = (line) => ALIGN_NAME[ALIGN_ALIASES[line.match(RE_ALIGN_OPEN)[1].toLowerCase()]];
const isDirective = (l) => RE_ALIGN_OPEN.test(l) || RE_ALIGN_CLOSE.test(l);
const offsetOf = (lines, i) => lines.slice(0, i).reduce((n, l) => n + l.length + 1, 0);

// Penutup ::: yang berpasangan dengan pembuka di baris `open` (-1 bila tidak ada).
function matchClose(lines, open) {
  let depth = 0;
  for (let k = open + 1; k < lines.length; k++) {
    if (RE_ALIGN_OPEN.test(lines[k])) depth += 1;
    else if (RE_ALIGN_CLOSE.test(lines[k])) {
      if (depth === 0) return k;
      depth -= 1;
    }
  }
  return -1;
}

// Pembuka terdekat yang membungkus baris `i` (-1 bila di luar semua blok rata).
function enclosingOpen(lines, i) {
  let depth = 0;
  for (let k = i - 1; k >= 0; k--) {
    if (RE_ALIGN_CLOSE.test(lines[k])) depth += 1;
    else if (RE_ALIGN_OPEN.test(lines[k])) {
      if (depth === 0) return k;
      depth -= 1;
    }
  }
  return -1;
}

// Atur rata teks untuk paragraf yang tersentuh pilihan.
//  - belum dibungkus      → dibungkus :::align
//  - sudah dibungkus lain → penandanya diganti
//  - sudah dibungkus sama → dilepas (toggle). "kiri" = bawaan, jadi di luar blok lain cukup melepas.
export function setAlign(text, { start, end }, align) {
  const lines = text.split('\n');
  const lineAt = (off) => text.slice(0, off).split('\n').length - 1;
  let a = lineAt(start);
  let b = lineAt(end > start && text[end - 1] === '\n' ? end - 1 : end);
  const same = { text, sel: { start, end } };

  let wrap = null; // [indeks baris pembuka, indeks baris penutup] bila pilihan = satu blok rata utuh
  if (RE_ALIGN_OPEN.test(lines[a])) {
    const c = matchClose(lines, a);
    if (c !== -1 && c >= b) wrap = [a, c];
  } else if (RE_ALIGN_CLOSE.test(lines[a])) {
    const o = enclosingOpen(lines, a);
    if (o !== -1 && matchClose(lines, o) === a) wrap = [o, a];
  }
  if (!wrap) {
    // Pangkas baris kosong di tepi pilihan; kursor di baris kosong = tidak ada yang diubah.
    while (a <= b && !lines[a].trim()) a += 1;
    while (b >= a && !lines[b].trim()) b -= 1;
    if (a > b) return same;
    // Perluas ke batas paragraf (baris kosong atau baris ::: ).
    while (a > 0 && lines[a - 1].trim() && !isDirective(lines[a - 1])) a -= 1;
    while (b < lines.length - 1 && lines[b + 1].trim() && !isDirective(lines[b + 1])) b += 1;
    const o = enclosingOpen(lines, a);
    if (o === a - 1 && matchClose(lines, o) === b + 1) wrap = [o, b + 1];
  }

  const out = lines.slice();
  const select = (from, to) => ({
    text: out.join('\n'),
    sel: to < from ? { start: offsetOf(out, from), end: offsetOf(out, from) } : { start: offsetOf(out, from), end: offsetOf(out, to) + out[to].length },
  });

  if (wrap) {
    const [o, c] = wrap;
    if (canon(lines[o]) === align || (align === 'kiri' && enclosingOpen(lines, o) === -1)) {
      out.splice(c, 1);
      out.splice(o, 1); // lepas pembungkus
      return select(o, c - 2);
    }
    out[o] = `:::${align}`;
    return select(o + 1, c - 1);
  }
  if (align === 'kiri' && enclosingOpen(lines, a) === -1) return same; // sudah rata kiri secara bawaan
  out.splice(b + 1, 0, ':::');
  out.splice(a, 0, `:::${align}`);
  return select(a + 1, b + 1);
}

function insertAt(text, { start, end }, snippet) {
  const pos = start + snippet.length;
  return { text: text.slice(0, start) + snippet + text.slice(end), sel: { start: pos, end: pos } };
}

/* ---------- Toolbar ---------- */

const TOOLS = [
  { id: 'bold', label: 'B', hint: 'Tebal (Ctrl+B)', style: { fontWeight: '800' }, run: (t, s) => wrapSelection(t, s, '**', '**', 'tebal') },
  { id: 'italic', label: 'I', hint: 'Miring (Ctrl+I)', style: { fontStyle: 'italic' }, run: (t, s) => wrapSelection(t, s, '*', '*', 'miring') },
  { id: 'strike', label: 'S', hint: 'Coret', style: { textDecorationLine: 'line-through' }, run: (t, s) => wrapSelection(t, s, '~~', '~~', 'coret') },
  { id: 'mark', label: 'A', hint: 'Highlight (Ctrl+E)', mark: true, run: (t, s) => wrapSelection(t, s, '==', '==', 'highlight') },
  { sep: true },
  { id: 'size-kecil', label: 'A', hint: 'Teks kecil', style: { fontSize: 11 }, run: (t, s) => setSize(t, s, 'kecil') },
  { id: 'size-besar', label: 'A', hint: 'Teks besar', style: { fontSize: 18 }, run: (t, s) => setSize(t, s, 'besar') },
  { id: 'size-jumbo', label: 'A', hint: 'Teks sangat besar', style: { fontSize: 23 }, run: (t, s) => setSize(t, s, 'jumbo') },
  { sep: true },
  { id: 'al-left', icon: 'left', hint: 'Rata kiri', run: (t, s) => setAlign(t, s, 'kiri') },
  { id: 'al-center', icon: 'center', hint: 'Rata tengah', run: (t, s) => setAlign(t, s, 'tengah') },
  { id: 'al-right', icon: 'right', hint: 'Rata kanan', run: (t, s) => setAlign(t, s, 'kanan') },
  { id: 'al-justify', icon: 'justify', hint: 'Rata kanan-kiri (justify)', run: (t, s) => setAlign(t, s, 'justify') },
  { sep: true },
  { id: 'h1', label: 'H1', hint: 'Judul besar', run: (t, s) => toggleLinePrefix(t, s, '# ') },
  { id: 'h2', label: 'H2', hint: 'Subjudul', run: (t, s) => toggleLinePrefix(t, s, '## ') },
  { id: 'h3', label: 'H3', hint: 'Subjudul kecil', run: (t, s) => toggleLinePrefix(t, s, '### ') },
  { sep: true },
  { id: 'quote', label: '❝', hint: 'Kutipan', run: (t, s) => toggleLinePrefix(t, s, '> ') },
  { id: 'ul', label: '•', hint: 'Daftar poin', run: (t, s) => toggleLinePrefix(t, s, '- ') },
  { id: 'ol', label: '1.', hint: 'Daftar angka', run: (t, s) => toggleLinePrefix(t, s, 'ol') },
  { sep: true },
  { id: 'code', label: '</>', hint: 'Kode (satu baris: `kode`)', run: (t, s) => (t.slice(s.start, s.end).includes('\n') ? wrapSelection(t, s, '```\n', '\n```', 'kode') : wrapSelection(t, s, '`', '`', 'kode')) },
  { id: 'link', label: 'Link', hint: 'Sisipkan link (Ctrl+K)', run: (t, s) => insertLink(t, s) },
  { id: 'hr', label: '—', hint: 'Garis pemisah', run: (t, s) => insertAt(t, s, '\n\n---\n\n') },
];

const SHORTCUTS = { b: 'bold', i: 'italic', k: 'link', e: 'mark' };

// Ikon rata teks: empat garis dengan panjang/posisi berbeda.
function AlignIcon({ kind, color }) {
  const widths = kind === 'justify' ? [16, 16, 16, 16] : [16, 10, 16, 10];
  const self = kind === 'center' ? 'center' : kind === 'right' ? 'flex-end' : 'flex-start';
  return (
    <View style={{ width: 16, height: 14, justifyContent: 'space-between' }}>
      {widths.map((w, i) => (
        <View key={i} style={{ width: w, height: 2, borderRadius: 1, backgroundColor: color, alignSelf: self }} />
      ))}
    </View>
  );
}

function ToolButton({ tool, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tool.hint}
      title={tool.hint}
      onPress={onPress}
      style={({ hovered, pressed }) => ({
        minWidth: 34,
        height: 34,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? '#333' : hovered ? '#262626' : 'transparent',
      })}
    >
      {tool.icon ? (
        <AlignIcon kind={tool.icon} color={A.text} />
      ) : (
        <Text
          style={{
            fontFamily: fonts.main,
            fontSize: 15,
            color: tool.mark ? '#000' : A.text,
            backgroundColor: tool.mark ? A.warn : 'transparent',
            paddingHorizontal: tool.mark ? 5 : 0,
            ...(tool.style || {}),
          }}
        >
          {tool.label}
        </Text>
      )}
    </Pressable>
  );
}

const MD_HINT = 'Pilih teks lalu klik tombol, atau pakai Ctrl/Cmd + B (tebal), I (miring), E (highlight), K (link). Paragraf dipisah baris kosong. Ukuran huruf: {besar:teks} atau angka bebas {28:teks}. Rata teks: bungkus dengan :::tengah … ::: (juga kiri, kanan, justify).';

/** Editor gaya Medium: toolbar format di atas, tab Tulis / Pratinjau. Isi disimpan sebagai Markdown. */
export default function MarkdownEditor({ label, value = '', onChange, placeholder, hint = MD_HINT, minHeight = 320 }) {
  const [tab, setTab] = useState('write');
  // `forced` hanya terisi sesaat setelah tombol format diklik (untuk memindahkan kursor);
  // selebihnya selection dibiarkan tak terkontrol agar tidak ada loop render.
  const [forced, setForced] = useState(null);
  const input = useRef(null);
  const selRef = useRef({ start: 0, end: 0 });

  // Di web baca seleksi langsung dari <textarea> (selalu akurat, tetap ada walau fokus pindah ke tombol).
  const currentSel = () => {
    const el = input.current;
    if (Platform.OS === 'web' && el && typeof el.selectionStart === 'number') {
      return { start: el.selectionStart, end: el.selectionEnd };
    }
    const s = selRef.current;
    return { start: Math.min(s.start, value.length), end: Math.min(s.end, value.length) };
  };

  const apply = (tool) => {
    const res = tool.run(value, currentSel());
    onChange(res.text);
    selRef.current = res.sel;
    setForced(res.sel);
    setTimeout(() => {
      if (input.current) input.current.focus();
      setForced(null);
    }, 60);
  };

  const onKeyPress = (e) => {
    const ne = e.nativeEvent || {};
    if (!(ne.ctrlKey || ne.metaKey) || ne.altKey) return;
    const id = SHORTCUTS[String(ne.key || '').toLowerCase()];
    const tool = id && TOOLS.find((t) => t.id === id);
    if (!tool) return;
    if (e.preventDefault) e.preventDefault();
    apply(tool);
  };

  const tabs = [
    ['write', 'Tulis'],
    ['preview', 'Pratinjau'],
  ];

  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={{ fontFamily: fonts.main, fontSize: 14, color: A.muted, marginBottom: 8 }}>{label}</Text> : null}

      <View style={{ flexDirection: 'row', columnGap: 8, marginBottom: 10 }}>
        {tabs.map(([key, text]) => (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
            onPress={() => setTab(key)}
            style={{
              borderWidth: 1,
              borderColor: tab === key ? A.text : A.inputBorder,
              backgroundColor: tab === key ? A.text : 'transparent',
              borderRadius: 999,
              paddingVertical: 6,
              paddingHorizontal: 14,
            }}
          >
            <Text style={{ fontFamily: fonts.main, fontSize: 14, color: tab === key ? '#000' : A.text }}>{text}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'write' ? (
        <View>
          <View style={{ borderWidth: 1, borderColor: A.inputBorder, borderBottomWidth: 0, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#1c1c1c' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', padding: 4, columnGap: 2 }}>
              {TOOLS.map((tool, i) =>
                tool.sep ? (
                  <View key={`sep${i}`} style={{ width: 1, height: 20, backgroundColor: A.inputBorder, marginHorizontal: 4 }} />
                ) : (
                  <ToolButton key={tool.id} tool={tool} onPress={() => apply(tool)} />
                ),
              )}
            </ScrollView>
          </View>
          <TextInput
            ref={input}
            accessibilityLabel={label}
            value={value}
            onChangeText={onChange}
            multiline
            placeholder={placeholder || 'Tulis di sini…'}
            placeholderTextColor="#5f5f5f"
            autoCapitalize="none"
            autoCorrect={false}
            selection={forced || undefined}
            onSelectionChange={(e) => {
              selRef.current = e.nativeEvent.selection;
            }}
            onKeyPress={Platform.OS === 'web' ? onKeyPress : undefined}
            style={{
              fontFamily: fonts.main,
              color: A.text,
              fontSize: 16, // 16px mencegah iOS Safari zoom otomatis
              lineHeight: 25,
              backgroundColor: A.input,
              borderColor: A.inputBorder,
              borderWidth: 1,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 14,
              height: minHeight,
              textAlignVertical: 'top',
            }}
          />
        </View>
      ) : (
        <View style={{ backgroundColor: '#000', borderColor: A.inputBorder, borderWidth: 1, borderRadius: 8, padding: 16, minHeight }}>
          {value && value.trim() ? (
            <Markdown source={value} />
          ) : (
            <Text style={{ fontFamily: fonts.main, color: A.faint, fontSize: 15 }}>Belum ada isi.</Text>
          )}
        </View>
      )}
      {hint ? <Text style={{ fontFamily: fonts.main, fontSize: 13, color: A.faint, marginTop: 6 }}>{hint}</Text> : null}
    </View>
  );
}