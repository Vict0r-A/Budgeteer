import type { AuthedUser } from "./types";

const TOKEN_KEY = "budgeteer_token";
const USER_KEY = "budgeteer_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthedUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthedUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthedUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  // Keep logout logic in one place for consistency.
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
