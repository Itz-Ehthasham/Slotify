import { Brand } from '@/constants/brand';
import { AppScreenBackground } from '@/constants/screen';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CTA_BG = '#000000';
const DOT_ACTIVE = '#000000';
const DOT_INACTIVE = '#D1D5DB';
const SKIP_COLOR = '#374151';
const BODY_COLOR = '#6B7280';

const ART_X = 25;
const ART_Y = 118;
const ART_W = 325;
const ART_H = 276;
const HERO_H = ART_Y + ART_H;

const SLIDES = [
  {
    asset: require('../../../assets/images/01splashscreen.svg'),
    title: 'Choose a service',
    description:
      'Find the right service for your needs easily, with a variety of options available at your fingertips.',
  },
  {
    asset: require('../../../assets/images/02splashscreen.svg'),
    title: 'Book trusted help',
    description:
      'Pick a time that works for you and connect with verified pros ready to get the job done.',
  },
  {
    asset: require('../../../assets/images/03splashscreen.svg'),
    title: 'Track every step',
    description:
      'Stay updated from request to completion with simple status and messaging in one place.',
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(AppScreenBackground);
  }, []);

  const goNext = () => {
    if (isLast) {
      router.replace('/login');
      return;
    }
    setIndex((i) => i + 1);
  };

  const goSkip = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <StatusBar style="dark" />
      <View style={styles.body}>
        <View style={styles.hero}>
          <Image source={slide.asset} style={styles.illustration} contentFit="contain" />
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={goSkip}
            style={({ pressed }) => [styles.skipHit, pressed && styles.footerPressed]}
            hitSlop={12}>
            <Text style={styles.skipLabel}>Skip</Text>
          </Pressable>
          <Pressable
            onPress={goNext}
            style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}>
            <Text style={styles.nextLabel}>{isLast ? 'Get started' : 'Next'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppScreenBackground,
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  hero: {
    width: '100%',
    height: HERO_H,
    position: 'relative',
  },
  illustration: {
    position: 'absolute',
    left: ART_X,
    top: ART_Y,
    width: ART_W,
    height: ART_H,
  },
  copyBlock: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3,
  },
  description: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: BODY_COLOR,
    maxWidth: 320,
    paddingHorizontal: 4,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: DOT_ACTIVE,
  },
  dotInactive: {
    backgroundColor: DOT_INACTIVE,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  skipHit: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  footerPressed: {
    opacity: 0.7,
  },
  skipLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: SKIP_COLOR,
  },
  nextBtn: {
    backgroundColor: CTA_BG,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  nextBtnPressed: {
    opacity: 0.92,
  },
  nextLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.logoLime,
    letterSpacing: 0.1,
  },
});
