import { Pressable, Text, View } from 'react-native';

import { colors, fonts, useLayout } from '../theme';
import { pathToUrl, navigate } from '../utils/router';
import { relativeTime } from '../utils/time';
import Avatar from './Avatar';
import DotsMenu from './DotsMenu';
import Thumb from './Thumb';

export default function PostCard({ post, profile }) {
  const { px } = useLayout();
  const path = `/post/${post.id}`;
  return (
    <View style={{ marginBottom: px(40) }}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={post.title}
        onPress={() => navigate(path)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 11 }}>
          <Avatar uri={profile.avatar} name={profile.name} size={px(26)} />
          <Text style={{ color: colors.meta, fontFamily: fonts.main, fontSize: px(15) }}>
            {profile.name} · {relativeTime(post.publishedAt)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', columnGap: px(36), marginTop: px(24) }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontFamily: fonts.main,
                fontSize: px(24),
                lineHeight: px(31),
                fontWeight: '700',
                letterSpacing: -0.6,
              }}
            >
              {post.title}
            </Text>
            {post.excerpt ? (
              <Text
                numberOfLines={2}
                style={{
                  color: colors.text,
                  fontFamily: fonts.main,
                  fontSize: px(19),
                  lineHeight: px(26),
                  letterSpacing: -0.19,
                  marginTop: px(15),
                }}
              >
                {post.excerpt}
              </Text>
            ) : null}
          </View>
          <View style={{ marginTop: 3 }}>
            <Thumb uri={post.image} width={px(104)} height={px(69)} />
          </View>
        </View>
      </Pressable>
      <View style={{ marginTop: px(28) }}>
        <DotsMenu url={pathToUrl(path)} title={post.title} />
      </View>
    </View>
  );
}
