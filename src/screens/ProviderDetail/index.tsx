import { ServiceWorkHero } from '@/components/provider/ServiceWorkHero';
import { Brand } from '@/constants/brand';
import { AppScreenBackground } from '@/constants/screen';
import { formatHourlyRateInr, getProviderDetail } from '@/data/mockProviders';
import {
  appendBooking,
  createBookingId,
  getBookedTimesForProviderOnDate,
  todayLocalIsoDate,
} from '@/storage/bookingsStorage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function paramString(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
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
  const bookingDate = todayLocalIsoDate();

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const refreshBookedSlots = useCallback(async () => {
    const taken = await getBookedTimesForProviderOnDate(providerId, bookingDate);
    setBookedSlots(taken);
    setSelectedSlot((current) => (current && taken.has(current) ? null : current));
  }, [providerId, bookingDate]);

  useFocusEffect(
    useCallback(() => {
      void refreshBookedSlots();
    }, [refreshBookedSlots]),
  );

  const onSelectSlot = (slot: string) => {
    if (bookedSlots.has(slot)) return;
    setSelectedSlot((prev) => (prev === slot ? null : slot));
  };

  const onBookAppointment = async () => {
    if (!selectedSlot || bookingSubmitting) return;
    const providerName = detail.name;
    const cat = category ?? 'Service';
    setBookingSubmitting(true);
    try {
      await appendBooking({
        id: createBookingId(),
        providerId,
        providerName,
        category: cat,
        time: selectedSlot,
        date: bookingDate,
      });
      await refreshBookedSlots();
      setSelectedSlot(null);
      Alert.alert('Appointment Booked', 'Your slot has been reserved.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/appointments' as Href),
        },
      ]);
    } catch {
      Alert.alert('Booking failed', 'Could not save your appointment. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

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

        <Text style={styles.sectionTitle}>Available slots</Text>
        <Text style={styles.slotsHint}>
          {new Date(bookingDate + 'T12:00:00').toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        <View style={styles.slotsRow}>
          {detail.slots.map((slot) => {
            const booked = bookedSlots.has(slot);
            const selected = selectedSlot === slot && !booked;
            return (
              <Pressable
                key={slot}
                onPress={() => onSelectSlot(slot)}
                disabled={booked}
                style={({ pressed }) => [
                  styles.slotChip,
                  booked && styles.slotChipBooked,
                  selected && styles.slotChipSelected,
                  !booked && !selected && pressed && styles.slotChipPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: booked, selected }}
                accessibilityLabel={booked ? `${slot}, booked` : `Select ${slot}`}>
                <Text
                  style={[
                    styles.slotText,
                    booked && styles.slotTextBooked,
                    selected && styles.slotTextSelected,
                  ]}>
                  {slot}
                </Text>
                {booked ? <Text style={styles.slotBookedLabel}>Booked</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => void onBookAppointment()}
          disabled={!selectedSlot || bookingSubmitting}
          style={({ pressed }) => [
            styles.bookBtn,
            !selectedSlot && !bookingSubmitting && styles.bookBtnDisabled,
            pressed && selectedSlot && !bookingSubmitting && styles.bookBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Book appointment"
          accessibilityState={{ disabled: !selectedSlot || bookingSubmitting }}>
          {bookingSubmitting ? (
            <ActivityIndicator color={Brand.logoLime} />
          ) : (
            <Text
              style={[
                styles.bookBtnText,
                !selectedSlot && !bookingSubmitting && styles.bookBtnTextDisabled,
              ]}>
              Book Appointment
            </Text>
          )}
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
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  slotsHint: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 14,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.12)',
    minWidth: 100,
    alignItems: 'center',
  },
  slotChipSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: 'rgba(22, 101, 52, 0.45)',
    borderWidth: 2,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  slotChipBooked: {
    opacity: 0.55,
    backgroundColor: '#F3F4F6',
    borderColor: 'rgba(15, 15, 15, 0.08)',
  },
  slotChipPressed: {
    opacity: 0.88,
    backgroundColor: '#F3F4F6',
  },
  slotText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  slotTextSelected: {
    color: '#166534',
  },
  slotTextBooked: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  slotBookedLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bookBtn: {
    marginTop: 24,
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
  bookBtnDisabled: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.08)',
  },
  bookBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.logoLime,
    letterSpacing: 0.1,
  },
  bookBtnTextDisabled: {
    color: '#6B7280',
  },
});
