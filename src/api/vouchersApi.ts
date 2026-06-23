import { apiJson } from "@/src/api/productsApi";

export type VoucherDiscountType = "fixed" | "percent" | "free_shipping" | "gift";

export type PublicVoucher = {
  id: number;
  code: string;
  title: string;
  name: string;
  description: string | null;
  label: string | null;
  badgeText: string | null;
  themeColor: string;
  iconKey: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
};

export type AdminVoucher = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  usageLimit: number | null;
  usedCount: number;
  perCustomerLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: number;
  showOnHome: number;
  showInCart: number;
  showInAiAdvisor: number;
  displayTitle: string | null;
  displayLabel: string | null;
  badgeText: string | null;
  themeColor: string;
  iconKey: string;
  sortOrder: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AdminVoucherPayload = {
  id?: number | null;
  code: string;
  name: string;
  description?: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount?: number | "";
  minOrderAmount: number;
  usageLimit?: number | "";
  perCustomerLimit?: number | "";
  startsAt?: string | null;
  endsAt?: string | null;
  noEndDate?: boolean;
  isActive: number;
  showOnHome: number;
  showInCart: number;
  showInAiAdvisor: number;
  displayTitle?: string | null;
  displayLabel?: string | null;
  badgeText?: string | null;
  themeColor: string;
  iconKey: string;
  sortOrder: number;
};

export type VoucherStats = {
  total: number;
  active: number;
  expired: number;
  used: number;
  home?: number;
  cart?: number;
  ai?: number;
  events?: Record<string, number>;
};

export type AdminVoucherListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

export function getFeaturedVouchers(limit = 12) {
  return apiJson<{ success: boolean; data: PublicVoucher[] }>(`/api/vouchers/featured${query({ limit })}`);
}

export function getCartVoucherSuggestions(limit = 8) {
  return apiJson<{ success: boolean; data: PublicVoucher[] }>(`/api/vouchers/cart-suggestions${query({ limit })}`);
}

export function getAiAdvisorVoucher() {
  return apiJson<{ success: boolean; data: PublicVoucher | null }>("/api/vouchers/ai-advisor");
}

export function trackVoucherEvent(payload: {
  couponId?: number | null;
  code: string;
  eventType: "view" | "copy" | "apply_success" | "apply_failed" | "redeem_order";
  customerPhone?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return apiJson<{ success: boolean }>("/api/vouchers/track", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminGetVouchers(filters: { q?: string; isActive?: string; placement?: string; page?: number; perPage?: number } = {}) {
  return apiJson<{ success: boolean; data: AdminVoucher[]; stats: VoucherStats; meta: AdminVoucherListMeta }>(
    `/api/admin/vouchers${query(filters)}`,
  );
}

export function adminSaveVoucher(payload: AdminVoucherPayload) {
  const path = payload.id ? "/api/admin/vouchers/update" : "/api/admin/vouchers";
  return apiJson<{ success: boolean; id: number; message?: string }>(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminToggleVoucherActive(id: number, isActive: number) {
  return apiJson<{ success: boolean; message?: string }>("/api/admin/vouchers/toggle-active", {
    method: "POST",
    body: JSON.stringify({ id, isActive }),
  });
}

export function adminDeleteVoucher(id: number) {
  return apiJson<{ success: boolean; message?: string }>("/api/admin/vouchers/delete", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}
