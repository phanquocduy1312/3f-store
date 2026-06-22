import { API_BASE_URL } from "../config/api";

async function apiJson<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: options?.body instanceof FormData ? options.headers : {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Không thể tải dữ liệu loyalty.");
    }
    return data;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Không tải được dữ liệu. Bấm thử lại.");
    }
    throw err;
  } finally {
    window.clearTimeout(timeout);
  }
}

export type VoucherPoolItem = {
  id: number;
  reward_id: number;
  reward_name: string;
  voucher_code: string;
  voucher_value: number | null;
  status: "available" | "assigned" | "used" | "expired";
  assigned_customer_id: string | null;
  assigned_redemption_id: number | null;
  assigned_at: string | null;
  used_at: string | null;
  expired_at: string | null;
  created_at: string;
};

export type MembershipTier = {
  id: number;
  key_name?: string;
  name: string;
  min_points: number;
  multiplier: number;
  color: string | null;
  benefits: string | null;
  is_active: number;
  min_spend?: number;
  min_orders?: number;
  redemption_cap_percent?: number;
};

export type LoyaltyCampaign = {
  id: number;
  name: string;
  description: string | null;
  multiplier: number;
  start_at: string | null;
  end_at: string | null;
  is_active: number;
};

export async function getVoucherPool(params?: { rewardId?: number | string; status?: string }) {
  const search = new URLSearchParams();
  if (params?.rewardId) search.set("rewardId", String(params.rewardId));
  if (params?.status) search.set("status", params.status);
  return apiJson<{ success: boolean; data: VoucherPoolItem[] }>(`/api/admin/loyalty/voucher-pool?${search}`);
}

export async function importVoucherPool(payload: { rewardId: number; text?: string; csv?: string; codes?: string[]; voucherValue?: number | "" }) {
  return apiJson<{ success: boolean; data: { created: number; skipped: number } }>("/api/admin/loyalty/voucher-pool/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMembershipTiers() {
  return apiJson<{ success: boolean; data: MembershipTier[] }>("/api/admin/3f-club/tiers");
}

export async function saveMembershipTier(payload: Partial<MembershipTier> & { name: string; minPoints?: number; multiplier?: number; isActive?: number; min_spend?: number; min_orders?: number; redemption_cap_percent?: number }) {
  const method = payload.id ? "PUT" : "POST";
  const url = payload.id ? `/api/admin/3f-club/tiers/${payload.id}` : "/api/admin/3f-club/tiers";
  return apiJson<{ success: boolean; id: number }>(url, {
    method,
    body: JSON.stringify(payload),
  });
}

export async function setMembershipTierActive(id: number, isActive: number) {
  return apiJson<{ success: boolean }>(`/api/admin/3f-club/tiers/${id}`, {
    method: "PUT",
    body: JSON.stringify({ isActive }),
  });
}

export async function previewMembershipTier(params: { customerId?: string; points?: number }) {
  const search = new URLSearchParams();
  if (params.customerId) search.set("customerId", params.customerId);
  if (params.points !== undefined) search.set("points", String(params.points));
  return apiJson<{ success: boolean; data: any }>(`/api/admin/loyalty/tiers/preview?${search}`);
}

export async function getLoyaltyCampaigns() {
  return apiJson<{ success: boolean; data: LoyaltyCampaign[] }>("/api/admin/loyalty/campaigns");
}

export async function saveLoyaltyCampaign(payload: Partial<LoyaltyCampaign> & { name: string; multiplier: number; startAt?: string | null; endAt?: string | null; isActive?: number }) {
  return apiJson<{ success: boolean; id: number }>("/api/admin/loyalty/campaigns/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function setLoyaltyCampaignActive(id: number, isActive: number) {
  return apiJson<{ success: boolean }>("/api/admin/loyalty/campaigns/active", {
    method: "POST",
    body: JSON.stringify({ id, isActive }),
  });
}

export async function previewLoyaltyPoints(payload: { amount: number; customerId?: string }) {
  return apiJson<{ success: boolean; data: { basePoints: number; tierMultiplier: number; campaignMultiplier: number; birthdayMultiplier: number; finalPoints: number; tier: any } }>("/api/admin/loyalty/preview-points", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getLoyaltyAnalytics() {
  return apiJson<{ success: boolean; data: any }>("/api/admin/loyalty/analytics");
}

export async function getCustomerLoyaltyProfile(customerId: string) {
  return apiJson<{ success: boolean; data: any }>(`/api/admin/customers/loyalty?customer_id=${encodeURIComponent(customerId)}`);
}
