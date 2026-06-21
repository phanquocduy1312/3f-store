import { apiJson } from "./productsApi";

export type OrderItemDetail = {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  sku: string | null;
  product_name: string;
  variant_name: string | null;
  image_url: string | null;
  price: string;
  quantity: number;
};

export type OrderStatusLog = {
  id: number;
  order_id: number;
  group_key?: string | null;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
  changed_by: string;
  changed_by_admin_id?: number | null;
  changed_by_customer_id?: number | null;
  metadata?: any;
};

export type OrderDetail = {
  id: number;
  order_code: string;
  customer_id: number;
  receiver_name: string;
  phone: string;
  email: string | null;
  zalo: string | null;
  province: string;
  district: string;
  ward: string;
  address_line: string;
  note: string | null;
  payment_method: "cod" | "bank_transfer";
  shipping_method?: string;
  payment_status: string;
  order_status: string;
  shipping_status?: string;
  loyalty_status?: string;
  subtotal: string;
  shipping_fee: string;
  discount: string;
  total: string;
  loyalty_points_earned: number;
  created_at: string;
  updated_at: string;
  items: OrderItemDetail[];
  status_logs?: OrderStatusLog[];
  customer_name?: string;
  customer_phone?: string;
  coupon_code?: string | null;
  couponCode?: string | null;
  customer_email?: string | null;
};

export type OrderDetailResponse = {
  success: boolean;
  data: OrderDetail;
};

export type OrderCheckResponse = {
  success: boolean;
  data: OrderDetail[];
};

export type AdminOrderListParams = {
  q?: string;
  order_status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
};

export type AdminOrderListResponse = {
  success: boolean;
  data: {
    items: OrderDetail[];
    summary: {
      totalOrders: number;
      pendingOrders: number;
      processingOrders: number;
      shippingOrders: number;
      completedOrders: number;
      completedRevenue: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export type AllowedTransitionsResponse = {
  success: boolean;
  data: {
    order: Array<{ id: number; group_key: string; from_status: string; to_status: string; label: string; requires_reason: number; to_status_label: string; to_status_color: string }>;
    payment: Array<{ id: number; group_key: string; from_status: string; to_status: string; label: string; requires_reason: number; to_status_label: string; to_status_color: string }>;
    shipping: Array<{ id: number; group_key: string; from_status: string; to_status: string; label: string; requires_reason: number; to_status_label: string; to_status_color: string }>;
    loyalty: Array<{ id: number; group_key: string; from_status: string; to_status: string; label: string; requires_reason: number; to_status_label: string; to_status_color: string }>;
  };
};

export async function getOrderDetails(orderCode: string): Promise<OrderDetailResponse> {
  return apiJson<OrderDetailResponse>(`/api/orders/detail?orderCode=${encodeURIComponent(orderCode)}`);
}

export async function checkOrdersByPhone(phone: string, orderCode?: string): Promise<OrderCheckResponse> {
  const query = new URLSearchParams({ phone });
  if (orderCode) {
    query.set("orderCode", orderCode);
  }
  return apiJson<OrderCheckResponse>(`/api/orders/check?${query.toString()}`);
}

export async function getAdminOrders(params: AdminOrderListParams = {}): Promise<AdminOrderListResponse> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.set(key, String(value));
    }
  });
  return apiJson<AdminOrderListResponse>(`/api/admin/orders?${queryParams.toString()}`);
}

export async function updateAdminOrderStatus(orderId: number, newStatus: string, note?: string, groupKey = "order"): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/orders/update-status", {
    method: "POST",
    body: JSON.stringify({ orderId, newStatus, note, groupKey }),
  });
}

export async function markAdminOrderPaid(orderId: number, note?: string): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/orders/mark-paid", {
    method: "POST",
    body: JSON.stringify({ orderId, note }),
  });
}

export async function getAllowedTransitions(orderId: number): Promise<AllowedTransitionsResponse> {
  return apiJson<AllowedTransitionsResponse>(`/api/admin/orders/${orderId}/allowed-transitions`);
}
