import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { api, tokenStore } from '../api/client';
import { useContent } from '../hooks/useContent';
import { colors, fonts, useLayout } from '../theme';
import { confirmAction } from '../utils/confirm';
import { navigate } from '../utils/router';
import LoginForm from './LoginForm';
import {
  AboutPanel,
  ActivityPanel,
  DataPanel,
  ListsPanel,
  PostsPanel,
  ProfilePanel,
  ResumePanel,
  TabsPanel,
} from './panels';
import { Button } from './ui';

const PANELS = [
  { id: 'profile', label: 'Profil', Component: ProfilePanel },
  { id: 'tabs', label: 'Tab', Component: TabsPanel },
  { id: 'posts', label: 'Kegiatan', Component: PostsPanel },
  { id: 'resume', label: 'Resume', Component: ResumePanel },
  { id: 'activity', label: 'Activity', Component: ActivityPanel },
  { id: 'lists', label: 'Lists', Component: ListsPanel },
  { id: 'about', label: 'About', Component: AboutPanel },
  { id: 'data', label: 'Data', Component: DataPanel },
];

function setIn(obj, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[head] = setIn(obj ? obj[head] : undefined, rest, value);
  return copy;
}

export default function AdminScreen() {
  const { content, setContent, reload } = useContent();
  const { isDesktop } = useLayout();
  const [token, setToken] = useState(() => tokenStore.get());
  const [checking, setChecking] = useState(Boolean(tokenStore.get()));
  const [notice, setNotice] = useState('');

  const logout = useCallback((message = '') => {
    tokenStore.clear();
    setToken(null);
    setNotice(message);
  }, []);

  // Validasi token tersimpan sekali saat membuka halaman admin.
  useEffect(() => {
    if (!token || !checking) return;
    api
      .checkSession(token)
      .catch(() => logout('Sesi berakhir. Silakan masuk lagi.'))
      .finally(() => setChecking(false));
  }, [token, checking, logout]);

  if (checking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 24 }}>
        <Text style={{ color: colors.muted, fontFamily: fonts.main }}>Memeriksa sesi…</Text>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <LoginForm notice={notice} onLoggedIn={(t) => { setToken(t); setNotice(''); reload(); }} />
      </SafeAreaView>
    );
  }

  return (
    <Editor
      token={token}
      content={content}
      setContent={setContent}
      isDesktop={isDesktop}
      onUnauthorized={() => logout('Sesi berakhir. Silakan masuk lagi.')}
      onLogout={() => logout()}
    />
  );
}

function Editor({ token, content, setContent, isDesktop, onUnauthorized, onLogout }) {
  const [draft, setDraft] = useState(content);
  const [panel, setPanel] = useState('profile');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ kind: '', text: '' });

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(content), [draft, content]);
  const set = useCallback((path, value) => setDraft((d) => setIn(d, path, value)), []);

  // Peringatan sebelum menutup tab bila ada perubahan belum disimpan (web).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.addEventListener) return undefined;
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const handleError = (e) => {
    if (e.status === 401) onUnauthorized();
    else setStatus({ kind: 'error', text: e.message });
  };

  const save = async () => {
    setBusy(true);
    setStatus({ kind: '', text: '' });
    try {
      const res = await api.saveContent(draft, token);
      setContent(res.content);
      setDraft(res.content);
      setStatus({ kind: 'ok', text: 'Tersimpan. Situs sudah diperbarui.' });
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  };

  const resetRemote = async () => {
    if (!(await confirmAction('Hapus konten tersimpan dan kembali ke konten bawaan?'))) return;
    setBusy(true);
    try {
      await api.resetContent(token);
      const res = await api.getContent();
      const fresh = res.content || null;
      if (fresh) setContent(fresh);
      else {
        const { defaultContent } = await import('../content/defaultContent');
        setContent(defaultContent);
        setDraft(defaultContent);
      }
      setStatus({ kind: 'ok', text: 'Konten dikembalikan ke bawaan.' });
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  };

  const discard = async () => {
    if (dirty && !(await confirmAction('Buang semua perubahan yang belum disimpan?'))) return;
    setDraft(content);
    setStatus({ kind: '', text: '' });
  };

  const active = PANELS.find((p) => p.id === panel) || PANELS[0];
  const Panel = active.Component;

  const nav = (
    <ScrollView
      horizontal={!isDesktop}
      showsHorizontalScrollIndicator={false}
      style={isDesktop ? { width: 190, flexGrow: 0 } : { flexGrow: 0, borderBottomColor: colors.border, borderBottomWidth: 1 }}
      contentContainerStyle={isDesktop ? { paddingVertical: 8 } : { paddingHorizontal: 16, columnGap: 18 }}
    >
      {PANELS.map((p) => {
        const on = p.id === panel;
        return (
          <Pressable
            key={p.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => setPanel(p.id)}
            style={isDesktop
              ? { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: on ? colors.panelAlt : 'transparent' }
              : { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: on ? colors.text : 'transparent' }}
          >
            <Text style={{ color: colors.text, opacity: on ? 1 : 0.65, fontFamily: fonts.main, fontSize: 15 }}>{p.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomColor: colors.border, borderBottomWidth: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
          <Text accessibilityRole="header" style={{ color: colors.text, fontFamily: fonts.main, fontSize: 18, fontWeight: '700' }}>Admin</Text>
          {dirty ? <Text style={{ color: colors.gold, fontFamily: fonts.main, fontSize: 13 }}>Belum disimpan</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Button small label="Lihat situs" onPress={() => navigate('/')} />
          <Button small label="Buang" onPress={discard} disabled={!dirty || busy} />
          <Button small kind="primary" label={busy ? 'Menyimpan…' : 'Simpan'} onPress={save} disabled={!dirty || busy} />
          <Button small kind="ghost" label="Keluar" onPress={onLogout} />
        </View>
      </View>
      {status.text ? (
        <Text style={{ color: status.kind === 'error' ? colors.danger : colors.ok, fontFamily: fonts.main, fontSize: 14, paddingHorizontal: 16, paddingTop: 10 }}>
          {status.text}
        </Text>
      ) : null}
      <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column', maxWidth: 1100, width: '100%', alignSelf: 'center', paddingHorizontal: isDesktop ? 16 : 0 }}>
        {nav}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 96, maxWidth: 760 }} keyboardShouldPersistTaps="handled">
          <Panel draft={draft} set={set} replaceDraft={setDraft} onResetRemote={resetRemote} busy={busy} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
