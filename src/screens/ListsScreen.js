import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import Empty from '../components/Empty';
import { colors, fonts, useLayout } from '../theme';
import { navigate } from '../utils/router';

export default function ListsScreen({ content }) {
  const { px } = useLayout();
  const [openId, setOpenId] = useState(null);
  if (content.lists.length === 0) return <Empty>Belum ada koleksi.</Empty>;

  return content.lists.map((list) => {
    const posts = list.postIds
      .map((id) => content.posts.find((p) => p.id === id && p.published !== false))
      .filter(Boolean);
    const open = openId === list.id;
    return (
      <View key={list.id} style={{ marginBottom: px(30) }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpenId(open ? null : list.id)}
          style={{ flexDirection: 'row', justifyContent: 'space-between', columnGap: 20 }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(19), lineHeight: px(26), fontWeight: '600', letterSpacing: -0.3 }}>
              {list.title}
            </Text>
            {list.description ? (
              <Text style={{ color: colors.meta, fontFamily: fonts.main, fontSize: px(15), marginTop: 4 }}>{list.description}</Text>
            ) : null}
          </View>
          <Text style={{ color: colors.meta, fontFamily: fonts.main, fontSize: px(15), paddingTop: 5 }}>
            {posts.length} cerita
          </Text>
        </Pressable>
        {open
          ? posts.map((post) => (
              <Pressable key={post.id} accessibilityRole="link" onPress={() => navigate(`/post/${post.id}`)} style={{ marginTop: 14, paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: colors.line }}>
                <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(17), lineHeight: px(24) }}>{post.title}</Text>
              </Pressable>
            ))
          : null}
      </View>
    );
  });
}
