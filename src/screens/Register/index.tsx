import { saveUser } from '@/auth/session';
import { PasswordField } from '@/components/auth/PasswordField';
import { SlotifyLogo } from '@/components/splash/SlotifyLogo';
import { Brand } from '@/constants/brand';
import { AppScreenBackground } from '@/constants/screen';
import { type Href, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CTA_BG = '#000000';
const LABEL_COLOR = '#374151';
const INPUT_BORDER = 'rgba(15, 15, 15, 0.12)';
const PLACEHOLDER = '#9CA3AF';

const PAD_H = 22;
const MAX_CONTENT_WIDTH = 400;

const GAP_LOGO_TITLE = 16;
const GAP_TITLE_SUB = 10;
const GAP_HEADER_TO_CARD = 24;
const GAP_FIELDS = 14;
const GAP_LABEL_INPUT = 8;
const GAP_CARD_TO_CTA = 20;
const GAP_CTA_FOOTER = 20;
const FORM_CARD_PADDING = 16;

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(AppScreenBackground);
  }, []);

  const onSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    await saveUser({ email: normalizedEmail });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.column}>
            <View style={styles.header}>
              <SlotifyLogo size={136} useSplashLogo style={styles.logo} />
              <View style={styles.headerText}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Create your account to continue.</Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={PLACEHOLDER}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
              <PasswordField
                label="Password"
                value={password}
                onChangeText={setPassword}
                autoComplete="password-new"
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoComplete="password-new"
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
              onPress={onSubmit}>
              <Text style={styles.ctaLabel}>Create Account</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerMuted}>{"Already have an account? "}</Text>
              <Pressable
                onPress={() => router.push('/login' as Href)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                <Text style={styles.footerLink}>Log in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppScreenBackground,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: PAD_H,
    paddingVertical: 20,
  },
  column: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    alignItems: 'stretch',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: GAP_HEADER_TO_CARD,
    gap: GAP_LOGO_TITLE,
  },
  logo: {
    alignSelf: 'center',
  },
  headerText: {
    width: '100%',
    alignItems: 'center',
    gap: GAP_TITLE_SUB,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: LABEL_COLOR,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    borderRadius: 10,
    padding: FORM_CARD_PADDING,
    gap: GAP_FIELDS,
  },
  field: {
    width: '100%',
    gap: GAP_LABEL_INPUT,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LABEL_COLOR,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },
  cta: {
    width: '100%',
    marginTop: GAP_CARD_TO_CTA,
    alignSelf: 'stretch',
    backgroundColor: CTA_BG,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
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
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: GAP_CTA_FOOTER,
    paddingHorizontal: 4,
  },
  footerMuted: {
    fontSize: 15,
    lineHeight: 22,
    color: LABEL_COLOR,
    textAlign: 'center',
  },
  footerLink: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000000',
  },
});
