import { API_BASE_URL } from "@/src/config/api";
import type { Product, ProductVariant } from "@/types/store";

export type ProductSort = "newest" | "price_asc" | "price_desc" | "popular";

export type ProductListParams = {
  q?: string;
  category?: string;
  categorySlug?: string;
  petType?: string;
  productType?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: ProductSort;
};

export type ApiProductVariant = {
  id: number;
  sourceSkuId: string;
  sku?: string | null;
  variantName?: string | null;
  label?: string | null;
  option1Name?: string | null;
  option1Value?: string | null;
  option2Name?: string | null;
  option2Value?: string | null;
  option3Name?: string | null;
  option3Value?: string | null;
  price: number;
  priceText: string;
  originalPrice?: number | null;
  oldPriceText?: string | null;
  stockQuantity: number;
  imageUrl?: string | null;
};

export type ApiProductImage = {
  id: number;
  imageUrl: string;
  isMain: boolean;
  variantId?: number | null;
  sortOrder: number;
};

export type ApiProduct = {
  id: number;
  sourceProductId: string;
  sourcePlatform: string;
  sourceSellerId?: string | null;
  sourceProductUrl?: string | null;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  brand?: string | null;
  mainImageUrl?: string | null;
  imageUrls?: string[];
  minPrice: number;
  maxPrice: number;
  price: string;
  oldPrice?: string | null;
  currency: string;
  totalStock: number;
  soldCount: number;
  ratingAverage: number;
  reviewCount: number;
  categoryName?: string | null;
  categorySlug?: string | null;
  petType?: string | null;
  productType?: string | null;
  hasVariants: boolean;
  variantCount: number;
  images?: ApiProductImage[];
  variants?: ApiProductVariant[];
};

export type ProductListResponse = {
  success: boolean;
  data: {
    items: ApiProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export type ProductDetailResponse = {
  success: boolean;
  data: ApiProduct;
};

async function apiJson<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  }

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data?.message || "Không tải được dữ liệu.");
  }
  return data;
}

export async function adminLogin(payload: any) {
  return apiJson<{ success: boolean; data: { token: string; admin: any } }>("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function adminLogout() {
  return apiJson<{ success: boolean; message: string }>("/api/admin/auth/logout", {
    method: "POST"
  });
}

export async function adminGetMe() {
  return apiJson<{ success: boolean; data: any }>("/api/admin/auth/me");
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function mapApiProduct(product: ApiProduct): Product {
  const imageUrls = product.images?.map((image) => image.imageUrl) ?? product.imageUrls ?? [];
  const mainImage = product.mainImageUrl || imageUrls[0] || "/assets/images/dog-food.webp";
  const variants: ProductVariant[] | undefined = product.variants?.map((variant) => ({
    id: String(variant.id),
    sku: variant.sku || variant.sourceSkuId,
    label: variant.variantName || variant.label || variant.sku || "Phan loai",
    price: variant.priceText,
    oldPrice: variant.oldPriceText || undefined,
    image: variant.imageUrl || mainImage,
    stock: variant.stockQuantity,
  }));

  return {
    id: product.slug || product.sourceProductId || String(product.id),
    backendId: product.id,
    sourceProductId: product.sourceProductId,
    slug: product.slug,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice || variants?.find((variant) => variant.oldPrice)?.oldPrice,
    image: mainImage,
    images: Array.from(new Set([mainImage, ...imageUrls].filter(Boolean))),
    rating: product.ratingAverage || 4.8,
    reviews: product.reviewCount || 0,
    sold: product.soldCount || 0,
    category: product.categoryName || undefined,
    brand: product.brand || undefined,
    description: product.description || product.shortDescription || undefined,
    productUrl: product.sourceProductUrl || undefined,
    tiktokUrl: product.sourceProductUrl || undefined,
    source: product.sourcePlatform,
    sellerId: product.sourceSellerId || undefined,
    currency: product.currency,
    stock: product.totalStock,
    variants,
  };
}

export async function getProducts(params: ProductListParams = {}) {
  const response = await apiJson<ProductListResponse>(`/api/products${buildQuery(params)}`);
  return {
    items: response.data.items.map(mapApiProduct),
    rawItems: response.data.items,
    pagination: response.data.pagination,
  };
}

export async function getProductDetail(identifier: string) {
  const key = /^\d{10,}$/.test(identifier) ? "sourceProductId" : /^\d+$/.test(identifier) ? "id" : "slug";
  const response = await apiJson<ProductDetailResponse>(
    `/api/products/detail${buildQuery({ [key]: identifier })}`,
  );
  return {
    item: mapApiProduct(response.data),
    rawItem: response.data,
  };
}

export async function getProductCategories() {
  return apiJson<{ success: boolean; data: Array<{ id: number; name: string; slug: string; parentId: number | null }> }>(
    "/api/product-categories",
  );
}

export type FilterCategory = {
  slug: string;
  name: string;
  count: number;
};

export type FilterPetType = {
  value: string;
  label: string;
  count: number;
};

export type FilterProductType = {
  value: string;
  label: string;
  count: number;
};

export type FilterBrand = {
  value: string;
  label: string;
  count: number;
};

export type FilterPriceRange = {
  min: number;
  max: number;
};

export type ProductFiltersData = {
  categories: FilterCategory[];
  petTypes: FilterPetType[];
  productTypes: FilterProductType[];
  brands: FilterBrand[];
  priceRange: FilterPriceRange;
};

export type ProductFiltersResponse = {
  success: boolean;
  data: ProductFiltersData;
};

export async function getProductFilters() {
  return apiJson<ProductFiltersResponse>("/api/products/filters");
}

// Order Integration Types & Functions
export type CreateOrderPayload = {
  customer: {
    name: string;
    phone: string;
    email?: string;
    zalo?: string;
  };
  shipping: {
    receiverName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    addressLine: string;
    note?: string;
  };
  items: Array<{
    productId: number;
    variantId?: number | null;
    quantity: number;
  }>;
  paymentMethod: "cod" | "bank_transfer";
};

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
  status: string;
  note: string | null;
  created_at: string;
  created_by: string;
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
  payment_status: string;
  order_status: string;
  subtotal: string;
  shipping_fee: string;
  discount: string;
  total: string;
  loyalty_points_earned: number;
  created_at: string;
  updated_at: string;
  items: OrderItemDetail[];
  status_logs?: OrderStatusLog[];
};

export type CreateOrderResponse = {
  success: boolean;
  data: OrderDetail;
};

export type OrderDetailResponse = {
  success: boolean;
  data: OrderDetail;
};

export type OrderCheckResponse = {
  success: boolean;
  data: OrderDetail[];
};

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  return apiJson<CreateOrderResponse>("/api/orders/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

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

export type AdminOrderListParams = {
  q?: string;
  order_status?: string;
  payment_status?: string;
  page?: number;
  limit?: number;
};

export type AdminOrderListResponse = {
  success: boolean;
  data: {
    items: OrderDetail[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export async function getAdminOrders(params: AdminOrderListParams = {}): Promise<AdminOrderListResponse> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.set(key, String(value));
    }
  });
  return apiJson<AdminOrderListResponse>(`/api/admin/orders?${queryParams.toString()}`);
}

export async function updateAdminOrderStatus(orderId: number, newStatus: string, note?: string): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/orders/update-status", {
    method: "POST",
    body: JSON.stringify({ orderId, newStatus, note }),
  });
}

export async function markAdminOrderPaid(orderId: number, note?: string): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/orders/mark-paid", {
    method: "POST",
    body: JSON.stringify({ orderId, note }),
  });
}


