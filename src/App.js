import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Linking, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';

import AdminScreen from './admin/AdminScreen';
import Header from './components/Header';
import Tabs from './components/Tabs';
import { ContentProvider, useContent } from './hooks/useContent';
import AboutScreen from './screens/AboutScreen';
import ActivityScreen from './screens/ActivityScreen';
import HomeScreen from './screens/HomeScreen';
import ListsScreen from './screens/ListsScreen';
import PostScreen from './screens/PostScreen';
import ResumeScreen from './screens/ResumeScreen';
import { colors, fonts, useLayout } from './theme';
import { findTabByPath, isExternal, tabPath } from './utils/navTabs';
import { navigate, useRoute } from './utils/router';

// id tab (dari CMS) -> layar. Nama, URL, urutan, dan visibilitas tab diatur di CMS.
const SCREENS = {
  home: HomeScreen,
  resume: ResumeScreen,
  activity: ActivityScreen,
  lists: ListsScreen,
  about: AboutScreen,
};

// Favicon situs diambil dari foto profil (dipotong bulat 64x64; bila gagal, pakai gambar apa adanya).
function setFavicon(uri) {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || !uri) return;
  const apply = (href, type) => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    if (type) link.setAttribute('type', type);
    else link.removeAttribute('type');
    link.href = href;
  };
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const size = 64;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      apply(c.toDataURL('image/png'), 'image/png');
    } catch (e) {
      apply(uri);
    }
  };
  img.onerror = () => apply(uri);
  img.src = uri;
}

function Shell({ children }) {
  const { maxWidth, pad } = useLayout();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 72 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth, paddingHorizontal: pad, paddingTop: Platform.OS === 'web' ? 31 : 16 }}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Site({ route }) {
  const { content, status } = useContent();
  const { px } = useLayout();

  useEffect(() => {
    if (Platform.OS === 'web' && content) document.title = content.settings.siteTitle || content.profile.name;
  }, [content]);

  const avatar = content && content.profile && content.profile.avatar;
  useEffect(() => {
    setFavicon(avatar);
  }, [avatar]);

  if (!content) {
    return (
      <Shell>
        <Text style={{ color: colors.muted, fontFamily: fonts.main, fontSize: 15 }}>
          {status === 'loading' ? 'Memuat…' : ''}
        </Text>
      </Shell>
    );
  }

  // Tab yang tampil: visible, dan punya layar atau berupa link luar. Urutan = urutan di CMS.
  const tabs = content.tabs
    .filter((t) => t.visible !== false && (SCREENS[t.id] || isExternal(tabPath(t))))
    .map((t) => ({ ...t, path: tabPath(t) }));

  const pathname = route.split(/[?#]/)[0];
  const postMatch = pathname.match(/^\/post\/(.+)$/);
  const found = findTabByPath(tabs, pathname);
  const firstInternal = tabs.find((t) => SCREENS[t.id]);
  const active = postMatch ? 'home' : found ? found.id : (firstInternal && firstInternal.id) || 'home';
  const Screen = SCREENS[active] || HomeScreen;

  const onTabChange = (id) => {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    if (isExternal(tab.path)) Linking.openURL(tab.path);
    else navigate(tab.path);
  };

  return (
    <Shell>
      <Header profile={content.profile} />
      <View style={{ marginTop: px(49) }}>
        <Tabs tabs={tabs} active={active} onChange={onTabChange} />
      </View>
      {status === 'offline' ? (
        <Text style={{ color: colors.muted, fontFamily: fonts.main, fontSize: 13, marginTop: 16 }}>
          Mode offline: menampilkan konten bawaan.
        </Text>
      ) : null}
      <View style={{ marginTop: px(61) }}>
        {postMatch ? <PostScreen content={content} id={decodeURIComponent(postMatch[1])} /> : <Screen content={content} />}
      </View>
    </Shell>
  );
}

function Root() {
  const route = useRoute();
  if (route.startsWith('/admin')) return <AdminScreen />;
  return <Site route={route} />;
}

export default function App() {
  return (
    <ContentProvider>
      <StatusBar style="light" />
      <Root />
    </ContentProvider>
  );
}