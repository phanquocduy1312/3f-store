import { buildApiUrl } from "@/src/config/api";

export type AdminReviewStatus = "published" | "hidden" | "flagged";

export type AdminProductReview = {
  id: number;
  productId: number;
  customerId: number;
  orderId: number;
  orderItemId: number;
  orderCode?: string | null;
  orderStatus?: string | null;
  rating: number;
  content: string;
  images: string[];
  verifiedPurchase: boolean;
  customerName: string;
  customerRawName?: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerStatus?: string | null;
  status: AdminReviewStatus;
  productName?: string | null;
  productSlug?: string | null;
  productImage?: string | null;
  productRatingAverage?: number | null;
  productReviewCount?: number | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type AdminProductReviewStats = {
  total: number;
  published: number;
  hidden: number;
  flagged: number;
  verified: number;
  averageRating: number;
};

export type AdminProductReviewParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: "all" | AdminReviewStatus;
  rating?: "all" | number;
  verified?: "all" | "yes" | "no";
  hasImages?: "all" | "yes" | "no";
  sort?: "newest" | "oldest" | "rating_high" | "rating_low";
};

function adminHeaders(extra?: HeadersInit) {
  const token = localStorage.getItem("admin_token") || "";
  return {
    Authorization: `Bearer ${token}`,
    "X-Admin-Token": token,
    ...extra,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok || !data.success) {
    throw new Error(data.message || `API error ${response.status}`);
  }
  return data.data;
}

export async function getAdminProductReviews(params: AdminProductReviewParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      searchParams.append(key, String(value));
    }
  });

  const response = await fetch(`${buildApiUrl("/api/admin/product-reviews")}?${searchParams.toString()}`, {
    headers: adminHeaders(),
  });

  return parseResponse<{
    items: AdminProductReview[];
    stats: AdminProductReviewStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(response);
}

export async function updateAdminProductReviewStatus(id: number, status: AdminReviewStatus) {
  const response = await fetch(buildApiUrl(`/api/admin/product-reviews/${id}/status`), {
    method: "PUT",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });

  return parseResponse<AdminProductReview>(response);
}

export async function deleteAdminProductReview(id: number) {
  const response = await fetch(buildApiUrl(`/api/admin/product-reviews/${id}`), {
    method: "DELETE",
    headers: adminHeaders(),
  });

  return parseResponse<unknown>(response);
}
