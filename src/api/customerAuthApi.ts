import { buildApiUrl } from "@/src/config/api";

const TOKEN_KEY = "customer_token";

/**
 * Get stored customer auth token.
 */
export function getCustomerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store customer auth token.
 */
export function setCustomerToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove customer auth token.
 */
export function removeCustomerToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Build headers with optional auth token.
 */
function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getCustomerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ─── Types ───

export interface CustomerData {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  avatarUrl: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  devVerifyUrl?: string;
  data?: { token: string; customer: CustomerData };
}

interface OtpResponse {
  success: boolean;
  message?: string;
  devOtp?: string;
  code?: string;
}

// ─── API Functions ───

export async function registerEmail(body: {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptTerms: boolean;
}): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl("/api/customer/auth/register-email"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function verifyRegistrationApi(body: {
  email: string;
  token: string;
}): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl("/api/customer/auth/verify-registration"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function resendRegistrationVerificationApi(body: {
  email: string;
}): Promise<{ success: boolean; message?: string; devVerifyUrl?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/auth/resend-registration-verification"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function loginPassword(body: {
  identifier: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl("/api/customer/auth/login-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getMe(): Promise<{ success: boolean; data?: CustomerData }> {
  const res = await fetch(buildApiUrl("/api/customer/auth/me"), {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}

export async function logoutApi(): Promise<{ success: boolean }> {
  const res = await fetch(buildApiUrl("/api/customer/auth/logout"), {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
}

export async function addPhone(body: { phone: string }): Promise<OtpResponse> {
  const res = await fetch(buildApiUrl("/api/customer/auth/add-phone"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function verifyAddPhone(body: {
  phone: string;
  otp: string;
}): Promise<{ success: boolean; message?: string; data?: CustomerData }> {
  const res = await fetch(buildApiUrl("/api/customer/auth/verify-add-phone"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}
