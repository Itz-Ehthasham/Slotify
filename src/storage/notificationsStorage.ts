import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCurrentUser } from '@/auth/session';

const STORAGE_KEY = '@slotify/notifications_v1';
const LAST_SEEN_BY_USER_KEY = '@slotify/notifications_last_seen_by_user_v1';

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
  userId: string;
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

async function getLastSeenByUserMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(LAST_SEEN_BY_USER_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed != null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

async function setLastSeenByUserMap(map: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(LAST_SEEN_BY_USER_KEY, JSON.stringify(map));
}

export async function getNotificationsForUser(userEmail: string): Promise<StoredNotification[]> {
  const e = userEmail.trim().toLowerCase();
  const all = await getAllNotifications();
  return all.filter((n) => 'userId' in n && typeof n.userId === 'string' && n.userId === e);
}

export async function getNotificationsLastSeenAtForUser(userEmail: string): Promise<string | null> {
  const map = await getLastSeenByUserMap();
  const v = map[userEmail.trim().toLowerCase()];
  return v?.trim() ? v : null;
}

export async function setNotificationsLastSeenNowForUser(userEmail: string): Promise<void> {
  const e = userEmail.trim().toLowerCase();
  const map = await getLastSeenByUserMap();
  map[e] = new Date().toISOString();
  await setLastSeenByUserMap(map);
  emitUnreadNotificationsChanged();
}

export async function setNotificationsLastSeenNow(): Promise<void> {
  const u = await getCurrentUser();
  if (u) await setNotificationsLastSeenNowForUser(u.email);
}

export async function getUnreadNotificationCountForUser(userEmail: string): Promise<number> {
  const items = await getNotificationsForUser(userEmail);
  if (items.length === 0) return 0;
  const lastSeen = await getNotificationsLastSeenAtForUser(userEmail);
  if (!lastSeen?.trim()) return items.length;
  const seenMs = new Date(lastSeen).getTime();
  if (Number.isNaN(seenMs)) return items.length;
  return items.filter((n) => new Date(n.createdAt).getTime() > seenMs).length;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const u = await getCurrentUser();
  if (!u?.email) return 0;
  return getUnreadNotificationCountForUser(u.email);
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
    userId: row.userId.trim().toLowerCase(),
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
