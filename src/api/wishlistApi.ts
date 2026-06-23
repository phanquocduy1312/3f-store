import { buildApiUrl } from "@/src/config/api";
import { getCustomerToken } from "./customerAuthApi";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getCustomerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function getWishlistApi(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const res = await fetch(buildApiUrl("/api/customer/wishlist"), {
      method: "GET",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

export async function toggleWishlistApi(productId: number): Promise<{ success: boolean; is_favorite?: boolean; message?: string }> {
  try {
    const res = await fetch(buildApiUrl("/api/customer/wishlist/toggle"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ product_id: productId }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error toggling wishlist:", err);
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

export async function syncWishlistApi(productIds: number[]): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(buildApiUrl("/api/customer/wishlist/sync"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ product_ids: productIds }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error syncing wishlist:", err);
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}
