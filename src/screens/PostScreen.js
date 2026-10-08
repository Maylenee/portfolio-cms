import { Image, Pressable, Text, View } from 'react-native';

import Avatar from '../components/Avatar';
import Empty from '../components/Empty';
import PostGallery from '../components/PostGallery';
import { colors, fonts, useLayout } from '../theme';
import { openUrl, safeUrl } from '../utils/links';
import { navigate } from '../utils/router';
import { relativeTime } from '../utils/time';

const logosOf = (list) => (Array.isArray(list) ? list : []).map((i) => i && i.logo).filter(Boolean);

// Barisan logo (Client / Tools) dengan label kecil di atasnya.
function LogoGroup({ label, list, px, top = 28 }) {
  const logos = logosOf(list);
  if (logos.length === 0) return null;
  return (
    <View style={{ marginTop: top }}>
      <Text style={{ color: colors.meta, fontFamily: fonts.main, fontSize: px(14), marginBottom: 10 }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 12 }}>
        {logos.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            resizeMode="contain"
            accessibilityLabel={label}
            style={{ width: px(44), height: px(44), borderRadius: 6, backgroundColor: '#1c1c1e' }}
          />
        ))}
      </View>
    </View>
  );
}

export default function PostScreen({ content, id }) {
  const { px } = useLayout();
  const post = content.posts.find((p) => p.id === id && p.published !== false);
  if (!post) return <Empty>Tulisan tidak ditemukan.</Empty>;

  const paragraphs = (post.body || post.excerpt || '').split(/\n{2,}/).filter(Boolean);
  const hasGallery = (post.images || []).some((i) => i && i.src);
  const showLink = post.showLink !== false;
  const linkUrl = showLink ? safeUrl(post.link) : '';
  const showClient = post.showClient !== false;

  const title = (
    <Text accessibilityRole="header" style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(32), lineHeight: px(40), fontWeight: '700', letterSpacing: -0.9 }}>
      {post.title}
    </Text>
  );

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

      <View style={{ marginTop: 20 }}>{title}</View>

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

      {/* Bagian paling bawah (setelah isi lengkap): Link, Tools, Stack, Client */}
      {linkUrl ? (
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: colors.meta, fontFamily: fonts.main, fontSize: px(14), marginBottom: 6 }}>Link</Text>
          <Pressable accessibilityRole="link" onPress={() => openUrl(linkUrl)}>
            <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(17), lineHeight: px(24), textDecorationLine: 'underline' }}>
              {post.link}
            </Text>
          </Pressable>
        </View>
      ) : null}
      <LogoGroup label="Tools" list={post.tools} px={px} top={24} />
      <LogoGroup label="Stack" list={post.stack} px={px} top={24} />
      {showClient ? <LogoGroup label="Client" list={post.clients} px={px} top={24} /> : null}
    </View>
  );
}