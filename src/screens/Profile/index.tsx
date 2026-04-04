import { AppScreenBackground } from '@/constants/screen';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const emptyIllustration = require('../../../assets/icons/nonotifications.svg');

const ART_ASPECT = 179 / 170;

/**
 * Notifications tab — empty state when there are no items.
 * When you load real data: if `notifications.length === 0`, keep this UI; else render a list.
 */
export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.headerShell}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <View style={styles.body}>
        <Image source={emptyIllustration} style={styles.art} contentFit="contain" />
        <Text style={styles.emptyTitle}>No Notifications Yet</Text>
        <Text style={styles.emptySubtitle}>
          You have no notifications right now. Come back later.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppScreenBackground,
  },
  headerShell: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
  },
  body: {
    flex: 1,
    backgroundColor: AppScreenBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  art: {
    width: '85%',
    maxWidth: 280,
    aspectRatio: ART_ASPECT,
    maxHeight: 280,
  },
  emptyTitle: {
    marginTop: 28,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
});
