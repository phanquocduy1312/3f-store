import { API_BASE_URL } from "../config/api";

export type LoyaltyRedemption = {
  id: number;
  customer_phone: string;
  customer_name: string | null;
  reward_id: number;
  assigned_voucher_id?: number | null;
  voucher_code?: string | null;
  points_spent: number;
  status: "pending" | "approved" | "rejected" | "fulfilled" | "cancelled";
  note: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string | null;
  reward_name: string;
  reward_type: string;
};

export async function getAdminLoyaltyRedemptions(params?: {
  status?: string;
  phone?: string;
  search?: string;
}): Promise<{ success: boolean; data: LoyaltyRedemption[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.phone) searchParams.set("phone", params.phone);
  if (params?.search) searchParams.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/api/admin/loyalty/redemptions?${searchParams.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không tải được danh sách yêu cầu đổi quà.");
  }
  return data;
}

export async function approveLoyaltyRedemption(id: number, note?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/loyalty/redemptions/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, processedBy: "admin", note }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không thể duyệt yêu cầu đổi quà.");
  }
  return data;
}

export async function rejectLoyaltyRedemption(id: number, note?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/loyalty/redemptions/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, processedBy: "admin", note }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không thể từ chối yêu cầu đổi quà.");
  }
  return data;
}

export async function fulfillLoyaltyRedemption(id: number, note?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/loyalty/redemptions/fulfill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, processedBy: "admin", note }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không thể đánh dấu đã giao.");
  }
  return data;
}
