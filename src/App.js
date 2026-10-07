import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';

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
import { navigate, useRoute } from './utils/router';

const SCREENS = {
  home: HomeScreen,
  resume: ResumeScreen,
  activity: ActivityScreen,
  lists: ListsScreen,
  about: AboutScreen,
};

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

  if (!content) {
    return (
      <Shell>
        <Text style={{ color: colors.muted, fontFamily: fonts.main, fontSize: 15 }}>
          {status === 'loading' ? 'Memuat…' : ''}
        </Text>
      </Shell>
    );
  }

  const tabs = content.tabs.filter((t) => t.visible !== false && SCREENS[t.id]);
  const postMatch = route.match(/^\/post\/(.+)$/);
  const routeTab = route.replace(/^\//, '').split('/')[0] || 'home';
  const active = postMatch ? 'home' : tabs.some((t) => t.id === routeTab) ? routeTab : (tabs[0] && tabs[0].id) || 'home';
  const Screen = SCREENS[active] || HomeScreen;

  return (
    <Shell>
      <Header profile={content.profile} />
      <View style={{ marginTop: px(49) }}>
        <Tabs tabs={tabs} active={active} onChange={(id) => navigate(id === 'home' ? '/' : `/${id}`)} />
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
