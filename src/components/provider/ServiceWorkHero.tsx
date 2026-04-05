import { getServiceHeroIconName } from '@/data/serviceWorkHeroIcon';
import { SERVICE_HERO_RASTER } from '@/data/serviceWorkHeroRaster';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

type Props = {
  category?: string;
};

/**
 * Hero for “Work they do”: uses a bundled PNG/WebP when listed in
 * `serviceWorkHeroRaster.ts`; otherwise a large category icon (always works on Android).
 */
export function ServiceWorkHero({ category }: Props) {
  const key = category?.trim().toLowerCase() ?? '';
  const raster = SERVICE_HERO_RASTER[key];

  if (raster) {
    return (
      <View style={styles.wrap}>
        <Image source={raster} style={styles.raster} contentFit="contain" transition={150} />
      </View>
    );
  }

  const iconName = getServiceHeroIconName(category);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={88} color="#1C1F34" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raster: {
    width: '100%',
    height: '100%',
    minHeight: 160,
  },
  iconCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#E8ECF0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
  },
});
