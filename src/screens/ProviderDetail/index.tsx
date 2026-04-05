import { getCurrentUser } from '@/auth/session';
import { AppointmentBookedSuccessModal } from '@/components/appointments/AppointmentBookedSuccessModal';
import { BookingCalendarModal, type BookingConfirmDetails } from '@/components/provider/BookingCalendarModal';
import { ServiceWorkHero } from '@/components/provider/ServiceWorkHero';
import { Brand } from '@/constants/brand';
import { AppScreenBackground } from '@/constants/screen';
import { formatHourlyRateInr, getProviderDetail } from '@/data/mockProviders';
import { appendBooking, createBookingId } from '@/storage/bookingsStorage';
import { appendNotification } from '@/storage/notificationsStorage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function paramString(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function formatVisitLabel(dateIso: string, time: string): string {
  const d = new Date(dateIso + 'T12:00:00');
  const datePart = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${datePart} · ${time}`;
}

export default function ProviderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    category?: string;
    image?: string;
    rating?: string;
  }>();
  const id = paramString(params.id) ?? '';
  const fallbackName = paramString(params.name);
  const category = paramString(params.category);
  const imageUrl = paramString(params.image);
  const ratingRaw = paramString(params.rating);
  const ratingNum = ratingRaw != null ? Number.parseFloat(ratingRaw) : NaN;
  const hasRating = Number.isFinite(ratingNum);

  const detail = getProviderDetail(id || 'unknown', fallbackName, category);
  const providerId = id || 'unknown';

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccessOpen, setBookingSuccessOpen] = useState(false);

  const confirmBooking = useCallback(
    async (dateIso: string, time: string, bookingDetails: BookingConfirmDetails) => {
      const cu = await getCurrentUser();
      if (!cu?.email) {
        Alert.alert('Sign in required', 'Please log in to book an appointment.');
        return;
      }
      const userId = cu.email.trim().toLowerCase();
      const bookingId = createBookingId();
      await appendBooking({
        id: bookingId,
        userId,
        providerId,
        providerName: detail.name,
        category: category ?? 'Service',
        time,
        date: dateIso,
        providerImage: imageUrl,
        providerRating: hasRating ? ratingNum : undefined,
        serviceAddress: bookingDetails.serviceAddress,
        addressType: bookingDetails.addressType,
        bookedAt: new Date().toISOString(),
      });
      await appendNotification({
        userId,
        kind: 'appointment_booked',
        title: 'Appointment booked',
        body: `Your ${category ?? 'service'} with ${detail.name} on ${formatVisitLabel(dateIso, time)} is confirmed.`,
        bookingId,
      });
      setBookingModalOpen(false);
      setBookingSuccessOpen(true);
    },
    [providerId, detail.name, category, imageUrl, hasRating, ratingNum],
  );

  const workLabel = category ? `${category} service` : 'Service';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color="#111111" />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          Profile
        </Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.workHero} accessibilityLabel={workLabel}>
          <ServiceWorkHero category={category} />
        </View>
        <Text style={styles.workCaption}>Work they do</Text>

        <View style={styles.profileRow}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.profileAvatar}
              contentFit="cover"
              transition={200}
              accessibilityLabel={`${detail.name} photo`}
            />
          ) : (
            <View style={styles.profileAvatarPlaceholder}>
              <Ionicons name="person-outline" size={28} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.profileText}>
            <Text style={styles.name}>{detail.name}</Text>
            <Text style={styles.proLabel}>Your professional</Text>
          </View>
        </View>

        {(category || hasRating || detail.hourlyRate > 0) && (
          <View style={styles.metaRow}>
            {category ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{category}</Text>
              </View>
            ) : null}
            {hasRating ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={15} color="#CA8A04" />
                <Text style={styles.ratingBadgeText}>
                  {Number.isInteger(ratingNum)
                    ? `${ratingNum}.0`
                    : String(ratingNum)}
                </Text>
              </View>
            ) : null}
            <View style={styles.rateBadge}>
              <Ionicons name="cash-outline" size={16} color="#166534" />
              <Text style={styles.rateBadgeText}>from {formatHourlyRateInr(detail.hourlyRate)}</Text>
            </View>
          </View>
        )}

        <Text style={styles.description}>{detail.description}</Text>

        <View style={styles.phoneBlock}>
          <View style={styles.phoneIconWrap}>
            <Ionicons name="call-outline" size={22} color="#374151" />
          </View>
          <View style={styles.phoneTextCol}>
            <Text style={styles.phoneLabel}>Phone</Text>
            <Text style={styles.phoneValue}>{detail.phone}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => setBookingModalOpen(true)}
          style={({ pressed }) => [styles.bookBtn, pressed && styles.bookBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Book appointment">
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </Pressable>
      </ScrollView>

      <BookingCalendarModal
        visible={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        providerId={providerId}
        providerName={detail.name}
        category={category ?? 'Service'}
        slots={detail.slots}
        hourlyRate={detail.hourlyRate}
        onConfirmBooking={confirmBooking}
      />
      <AppointmentBookedSuccessModal
        visible={bookingSuccessOpen}
        onViewAppointments={() => {
          setBookingSuccessOpen(false);
          router.replace('/(tabs)/appointments');
        }}
        onBackToHome={() => {
          setBookingSuccessOpen(false);
          router.replace('/(tabs)');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppScreenBackground,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  pressed: {
    opacity: 0.65,
  },
  topTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  topBarSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  workHero: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  workCaption: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 18,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  profileAvatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  proLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  categoryPill: {
    backgroundColor: 'rgba(204, 253, 4, 0.35)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.08)',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.1)',
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F0F0F',
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(22, 101, 52, 0.2)',
  },
  rateBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  phoneBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.08)',
  },
  phoneIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneTextCol: {
    flex: 1,
    minWidth: 0,
  },
  phoneLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  phoneValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.2,
  },
  bookBtn: {
    marginTop: 8,
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  bookBtnPressed: {
    opacity: 0.92,
  },
  bookBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.logoLime,
    letterSpacing: 0.1,
  },
});
