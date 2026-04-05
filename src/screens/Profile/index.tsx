import { getCurrentUser } from '@/auth/session';
import { Brand } from '@/constants/brand';
import { AppScreenBackground } from '@/constants/screen';
import {
  getNotificationsForUser,
  setNotificationsLastSeenNowForUser,
  type StoredNotification,
} from '@/storage/notificationsStorage';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const emptyIllustration = require('../../../assets/icons/nonotifications.svg');

const ART_ASPECT = 179 / 170;

function formatNotificationTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ProfileScreen() {
  const [items, setItems] = useState<StoredNotification[]>([]);

  useFocusEffect(
    useCallback(() => {
      let dead = false;
      void (async () => {
        const cu = await getCurrentUser();
        if (!cu?.email) {
          if (!dead) setItems([]);
          return;
        }
        const email = cu.email.trim().toLowerCase();
        await setNotificationsLastSeenNowForUser(email);
        const rows = await getNotificationsForUser(email);
        if (!dead) setItems(rows);
      })();
      return () => {
        dead = true;
      };
    }, []),
  );

  const isEmpty = items.length === 0;

  const renderItem: ListRenderItem<StoredNotification> = useCallback(({ item }) => {
    return (
      <View style={styles.row}>
        <View
          style={[
            styles.rowAccent,
            item.kind === 'appointment_booked' ? styles.rowAccentBooked : styles.rowAccentCancelled,
          ]}
        />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowMessage}>{item.body}</Text>
          <Text style={styles.rowTime}>{formatNotificationTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  }, []);

  const listHeader = useMemo(
    () => (
      <Text style={styles.listHeading}>
        {items.length} notification{items.length === 1 ? '' : 's'}
      </Text>
    ),
    [items.length],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.headerShell}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {isEmpty ? (
        <View style={styles.body}>
          <Image source={emptyIllustration} style={styles.art} contentFit="contain" />
          <Text style={styles.emptyTitle}>No Notifications Yet</Text>
          <Text style={styles.emptySubtitle}>
            Booking and cancellation updates will show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    paddingTop: 8,
  },
  listHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 14,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  rowAccent: {
    width: 4,
  },
  rowAccentBooked: {
    backgroundColor: Brand.logoLime,
  },
  rowAccentCancelled: {
    backgroundColor: '#0F0F0F',
  },
  rowBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  rowMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
    lineHeight: 22,
  },
  rowTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
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
