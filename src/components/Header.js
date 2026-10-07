import { Text, View } from 'react-native';

import { colors, fonts, useLayout } from '../theme';
import Avatar from './Avatar';

export default function Header({ profile }) {
  const { px } = useLayout();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 27 }}>
      <Avatar uri={profile.avatar} name={profile.name} size={px(62)} />
      <Text
        accessibilityRole="header"
        style={{
          flex: 1,
          color: colors.text,
          fontFamily: fonts.main,
          fontSize: px(26),
          lineHeight: px(30),
          fontWeight: '600',
          letterSpacing: -0.5,
        }}
      >
        {profile.name}
      </Text>
    </View>
  );
}
