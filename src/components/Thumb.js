import { Image, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

export default function Thumb({ uri, width, height }) {
  return (
    <View style={{ width, height, borderRadius: 3, overflow: 'hidden', backgroundColor: '#1c1c1e' }}>
      {uri ? (
        <Image source={{ uri }} style={{ width, height }} resizeMode="cover" />
      ) : (
        <Svg width={width} height={height} viewBox="0 0 104 69">
          <Rect width="104" height="69" fill="#1c1c1e" />
          <Circle cx="34" cy="26" r="9" fill="#2c2c30" />
          <Rect x="0" y="48" width="104" height="21" fill="#26262a" />
          <Rect x="52" y="30" width="34" height="18" fill="#303035" />
        </Svg>
      )}
    </View>
  );
}
