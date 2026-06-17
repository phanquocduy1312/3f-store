import { buildApiUrl } from "@/src/config/api";
import { getCustomerToken } from "./customerAuthApi";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getCustomerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface SessionData {
  id: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export async function changePasswordApi(body: {
  currentPassword?: string;
  newPassword: string;
  newPasswordConfirmation: string;
}): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/security/change-password"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function listSessionsApi(): Promise<{ success: boolean; data?: SessionData[]; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/security/sessions"), {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}

export async function revokeSessionApi(id: number): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/security/sessions/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function logoutAllSessionsApi(): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/security/logout-all"), {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
}
