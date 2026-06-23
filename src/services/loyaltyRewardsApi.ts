import { API_BASE_URL } from "../config/api";

export type VoucherPoolStatus = "available" | "assigned" | "used" | "expired";

export type RewardVoucherItem = {
  id: number;
  reward_id: number;
  reward_name?: string;
  voucher_code: string;
  voucher_value: number | null;
  status: VoucherPoolStatus;
  assigned_customer_id: string | null;
  assigned_redemption_id: number | null;
  assigned_at: string | null;
  used_at: string | null;
  expired_at: string | null;
  created_at: string;
};

export type VoucherStats = {
  totalCodes: number;
  availableCodes: number;
  assignedCodes: number;
  usedCodes: number;
  expiredCodes: number;
};

export type LoyaltyReward = {
  id: number;
  name: string;
  description: string | null;
  rewardType: "voucher" | "physical_gift" | "free_shipping" | "discount_code" | "manual_reward";
  imageUrl: string | null;
  pointsRequired: number;
  rewardValue: number | null;
  stockQuantity: number | null;
  sku?: string | null;
  stock?: number | null;
  reservedStock?: number | null;
  weight?: number | null;
  dimensions?: string | null;
  limitPerCustomer: number | null;
  isActive: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  voucherStats?: VoucherStats | null;
  vouchers?: RewardVoucherItem[];
};

async function apiJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers:
      options?.body instanceof FormData
        ? options.headers
        : {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
          },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không tải được dữ liệu quà tặng.");
  }
  return data;
}

export async function getAdminLoyaltyRewards(params?: {
  status?: string;
  type?: string;
  search?: string;
}): Promise<{ success: boolean; data: LoyaltyReward[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.type) searchParams.set("type", params.type);
  if (params?.search) searchParams.set("search", params.search);

  return apiJson(`/api/admin/loyalty/rewards?${searchParams.toString()}`);
}

export async function getAdminLoyaltyRewardDetail(id: number): Promise<{ success: boolean; data: LoyaltyReward }> {
  return apiJson(`/api/admin/loyalty/rewards/detail?id=${id}`);
}

export async function createLoyaltyReward(
  payload: Omit<LoyaltyReward, "id" | "createdAt" | "updatedAt" | "voucherStats" | "vouchers">,
): Promise<{ success: boolean; id: number }> {
  return apiJson("/api/admin/loyalty/rewards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateLoyaltyReward(
  payload: Partial<LoyaltyReward> & { id: number },
): Promise<{ success: boolean; message: string }> {
  return apiJson("/api/admin/loyalty/rewards/update", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function toggleLoyaltyRewardActive(
  id: number,
  isActive: number,
): Promise<{ success: boolean; message: string }> {
  return apiJson("/api/admin/loyalty/rewards/toggle-active", {
    method: "POST",
    body: JSON.stringify({ id, isActive }),
  });
}

export async function deactivateLoyaltyReward(id: number): Promise<{ success: boolean; message: string }> {
  return apiJson("/api/admin/loyalty/rewards/deactivate", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}

export async function uploadLoyaltyRewardImage(
  file: File,
): Promise<{ success: boolean; data: { imageUrl: string } }> {
  const formData = new FormData();
  formData.append("image", file);

  return apiJson("/api/admin/loyalty/rewards/upload-image", {
    method: "POST",
    body: formData,
  });
}

export async function importRewardVouchers(payload: {
  rewardId: number;
  voucherValue?: number | "";
  expiredAt?: string | null;
  codes: string[];
}): Promise<{ success: boolean; data: { created: number; skipped: number; duplicates?: string[] } }> {
  return apiJson("/api/admin/loyalty/rewards/import-vouchers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getRewardVouchers(rewardId: number): Promise<{ success: boolean; data: RewardVoucherItem[] }> {
  return apiJson(`/api/admin/loyalty/rewards/vouchers?rewardId=${rewardId}`);
}

export async function getClientLoyaltyRewards(): Promise<{ success: boolean; data: LoyaltyReward[] }> {
  return apiJson("/api/loyalty/rewards");
}

export async function redeemLoyaltyReward(payload: {
  phone: string;
  customerName: string;
  rewardId: number;
  verificationToken?: string;
}): Promise<{
  success: boolean;
  message: string;
  redemptionId: number;
  pointsSpent: number;
  remainingPoints: number;
  voucherCode?: string | null;
}> {
  const token = localStorage.getItem("customer_token");
  return apiJson("/api/loyalty/rewards/redeem", {
    method: "POST",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  });
}
