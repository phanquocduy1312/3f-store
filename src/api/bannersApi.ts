import { buildApiUrl } from "@/src/config/api";

export type BannerPlacement = 'home_hero_slider';

export interface Banner {
  id: number;
  placement: BannerPlacement;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: number;
  sort_order: number;
  start_at: string | null;
  end_at: string | null;
  impression_count: number;
  click_count: number;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface AdminBannerPayload {
  placement: BannerPlacement;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: number;
  sort_order: number;
  start_at: string | null;
  end_at: string | null;
}

function getAdminHeaders(): Record<string, string> {
  const token = localStorage.getItem("admin_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch active banners (public endpoint).
 */
export async function getActiveBanners(placement?: string): Promise<{ success: boolean; data: Banner[]; message?: string }> {
  try {
    const url = new URL(buildApiUrl("/api/banners"));
    if (placement) {
      url.searchParams.append("placement", placement);
    }
    const res = await fetch(url.toString(), { method: "GET" });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching active banners:", err);
    return { success: false, data: [], message: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Track banner click (public endpoint).
 */
export async function trackBannerClick(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/banners/${id}/click`), {
      method: "POST"
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error tracking banner click:", err);
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Fetch all banners for admin (paginated & filtered).
 */
export async function adminGetBanners(filters: {
  placement?: string;
  is_active?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: Banner[];
  pagination?: { total: number; page: number; totalPages: number };
  message?: string;
}> {
  try {
    const url = new URL(buildApiUrl("/api/admin/banners"));
    if (filters.placement) url.searchParams.append("placement", filters.placement);
    if (filters.is_active) url.searchParams.append("is_active", filters.is_active);
    if (filters.q) url.searchParams.append("q", filters.q);
    if (filters.page) url.searchParams.append("page", String(filters.page));
    if (filters.limit) url.searchParams.append("limit", String(filters.limit));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: getAdminHeaders()
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching admin banners:", err);
    return { success: false, data: [], message: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Fetch detailed view of a banner for admin.
 */
export async function adminGetBannerDetail(id: number): Promise<{ success: boolean; data?: Banner; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/banners/${id}`), {
      method: "GET",
      headers: getAdminHeaders()
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error(`Error fetching banner ${id}:`, err);
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Create banner (admin).
 */
export async function adminCreateBanner(payload: AdminBannerPayload): Promise<{ success: boolean; id?: number; message?: string }> {
  try {
    const res = await fetch(buildApiUrl("/api/admin/banners"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAdminHeaders()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error creating banner:", err);
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Update banner (admin).
 */
export async function adminUpdateBanner(id: number, payload: AdminBannerPayload): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/banners/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAdminHeaders()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error(`Error updating banner ${id}:`, err);
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Delete banner (admin).
 */
export async function adminDeleteBanner(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/banners/${id}`), {
      method: "DELETE",
      headers: getAdminHeaders()
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error(`Error deleting banner ${id}:`, err);
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Upload image for banners (admin).
 */
export async function adminUploadBannerImage(file: File): Promise<{ success: boolean; data?: { image_url: string }; message?: string }> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(buildApiUrl("/api/admin/banners/upload-image"), {
      method: "POST",
      headers: getAdminHeaders(),
      body: formData
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error uploading banner image:", err);
    return { success: false, message: err instanceof Error ? err.message : "Network error" };
  }
}
