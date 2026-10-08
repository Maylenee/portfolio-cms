import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { colors, fonts, useLayout } from '../theme';
import { faviconFor, hostOf, openUrl, safeUrl } from '../utils/links';

// Chip untuk Tools / Stack / Client: ikon dari URL + nama, klik membuka URL.
export default function LinkChip({ name, url }) {
  const { px } = useLayout();
  const [broken, setBroken] = useState(false);
  const href = safeUrl(url);
  const icon = faviconFor(url);
  const label = name || hostOf(url);
  if (!label) return null;

  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 12,
        maxWidth: '100%',
      }}
    >
      {icon && !broken ? (
        <Image source={{ uri: icon }} onError={() => setBroken(true)} style={{ width: 16, height: 16, borderRadius: 3 }} />
      ) : (
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: 10, fontWeight: '700' }}>{label.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(15), flexShrink: 1 }}>
        {label}
      </Text>
    </View>
  );

  return href ? (
    <Pressable accessibilityRole="link" accessibilityLabel={label} onPress={() => openUrl(href)} style={{ maxWidth: '100%' }}>
      {body}
    </Pressable>
  ) : (
    body
  );
}