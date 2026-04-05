import AsyncStorage from '@react-native-async-storage/async-storage';

import { MOCK_USER_EMAIL, MOCK_USER_PASSWORD } from '@/auth/mockUser';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const LEGACY_USER_KEY = '@slotify/user';

export type StoredUserAccount = {
  email: string;
  password: string;
};

export type CurrentUser = {
  email: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readJsonArray<T>(raw: string | null): T[] {
  if (raw == null || raw === '') return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function migrateLegacyUserStore(): Promise<void> {
  const existing = await AsyncStorage.getItem(USERS_KEY);
  if (existing != null && existing !== '') {
    try {
      const parsed: unknown = JSON.parse(existing);
      if (Array.isArray(parsed) && parsed.length > 0) return;
    } catch {
    }
  }

  const legacySingle = await AsyncStorage.getItem(LEGACY_USER_KEY);
  let legacyEmail: string | null = null;
  if (legacySingle) {
    try {
      const parsed: unknown = JSON.parse(legacySingle);
      if (
        parsed != null &&
        typeof parsed === 'object' &&
        'email' in parsed &&
        typeof (parsed as CurrentUser).email === 'string'
      ) {
        legacyEmail = normalizeEmail((parsed as CurrentUser).email);
      }
    } catch {
    }
  }

  if (legacyEmail) {
    const password = legacyEmail === normalizeEmail(MOCK_USER_EMAIL) ? MOCK_USER_PASSWORD : '';
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([{ email: legacyEmail, password }]));
    await AsyncStorage.removeItem(LEGACY_USER_KEY);
    const hasCurrent = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!hasCurrent) {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email: legacyEmail }));
    }
  }

  const rawUsers = await AsyncStorage.getItem(USERS_KEY);
  const list = readJsonArray<StoredUserAccount>(rawUsers);
  if (list.length === 0) {
    await AsyncStorage.setItem(
      USERS_KEY,
      JSON.stringify([{ email: normalizeEmail(MOCK_USER_EMAIL), password: MOCK_USER_PASSWORD }]),
    );
  }
}

export async function getUsers(): Promise<StoredUserAccount[]> {
  await migrateLegacyUserStore();
  const raw = await AsyncStorage.getItem(USERS_KEY);
  const rows = readJsonArray<StoredUserAccount>(raw);
  return rows.filter(
    (u) =>
      u != null &&
      typeof u.email === 'string' &&
      u.email.length > 0 &&
      typeof u.password === 'string',
  );
}

export async function saveUsers(users: StoredUserAccount[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function appendUserAccount(account: StoredUserAccount): Promise<void> {
  const users = await getUsers();
  users.push({
    email: normalizeEmail(account.email),
    password: account.password,
  });
  await saveUsers(users);
}

export async function registerUser(email: string, password: string): Promise<'ok' | 'duplicate'> {
  const normalized = normalizeEmail(email);
  const users = await getUsers();
  if (users.some((u) => u.email === normalized)) return 'duplicate';
  await appendUserAccount({ email: normalized, password });
  await setCurrentUser({ email: normalized });
  return 'ok';
}

export async function loginUser(email: string, password: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const users = await getUsers();
  const match = users.find((u) => u.email === normalized && u.password === password);
  if (!match) return false;
  await setCurrentUser({ email: match.email });
  return true;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  await migrateLegacyUserStore();
  const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (raw == null || raw === '') return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed != null &&
      typeof parsed === 'object' &&
      'email' in parsed &&
      typeof (parsed as CurrentUser).email === 'string' &&
      (parsed as CurrentUser).email.length > 0
    ) {
      return { email: normalizeEmail((parsed as CurrentUser).email) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCurrentUser(user: CurrentUser): Promise<void> {
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email: normalizeEmail(user.email) }));
}

export async function clearCurrentUser(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}

export async function getUser(): Promise<CurrentUser | null> {
  return getCurrentUser();
}

export async function clearUser(): Promise<void> {
  await clearCurrentUser();
}

export async function saveUser(user: CurrentUser): Promise<void> {
  await setCurrentUser(user);
}
