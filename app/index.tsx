import { SplashScreenView } from '@/screens/Splash';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';

const MAIN_DELAY_MS = 2000;

export default function SplashRoute() {
  const router = useRouter();
  const hidNative = useRef(false);

  useEffect(() => {
    const hide = async () => {
      if (hidNative.current) return;
      hidNative.current = true;
      await SplashScreen.hideAsync();
    };
    void hide();

    const t = setTimeout(() => {
      router.replace('/welcome');
    }, MAIN_DELAY_MS);

    return () => clearTimeout(t);
  }, [router]);

  return <SplashScreenView />;
}
