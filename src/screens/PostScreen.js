import { Image, Pressable, Text, View } from 'react-native';

import Avatar from '../components/Avatar';
import Empty from '../components/Empty';
import { colors, fonts, useLayout } from '../theme';
import { navigate } from '../utils/router';
import { relativeTime } from '../utils/time';

export default function PostScreen({ content, id }) {
  const { px } = useLayout();
  const post = content.posts.find((p) => p.id === id && p.published !== false);
  if (!post) return <Empty>Tulisan tidak ditemukan.</Empty>;

  const paragraphs = (post.body || post.excerpt || '').split(/\n{2,}/).filter(Boolean);
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
      {post.image ? (
        <Image source={{ uri: post.image }} resizeMode="cover" style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 4, marginTop: 24, backgroundColor: '#1c1c1e' }} />
      ) : null}
      <View style={{ marginTop: 24 }}>
        {paragraphs.map((p, i) => (
          <Text key={i} style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(19), lineHeight: px(30), letterSpacing: -0.19, marginBottom: 20 }}>
            {p}
          </Text>
        ))}
      </View>
    </View>
  );
}
