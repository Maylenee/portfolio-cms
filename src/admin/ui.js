import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

import { colors, fonts } from '../theme';
import { canUpload, pickImage } from '../utils/image';

const base = { fontFamily: fonts.main, color: colors.text };

export function Button({ label, onPress, kind = 'default', disabled, small }) {
  const palette = {
    default: { bg: colors.panelAlt, fg: colors.text, border: colors.border },
    primary: { bg: colors.text, fg: '#000', border: colors.text },
    danger: { bg: 'transparent', fg: colors.danger, border: '#4a2a2a' },
    ghost: { bg: 'transparent', fg: colors.text, border: 'transparent' },
  }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={{
        opacity: disabled ? 0.45 : 1,
        backgroundColor: palette.bg,
        borderColor: palette.border,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: small ? 6 : 10,
        paddingHorizontal: small ? 10 : 16,
      }}
    >
      <Text style={{ ...base, color: palette.fg, fontSize: small ? 13 : 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, value, onChange, multiline, placeholder, hint, secure, onSubmit }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={{ ...base, fontSize: 13, color: colors.muted, marginBottom: 6 }}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        value={value ?? ''}
        onChangeText={onChange}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#5c5c60"
        secureTextEntry={secure}
        onSubmitEditing={onSubmit}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          ...base,
          fontSize: 16, // 16px mencegah iOS Safari zoom otomatis saat fokus
          backgroundColor: colors.panel,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 12,
          minHeight: multiline ? 96 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {hint ? <Text style={{ ...base, fontSize: 12, color: colors.muted, marginTop: 4 }}>{hint}</Text> : null}
    </View>
  );
}

export function Toggle({ label, value, onChange }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: Boolean(value) }}
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10, marginBottom: 14 }}
    >
      <View style={{ width: 40, height: 22, borderRadius: 11, backgroundColor: value ? colors.ok : colors.border, padding: 2 }}>
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#000', marginLeft: value ? 18 : 0 }} />
      </View>
      <Text style={{ ...base, fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function ImageField({ label, value, onChange, maxSize = 800 }) {
  const [error, setError] = useState('');
  const upload = async () => {
    setError('');
    try {
      const data = await pickImage(maxSize);
      if (data) onChange(data);
    } catch (e) {
      setError(e.message);
    }
  };
  const isData = typeof value === 'string' && value.startsWith('data:');
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ ...base, fontSize: 13, color: colors.muted, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', columnGap: 12, alignItems: 'flex-start' }}>
        <View style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1 }}>
          {value ? <Image source={{ uri: value }} style={{ width: 72, height: 72 }} resizeMode="cover" /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Field
            value={isData ? '' : value}
            onChange={onChange}
            placeholder={isData ? 'Gambar diunggah (data)' : 'https://… atau unggah'}
          />
          <View style={{ flexDirection: 'row', columnGap: 8, marginTop: -6 }}>
            {canUpload ? <Button small label="Unggah gambar" onPress={upload} /> : null}
            {value ? <Button small kind="danger" label="Hapus" onPress={() => onChange('')} /> : null}
          </View>
          {error ? <Text style={{ ...base, color: colors.danger, fontSize: 12, marginTop: 6 }}>{error}</Text> : null}
        </View>
      </View>
    </View>
  );
}

export function DateField({ label, value, onChange }) {
  const valid = !value || !Number.isNaN(new Date(value).getTime());
  return (
    <View>
      <Field
        label={label}
        value={value}
        onChange={onChange}
        placeholder="2026-10-07T09:00:00Z"
        hint={valid ? 'Format ISO. Tekan “Sekarang” untuk mengisi waktu saat ini.' : 'Format tanggal tidak valid.'}
      />
      <View style={{ marginTop: -6, marginBottom: 14, flexDirection: 'row' }}>
        <Button small label="Sekarang" onPress={() => onChange(new Date().toISOString())} />
      </View>
    </View>
  );
}

export function Card({ children, style }) {
  return (
    <View style={[{ backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 }, style]}>
      {children}
    </View>
  );
}

export function H({ children }) {
  return (
    <Text accessibilityRole="header" style={{ ...base, fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
      {children}
    </Text>
  );
}
