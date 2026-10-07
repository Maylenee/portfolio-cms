import { Text } from 'react-native';

import { colors, fonts } from '../theme';

export default function Empty({ children }) {
  return (
    <Text style={{ color: colors.muted, fontFamily: fonts.main, fontSize: 16, lineHeight: 24 }}>{children}</Text>
  );
}
