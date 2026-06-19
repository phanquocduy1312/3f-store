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
  isActive?: boolean;
  hasOrderHistory?: boolean;
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
  ingredients?: string | null;
  guide?: string | null;
  brand?: string | null;
  mainImageUrl?: string | null;
  imageUrls?: string[];
  minPrice: number;
  maxPrice: number;
  minOriginalPrice?: number | null;
  maxOriginalPrice?: number | null;
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
  options?: Array<{ name: string; values: string[] }>;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductListResponse = {
  success: boolean;
  data: {
    items: ApiProduct[];
    stats?: {
      totalProducts: number;
      activeProducts: number;
      inactiveProducts: number;
      outOfStockProducts: number;
      lowStockProducts: number;
    };
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
  const adminToken = localStorage.getItem("admin_token");
  const customerToken = localStorage.getItem("customer_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  } else if (customerToken) {
    headers["Authorization"] = `Bearer ${customerToken}`;
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

  const responseText = await response.text();
  let data: any = {};
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(response.ok ? "API trả về JSON không hợp lệ." : `API error ${response.status}: ${responseText.slice(0, 180)}`);
    }
  }
  if (!response.ok || !data.success) {
    throw new Error(data?.message || `API error ${response.status || ""}`.trim() || "Không tải được dữ liệu.");
  }
  return data;
}

async function apiFormData<T>(path: string, formData: FormData): Promise<T> {
  const adminToken = localStorage.getItem("admin_token");
  const headers: Record<string, string> = {};
  if (adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  }

  const responseText = await response.text();
  let data: any = {};
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(response.ok ? "API trả về JSON không hợp lệ." : `Upload error ${response.status}: ${responseText.slice(0, 180)}`);
    }
  }
  if (!response.ok || !data.success) {
    throw new Error(data?.message || `Upload error ${response.status || ""}`.trim() || "Khong upload duoc file.");
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

export function mapApiProduct(p: ApiProduct | any): Product {
  const imageUrls = p.images?.map((image: any) => image.imageUrl || image.image_url) ?? p.imageUrls ?? p.image_urls ?? [];
  const mainImage = p.mainImageUrl || p.main_image_url || imageUrls[0] || "/assets/images/dog-food.webp";
  const variants: ProductVariant[] | undefined = p.variants?.map((variant: any) => ({
    id: String(variant.id),
    sku: variant.sku || variant.sourceSkuId || variant.source_sku_id,
    label: variant.variantName || variant.variant_name || variant.label || variant.sku || "Phân loại",
    price: variant.priceText || variant.price_text || (variant.price ? String(variant.price) : ""),
    oldPrice: variant.oldPriceText || variant.old_price_text || (variant.originalPrice || variant.original_price ? String(variant.originalPrice || variant.original_price) : undefined),
    image: variant.imageUrl || variant.image_url || mainImage,
    stock: variant.stockQuantity || variant.stock_quantity,
    option1Name: variant.option1Name || variant.option1_name || undefined,
    option1Value: variant.option1Value || variant.option1_value || undefined,
    option2Name: variant.option2Name || variant.option2_name || undefined,
    option2Value: variant.option2Value || variant.option2_value || undefined,
    option3Name: variant.option3Name || variant.option3_name || undefined,
    option3Value: variant.option3Value || variant.option3_value || undefined,
  }));

  // Force reviews average and counts to look premium if reviews don't exist yet
  const rating = (p.ratingAverage == 4.8 || p.rating_average == 4.8 || p.reviewCount === 0 || p.review_count === 0) ? 5.0 : (p.ratingAverage || p.rating_average || 5.0);
  const reviews = p.reviewCount || p.review_count || 0;
  const sold = p.soldCount || p.sold_count || 0;

  return {
    id: p.slug || p.sourceProductId || p.source_product_id || String(p.id),
    backendId: p.id,
    sourceProductId: p.sourceProductId || p.source_product_id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice ? String(p.oldPrice) : (p.old_price ? `${Number(p.old_price).toLocaleString("vi-VN")}đ` : (p.originalPrice ? `${Number(p.originalPrice).toLocaleString("vi-VN")}đ` : (p.original_price ? `${Number(p.original_price).toLocaleString("vi-VN")}đ` : (variants?.find((v) => v.oldPrice)?.oldPrice || undefined)))),
    image: mainImage,
    images: Array.from(new Set([mainImage, ...imageUrls].filter(Boolean))),
    rating,
    reviews,
    sold,
    category: p.categoryName || p.category_name || undefined,
    brand: p.brand || undefined,
    description: p.description || p.shortDescription || p.short_description || undefined,
    ingredients: p.ingredients || undefined,
    guide: p.guide || p.feeding_guide || undefined,
    productUrl: p.sourceProductUrl || p.source_product_url || undefined,
    tiktokUrl: p.sourceProductUrl || p.source_product_url || undefined,
    source: p.sourcePlatform || p.source_platform,
    sellerId: p.sourceSellerId || p.source_seller_id || undefined,
    currency: p.currency,
    stock: p.totalStock || p.total_stock,
    variants,
    options: p.options || undefined,
    productType: p.productType || p.product_type || undefined,
    petType: p.petType || p.pet_type || undefined,
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

export async function searchProducts(keyword: string, limit = 8, signal?: AbortSignal) {
  const params = new URLSearchParams();
  params.set("q", keyword);
  params.set("limit", String(limit));

  return apiJson<ProductListResponse>(`/api/products?${params.toString()}`, {
    signal,
  });
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
  id: number;
  parentId: number | null;
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
    provinceCode: string;
    provinceName: string;
    wardCode: string;
    wardName: string;
    addressLine: string;
    note?: string;
  };
  items: Array<{
    productId: number;
    variantId?: number | null;
    quantity: number;
  }>;
  paymentMethod: "cod" | "bank_transfer";
  couponCode?: string;
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
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
  changed_by: string;
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
  customer_name?: string;
  customer_phone?: string;
  coupon_code?: string | null;
  couponCode?: string | null;
  customer_email?: string | null;
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

export type ValidateCouponPayload = {
  code: string;
  subtotal: number;
  customerPhone?: string;
};

export type ValidateCouponResponse = {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    code: string;
    name: string;
    description: string;
    discountType: "fixed" | "percent";
    discountValue: number;
    discountAmount: number;
  };
};

export async function validateCoupon(payload: ValidateCouponPayload): Promise<ValidateCouponResponse> {
  return apiJson<ValidateCouponResponse>("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

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

export type AdminProductListParams = {
  q?: string;
  category?: string;
  petType?: string;
  productType?: string;
  isActive?: number | string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock" | "";
  page?: number;
  limit?: number;
  sort?: string;
};

export type AdminProductVariantPayload = {
  id?: number | null;
  sku: string;
  variantName?: string;
  option1Name?: string | null;
  option1Value?: string | null;
  option2Name?: string | null;
  option2Value?: string | null;
  option3Name?: string | null;
  option3Value?: string | null;
  price: number;
  originalPrice?: number | null;
  stockQuantity: number;
  isActive?: boolean;
  hasOrderHistory?: boolean;
};

export type AdminProductImagePayload = {
  id?: number | null;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type AdminProductSavePayload = {
  id?: number | null;
  name: string;
  slug?: string;
  brand?: string;
  shortDescription?: string;
  description?: string;
  ingredients?: string;
  guide?: string;
  categoryId: number | string;
  petType: "cat" | "dog" | "both" | "other";
  productType: string;
  isActive?: boolean | number;
  isFeatured?: boolean | number;
  variants: AdminProductVariantPayload[];
  galleryImages: AdminProductImagePayload[];
  mainImageUrl?: string;
};

export async function getAdminProducts(params: AdminProductListParams = {}): Promise<ProductListResponse> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.set(key, String(value));
    }
  });
  return apiJson<ProductListResponse>(`/api/admin/products?${queryParams.toString()}`);
}

export async function getAdminProductDetail(id: number | string): Promise<ProductDetailResponse> {
  return apiJson<ProductDetailResponse>(`/api/admin/products/detail?id=${id}`);
}

export async function saveAdminProduct(payload: AdminProductSavePayload): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiJson<{ success: boolean; data: { id: number }; message: string }>("/api/admin/products/save", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function toggleAdminProductActive(id: number, isActive: number): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/products/toggle-active", {
    method: "POST",
    body: JSON.stringify({ id, isActive })
  });
}

