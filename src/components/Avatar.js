import { Image, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

export default function Avatar({ uri, name = '', size = 62 }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name ? `Foto ${name}` : 'Foto profil'}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: '#2a2a2c',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text style={{ color: colors.text, fontFamily: fonts.main, fontWeight: '600', fontSize: size * 0.36 }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
