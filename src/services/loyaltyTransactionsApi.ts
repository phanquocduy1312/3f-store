import { API_BASE_URL } from "../config/api";

export type CustomerPointTransaction = {
  id: number;
  customer_phone: string;
  type: "earn_shopee_order" | "spend_reward" | "refund_reward" | "adjust_manual";
  points: number;
  balance_after: number | null;
  reference_type: string | null;
  reference_id: number | null;
  note: string | null;
  created_at: string;
};

export async function getAdminLoyaltyTransactions(params?: {
  phone?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ success: boolean; data: CustomerPointTransaction[] }> {
  const searchParams = new URLSearchParams();
  if (params?.phone) searchParams.set("phone", params.phone);
  if (params?.type) searchParams.set("type", params.type);
  if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params?.dateTo) searchParams.set("dateTo", params.dateTo);

  const res = await fetch(`${API_BASE_URL}/api/admin/loyalty/transactions?${searchParams.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không tải được lịch sử điểm.");
  }
  return data;
}

export async function getClientLoyaltyTransactions(phone: string): Promise<{ success: boolean; data: CustomerPointTransaction[] }> {
  const res = await fetch(`${API_BASE_URL}/api/loyalty/transactions?phone=${encodeURIComponent(phone)}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không tải được lịch sử điểm.");
  }
  return data;
}
