import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import Avatar from '../components/Avatar';
import Empty from '../components/Empty';
import Thumb from '../components/Thumb';
import { colors, fonts, useLayout } from '../theme';
import { navigate } from '../utils/router';

// Tampilan kartu sama dengan PostCard di beranda.
// Bedanya: tap membuka/menutup daftar cerita, dan meta menampilkan jumlah cerita.
export default function ListsScreen({ content }) {
  const { px } = useLayout();
  const [openId, setOpenId] = useState(null);
  const { profile } = content;
  if (content.lists.length === 0) return <Empty>Belum ada koleksi.</Empty>;

  return content.lists.map((list) => {
    const posts = (list.postIds || [])
      .map((id) => content.posts.find((p) => p.id === id && p.published !== false))
      .filter(Boolean);
    const open = openId === list.id;
    return (
      <View key={list.id} style={{ marginBottom: px(40) }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={list.title}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpenId(open ? null : list.id)}
        >
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
                {list.title}
              </Text>
              {list.description ? (
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
                  {list.description}
                </Text>
              ) : null}
            </View>
            <View style={{ marginTop: 3 }}>
              <Thumb uri={list.image} width={px(104)} height={px(69)} />
            </View>
          </View>
        </Pressable>

        {open
          ? posts.map((post) => (
              <Pressable
                key={post.id}
                accessibilityRole="link"
                onPress={() => navigate(`/post/${post.id}`)}
                style={{ marginTop: 14, paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: colors.line }}
              >
                <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(17), lineHeight: px(24) }}>{post.title}</Text>
              </Pressable>
            ))
          : null}
      </View>
    );
  });
}