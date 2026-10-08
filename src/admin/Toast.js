import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { fonts } from '../theme';

const SHOW_MS = 2000; // lama tampil sebelum menghilang

/**
 * Pop up kecil hijau di pojok kanan atas: jatuh dari atas (drop), tampil 2 detik, lalu hilang.
 * Pakai `key={toast.id}` supaya animasi mulai lagi tiap ada notifikasi baru.
 */
export default function Toast({ text, onDone }) {
  const y = useRef(new Animated.Value(-90)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const native = Platform.OS !== 'web';

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(y, { toValue: 0, duration: 520, easing: Easing.out(Easing.bounce), useNativeDriver: native }),
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: native }),
      ]),
      Animated.delay(SHOW_MS),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: native }),
        Animated.timing(y, { toValue: -20, duration: 220, useNativeDriver: native }),
      ]),
    ]);
    anim.start(({ finished }) => {
      if (finished && onDone) onDone();
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 100,
        opacity,
        transform: [{ translateY: y }],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: 12,
          backgroundColor: '#1f9d55',
          borderRadius: 10,
          paddingVertical: 11,
          paddingLeft: 16,
          paddingRight: 12,
          maxWidth: 320,
        }}
      >
        <Text style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: '500', color: '#fff', flexShrink: 1 }}>{text}</Text>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="11" fill="#fff" />
          <Path d="M7 12.5l3.2 3.2L17 8.9" stroke="#1f9d55" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    </Animated.View>
  );
}
