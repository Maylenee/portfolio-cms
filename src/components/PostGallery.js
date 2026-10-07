import { Image, ScrollView, View } from 'react-native';

import { useLayout } from '../theme';

// Pilihan kolase. Nilai ini yang disimpan di post.layout dan tampil di dropdown admin.
export const LAYOUTS = ['Grid', 'Mosaik', 'Berurutan', 'Geser'];
export const DEFAULT_LAYOUT = 'Grid';

const GAP = 6;
const bg = '#1c1c1e';

function Pic({ uri, style }) {
  return <Image source={{ uri }} resizeMode="cover" style={[{ borderRadius: 4, backgroundColor: bg }, style]} />;
}

export default function PostGallery({ images, layout }) {
  const { px } = useLayout();
  const list = (images || []).map((i) => (typeof i === 'string' ? i : i && i.src)).filter(Boolean);
  if (list.length === 0) return null;

  // Satu gambar: tampil penuh seperti sebelumnya.
  if (list.length === 1) return <Pic uri={list[0]} style={{ width: '100%', aspectRatio: 16 / 9 }} />;

  if (layout === 'Berurutan') {
    return (
      <View style={{ rowGap: GAP }}>
        {list.map((u, i) => <Pic key={i} uri={u} style={{ width: '100%', aspectRatio: 16 / 9 }} />)}
      </View>
    );
  }

  if (layout === 'Geser') {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ columnGap: GAP }}>
        {list.map((u, i) => <Pic key={i} uri={u} style={{ width: px(280), aspectRatio: 4 / 3 }} />)}
      </ScrollView>
    );
  }

  if (layout === 'Mosaik') {
    const [first, ...rest] = list;
    const per = rest.length === 1 ? 1 : rest.length === 2 || rest.length === 4 ? 2 : 3;
    const width = per === 1 ? '100%' : per === 2 ? '49.2%' : '32.4%';
    return (
      <View style={{ rowGap: GAP }}>
        <Pic uri={first} style={{ width: '100%', aspectRatio: 16 / 9 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: GAP, rowGap: GAP }}>
          {rest.map((u, i) => <Pic key={i} uri={u} style={{ width, aspectRatio: per === 1 ? 16 / 9 : 1 }} />)}
        </View>
      </View>
    );
  }

  // Grid (default): 2 kolom persegi.
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: GAP, rowGap: GAP }}>
      {list.map((u, i) => <Pic key={i} uri={u} style={{ width: '49.2%', aspectRatio: 1 }} />)}
    </View>
  );
}