import { Image, Platform, ScrollView, Text, View } from 'react-native';

import { colors, fonts, useLayout } from '../theme';
import { openUrl, safeUrl, shortenUrl } from '../utils/links';

/**
 * Markdown ringan tanpa dependensi (aman untuk React Native + web).
 * Blok  : # judul (1–4), paragraf, daftar (- * + / 1.), > kutipan, ``` kode ```, --- garis, ![alt](url)
 *         :::kiri | :::tengah | :::kanan | :::justify  …  :::   (rata teks; membungkus blok apa pun, boleh bersarang)
 * Inline: **tebal**, *miring*, _miring_, ~~coret~~, ==highlight==, `kode`, [teks](url), URL polos (tampil dipotong …),
 *         {besar:teks} {kecil:teks} {jumbo:teks} atau {28:teks} (ukuran huruf 10–72), \* escape (juga \{ \})
 * Baris baru tunggal dipertahankan sebagai baris baru; paragraf dipisah baris kosong.
 */

const mono = Platform.select({
  web: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  ios: 'Menlo',
  default: 'monospace',
});

/* ---------- Ukuran & rata teks (dipakai juga oleh editor) ---------- */

export const SIZE_KEYS_SRC = '\\d{1,2}|kecil|besar|jumbo';
const SIZE_PRESETS = { kecil: 14, besar: 26, jumbo: 36 };

/** "besar" | "28" → ukuran px dasar (dibatasi 10–72). */
export function resolveSize(key) {
  const n = SIZE_PRESETS[key] ?? Number(key);
  return Math.min(72, Math.max(10, Number.isFinite(n) ? n : 19));
}

export const RE_ALIGN_OPEN = /^\s*:::\s*(kiri|tengah|kanan|justify|left|center|right)\s*$/i;
export const RE_ALIGN_CLOSE = /^\s*:::\s*$/;
export const ALIGN_ALIASES = { kiri: 'left', left: 'left', tengah: 'center', center: 'center', kanan: 'right', right: 'right', justify: 'justify' };

/* ---------- Inline ---------- */

const INLINE_SRC = [
  '\\\\([\\\\`*_~\\[\\]()#+\\-.!>|{}])', // 1 escape
  '\\*\\*(.+?)\\*\\*', // 2 tebal
  '__(.+?)__', // 3 tebal
  '~~(.+?)~~', // 4 coret
  '`([^`]+)`', // 5 kode
  '\\[([^\\]]+)\\]\\(([^)\\s]+)\\)', // 6 label, 7 href
  '(https?:\\/\\/[^\\s<]*[^\\s<.,;:!?)\\]])', // 8 URL polos
  '\\*(\\S(?:.*?\\S)?)\\*', // 9 miring *
  '\\b_(\\S(?:.*?\\S)?)_(?!\\w)', // 10 miring _
  '==(.+?)==', // 11 highlight
  `\\{(${SIZE_KEYS_SRC}):([\\s\\S]+?)\\}`, // 12 ukuran, 13 isi
].join('|');

export function parseInline(text) {
  const re = new RegExp(INLINE_SRC, 'g'); // instance baru: aman untuk rekursi
  const nodes = [];
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push({ t: 'text', v: text.slice(last, m.index) });
    if (m[1] !== undefined) nodes.push({ t: 'text', v: m[1] });
    else if (m[2] !== undefined || m[3] !== undefined) nodes.push({ t: 'bold', c: parseInline(m[2] ?? m[3]) });
    else if (m[4] !== undefined) nodes.push({ t: 'strike', c: parseInline(m[4]) });
    else if (m[5] !== undefined) nodes.push({ t: 'code', v: m[5] });
    else if (m[6] !== undefined) nodes.push({ t: 'link', href: m[7], c: parseInline(m[6]) });
    else if (m[8] !== undefined) nodes.push({ t: 'link', href: m[8], c: [{ t: 'text', v: shortenUrl(m[8]) }] }); // tampil singkat, href tetap utuh
    else if (m[11] !== undefined) nodes.push({ t: 'mark', c: parseInline(m[11]) });
    else if (m[12] !== undefined) nodes.push({ t: 'size', size: m[12], c: parseInline(m[13]) });
    else nodes.push({ t: 'italic', c: parseInline(m[9] ?? m[10]) });
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push({ t: 'text', v: text.slice(last) });
  return nodes;
}

