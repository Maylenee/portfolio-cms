import { Pressable, Text, View } from 'react-native';

import { colors, fonts, useLayout } from '../theme';
import { pathToUrl, navigate } from '../utils/router';
import { relativeTime } from '../utils/time';
import Avatar from './Avatar';
import DotsMenu from './DotsMenu';
import Thumb from './Thumb';

export default function PostCard({ post, profile }) {
  const { px, isTablet } = useLayout();
  const thumbW = isTablet ? 150 : 108; // thumbnail lebih besar di layar lebar
  const path = `/post/${post.id}`;
  // Sampul: pakai thumbnail bila diisi, kalau tidak ambil gambar pertama dari galeri.
  const cover = post.image || (post.images || []).find((i) => i && i.src)?.src || '';

  return (
    <View style={{ marginBottom: px(40) }}>
      <Pressable accessibilityRole="link" accessibilityLabel={post.title} onPress={() => navigate(path)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 11 }}>
          <Avatar uri={profile.avatar} name={profile.name} size={px(26)} />
          <Text style={{ color: colors.meta, fontFamily: fonts.main, fontSize: px(15) }}>
            {profile.name} · {relativeTime(post.publishedAt)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', columnGap: px(28), marginTop: px(20) }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(20), lineHeight: px(26), fontWeight: '700', letterSpacing: -0.4 }}>
              {post.title}
            </Text>
            {post.excerpt ? (
              <Text
                numberOfLines={2}
                style={{ color: colors.muted, fontFamily: fonts.main, fontSize: px(16), lineHeight: px(23), letterSpacing: -0.1, marginTop: px(8) }}
              >
                {post.excerpt}
              </Text>
            ) : null}
          </View>
          <View style={{ marginTop: px(4) }}>
            <Thumb uri={cover} width={px(thumbW)} height={px(thumbW * 2 / 3)} />
          </View>
        </View>
      </Pressable>
      <View style={{ marginTop: px(28) }}>
        <DotsMenu url={pathToUrl(path)} title={post.title} />
      </View>
    </View>
  );
}