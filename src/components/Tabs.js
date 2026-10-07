import { Pressable, ScrollView, Text } from 'react-native';

import { colors, fonts, useLayout } from '../theme';

export default function Tabs({ tabs, active, onChange }) {
  const { px } = useLayout();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', columnGap: 18 }}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.id)}
            style={{
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: selected ? colors.text : 'transparent',
            }}
          >
            <Text
              style={{
                color: colors.text,
                opacity: selected ? 1 : 0.72,
                fontFamily: fonts.main,
                fontSize: px(17),
                lineHeight: px(21),
                letterSpacing: -0.1,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
