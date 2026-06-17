import { API_BASE_URL } from "@/src/config/api";
import type { Product, ProductVariant } from "@/types/store";

export type ProductSort = "newest" | "price_asc" | "price_desc" | "popular";

export type ProductListParams = {
  q?: string;
  category?: string;
  petType?: string;
  productType?: string;
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data?.message || "Khong tai duoc du lieu san pham.");
  }
  return data;
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
