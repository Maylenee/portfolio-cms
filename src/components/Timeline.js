import { Text, View } from 'react-native';

import { colors, fonts, useLayout } from '../theme';

function titleCase(str) {
  return str.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

const DOT = 16; // diameter luar (cincin hitam + titik berwarna)
const LINE = 2;

/** Timeline sederhana: judul polos, garis tipis berwarna aksen, titik solid. */
export default function Timeline({ sections, accent }) {
  const { px } = useLayout();
  const body = { fontFamily: fonts.resume, fontSize: px(15), lineHeight: px(24) };

  return (
    <View>
      {sections.map((section, si) => (
        <View key={section.id} style={{ marginTop: si === 0 ? 0 : 48 }}>
          <Text
            accessibilityRole="header"
            style={{ color: colors.text, fontFamily: fonts.resume, fontSize: px(22), fontWeight: '600', marginBottom: 22 }}
          >
            {section.title}
          </Text>

          {section.items.map((item, i) => {
            const last = i === section.items.length - 1;
            return (
              <View key={item.id} style={{ paddingLeft: 30, paddingBottom: last ? 0 : 26 }}>
                {!last ? (
                  <View
                    style={{
                      position: 'absolute',
                      left: DOT / 2 - LINE / 2,
                      width: LINE,
                      top: DOT / 2 + 4,
                      bottom: -(DOT / 2 + 4),
                      backgroundColor: accent,
                    }}
                  />
                ) : null}
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    width: DOT,
                    height: DOT,
                    borderRadius: DOT / 2,
                    backgroundColor: accent,
                    borderWidth: 3,
                    borderColor: colors.bg,
                  }}
                />
                <Text style={[body, { color: colors.text, fontWeight: '600', fontSize: px(16) }]}>{titleCase(item.title)}</Text>
                {item.period ? <Text style={[body, { color: accent, fontWeight: '500', marginTop: 2 }]}>{item.period}</Text> : null}
                {item.description ? <Text style={[body, { color: '#cfcfcf', marginTop: 4 }]}>{item.description}</Text> : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}