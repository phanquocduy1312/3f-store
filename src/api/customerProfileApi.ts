import { buildApiUrl } from "@/src/config/api";
import { getCustomerToken, removeCustomerToken } from "./customerAuthApi";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getCustomerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface ProfileStats {
  totalOrders: number;
  processingOrders: number;
  availableVouchers: number;
  profileCompletion: number;
}

export interface ProfileData {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  birthday: string | null;
  gender: string | null;
  phoneVerifiedAt: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  hasPassword: boolean;
  stats: ProfileStats;
}

export async function getProfileApi(): Promise<{ success: boolean; data?: ProfileData; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/profile"), {
    method: "GET",
    headers: authHeaders(),
  });
  if (res.status === 401) {
    removeCustomerToken();
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  }
  return res.json();
}

export async function patchProfileApi(body: {
  fullName: string;
  email?: string;
  birthday?: string;
  gender?: string;
  avatarUrl?: string;
}): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/profile"), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function requestPhoneChangeApi(phone: string): Promise<{ success: boolean; message?: string; devOtp?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/profile/request-phone-change"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ phone }),
  });
  return res.json();
}

export async function verifyPhoneChangeApi(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/profile/verify-phone-change"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ phone, otp }),
  });
  return res.json();
}

export async function uploadAvatarApi(file: File): Promise<{ success: boolean; message?: string; avatarUrl?: string }> {
  const token = getCustomerToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(buildApiUrl("/api/customer/profile/upload-avatar"), {
    method: "POST",
    headers,
    body: formData,
  });
  return res.json();
}
