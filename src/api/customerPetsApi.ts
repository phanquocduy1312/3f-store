import { buildApiUrl } from "@/src/config/api";
import { getCustomerToken } from "./customerAuthApi";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getCustomerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface PetData {
  id?: number;
  name: string;
  species: "cat" | "dog" | "other";
  breed?: string;
  gender?: "male" | "female" | "unknown";
  birthday?: string | null;
  weightKg?: number | null;
  healthNotes?: string;
  allergies?: string;
  favoriteFood?: string;
  avatarUrl?: string | null;
}

export async function listPetsApi(): Promise<{ success: boolean; data?: PetData[]; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/pets"), {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}

export async function createPetApi(body: PetData): Promise<{ success: boolean; message?: string; id?: number }> {
  const res = await fetch(buildApiUrl("/api/customer/pets"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function updatePetApi(id: number, body: PetData): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/pets/${id}`), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deletePetApi(id: number): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/pets/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}
