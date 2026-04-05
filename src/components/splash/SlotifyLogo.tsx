import { Image } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
  useSplashLogo?: boolean;
};

const logoSource = require('../../../assets/icons/logo.png');
const splashLogoSource = require('../../../assets/images/slpash-logo.png');

export function SlotifyLogo({ size = 120, style, useSplashLogo = false }: Props) {
  const source = useSplashLogo ? splashLogoSource : logoSource;
  const frame = useSplashLogo
    ? { width: Math.min(400, size * 3.2), height: size * 0.72 }
    : { width: size, height: size };

  return <Image source={source} style={[frame, style]} contentFit="contain" />;
}
