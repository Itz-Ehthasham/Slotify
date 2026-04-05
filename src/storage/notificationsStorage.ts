import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@slotify/notifications_v1';
const LAST_SEEN_KEY = '@slotify/notifications_last_seen_v1';

const unreadListeners = new Set<() => void>();

export function subscribeUnreadNotificationsChanged(listener: () => void): () => void {
  unreadListeners.add(listener);
  return () => {
    unreadListeners.delete(listener);
  };
}

function emitUnreadNotificationsChanged(): void {
  unreadListeners.forEach((fn) => {
    fn();
  });
}

export type NotificationKind = 'appointment_booked' | 'appointment_cancelled';

export type StoredNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  bookingId?: string;
};

export function createNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export async function getAllNotifications(): Promise<StoredNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredNotification[]) : [];
  } catch {
    return [];
  }
}

export async function getNotificationsLastSeenAt(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SEEN_KEY);
  } catch {
    return null;
  }
}

export async function setNotificationsLastSeenNow(): Promise<void> {
  await AsyncStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
  emitUnreadNotificationsChanged();
}

export async function getUnreadNotificationCount(): Promise<number> {
  const [items, lastSeen] = await Promise.all([getAllNotifications(), getNotificationsLastSeenAt()]);
  if (items.length === 0) return 0;
  if (!lastSeen?.trim()) return items.length;
  const seenMs = new Date(lastSeen).getTime();
  if (Number.isNaN(seenMs)) return items.length;
  return items.filter((n) => new Date(n.createdAt).getTime() > seenMs).length;
}

export async function appendNotification(
  row: Omit<StoredNotification, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
  },
): Promise<void> {
  const all = await getAllNotifications();
  const item: StoredNotification = {
    id: row.id ?? createNotificationId(),
    kind: row.kind,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt ?? new Date().toISOString(),
    bookingId: row.bookingId,
  };
  all.unshift(item);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  emitUnreadNotificationsChanged();
}
