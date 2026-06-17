import { API_BASE_URL } from "../config/api";

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
  phone: string;
  email?: string;
  customerName?: string;
  zalo?: string;
  shopeeOrderCode: string;
  orderAmount: number;
  imageId?: number | null;
  scanId?: number | null;
};

export type CreateShopeePointRequestResponse = {
  success: boolean;
  message: string;
  requestId?: number;
  expectedPoints?: number;
  processingStatus?: string;
  code?: string;
};

/**
 * Uploads order receipt image and performs real OCR parsing.
 */
export async function scanShopeeOrderImage(file: File): Promise<ShopeeOrderScanResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/shopee/order-scan`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Không quét được ảnh đơn hàng");
  }

  return data;
}

/**
 * Sends a Shopee point request creation payload.
 */
export async function createShopeePointRequest(
  payload: CreateShopeePointRequestPayload
): Promise<CreateShopeePointRequestResponse> {
  const res = await fetch(`${API_BASE_URL}/api/shopee/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không gửi được yêu cầu tích điểm");
  }

  return data;
}

/**
 * Retrieves lists of Shopee requests for administrators.
 */
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

  const url = `${API_BASE_URL}/api/admin/shopee/requests${
    search.toString() ? `?${search.toString()}` : ""
  }`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không tải được danh sách yêu cầu Shopee");
  }

  return data;
}

/**
 * Retrieves detailed request logs by id.
 */
export async function getShopeePointRequestDetail(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/admin/shopee/requests/detail?id=${id}`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không tải được chi tiết yêu cầu");
  }

  return data;
}

/**
 * Performs admin request approval.
 */
export async function approveShopeePointRequest(requestId: number, adminNote?: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/shopee/requests/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requestId,
      adminNote: adminNote || "",
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không duyệt được yêu cầu");
  }

  return data;
}

/**
 * Performs admin request rejection.
 */
export async function rejectShopeePointRequest(requestId: number, reason: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/shopee/requests/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requestId,
      reason,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không từ chối được yêu cầu");
  }

  return data;
}

/**
 * Verifies a single Shopee point request against Shopee API.
 */
export async function verifyShopeePointRequest(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/admin/shopee/requests/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  const data = await res.json();

  if (res.status === 401 || res.status === 403) {
    throw new Error("Bạn không có quyền thực hiện thao tác này");
  }

  if (!res.ok || !data.success) {
    const msg = data?.message || "";
    if (msg.toLowerCase().includes("token") || msg.toLowerCase().includes("shopee")) {
      throw new Error("Không thể kết nối Shopee API. Vui lòng kiểm tra kết nối Shopee.");
    }
    throw new Error(msg || "Không thể đối chiếu yêu cầu");
  }

  return data;
}

/**
 * Verifies multiple Shopee point requests against Shopee API.
 */
export async function verifyBulkShopeePointRequests(ids: number[]) {
  const res = await fetch(`${API_BASE_URL}/api/admin/shopee/requests/verify-bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  const data = await res.json();

  if (res.status === 401 || res.status === 403) {
    throw new Error("Bạn không có quyền thực hiện thao tác này");
  }

  if (!res.ok || !data.success) {
    const msg = data?.message || "";
    if (msg.toLowerCase().includes("token") || msg.toLowerCase().includes("shopee")) {
      throw new Error("Không thể kết nối Shopee API. Vui lòng kiểm tra kết nối Shopee.");
    }
    throw new Error(msg || "Không thể đối chiếu hàng loạt");
  }

  return data;
}

/**
 * Retrieves customer points by phone number.
 */
export async function getCustomerPoints(phone: string) {
  const res = await fetch(`${API_BASE_URL}/api/customer/points?phone=${encodeURIComponent(phone)}`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Không lấy được điểm khách hàng");
  }

  return data;
}
