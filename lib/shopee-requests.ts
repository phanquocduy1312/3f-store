import { mockShopeeRequests } from "@/data/mock-shopee-requests";
import type {
  ShopeeApiCheckStatus,
  ShopeePointRequest,
  ShopeePointStatus,
  ShopeeProcessingStatus,
  ShopeeVerificationStatus,
} from "@/types/shopee";

export const STORAGE_KEY = "threef_shopee_point_requests";

export const shopeeStatusOptions: Array<{ label: string; value: "all" | ShopeeProcessingStatus }> = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Từ chối", value: "rejected" },
];

export const shopeeApiOptions: Array<{ label: string; value: "all" | ShopeeVerificationStatus }> = [
  { label: "Tất cả", value: "all" },
  { label: "Chưa đối chiếu", value: "not_checked" },
  { label: "Hợp lệ", value: "valid" },
  { label: "Cần kiểm tra", value: "manual_review" },
  { label: "Không tìm thấy", value: "not_found" },
  { label: "Lệch thông tin", value: "mismatch" },
  { label: "Trùng mã", value: "duplicate" },
  { label: "Đơn chưa đủ điều kiện", value: "invalid_order_status" },
];

export const shopeeTimeOptions = [
  { label: "Tất cả thời gian", value: "all" },
  { label: "Hôm nay", value: "today" },
  { label: "24 giờ qua", value: "24h" },
  { label: "7 ngày qua", value: "7d" },
];

export const rejectionReasons = [
  "Ảnh đơn không rõ",
  "Mã đơn không hợp lệ",
  "Tổng tiền không khớp",
  "Đơn không thuộc 3F Store",
  "Mã đơn đã được cộng điểm",
  "Không tìm thấy đơn trên Shopee API",
  "Đơn chưa hoàn tất / đã hủy / hoàn trả",
  "Thông tin chưa đủ để xác minh",
  "Khác",
];

export function computeExpectedPoints(amount: number) {
  return Math.floor(amount / 10000);
}

export function formatCurrency(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

export function formatNumber(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTime(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const date = new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round((Date.now() - date) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} ngày trước`;
}

export function getRequestAmountForPoints(request: ShopeePointRequest) {
  return request.apiOrderAmount ?? request.customerInputAmount;
}

export function getDuplicatedCodes(requests: ShopeePointRequest[]) {
  return requests
    .map((request) => request.shopeeOrderCode)
    .filter((code, index, list) => list.indexOf(code) !== index);
}

export function normalizeShopeeRequest(request: any): ShopeePointRequest {
  if (request.processingStatus && request.verificationStatus) {
    return request;
  }

  if (request.status === "approved") {
    return {
      ...request,
      processingStatus: "approved",
      verificationStatus: request.apiCheckStatus === "valid" ? "valid" : request.apiCheckStatus || "not_checked"
    };
  }

  if (request.status === "rejected") {
    return {
      ...request,
      processingStatus: "rejected",
      verificationStatus: request.apiCheckStatus || "manual_review"
    };
  }

  if (request.status === "auto_verified") {
    return {
      ...request,
      processingStatus: "pending",
      verificationStatus: "valid"
    };
  }

  if (request.status === "api_mismatch") {
    return {
      ...request,
      processingStatus: "pending",
      verificationStatus: "mismatch"
    };
  }

  if (request.status === "api_not_found") {
    return {
      ...request,
      processingStatus: "pending",
      verificationStatus: "not_found"
    };
  }

  if (request.status === "duplicate") {
    return {
      ...request,
      processingStatus: "pending",
      verificationStatus: "duplicate"
    };
  }

  if (request.status === "need_more_info") {
    return {
      ...request,
      processingStatus: "rejected",
      verificationStatus: "manual_review",
      rejectedReason: request.rejectedReason || "Thông tin chưa đủ để xác minh"
    };
  }

  return {
    ...request,
    processingStatus: "pending",
    verificationStatus: request.apiCheckStatus || "not_checked"
  };
}

export function loadShopeeRequests() {
  if (typeof window === "undefined") {
    return mockShopeeRequests.map(normalizeShopeeRequest);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const normalizedMock = mockShopeeRequests.map(normalizeShopeeRequest);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedMock));
    return normalizedMock;
  }

  try {
    const parsed = JSON.parse(raw) as any[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.map(normalizeShopeeRequest) : mockShopeeRequests.map(normalizeShopeeRequest);
  } catch {
    const normalizedMock = mockShopeeRequests.map(normalizeShopeeRequest);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedMock));
    return normalizedMock;
  }
}

export function persistShopeeRequests(requests: ShopeePointRequest[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }
}

export function reconcileShopeeRequest(request: ShopeePointRequest): ShopeePointRequest {
  const code = request.shopeeOrderCode.toUpperCase();
  const nextUpdatedAt = new Date().toISOString();

  if (code.includes("NOTFOUND")) {
    return {
      ...request,
      apiChecked: true,
      apiCheckStatus: "not_found",
      apiOrderAmount: undefined,
      apiOrderStatus: "NOT_FOUND",
      expectedPoints: 0,
      status: "api_not_found",
      verificationIssues: ["Không tìm thấy đơn trên Shopee API."],
      updatedAt: nextUpdatedAt,
    };
  }

  if (code.includes("DUP")) {
    return {
      ...request,
      apiChecked: true,
      apiCheckStatus: "duplicate",
      apiOrderAmount: request.customerInputAmount,
      apiOrderStatus: "COMPLETED",
      expectedPoints: computeExpectedPoints(request.customerInputAmount),
      status: "duplicate",
      verificationIssues: ["Mã đơn bị trùng trong hệ thống."],
      updatedAt: nextUpdatedAt,
    };
  }

  if (request.customerInputAmount >= 400000 && request.customerInputAmount % 30000 !== 0 && code.includes("IS")) {
    const amount = request.customerInputAmount - 30000;
    return {
      ...request,
      apiChecked: true,
      apiCheckStatus: "mismatch",
      apiOrderAmount: amount,
      apiOrderStatus: "COMPLETED",
      expectedPoints: computeExpectedPoints(amount),
      status: "api_mismatch",
      verificationIssues: ["Tổng tiền khách nhập lệch với dữ liệu Shopee API."],
      updatedAt: nextUpdatedAt,
    };
  }

  return {
    ...request,
    apiChecked: true,
    apiCheckStatus: "valid",
    apiOrderAmount: request.customerInputAmount,
    apiOrderStatus: "COMPLETED",
    apiShopId: request.apiShopId ?? "123456789",
    apiBuyerId: request.apiBuyerId ?? "998877665",
    apiCreateTime: request.apiCreateTime ?? "2026-06-12T08:20:00.000Z",
    apiCompleteTime: request.apiCompleteTime ?? "2026-06-12T10:40:00.000Z",
    expectedPoints: computeExpectedPoints(request.customerInputAmount),
    status: "auto_verified",
    verificationIssues: [],
    updatedAt: nextUpdatedAt,
  };
}

export function isTerminalStatus(status: ShopeeProcessingStatus | ShopeePointStatus | undefined) {
  return status === "approved" || status === "rejected";
}
