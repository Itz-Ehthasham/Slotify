import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@slotify/bookings_v1';

export type BookingAddressType = 'home' | 'work';

export type StoredBooking = {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  category: string;
  time: string;
  date: string;
  providerImage?: string;
  providerRating?: number;
  serviceAddress?: string;
  addressType?: BookingAddressType;
  cancelled?: boolean;
  bookedAt?: string;
  cancelledAt?: string;
};

export function todayLocalIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function createBookingId(): string {
  return `book_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export async function getAppointments(): Promise<StoredBooking[]> {
  return getAllBookings();
}

export async function getAllBookings(): Promise<StoredBooking[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredBooking[]) : [];
  } catch {
    return [];
  }
}

export async function saveAppointments(bookings: StoredBooking[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export async function getBookingsForUser(userEmail: string): Promise<StoredBooking[]> {
  const e = userEmail.trim().toLowerCase();
  const all = await getAllBookings();
  return all.filter((b) => b.userId === e);
}

export async function appendBooking(booking: StoredBooking): Promise<void> {
  const all = await getAllBookings();
  all.push(booking);
  await saveAppointments(all);
}

export async function cancelBookingById(bookingId: string, userEmail: string): Promise<boolean> {
  const all = await getAllBookings();
  const idx = all.findIndex((b) => b.id === bookingId);
  if (idx === -1) return false;
  const e = userEmail.trim().toLowerCase();
  if (all[idx].userId !== e) return false;
  if (all[idx].cancelled) return true;
  all[idx] = { ...all[idx], cancelled: true, cancelledAt: new Date().toISOString() };
  await saveAppointments(all);
  return true;
}

export async function getBookedTimesForProviderOnDate(
  providerId: string,
  dateIso: string,
): Promise<Set<string>> {
  const all = await getAllBookings();
  const taken = new Set<string>();
  for (const b of all) {
    if (b.cancelled) continue;
    if (b.providerId === providerId && b.date === dateIso) taken.add(b.time);
  }
  return taken;
}
