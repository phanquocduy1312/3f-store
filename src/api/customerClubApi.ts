import { buildApiUrl } from "@/src/config/api";
import { getCustomerToken } from "./customerAuthApi";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getCustomerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface ClubSummary {
  pointsBalance: number;
  tier: {
    name: string;
    multiplier: number;
    color: string;
    minPoints: number;
    benefits?: string;
    capPercent?: number;
  };
  nextTier: {
    name: string;
    minPoints?: number;
    minSpend?: number;
    minOrders?: number;
    currentSpend?: number;
    currentOrders?: number;
  } | null;
  totalEarned: number;
  totalSpent: number;
  locked?: boolean;
  phone_verified?: boolean;
  holdingPoints?: number;
}

export interface PointTransaction {
  id: number;
  customer_phone: string;
  type: string;
  points: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: number | null;
  note: string | null;
  created_at: string;
}

export interface ShopeeRequestData {
  id: number;
  customer_name: string | null;
  phone: string;
  shopee_order_code: string;
  order_amount: number;
  expected_points: number;
  approved_points: number;
  processing_status: "pending" | "approved" | "rejected";
  imageUrl: string | null;
  createdAt: string;
}

export interface VoucherData {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  minOrderAmount: number;
  expiresAt: string | null;
  status: "available" | "used" | "expired";
  source: "coupon" | "reward" | "birthday" | "welcome";
}

export async function getClubSummaryApi(): Promise<{ success: boolean; data?: ClubSummary; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/club/summary"), {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}

export async function listPointTransactionsApi(): Promise<{ success: boolean; data?: PointTransaction[]; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/club/transactions"), {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}

export async function listShopeeRequestsApi(): Promise<{ success: boolean; data?: ShopeeRequestData[]; message?: string }> {
  const res = await fetch(buildApiUrl("/api/customer/club/shopee-requests"), {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}

export async function createShopeeRequestApi(body: {
  shopeeOrderCode: string;
  orderAmount: number;
  imageId?: number | null;
  note?: string;
}): Promise<{ success: boolean; message?: string; data?: { requestId: number; expectedPoints: number } }> {
  const res = await fetch(buildApiUrl("/api/customer/club/shopee-requests"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function listVouchersApi(status: "available" | "used" | "expired"): Promise<{ success: boolean; data?: VoucherData[]; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/vouchers?status=${status}`), {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}
