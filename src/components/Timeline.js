import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts, useLayout } from '../theme';

function BookIcon({ color }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 5.5C4.5 4.5 8.5 4.5 12 7c3.5-2.5 7.5-2.5 10-1.5v13c-2.5-1-6.5-1-10 1.5-3.5-2.5-7.5-2.5-10-1.5z" />
      <Path d="M12 7v13" />
    </Svg>
  );
}

function titleCase(str) {
  return str.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

export default function Timeline({ sections, accent }) {
  const { px } = useLayout();
  const body = { fontFamily: fonts.resume, fontSize: px(15), lineHeight: px(24) };

  return (
    <View>
      {sections.map((section, si) => (
        <View key={section.id} style={{ marginTop: si === 0 ? 0 : 44 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 17 }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                backgroundColor: '#161617',
                borderWidth: 1,
                borderColor: '#222224',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookIcon color={accent} />
            </View>
            <Text
              accessibilityRole="header"
              style={{ flex: 1, color: colors.text, fontFamily: fonts.resume, fontSize: px(24), fontWeight: '500' }}
            >
              {section.title}
            </Text>
          </View>

          <View style={{ marginTop: 14 }}>
            {section.items.length > 0 ? (
              <View style={{ position: 'absolute', left: 22, top: -14, height: 28, width: 1, backgroundColor: colors.line }} />
            ) : null}
            {section.items.map((item, i) => {
              const last = i === section.items.length - 1;
              return (
                <View key={item.id} style={{ paddingLeft: 65, paddingBottom: last ? 0 : 20 }}>
                  {!last ? (
                    <View style={{ position: 'absolute', left: 22, top: 14, bottom: -14, width: 1, backgroundColor: colors.line }} />
                  ) : null}
                  <View
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: 5,
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: colors.line,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: accent }} />
                  </View>
                  <Text style={[body, { color: colors.text, fontWeight: '600' }]}>{titleCase(item.title)}</Text>
                  {item.period ? <Text style={[body, { color: accent, marginTop: 4 }]}>{item.period}</Text> : null}
                  {item.description ? <Text style={[body, { color: '#d6d6d6', marginTop: 2 }]}>{item.description}</Text> : null}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
