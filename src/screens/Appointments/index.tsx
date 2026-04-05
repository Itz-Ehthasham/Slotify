import { getCurrentUser } from '@/auth/session';
import { CancelAppointmentConfirmModal } from '@/components/appointments/CancelAppointmentConfirmModal';
import { ProviderCard } from '@/components/home/ProviderCard';
import { AppScreenBackground } from '@/constants/screen';
import { formatHourlyRateInr, hourlyRateForProvider } from '@/data/mockProviders';
import { findListedProviderById } from '@/data/providersByService';
import {
  cancelBookingById,
  getBookingsForUser,
  todayLocalIsoDate,
  type BookingAddressType,
  type StoredBooking,
} from '@/storage/bookingsStorage';
import { appendNotification } from '@/storage/notificationsStorage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const emptyIllustration = require('../../../assets/icons/noorders.svg');

function formatBookingWhen(isoDate: string, time: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const datePart = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${datePart} · ${time}`;
}

function formatLongDate(isoDate: string): string {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatInstant(iso?: string): string {
  if (!iso?.trim()) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function resolveBookedAtIso(b: StoredBooking): string | undefined {
  if (b.bookedAt?.trim()) return b.bookedAt.trim();
  const m = /^book_(\d+)_/.exec(b.id);
  if (!m) return undefined;
  const t = Number(m[1]);
  if (!Number.isFinite(t)) return undefined;
  return new Date(t).toISOString();
}

function compareBookings(a: StoredBooking, b: StoredBooking): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.time.localeCompare(b.time);
}

function bookingCardImage(b: StoredBooking): string | undefined {
  const fromBooking = b.providerImage?.trim();
  if (fromBooking) return fromBooking;
  return findListedProviderById(b.providerId)?.image;
}

function bookingCardRating(b: StoredBooking): number {
  if (b.providerRating != null && Number.isFinite(b.providerRating)) {
    return b.providerRating;
  }
  const listed = findListedProviderById(b.providerId);
  if (listed) return listed.rating;
  return 4.5;
}

function fallbackAddressForLegacyBooking(providerId: string): string {
  let h = 2166136261;
  for (let i = 0; i < providerId.length; i++) {
    h ^= providerId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = Math.abs(h);
  const block = 1 + (n % 199);
  const areas = ['MG Road', 'Koramangala', 'Indiranagar', 'Whitefield', 'JP Nagar'];
  return `${block} ${areas[n % areas.length]}, Bengaluru`;
}

function bookingCardAddress(b: StoredBooking): string {
  const line = b.serviceAddress?.trim();
  if (line) {
    const label = b.addressType === 'work' ? 'Work' : b.addressType === 'home' ? 'Home' : null;
    return label ? `${label} · ${line}` : line;
  }
  return fallbackAddressForLegacyBooking(b.providerId);
}

function addressTypeLabel(t?: BookingAddressType): string {
  if (t === 'work') return 'Work';
  if (t === 'home') return 'Home';
  return 'Address';
}

type DetailRowProps = { label: string; value: string; multiline?: boolean };

function DetailRow({ label, value, multiline }: DetailRowProps) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.rowLabel}>{label}</Text>
      <Text style={detailStyles.rowValue} numberOfLines={multiline ? undefined : 2}>
        {value}
      </Text>
    </View>
  );
}

function historyCardCategory(item: StoredBooking): string {
  const when = formatBookingWhen(item.date, item.time);
  if (item.cancelled) {
    return `Appointment cancelled · ${item.category} · ${when}`;
  }
  return `${item.category} · ${when}`;
}

const detailStyles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
    gap: 4,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
});

export default function AppointmentsScreen() {
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [upcomingDetail, setUpcomingDetail] = useState<StoredBooking | null>(null);
  const [historyDetail, setHistoryDetail] = useState<StoredBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const cancelInFlight = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let dead = false;
      void (async () => {
        const cu = await getCurrentUser();
        if (!cu?.email) {
          if (!dead) setBookings([]);
          return;
        }
        const rows = await getBookingsForUser(cu.email);
        if (!dead) setBookings(rows);
      })();
      return () => {
        dead = true;
      };
    }, []),
  );

  const today = todayLocalIsoDate();
  const { pending, history } = useMemo(() => {
    const pendingRows = bookings
      .filter((b) => !b.cancelled && b.date >= today)
      .sort(compareBookings);
    const historyRows = bookings
      .filter((b) => b.cancelled === true || b.date < today)
      .sort(compareBookings);
    return { pending: pendingRows, history: historyRows };
  }, [bookings, today]);

  const upcomingDetailLive = useMemo(() => {
    if (!upcomingDetail) return null;
    return bookings.find((b) => b.id === upcomingDetail.id) ?? upcomingDetail;
  }, [bookings, upcomingDetail]);

  const historyDetailLive = useMemo(() => {
    if (!historyDetail) return null;
    return bookings.find((b) => b.id === historyDetail.id) ?? historyDetail;
  }, [bookings, historyDetail]);

  useEffect(() => {
    if (!upcomingDetail) return;
    const live = bookings.find((b) => b.id === upcomingDetail.id);
    if (live?.cancelled) setUpcomingDetail(null);
  }, [bookings, upcomingDetail]);

  const isPending = tab === 'pending';
  const list = isPending ? pending : history;
  const isEmpty = list.length === 0;

  useEffect(() => {
    if (isPending) setHistoryDetail(null);
  }, [isPending]);

  const emptyTitle = isPending ? 'No Appointments Yet' : 'No History Yet';
  const emptySubtitle = isPending
    ? 'You have no active appointments right now.'
    : 'You have no past or cancelled appointments yet.';

  const onCardPress = (item: StoredBooking) => {
    if (isPending) setUpcomingDetail(item);
    else setHistoryDetail(item);
  };

  const closeHistoryDetail = () => setHistoryDetail(null);

  const closeUpcomingDetail = () => {
    setShowCancelConfirm(false);
    setUpcomingDetail(null);
  };

  const runCancelAppointment = useCallback(async () => {
    const snapshot = upcomingDetail;
    const id = snapshot?.id;
    if (!id || cancelInFlight.current) return;
    const cu = await getCurrentUser();
    if (!cu?.email) return;
    const userId = cu.email.trim().toLowerCase();
    cancelInFlight.current = true;
    setIsCancelling(true);
    try {
      const cancelledOk = await cancelBookingById(id, userId);
      if (!cancelledOk) return;
      await appendNotification({
        userId,
        kind: 'appointment_cancelled',
        title: 'Appointment cancelled',
        body: `Your ${snapshot.category} visit with ${snapshot.providerName} on ${formatBookingWhen(snapshot.date, snapshot.time)} was cancelled.`,
        bookingId: id,
      });
      const rows = await getBookingsForUser(userId);
      setBookings(rows);
      setShowCancelConfirm(false);
      setUpcomingDetail(null);
      setTab('history');
    } finally {
      cancelInFlight.current = false;
      setIsCancelling(false);
    }
  }, [upcomingDetail]);

  const confirmCancelAppointment = useCallback(() => {
    setShowCancelConfirm(true);
  }, []);

  const renderItem: ListRenderItem<StoredBooking> = ({ item }) => (
    <View style={styles.cardOuter}>
      <ProviderCard
        name={item.providerName}
        category={isPending ? `${item.category} · ${formatBookingWhen(item.date, item.time)}` : historyCardCategory(item)}
        categoryColor={!isPending && item.cancelled ? '#B45309' : undefined}
        address={isPending ? undefined : bookingCardAddress(item)}
        imageUrl={bookingCardImage(item)}
        rating={bookingCardRating(item)}
        categoryNumberOfLines={2}
        onPress={() => onCardPress(item)}
      />
    </View>
  );

  const listHeading = isPending ? 'Upcoming appointments' : 'Past & cancelled';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.headerShell}>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      <View style={styles.tabsBar}>
        <Pressable
          onPress={() => setTab('pending')}
          style={[styles.tabBtn, isPending && styles.tabBtnActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: isPending }}>
          <Text style={[styles.tabLabel, isPending ? styles.tabLabelActive : styles.tabLabelInactive]}>
            Pending ({pending.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('history')}
          style={[styles.tabBtn, !isPending && styles.tabBtnActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: !isPending }}>
          <Text style={[styles.tabLabel, !isPending ? styles.tabLabelActive : styles.tabLabelInactive]}>
            History ({history.length})
          </Text>
        </Pressable>
      </View>

      {isEmpty ? (
        <View style={styles.body}>
          <View style={styles.emptyWrap}>
            <Image source={emptyIllustration} style={styles.art} contentFit="contain" />
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={list}
          extraData={{ tab, bookingsLen: bookings.length }}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<Text style={styles.listHeading}>{listHeading}</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={upcomingDetail != null}
        transparent
        animationType="fade"
        onRequestClose={closeUpcomingDetail}>
        <View style={styles.modalWrap}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={isCancelling ? undefined : closeUpcomingDetail}
            accessibilityRole="button"
            accessibilityLabel="Close appointment details"
            disabled={isCancelling}
          />
          {upcomingDetail && upcomingDetailLive ? (
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Appointment details</Text>
                <Pressable
                  onPress={closeUpcomingDetail}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  disabled={isCancelling}>
                  <Ionicons name="close" size={26} color="#111827" />
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={styles.modalProviderRow}>
                  {bookingCardImage(upcomingDetailLive) ? (
                    <Image
                      source={{ uri: bookingCardImage(upcomingDetailLive) }}
                      style={styles.modalAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.modalAvatar, styles.modalAvatarPh]}>
                      <Ionicons name="person-outline" size={28} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.modalProviderMeta}>
                    <Text style={styles.modalProviderName} numberOfLines={2}>
                      {upcomingDetailLive.providerName}
                    </Text>
                    <Text style={styles.modalRatingText}>
                      {Number.isInteger(bookingCardRating(upcomingDetailLive))
                        ? `${bookingCardRating(upcomingDetailLive)}.0`
                        : String(bookingCardRating(upcomingDetailLive))}{' '}
                      <Text style={styles.modalRatingStar}>★</Text>
                    </Text>
                  </View>
                </View>

                <DetailRow label="Service" value={upcomingDetailLive.category} />
                <DetailRow
                  label="Date"
                  value={new Date(upcomingDetailLive.date + 'T12:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                />
                <DetailRow label="Time" value={upcomingDetailLive.time} />
                <DetailRow
                  label="Rate"
                  value={formatHourlyRateInr(
                    hourlyRateForProvider(upcomingDetailLive.providerId, upcomingDetailLive.category),
                  )}
                />
                <Text style={styles.modalRateHint}>Estimated hourly rate for this provider and service.</Text>
                <DetailRow
                  label={addressTypeLabel(upcomingDetailLive.addressType)}
                  value={
                    upcomingDetailLive.serviceAddress?.trim()
                      ? upcomingDetailLive.serviceAddress.trim()
                      : bookingCardAddress(upcomingDetailLive)
                  }
                  multiline
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelApptBtn,
                    (pressed || isCancelling) && styles.cancelApptBtnPressed,
                    isCancelling && styles.cancelApptBtnDisabled,
                  ]}
                  onPress={confirmCancelAppointment}
                  disabled={isCancelling || showCancelConfirm}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel appointment">
                  {isCancelling ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.cancelApptBtnText}>Cancel appointment</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={historyDetail != null}
        transparent
        animationType="fade"
        onRequestClose={closeHistoryDetail}>
        <View style={styles.modalWrap}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeHistoryDetail}
            accessibilityRole="button"
            accessibilityLabel="Close booking record"
          />
          {historyDetail && historyDetailLive ? (
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Booking record</Text>
                <Pressable
                  onPress={closeHistoryDetail}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Close">
                  <Ionicons name="close" size={26} color="#111827" />
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.historyModalScrollContent}
                showsVerticalScrollIndicator={false}>
                <View
                  style={[
                    styles.historyStatusPill,
                    historyDetailLive.cancelled ? styles.historyStatusPillCancelled : styles.historyStatusPillDone,
                  ]}>
                  <Text
                    style={[
                      styles.historyStatusPillText,
                      historyDetailLive.cancelled
                        ? styles.historyStatusPillTextCancelled
                        : styles.historyStatusPillTextDone,
                    ]}>
                    {historyDetailLive.cancelled ? 'Appointment cancelled' : 'Completed'}
                  </Text>
                </View>

                <View style={styles.modalProviderRow}>
                  {bookingCardImage(historyDetailLive) ? (
                    <Image
                      source={{ uri: bookingCardImage(historyDetailLive) }}
                      style={styles.modalAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.modalAvatar, styles.modalAvatarPh]}>
                      <Ionicons name="person-outline" size={28} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.modalProviderMeta}>
                    <Text style={styles.modalProviderName} numberOfLines={2}>
                      {historyDetailLive.providerName}
                    </Text>
                    <Text style={styles.modalRatingText}>
                      {Number.isInteger(bookingCardRating(historyDetailLive))
                        ? `${bookingCardRating(historyDetailLive)}.0`
                        : String(bookingCardRating(historyDetailLive))}{' '}
                      <Text style={styles.modalRatingStar}>★</Text>
                    </Text>
                  </View>
                </View>

                <DetailRow
                  label="Scheduled visit"
                  value={`${formatLongDate(historyDetailLive.date)} · ${historyDetailLive.time}`}
                />
                <DetailRow
                  label="Booked on"
                  value={formatInstant(resolveBookedAtIso(historyDetailLive))}
                />
                {historyDetailLive.cancelled ? (
                  <DetailRow
                    label="Cancelled on"
                    value={formatInstant(historyDetailLive.cancelledAt)}
                  />
                ) : null}
                <DetailRow label="Service" value={historyDetailLive.category} />
                <DetailRow
                  label="Rate (at booking)"
                  value={formatHourlyRateInr(
                    hourlyRateForProvider(historyDetailLive.providerId, historyDetailLive.category),
                  )}
                />
                <Text style={styles.modalRateHint}>Estimated hourly rate for this provider and service.</Text>
                <DetailRow
                  label={addressTypeLabel(historyDetailLive.addressType)}
                  value={
                    historyDetailLive.serviceAddress?.trim()
                      ? historyDetailLive.serviceAddress.trim()
                      : bookingCardAddress(historyDetailLive)
                  }
                  multiline
                />
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>

      <CancelAppointmentConfirmModal
        visible={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirmCancel={runCancelAppointment}
        isSubmitting={isCancelling}
      />
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
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#000000',
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#000000',
  },
  tabLabelInactive: {
    color: '#6B7280',
    fontWeight: '500',
  },
  body: {
    flex: 1,
    backgroundColor: AppScreenBackground,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    paddingTop: 4,
  },
  cardOuter: {
    marginHorizontal: 0,
  },
  listHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 14,
    paddingTop: 4,
  },
  art: {
    width: '85%',
    maxWidth: 280,
    aspectRatio: 1,
    maxHeight: 280,
    alignSelf: 'center',
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
    alignSelf: 'center',
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 15, 0.5)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '88%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  modalScroll: {
    flexGrow: 0,
    maxHeight: 420,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  historyModalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 15, 15, 0.08)',
    backgroundColor: '#FFFFFF',
  },
  cancelApptBtn: {
    backgroundColor: '#B91C1C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cancelApptBtnPressed: {
    opacity: 0.92,
  },
  cancelApptBtnDisabled: {
    opacity: 0.7,
  },
  cancelApptBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalProviderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
  },
  modalAvatarPh: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
  },
  modalProviderMeta: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  modalProviderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalRatingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalRatingStar: {
    color: '#CA8A04',
  },
  modalRateHint: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: -4,
    marginBottom: 8,
    lineHeight: 18,
  },
  historyStatusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  historyStatusPillCancelled: {
    backgroundColor: '#FEF3C7',
  },
  historyStatusPillDone: {
    backgroundColor: '#D1FAE5',
  },
  historyStatusPillText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  historyStatusPillTextCancelled: {
    color: '#B45309',
  },
  historyStatusPillTextDone: {
    color: '#065F46',
  },
});
