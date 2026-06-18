import { buildApiUrl } from "@/src/config/api";
import { getCustomerToken } from "./customerAuthApi";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getCustomerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface AddressData {
  id?: number;
  receiverName: string;
  receiverPhone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  addressLine: string;
  note?: string;
  type?: "home" | "office" | "other";
  isDefault?: boolean;
}

export async function listAddressesApi(): Promise<{ success: boolean; data?: AddressData[]; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/addresses"), {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}

export async function createAddressApi(body: AddressData): Promise<{ success: boolean; message?: string; id?: number }> {
  const res = await fetch(buildApiUrl("/api/customer/addresses"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function updateAddressApi(id: number, body: AddressData): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/addresses/${id}`), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteAddressApi(id: number): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/addresses/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function setDefaultAddressApi(id: number): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/addresses/${id}/default`), {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
}
