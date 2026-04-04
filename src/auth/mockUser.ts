

export const MOCK_USER_EMAIL = 'test@gmail.com';
export const MOCK_USER_PASSWORD = 'testpassword';

export function isMockUserLogin(email: string, password: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail === MOCK_USER_EMAIL && password === MOCK_USER_PASSWORD;
}
