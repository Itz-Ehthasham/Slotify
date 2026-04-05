import { Brand } from '@/constants/brand';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
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

export type CancelAppointmentConfirmModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirmCancel: () => void | Promise<void>;
  isSubmitting?: boolean;
};

export function CancelAppointmentConfirmModal({
  visible,
  onClose,
  onConfirmCancel,
  isSubmitting = false,
}: CancelAppointmentConfirmModalProps) {
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
    outputRange: [0.92, 1],
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
      onRequestClose={isSubmitting ? undefined : onClose}>
      <View style={styles.wrap} pointerEvents="box-none">
        <Animated.View style={[styles.backdropTint, { opacity: backdropOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={isSubmitting ? undefined : onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
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
              <View style={styles.iconWrap}>
                <Ionicons name="warning" size={28} color="#FF4D4F" />
              </View>

              <Text style={styles.title}>Cancel Appointment?</Text>
              <Text style={styles.subtitle}>
                This slot will become available again. You can view this booking in History.
              </Text>

              <View style={styles.btnStack}>
                <Pressable
                  style={({ pressed }) => [
                    styles.btnPrimary,
                    (pressed || isSubmitting) && styles.btnPrimaryPressed,
                  ]}
                  onPress={() => void onConfirmCancel()}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel appointment">
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Cancel Appointment</Text>
                  )}
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnSecondaryPressed]}
                  onPress={onClose}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Keep appointment">
                  <Text style={styles.btnSecondaryText}>Keep Appointment</Text>
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
    borderRadius: 18,
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
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 77, 79, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.22)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F0F0F',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 26,
  },
  btnStack: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#FF4D4F',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  btnPrimaryPressed: {
    opacity: 0.9,
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
  btnSecondaryPressed: {
    opacity: 0.92,
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.logoLime,
  },
});
