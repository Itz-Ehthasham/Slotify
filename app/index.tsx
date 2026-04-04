import { getUser } from '@/auth/session';
import { SplashScreenView } from '@/screens/Splash';
import { type Href, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';

const MAIN_DELAY_MS = 2000;

export default function SplashRoute() {
  const router = useRouter();
  const hidNative = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const started = Date.now();
      let storedUser: Awaited<ReturnType<typeof getUser>> = null;
      try {
        storedUser = await getUser();
      } catch {
        storedUser = null;
      }
      if (cancelled) return;

      const elapsed = Date.now() - started;
      const waitMore = Math.max(0, MAIN_DELAY_MS - elapsed);
      if (waitMore > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, waitMore));
      }
      if (cancelled) return;

      if (!hidNative.current) {
        hidNative.current = true;
        await SplashScreen.hideAsync();
      }

      const next = (storedUser ? '/(tabs)' : '/welcome') as Href;
      router.replace(next);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <SplashScreenView />;
}
