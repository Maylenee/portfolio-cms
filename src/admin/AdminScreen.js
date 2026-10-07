import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { api, tokenStore } from '../api/client';
import { useContent } from '../hooks/useContent';
import { fonts, useLayout } from '../theme';
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
import { A, ArrowOut, Button, Chevron } from './ui';

const PANELS = [
  { id: 'profile', label: 'Profile', Component: ProfilePanel },
  { id: 'tabs', label: 'Navigation', Component: TabsPanel },
  { id: 'posts', label: 'Stories', Component: PostsPanel },
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
      <SafeAreaView style={{ flex: 1, backgroundColor: A.bg, padding: 24 }}>
        <Text style={{ color: A.muted, fontFamily: fonts.main }}>Memeriksa sesi…</Text>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: A.bg }}>
        <LoginForm notice={notice} onLoggedIn={(t) => { setToken(t); setNotice(''); reload(); }} />
      </SafeAreaView>
    );
  }

  return (
    <Editor
      token={token}
      content={content}
      setContent={setContent}
      onUnauthorized={() => logout('Sesi berakhir. Silakan masuk lagi.')}
      onLogout={() => logout()}
    />
  );
}

function TabBar({ active, onChange }) {
  const ref = useRef(null);
  const x = useRef(0);
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: A.line, flexDirection: 'row', alignItems: 'center' }}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="tablist"
        onScroll={(e) => { x.current = e.nativeEvent.contentOffset.x; }}
        scrollEventThrottle={32}
        style={{ flex: 1 }}
        contentContainerStyle={{ columnGap: 40, paddingRight: 24 }}
      >
        {PANELS.map((p) => {
          const on = p.id === active;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => onChange(p.id)}
              style={{ paddingVertical: 18, marginBottom: -1, borderBottomWidth: 1, borderBottomColor: on ? A.text : 'transparent' }}
            >
              <Text style={{ color: A.text, opacity: on ? 1 : 0.75, fontFamily: fonts.main, fontSize: 17, letterSpacing: -0.2 }}>{p.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Geser tab"
        onPress={() => ref.current && ref.current.scrollTo({ x: x.current + 180, animated: true })}
        style={{ paddingLeft: 12, paddingVertical: 18 }}
      >
        <Chevron />
      </Pressable>
    </View>
  );
}

function Editor({ token, content, setContent, onUnauthorized, onLogout }) {
  const { px, isTablet } = useLayout();
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
      if (res.content) {
        setContent(res.content);
        setDraft(res.content);
      } else {
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
  const pad = isTablet ? 39 : 24;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: A.bg }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: A.bg }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: dirty ? 140 : 72 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 920, paddingHorizontal: pad, paddingTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', columnGap: 18, marginBottom: 10 }}>
            <Pressable accessibilityRole="link" onPress={() => navigate('/')} style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6 }}>
              <Text style={{ color: A.muted, fontFamily: fonts.main, fontSize: 15 }}>Lihat situs</Text>
              <ArrowOut />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onLogout}>
              <Text style={{ color: A.muted, fontFamily: fonts.main, fontSize: 15 }}>Keluar</Text>
            </Pressable>
          </View>

          <Text
            accessibilityRole="header"
            style={{ color: A.text, fontFamily: fonts.main, fontSize: px(52), lineHeight: px(60), fontWeight: '700', letterSpacing: -1.5, marginBottom: px(44) }}
          >
            Dashboard
          </Text>

          <TabBar active={panel} onChange={setPanel} />

          {status.text ? (
            <Text style={{ color: status.kind === 'error' ? A.danger : A.ok, fontFamily: fonts.main, fontSize: 15, marginTop: 18 }}>
              {status.text}
            </Text>
          ) : null}

          <Panel draft={draft} set={set} replaceDraft={setDraft} onResetRemote={resetRemote} onLogout={onLogout} busy={busy} />
        </View>
      </ScrollView>

      {dirty ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#222222',
            borderTopWidth: 1,
            borderTopColor: A.line,
            paddingVertical: 14,
            paddingHorizontal: pad,
            alignItems: 'center',
          }}
        >
          <View style={{ width: '100%', maxWidth: 842, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ color: A.warn, fontFamily: fonts.main, fontSize: 15 }}>Perubahan belum disimpan</Text>
            <View style={{ flexDirection: 'row', columnGap: 8 }}>
              <Button small label="Buang" onPress={discard} disabled={busy} />
              <Button small kind="primary" label={busy ? 'Menyimpan…' : 'Simpan'} onPress={save} disabled={busy} />
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
