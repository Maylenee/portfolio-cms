import { Image, Linking, Pressable, Text, View } from 'react-native';

import Avatar from '../components/Avatar';
import Empty from '../components/Empty';
import PostGallery from '../components/PostGallery';
import { colors, fonts, useLayout } from '../theme';
import { navigate } from '../utils/router';
import { relativeTime } from '../utils/time';

// Hanya izinkan http(s) agar link tidak bisa berisi skema berbahaya.
const safeLink = (url = '') => (/^https?:\/\//i.test(url.trim()) ? url.trim() : '');

export default function PostScreen({ content, id }) {
  const { px } = useLayout();
  const post = content.posts.find((p) => p.id === id && p.published !== false);
  if (!post) return <Empty>Tulisan tidak ditemukan.</Empty>;

  const paragraphs = (post.body || post.excerpt || '').split(/\n{2,}/).filter(Boolean);
  const hasGallery = (post.images || []).some((i) => i && i.src);
  const link = safeLink(post.link);

  return (
    <View>
      <Pressable accessibilityRole="link" onPress={() => navigate('/')} style={{ marginBottom: 28 }}>
        <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(15) }}>← Kembali</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 11 }}>
        <Avatar uri={content.profile.avatar} name={content.profile.name} size={px(26)} />
        <Text style={{ color: colors.meta, fontFamily: fonts.main, fontSize: px(15) }}>
          {content.profile.name} · {relativeTime(post.publishedAt)}
        </Text>
      </View>
      <Text accessibilityRole="header" style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(32), lineHeight: px(40), fontWeight: '700', letterSpacing: -0.9, marginTop: 20 }}>
        {post.title}
      </Text>

      {hasGallery ? (
        <View style={{ marginTop: 24 }}>
          <PostGallery images={post.images} layout={post.layout} />
        </View>
      ) : post.image ? (
        <Image source={{ uri: post.image }} resizeMode="cover" style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 4, marginTop: 24, backgroundColor: '#1c1c1e' }} />
      ) : null}

      <View style={{ marginTop: 24 }}>
        {paragraphs.map((p, i) => (
          <Text key={i} style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(19), lineHeight: px(30), letterSpacing: -0.19, marginBottom: 20 }}>
            {p}
          </Text>
        ))}
      </View>

      {link ? (
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(link)} style={{ marginTop: 4 }}>
          <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(17), textDecorationLine: 'underline' }}>
            Lihat publikasi ↗
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}