export async function reclassifyAdminProducts(): Promise<{ success: boolean; data: any; message: string }> {
  return apiJson<{ success: boolean; data: any; message: string }>("/api/admin/products/reclassify", {
    method: "POST"
  });
}

export const deleteAdminProduct = async (id: number | string): Promise<{ success: boolean; message: string }> => {
  return apiJson<{ success: boolean; message: string }>(`/api/admin/products/${id}`, {
    method: "DELETE"
  });
};

export async function uploadAdminProductImage(
  file: File
): Promise<{ success: boolean; data: { url: string; filename: string }; message?: string }> {
  const adminToken = localStorage.getItem("admin_token");
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/admin/products/upload-image`, {
    method: "POST",
    headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
    body: form,
  });

  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  }

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Upload ảnh thất bại.");
  }
  return data;
}

// ------------------------------------------------------------------
// Admin Categories API
// ------------------------------------------------------------------

export type AdminCategory = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  parentName: string | null;
  productCount: number;
  childrenCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategoryPayload = {
  id?: number;
  parentId?: number | null;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
};

export async function getAdminCategories(): Promise<{ success: boolean; data: AdminCategory[] }> {
  return apiJson<{ success: boolean; data: AdminCategory[] }>("/api/admin/categories");
}

export async function saveAdminCategory(payload: AdminCategoryPayload): Promise<{ success: boolean; data: { id: number }; message?: string }> {
  return apiJson<{ success: boolean; data: { id: number }; message?: string }>("/api/admin/categories/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function toggleAdminCategoryActive(id: number, isActive: boolean): Promise<{ success: boolean; message?: string }> {
  return apiJson<{ success: boolean; message?: string }>("/api/admin/categories/toggle-active", {
    method: "POST",
    body: JSON.stringify({ id, isActive }),
  });
}

export async function deleteAdminCategory(id: number): Promise<{ success: boolean; message?: string }> {
  return apiJson<{ success: boolean; message?: string }>(`/api/admin/categories/${id}`, {
    method: "DELETE",
  });
}
