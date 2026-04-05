import { Brand } from '@/constants/brand';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_MAX_W = Math.min(400, SCREEN_W - 48);

export type AppointmentBookedSuccessModalProps = {
  visible: boolean;
  onViewAppointments: () => void;
  onBackToHome: () => void;
};

export function AppointmentBookedSuccessModal({
  visible,
  onViewAppointments,
  onBackToHome,
}: AppointmentBookedSuccessModalProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      sheetProgress.setValue(0);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(sheetProgress, {
          toValue: 1,
          friction: 9,
          tension: 68,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetProgress, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const cardScale = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });
  const cardOpacity = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onViewAppointments}>
      <View style={styles.wrap} pointerEvents="box-none">
        <Animated.View style={[styles.backdropTint, { opacity: backdropOpacity }]}>
          <View style={StyleSheet.absoluteFill} />
        </Animated.View>

        <View style={styles.centerPad} pointerEvents="box-none">
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.card,
              {
                width: CARD_MAX_W,
                maxWidth: '100%',
                opacity: cardOpacity,
                transform: [{ scale: cardScale }],
              },
            ]}>
            <View style={styles.accentBar} />

            <View style={styles.inner}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark-circle" size={72} color="#16A34A" />
              </View>

              <Text style={styles.title}>Appointment Confirmed!</Text>
              <Text style={styles.subtitle}>Your slot has been successfully booked.</Text>

              <View style={styles.btnStack}>
                <Pressable
                  style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
                  onPress={onViewAppointments}
                  accessibilityRole="button"
                  accessibilityLabel="View appointments">
                  <Text style={styles.btnPrimaryText}>View Appointments</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
                  onPress={onBackToHome}
                  accessibilityRole="button"
                  accessibilityLabel="Back to home">
                  <Text style={styles.btnSecondaryText}>Back to Home</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
  },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 15, 0.52)',
  },
  centerPad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 14,
  },
  accentBar: {
    height: 4,
    backgroundColor: Brand.logoLime,
  },
  inner: {
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F0F0F',
    textAlign: 'center',
    letterSpacing: -0.35,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  btnStack: {
    width: '100%',
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnSecondary: {
    backgroundColor: Brand.charcoal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 2,
    borderColor: Brand.logoLime,
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.logoLime,
  },
  btnPressed: {
    opacity: 0.92,
  },
});
