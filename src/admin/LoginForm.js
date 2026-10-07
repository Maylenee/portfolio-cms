import { useState } from 'react';
import { Text, View } from 'react-native';

import { api, tokenStore } from '../api/client';
import { fonts } from '../theme';
import { navigate } from '../utils/router';
import { A, Button, Field } from './ui';

export default function LoginForm({ onLoggedIn, notice }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!password || busy) return;
    setBusy(true);
    setError('');
    try {
      const { token } = await api.login(password);
      tokenStore.set(token);
      onLoggedIn(token);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 72 }}>
      <Text accessibilityRole="header" style={{ color: A.text, fontFamily: fonts.main, fontSize: 28, fontWeight: '700', letterSpacing: -0.7, marginBottom: 8 }}>
        Admin
      </Text>
      <Text style={{ color: A.muted, fontFamily: fonts.main, fontSize: 15, marginBottom: 28 }}>
        Masuk untuk mengelola konten portfolio.
      </Text>
      {notice ? <Text style={{ color: A.warn, fontFamily: fonts.main, fontSize: 14, marginBottom: 14 }}>{notice}</Text> : null}
      <Field label="Password" value={password} onChange={setPassword} secure onSubmit={submit} />
      {error ? <Text style={{ color: A.danger, fontFamily: fonts.main, fontSize: 14, marginBottom: 14 }}>{error}</Text> : null}
      <View style={{ flexDirection: 'row', columnGap: 10 }}>
        <Button kind="primary" label={busy ? 'Memeriksa…' : 'Masuk'} onPress={submit} disabled={busy || !password} />
        <Button kind="ghost" label="Kembali ke situs" onPress={() => navigate('/')} />
      </View>
    </View>
  );
}
