import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@slotify/user';

export type StoredUser = {
  email: string;
};

export async function saveUser(user: StoredUser): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (raw == null || raw === '') return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed != null &&
      typeof parsed === 'object' &&
      'email' in parsed &&
      typeof (parsed as StoredUser).email === 'string' &&
      (parsed as StoredUser).email.length > 0
    ) {
      return { email: (parsed as StoredUser).email };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}
