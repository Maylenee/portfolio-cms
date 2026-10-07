import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { fonts } from '../theme';
import { canUpload, pickImage } from '../utils/image';

/** Palet dashboard (abu-abu gelap ala halaman Settings). */
export const A = {
  bg: '#191919',
  text: '#ffffff',
  muted: '#b3b3b3',
  faint: '#8c8c8c',
  line: '#2e2e2e',
  input: '#121212',
  inputBorder: '#3d3d3d',
  danger: '#e5565f',
  ok: '#6bd49b',
  warn: '#ffdb70',
};

const base = { fontFamily: fonts.main, color: A.text };

export function ArrowOut({ color = A.muted }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 18L18 6" />
      <Path d="M8 6h10v10" />
    </Svg>
  );
}

export function Chevron({ color = A.text, size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

export function Checkbox({ checked }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: checked ? A.text : A.faint,
        backgroundColor: checked ? A.text : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked ? (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M5 12l5 5 9-10" />
        </Svg>
      ) : null}
    </View>
  );
}

/** Bagian dengan judul tebal dan garis pemisah di atasnya (kecuali yang pertama). */
export function Section({ title, first, children }) {
  return (
    <View style={first ? { marginTop: 48 } : { marginTop: 36, borderTopWidth: 1, borderTopColor: A.line, paddingTop: 44 }}>
      {title ? (
        <Text accessibilityRole="header" style={{ ...base, fontSize: 20, fontWeight: '600', letterSpacing: -0.3, marginBottom: 4 }}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/**
 * Baris pengaturan: judul + deskripsi di kiri, nilai/ikon di kanan.
 * Bila `children` ada, baris bisa dibuka (accordion) untuk mengedit di tempat.
 */
export function SettingRow({ title, description, right, arrow, onPress, expanded, children, danger, checkbox, badge }) {
  const interactive = Boolean(onPress);
  const Wrapper = interactive ? Pressable : View;
  return (
    <View>
      <Wrapper
        {...(interactive ? { accessibilityRole: 'button', accessibilityState: { expanded: Boolean(expanded) }, onPress } : {})}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', columnGap: 16, paddingVertical: 20 }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
            <Text style={{ ...base, color: danger ? A.danger : A.text, fontSize: 17, fontWeight: '500', letterSpacing: -0.2, flexShrink: 1 }}>{title}</Text>
            {badge ? (
              <View style={{ borderWidth: 1, borderColor: A.inputBorder, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ ...base, fontSize: 12 }}>{badge}</Text>
              </View>
            ) : null}
          </View>
          {description ? (
            <Text style={{ ...base, color: A.muted, fontSize: 15, lineHeight: 22, marginTop: 6 }}>{description}</Text>
          ) : null}
        </View>
        {right !== undefined || arrow || checkbox !== undefined ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 12, maxWidth: '50%' }}>
            {typeof right === 'string' ? (
              <Text numberOfLines={1} style={{ ...base, color: A.muted, fontSize: 17, flexShrink: 1 }}>{right}</Text>
            ) : (
              right
            )}
            {arrow ? <ArrowOut /> : null}
            {checkbox !== undefined ? <Checkbox checked={checkbox} /> : null}
          </View>
        ) : null}
      </Wrapper>
      {expanded && children ? <View style={{ paddingBottom: 24 }}>{children}</View> : null}
    </View>
  );
}

/** Baris pengaturan yang membuka formulir inline saat diketuk. */
export function FieldRow({ title, description, value, children, badge }) {
  const [open, setOpen] = useState(false);
  return (
    <SettingRow
      title={title}
      description={description}
      badge={badge}
      right={open ? undefined : value}
      expanded={open}
      onPress={() => setOpen((o) => !o)}
    >
      {children}
    </SettingRow>
  );
}

export function Button({ label, onPress, kind = 'default', disabled, small }) {
  const palette = {
    default: { bg: 'transparent', fg: A.text, border: A.inputBorder },
    primary: { bg: A.text, fg: '#000', border: A.text },
    danger: { bg: 'transparent', fg: A.danger, border: '#5a2d31' },
    ghost: { bg: 'transparent', fg: A.text, border: 'transparent' },
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
        borderRadius: 999,
        paddingVertical: small ? 7 : 11,
        paddingHorizontal: small ? 14 : 20,
      }}
    >
      <Text style={{ ...base, color: palette.fg, fontSize: small ? 14 : 15, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, value, onChange, multiline, placeholder, hint, secure, onSubmit }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={{ ...base, fontSize: 14, color: A.muted, marginBottom: 6 }}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        value={value ?? ''}
        onChangeText={onChange}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#5f5f5f"
        secureTextEntry={secure}
        onSubmitEditing={onSubmit}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          ...base,
          fontSize: 16, // 16px mencegah iOS Safari zoom otomatis saat fokus
          backgroundColor: A.input,
          borderColor: A.inputBorder,
          borderWidth: 1,
          borderRadius: 8,
          paddingVertical: 11,
          paddingHorizontal: 13,
          minHeight: multiline ? 110 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {hint ? <Text style={{ ...base, fontSize: 13, color: A.faint, marginTop: 6 }}>{hint}</Text> : null}
    </View>
  );
}

/** Kotak centang bergaya Settings (satu baris penuh bisa diketuk). */
export function Toggle({ label, value, onChange }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: Boolean(value) }}
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 10 }}
    >
      <Text style={{ ...base, fontSize: 16 }}>{label}</Text>
      <Checkbox checked={Boolean(value)} />
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
      {label ? <Text style={{ ...base, fontSize: 14, color: A.muted, marginBottom: 6 }}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', columnGap: 14, alignItems: 'flex-start' }}>
        <View style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', backgroundColor: A.input, borderColor: A.inputBorder, borderWidth: 1 }}>
          {value ? <Image source={{ uri: value }} style={{ width: 72, height: 72 }} resizeMode="cover" /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Field value={isData ? '' : value} onChange={onChange} placeholder={isData ? 'Gambar diunggah (data)' : 'https://… atau unggah'} />
          <View style={{ flexDirection: 'row', columnGap: 8, marginTop: -6 }}>
            {canUpload ? <Button small label="Unggah gambar" onPress={upload} /> : null}
            {value ? <Button small kind="danger" label="Hapus" onPress={() => onChange('')} /> : null}
          </View>
          {error ? <Text style={{ ...base, color: A.danger, fontSize: 13, marginTop: 6 }}>{error}</Text> : null}
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
