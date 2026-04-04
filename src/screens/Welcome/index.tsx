import { Brand } from '@/constants/brand';
import { AppScreenBackground } from '@/constants/screen';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const illustration = require('../../../assets/images/Mask group.svg');

const CTA_BG = '#000000';

export default function WelcomeScreen() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(AppScreenBackground);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { minHeight: windowHeight * 0.96 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.copy}>
          <Text style={styles.headline}>
            Best Helping{'\n'}Hands for you
          </Text>
          <Text style={styles.subhead}>
            With Our On-Demand Services App,{'\n'}We Give Better Services To You.
          </Text>
        </View>

        <View style={styles.artWrap}>
          <Image
            source={illustration}
            style={styles.illustration}
            contentFit="contain"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={() => router.replace('/onboarding')}>
          <Text style={styles.ctaLabel}>Gets Started</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppScreenBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 12,
  },
  copy: {
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 4,
    paddingTop: 56,
  },
  headline: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  subhead: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 22,
    letterSpacing: -0.1,
    maxWidth: 320,
    opacity: 0.88,
  },
  artWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 260,
    paddingVertical: 12,
  },
  illustration: {
    width: '100%',
    maxWidth: 380,
    height: 320,
  },
  cta: {
    alignSelf: 'stretch',
    backgroundColor: CTA_BG,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.logoLime,
    letterSpacing: 0.1,
  },
});
