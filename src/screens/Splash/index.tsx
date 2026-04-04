import { Brand } from '@/constants/brand';
import { SlotifyLogo } from '@/components/splash/SlotifyLogo';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SplashScreenView() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) }]}>
      <StatusBar style="dark" />
      <View style={styles.center}>
        <SlotifyLogo size={128} />
        <Text style={styles.title}>Slotify</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.splashBackground,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Brand.charcoal,
    letterSpacing: -0.5,
  },
});
