import { Text, View } from 'react-native';

import Empty from '../components/Empty';
import { colors, fonts, useLayout } from '../theme';
import { relativeTime } from '../utils/time';

export default function ActivityScreen({ content }) {
  const { px } = useLayout();
  const items = [...content.activity].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (items.length === 0) return <Empty>Belum ada aktivitas.</Empty>;
  return items.map((item) => (
    <View key={item.id} style={{ marginBottom: px(30) }}>
      <Text style={{ color: colors.text, fontFamily: fonts.main, fontSize: px(19), lineHeight: px(26), fontWeight: '600', letterSpacing: -0.3 }}>
        {item.text}
      </Text>
      <Text style={{ color: colors.meta, fontFamily: fonts.main, fontSize: px(15), marginTop: 4 }}>
        {relativeTime(item.date)}
      </Text>
    </View>
  ));
}
