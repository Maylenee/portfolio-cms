import { Text, View } from 'react-native';

import Markdown from '../components/Markdown';
import ServiceIcon, { ICON_NAMES } from '../components/ServiceIcon';
import { colors, fonts, useLayout } from '../theme';

function IconBox({ name, accent, size = 46, iconSize = 18, radius = 12 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: '#161617',
        borderWidth: 1,
        borderColor: '#222224',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ServiceIcon name={name} color={accent} size={iconSize} />
    </View>
  );
}

export default function AboutScreen({ content }) {
  const { px, isTablet } = useLayout();
  const { paragraphs, servicesTitle, services } = content.about;
  const accent = content.settings.accent;
  const [lead, ...rest] = paragraphs.filter((p) => p && p.trim());

  return (
    <View>
      {lead ? <Markdown source={lead} size={22} /> : null}

      {rest.map((text, i) => (
        <View key={i} style={{ marginTop: 18 }}>
          <Markdown source={text} size={17} color="#bdbdbd" />
        </View>
      ))}

      {services.length > 0 ? (
        <View style={{ marginTop: px(48) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 17, marginBottom: 22 }}>
              <Text
              accessibilityRole="header"
              style={{ flex: 1, color: colors.text, fontFamily: fonts.main, fontSize: px(24), fontWeight: '700', letterSpacing: -0.6 }}
            >
              {servicesTitle}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {services.map((service, i) => (
              <View
                key={service.id}
                style={{
                  flexGrow: 1,
                  flexBasis: isTablet ? '47%' : '100%',
                  backgroundColor: '#0d0d0e',
                  borderColor: '#202022',
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 18,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 14 }}>
                  <IconBox
                    name={service.icon || ICON_NAMES[i % ICON_NAMES.length]}
                    accent={accent}
                    size={40}
                    iconSize={18}
                    radius={10}
                  />
                  <Text
                    style={{ flex: 1, color: colors.text, fontFamily: fonts.main, fontSize: px(18), fontWeight: '600', letterSpacing: -0.3 }}
                  >
                    {service.title}
                  </Text>
                </View>
                <Text
                  style={{
                    color: '#bdbdbd',
                    fontFamily: fonts.main,
                    fontSize: px(15),
                    lineHeight: px(23),
                    marginTop: 14,
                  }}
                >
                  {service.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}