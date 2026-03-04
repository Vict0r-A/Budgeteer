import { clearAuth, setAuth } from "./auth-storage";
import { request } from "./http";
import type {
  AuthResponse,
  AuthedUser,
  ForgotPasswordResponse,
  MessageResponse,
} from "./types";

export async function register(payload: {
  email: string;
  password: string;
  displayName: string;
}): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
  setAuth(data.token, data.user);
  return data;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
  setAuth(data.token, data.user);
  return data;
}

export function logout() {
  clearAuth();
}

export async function getMe(): Promise<AuthedUser> {
  return request<AuthedUser>("/api/auth/me", { auth: true });
}

export async function forgotPassword(payload: { email: string }): Promise<ForgotPasswordResponse> {
  return request<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export async function resetPassword(payload: { token: string; newPassword: string }): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/reset-password", {
    method: "POST",
    body: payload,
  });
  setAuth(data.token, data.user);
  return data;
}

export async function updateProfile(payload: { displayName: string; email: string }): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/profile", {
    method: "PUT",
    body: payload,
    auth: true,
  });
  // Backend returns a refreshed token when profile data changes.
  setAuth(data.token, data.user);
  return data;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/password", {
    method: "PUT",
    body: payload,
    auth: true,
  });
  // Password change rotates token; store the new one immediately.
  setAuth(data.token, data.user);
  return data;
}

export async function deleteMyAccount(payload: { password: string }): Promise<MessageResponse> {
  const data = await request<MessageResponse>("/api/auth/me", {
    method: "DELETE",
    body: payload,
    auth: true,
  });
  clearAuth();
  return data;
}
