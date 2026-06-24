import { API_BASE_URL, handleAuthStatus } from "../config/api";

export type ShopeeOrderScanFields = {
  customerName?: string;
  phone?: string;
  email?: string;
  shopeeOrderCode?: string;
  orderAmount?: number;
  orderDate?: string;
  orderStatus?: string;
  shippingProvider?: string;
  trackingCode?: string;
};

export type ShopeeOrderScanResponse = {
  success: boolean;
  message: string;
  imageId?: number;
  scanId?: number;
  imageUrl?: string;
  fields?: ShopeeOrderScanFields;
  confidence?: number;
  warnings?: string[];
};

export type CreateShopeePointRequestPayload = {
  phone?: string;
  email?: string;
  customerName?: string;
  zalo?: string;
  shopeeOrderCode: string;
  orderAmount: number;
  imageId?: number | null;
  scanId?: number | null;
  note?: string;
};

export type CreateShopeePointRequestResponse = {
  success: boolean;
  message: string;
  requestId?: number;
  expectedPoints?: number;
  processingStatus?: string;
  code?: string;
};

async function fetchWithAdminAuth(url: string, options?: RequestInit) {
  const token = localStorage.getItem("admin_token");
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(options?.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers || {})
    }
  });

  if (response.status === 401 || response.status === 403) {
    handleAuthStatus(response.status);
    throw new Error("Unauthorized");
  }
  return response;
}

export async function scanShopeeOrderImage(file: File): Promise<ShopeeOrderScanResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/shopee/order-scan`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Không quét được ảnh đơn hàng");
  return data;
}

export async function requestGuestOtpApi(phone: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/shopee/guest/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.message || "Không gửi được mã xác nhận");
  return data;
}

export async function verifyGuestOtpApi(phone: string, otp: string): Promise<{ success: boolean; message?: string; data?: { verificationToken: string; expiresIn: number } }> {
  const res = await fetch(`${API_BASE_URL}/api/shopee/guest/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.message || "Xác thực mã OTP thất bại");
  return data;
}

export async function createShopeePointRequest(payload: CreateShopeePointRequestPayload): Promise<CreateShopeePointRequestResponse> {
  const customerToken = localStorage.getItem("customer_token");
  const res = await fetch(`${API_BASE_URL}/api/shopee/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(customerToken ? { "Authorization": `Bearer ${customerToken}` } : {})
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.message || "Không gửi được yêu cầu tích điểm");
  return data;
}

export async function getShopeePointRequests(params?: {
  status?: string;
  verification?: string;
  phone?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const url = `${API_BASE_URL}/api/admin/shopee/requests${search.toString() ? `?${search.toString()}` : ""}`;
  const res = await fetchWithAdminAuth(url);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.message || "Không tải được danh sách yêu cầu Shopee");
  return data;
}

export async function getShopeePointRequestDetail(id: number) {
  const res = await fetchWithAdminAuth(`${API_BASE_URL}/api/admin/shopee/requests/detail?id=${id}`);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.message || "Không tải được chi tiết yêu cầu");
  return data;
}

export async function approveShopeePointRequest(requestId: number, adminNote?: string) {
  const res = await fetchWithAdminAuth(`${API_BASE_URL}/api/admin/shopee/requests/approve`, {
    method: "POST",
    body: JSON.stringify({ requestId, adminNote: adminNote || "" }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.message || "Không duyệt được yêu cầu");
  return data;
}

export async function rejectShopeePointRequest(requestId: number, reason: string) {
  const res = await fetchWithAdminAuth(`${API_BASE_URL}/api/admin/shopee/requests/reject`, {
    method: "POST",
    body: JSON.stringify({ requestId, reason }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.message || "Không từ chối được yêu cầu");
  return data;
}

export async function verifyShopeePointRequest(id: number) {
  const res = await fetchWithAdminAuth(`${API_BASE_URL}/api/admin/shopee/requests/verify`, {
    method: "POST",
    body: JSON.stringify({ id }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    const msg = data?.message || "";
    if (msg.toLowerCase().includes("token") || msg.toLowerCase().includes("shopee")) {
      throw new Error("Không thể kết nối Shopee API. Vui lòng kiểm tra kết nối Shopee.");
    }
    throw new Error(msg || "Không thể đối chiếu yêu cầu");
  }
  return data;
}

export async function verifyBulkShopeePointRequests(ids: number[]) {
  const res = await fetchWithAdminAuth(`${API_BASE_URL}/api/admin/shopee/requests/verify-bulk`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    const msg = data?.message || "";
    if (msg.toLowerCase().includes("token") || msg.toLowerCase().includes("shopee")) {
      throw new Error("Không thể kết nối Shopee API. Vui lòng kiểm tra kết nối Shopee.");
    }
    throw new Error(msg || "Không thể đối chiếu hàng loạt");
  }
  return data;
}

export async function getCustomerPoints(phone: string) {
  const res = await fetch(`${API_BASE_URL}/api/customer/points?phone=${encodeURIComponent(phone)}`);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.message || "Không lấy được điểm khách hàng");
  return data;
}
