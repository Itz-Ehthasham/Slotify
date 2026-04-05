import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@slotify/bookings_v1';

/** Persisted shape matches app requirements; `providerId` blocks duplicate slot bookings per day. */
export type StoredBooking = {
  id: string;
  providerId: string;
  providerName: string;
  category: string;
  time: string;
  /** Local calendar date `YYYY-MM-DD` */
  date: string;
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

export async function appendBooking(booking: StoredBooking): Promise<void> {
  const all = await getAllBookings();
  all.push(booking);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export async function getBookedTimesForProviderOnDate(
  providerId: string,
  dateIso: string,
): Promise<Set<string>> {
  const all = await getAllBookings();
  const taken = new Set<string>();
  for (const b of all) {
    if (b.providerId === providerId && b.date === dateIso) taken.add(b.time);
  }
  return taken;
}
