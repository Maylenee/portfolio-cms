import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const ICON_NAMES = ['bot', 'article', 'code', 'workflow', 'design', 'mobile', 'camera', 'star'];

export default function ServiceIcon({ name, color, size = 20 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'bot':
      return (
        <Svg {...props}>
          <Rect x="4" y="8" width="16" height="12" rx="3" />
          <Path d="M12 8V5" />
          <Circle cx="12" cy="4" r="1" />
          <Circle cx="9" cy="13" r="1" />
          <Circle cx="15" cy="13" r="1" />
          <Path d="M9 17h6" />
        </Svg>
      );
    case 'article':
      return (
        <Svg {...props}>
          <Path d="M6 3h9l4 4v14H6z" />
          <Path d="M14 3v5h5" />
          <Path d="M9 13h7" />
          <Path d="M9 17h5" />
        </Svg>
      );
    case 'workflow':
      return (
        <Svg {...props}>
          <Circle cx="6" cy="6" r="2" />
          <Circle cx="6" cy="18" r="2" />
          <Circle cx="18" cy="12" r="2" />
          <Path d="M8 6c5 0 5 6 8 6" />
          <Path d="M8 18c5 0 5-6 8-6" />
        </Svg>
      );
    case 'design':
      return (
        <Svg {...props}>
          <Path d="M12 20h9" />
          <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </Svg>
      );
    case 'code':
      return (
        <Svg {...props}>
          <Path d="M16 18l6-6-6-6" />
          <Path d="M8 6l-6 6 6 6" />
        </Svg>
      );
    case 'mobile':
      return (
        <Svg {...props}>
          <Rect x="5" y="2" width="14" height="20" rx="2" />
          <Path d="M12 18h.01" />
        </Svg>
      );
    case 'camera':
      return (
        <Svg {...props}>
          <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <Circle cx="12" cy="13" r="4" />
        </Svg>
      );
    default:
      return (
        <Svg {...props}>
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </Svg>
      );
  }
}