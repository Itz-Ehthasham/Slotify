import { AppScreenBackground } from '@/constants/screen';
import { getAllBookings, todayLocalIsoDate, type StoredBooking } from '@/storage/bookingsStorage';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';
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

function compareBookings(a: StoredBooking, b: StoredBooking): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.time.localeCompare(b.time);
}

export default function AppointmentsScreen() {
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [bookings, setBookings] = useState<StoredBooking[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void getAllBookings().then((rows) => {
        if (!cancelled) setBookings(rows);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const today = todayLocalIsoDate();
  const { pending, history } = useMemo(() => {
    const pendingRows = bookings.filter((b) => b.date >= today).sort(compareBookings);
    const historyRows = bookings.filter((b) => b.date < today).sort(compareBookings);
    return { pending: pendingRows, history: historyRows };
  }, [bookings, today]);

  const isPending = tab === 'pending';
  const list = isPending ? pending : history;
  const isEmpty = list.length === 0;

  const emptyTitle = isPending ? 'No Appointments Yet' : 'No History Yet';
  const emptySubtitle = isPending
    ? 'You have no active appointments right now.'
    : 'You have no past appointments yet.';

  const renderItem: ListRenderItem<StoredBooking> = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardName}>{item.providerName}</Text>
      <Text style={styles.cardMeta}>
        {item.category} · {formatBookingWhen(item.date, item.time)}
      </Text>
    </View>
  );

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

      <View style={styles.body}>
        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <Image source={emptyIllustration} style={styles.art} contentFit="contain" />
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.08)',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
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
});
