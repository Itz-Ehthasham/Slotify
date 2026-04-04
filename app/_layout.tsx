import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Brand } from '@/constants/brand';
import { AppScreenBackground } from '@/constants/screen';

void SplashScreen.preventAutoHideAsync();

const LightChromeTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: AppScreenBackground,
    card: AppScreenBackground,
    primary: '#11181C',
    text: '#11181C',
  },
};

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(AppScreenBackground);
  }, []);

  return (
    <ThemeProvider value={LightChromeTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: AppScreenBackground } }}>
        <Stack.Screen
          name="index"
          options={{ contentStyle: { backgroundColor: Brand.splashBackground } }}
        />
        <Stack.Screen name="welcome" options={{ contentStyle: { backgroundColor: AppScreenBackground } }} />
        <Stack.Screen name="login" options={{ contentStyle: { backgroundColor: AppScreenBackground } }} />
        <Stack.Screen name="register" options={{ contentStyle: { backgroundColor: AppScreenBackground } }} />
        <Stack.Screen name="onboarding" options={{ contentStyle: { backgroundColor: AppScreenBackground } }} />
        <Stack.Screen name="(tabs)" options={{ contentStyle: { backgroundColor: AppScreenBackground } }} />
        <Stack.Screen name="auth" options={{ headerShown: true, title: 'Auth' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