function Inline({ nodes }) {
  const { px } = useLayout();
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'bold':
        return (
          <Text key={i} style={{ fontWeight: '700' }}>
            <Inline nodes={n.c} />
          </Text>
        );
      case 'italic':
        return (
          <Text key={i} style={{ fontStyle: 'italic' }}>
            <Inline nodes={n.c} />
          </Text>
        );
      case 'strike':
        return (
          <Text key={i} style={{ textDecorationLine: 'line-through' }}>
            <Inline nodes={n.c} />
          </Text>
        );
      case 'mark':
        return (
          <Text key={i} style={{ backgroundColor: colors.gold, color: '#000' }}>
            <Inline nodes={n.c} />
          </Text>
        );
      case 'size': {
        const fs = px(resolveSize(n.size));
        // lineHeight ikut diubah, kalau tidak huruf besar terpotong oleh tinggi baris paragraf.
        return (
          <Text key={i} style={{ fontSize: fs, lineHeight: Math.round(fs * 1.45 * 10) / 10 }}>
            <Inline nodes={n.c} />
          </Text>
        );
      }
      case 'code':
        return (
          <Text key={i} style={{ fontFamily: mono, backgroundColor: colors.panelAlt, color: colors.gold }}>
            {` ${n.v} `}
          </Text>
        );
      case 'link': {
        const href = safeUrl(n.href);
        if (!href) return <Inline key={i} nodes={n.c} />;
        return (
          <Text
            key={i}
            accessibilityRole="link"
            onPress={() => openUrl(href)}
            style={{ textDecorationLine: 'underline', color: colors.gold }}
          >
            <Inline nodes={n.c} />
          </Text>
        );
      }
      default:
        return n.v;
    }
  });
}

/* ---------- Blok ---------- */

const RE_FENCE = /^\s*```/;
const RE_HEADING = /^(#{1,4})\s+(.*?)\s*#*\s*$/;
const RE_HR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const RE_QUOTE = /^\s*>\s?(.*)$/;
const RE_LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const RE_IMAGE = /^\s*!\[([^\]]*)\]\(([^)\s]+)\)\s*$/;

const startsBlock = (line) =>
  RE_FENCE.test(line) ||
  RE_HEADING.test(line) ||
  RE_HR.test(line) ||
  RE_QUOTE.test(line) ||
  RE_LIST.test(line) ||
  RE_IMAGE.test(line) ||
  RE_ALIGN_OPEN.test(line) ||
  RE_ALIGN_CLOSE.test(line);

export function parseBlocks(source = '') {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
    } else if (RE_FENCE.test(line)) {
      const code = [];
      i += 1;
      while (i < lines.length && !RE_FENCE.test(lines[i])) code.push(lines[i++]);
      i += 1; // lewati penutup ```
      blocks.push({ t: 'code', v: code.join('\n') });
    } else if (RE_ALIGN_OPEN.test(line)) {
      const align = ALIGN_ALIASES[line.match(RE_ALIGN_OPEN)[1].toLowerCase()];
      const inner = [];
      let depth = 1;
      let fenced = false;
      i += 1;
      while (i < lines.length) {
        const l = lines[i];
        if (RE_FENCE.test(l)) fenced = !fenced;
        else if (!fenced) {
          if (RE_ALIGN_OPEN.test(l)) depth += 1;
          else if (RE_ALIGN_CLOSE.test(l)) {
            depth -= 1;
            if (depth === 0) break;
          }
        }
        inner.push(l);
        i += 1;
      }
      i += 1; // lewati penutup :::  (tanpa penutup = berlaku sampai akhir, seperti ``` )
      blocks.push({ t: 'align', align, c: parseBlocks(inner.join('\n')) });
    } else if (RE_ALIGN_CLOSE.test(line)) {
      i += 1; // ::: yatim tanpa pembuka: diabaikan
    } else if (RE_HEADING.test(line)) {
      const m = line.match(RE_HEADING);
      blocks.push({ t: 'heading', level: m[1].length, c: parseInline(m[2]) });
      i += 1;
    } else if (RE_HR.test(line)) {
      blocks.push({ t: 'hr' });
      i += 1;
    } else if (RE_IMAGE.test(line)) {
      const m = line.match(RE_IMAGE);
      blocks.push({ t: 'image', alt: m[1], src: m[2] });
      i += 1;
    } else if (RE_QUOTE.test(line)) {
      const q = [];
      while (i < lines.length && RE_QUOTE.test(lines[i])) q.push(lines[i++].match(RE_QUOTE)[1]);
      blocks.push({ t: 'quote', c: parseInline(q.join('\n')) });
    } else if (RE_LIST.test(line)) {
      const items = [];
      const counters = {};
      while (i < lines.length && RE_LIST.test(lines[i])) {
        const m = lines[i].match(RE_LIST);
        const depth = Math.min(3, Math.floor(m[1].replace(/\t/g, '  ').length / 2));
        const ordered = /\d/.test(m[2]);
        // Reset penghitung level yang lebih dalam saat naik level.
        Object.keys(counters).forEach((d) => Number(d) > depth && delete counters[d]);
        // Ganti jenis daftar (• ↔ 1.) pada level yang sama = mulai hitung dari 1 lagi.
        const prev = counters[depth];
        counters[depth] = { ordered, n: prev && prev.ordered === ordered ? prev.n + 1 : 1 };
        items.push({ depth, marker: ordered ? `${counters[depth].n}.` : '•', c: parseInline(m[3]) });
        i += 1;
      }
      blocks.push({ t: 'list', items });
    } else {
      const p = [];
      while (i < lines.length && lines[i].trim() && (p.length === 0 || !startsBlock(lines[i]))) p.push(lines[i++]);
      blocks.push({ t: 'p', c: parseInline(p.join('\n')) });
    }
  }
  return blocks;
}

