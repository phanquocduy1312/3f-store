import type { LucideIcon } from "lucide-react";

export type Category = {
  title: string;
  image: string;
  tone: string;
};

/** A single purchasable variant of a product (e.g. different size, flavor, color). */
export type ProductVariant = {
  id: string;          // SKU format: "{productId}-{index}"
  sku?: string;
  label: string;       // Human-readable label e.g. "Sữa - 1 gói"
  price: string;       // Selling price e.g. "74.900đ"
  oldPrice?: string;   // Original price before discount
  image: string;       // Variant-specific image URL
  stock?: number;      // Available stock (0 = available on demand)
  option1Name?: string;
  option1Value?: string;
  option2Name?: string;
  option2Value?: string;
  option3Name?: string;
  option3Value?: string;
};

export type Product = {
  id: string;
  backendId?: number;
  sourceProductId?: string;
  name: string;
  slug?: string;
  /** Lowest / default price (formatted, e.g. "56.900đ") */
  price: string;
  /** Crossed-out original price if on sale */
  oldPrice?: string;
  /** Primary/thumbnail image */
  image: string;
  /** All variant images (deduplicated) */
  images?: string[];
  rating: number;
  reviews: number;
  sold: number;
  category?: string;
  brand?: string;
  description?: string;
  ingredients?: string;
  guide?: string;
  shopeeUrl?: string;
  productUrl?: string;
  tiktokUrl?: string;
  source?: "shopee" | "tiktok-shop" | string;
  sellerId?: string;
  currency?: string;
  /** Available stock for non-variant products */
  stock?: number;
  /** Purchasable variants (size, flavor, color, etc.) */
  variants?: ProductVariant[];
  /** Options groupings (e.g. Kích cỡ, Hương vị) */
  options?: Array<{ name: string; values: string[] }>;
  productType?: string;
  petType?: string;
};

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type BlogPost = {
  title: string;
  image: string;
  date: string;
  category: string;
};
