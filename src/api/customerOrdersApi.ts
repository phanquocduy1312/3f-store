import { buildApiUrl } from "@/src/config/api";
import { getCustomerToken } from "./customerAuthApi";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getCustomerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface OrderItemData {
  id: number;
  product_id: number;
  variant_id: number | null;
  sku: string | null;
  product_name: string;
  variant_name: string | null;
  image_url: string | null;
  price: number;
  quantity: number;
}

export interface OrderStatusLog {
  id: number;
  from_status: string;
  to_status: string;
  note: string | null;
  changed_by: string;
  created_at: string;
}

export interface OrderData {
  id: number;
  order_code: string;
  customer_id: number | null;
  receiver_name: string;
  phone: string;
  email: string | null;
  province: string;
  ward: string;
  address_line: string;
  note: string | null;
  payment_method: string;
  payment_status: string;
  order_status: string;
  subtotalAmount: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  loyalty_points_earned: number;
  created_at: string;
  items?: OrderItemData[];
  status_logs?: OrderStatusLog[];
}

export async function listOrdersApi(status = ""): Promise<{ success: boolean; data?: OrderData[]; message?: string }> {
  const url = buildApiUrl(`/api/customer/orders?status=${status}`);
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}

export async function orderDetailApi(orderCode: string): Promise<{ success: boolean; data?: OrderData; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/orders/${orderCode}`), {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
}

export async function cancelOrderApi(orderCode: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/orders/${orderCode}/cancel`), {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
}

export async function reorderApi(orderCode: string): Promise<{ success: boolean; data?: { productId: number; variantId: number | null; quantity: number }[]; message?: string }> {
  const res = await fetch(buildApiUrl(`/api/customer/orders/${orderCode}/reorder`), {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
}