/* ---------- Tampilan ---------- */

const HEADING = { 1: [30, 38], 2: [25, 33], 3: [21, 29], 4: [19, 27] };

// Rekursif: blok `align` merender anak-anaknya dengan `textAlign` baru di gaya dasar (`body`).
function Blocks({ blocks, body, px }) {
  const al = body.textAlign; // 'left' | 'center' | 'right' | 'justify' | undefined
  const shrink = al === 'center' || al === 'right'; // daftar dipepatkan agar penanda menempel ke teks

  return blocks.map((b, idx) => {
    switch (b.t) {
      case 'align':
        return (
          <View key={idx}>
            <Blocks blocks={b.c} body={{ ...body, textAlign: b.align }} px={px} />
          </View>
        );
      case 'heading': {
        const [fs, lh] = HEADING[b.level];
        return (
          <Text
            key={idx}
            accessibilityRole="header"
            style={{ ...body, fontSize: px(fs), lineHeight: px(lh), fontWeight: '700', letterSpacing: -0.6, marginTop: idx === 0 ? 0 : 12, marginBottom: 14 }}
          >
            <Inline nodes={b.c} />
          </Text>
        );
      }
      case 'list':
        return (
          <View key={idx} style={{ marginBottom: 20 }}>
            {b.items.map((it, j) => (
              <View
                key={j}
                style={{
                  flexDirection: 'row',
                  justifyContent: al === 'center' ? 'center' : al === 'right' ? 'flex-end' : 'flex-start',
                  marginLeft: shrink ? 0 : it.depth * 20,
                  marginBottom: 6,
                }}
              >
                <Text style={{ ...body, width: 26, color: colors.muted, textAlign: 'left' }}>{it.marker}</Text>
                <Text style={{ ...body, ...(shrink ? { flexShrink: 1 } : { flex: 1 }) }}>
                  <Inline nodes={it.c} />
                </Text>
              </View>
            ))}
          </View>
        );
      case 'quote': {
        const side = al === 'right' ? 'Right' : 'Left'; // garis kutipan pindah ke sisi kanan untuk rata kanan
        return (
          <View key={idx} style={{ [`border${side}Width`]: 3, [`border${side}Color`]: colors.gold, [`padding${side}`]: 16, marginBottom: 20 }}>
            <Text style={{ ...body, color: colors.meta, fontStyle: 'italic' }}>
              <Inline nodes={b.c} />
            </Text>
          </View>
        );
      }
      case 'code':
        return (
          <View key={idx} style={{ backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 20 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 14 }}>
              <Text selectable style={{ fontFamily: mono, fontSize: px(14), lineHeight: px(21), color: colors.text }}>
                {b.v}
              </Text>
            </ScrollView>
          </View>
        );
      case 'hr':
        return <View key={idx} style={{ height: 1, backgroundColor: colors.line, marginVertical: 16 }} />;
      case 'image': {
        if (!/^(https?:\/\/|data:image\/)/i.test(b.src)) return null;
        return (
          <Image
            key={idx}
            source={{ uri: b.src }}
            accessibilityLabel={b.alt}
            resizeMode="contain"
            style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 4, marginBottom: 20, backgroundColor: '#1c1c1e' }}
          />
        );
      }
      default:
        return (
          <Text key={idx} style={{ ...body, marginBottom: 20 }}>
            <Inline nodes={b.c} />
          </Text>
        );
    }
  });
}

export default function Markdown({ source, size = 19 }) {
  const { px } = useLayout();
  const blocks = parseBlocks(source);
  const body = { color: colors.text, fontFamily: fonts.main, fontSize: px(size), lineHeight: px(size * 1.58), letterSpacing: -0.19 };

  return (
    <View>
      <Blocks blocks={blocks} body={body} px={px} />
    </View>
  );
}