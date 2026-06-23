"use client";

import { Image } from "@/components/Image";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { SaleBadge } from "@/components/SaleBadge";
import { NewBadge } from "@/components/NewBadge";
import type { Product } from "@/types/store";
import { useWishlist } from "@/src/context/WishlistContext";

interface ProductCardProps {
  product: Product;
  isBestSeller?: boolean;
  isFavorite?: boolean;
  isNew?: boolean;
  index?: number;
  showBuyNow?: boolean;
}

function getPriceValue(price: string) {
  if (!price) return 0;
  const cleanPrice = price.split("-")[0].trim();
  return Number(cleanPrice.replace(/\D/g, "")) || 0;
}

function formatCompactSold(sold: number) {
  if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k`;
  return `${sold}`;
}

function getProductCategoryLabel(product: Product) {
  const text = `${product.name} ${product.category ?? ""}`.toLowerCase();
  const isWetFood = /pate|mousse|lon|ướt/.test(text);
  return isWetFood ? "Thức ăn ướt" : "Thức ăn khô";
}

export function ProductCard({ product, isNew, index = 0, showBuyNow = true }: ProductCardProps) {
  const { toggleWishlist, isFavorite } = useWishlist();
  const isFav = isFavorite(product.id) || (product.backendId ? isFavorite(product.backendId) : false);

  const priceValue = getPriceValue(product.price);
  const oldPriceValue = product.oldPrice ? getPriceValue(product.oldPrice) : 0;
  const hasDiscount = !!product.oldPrice && oldPriceValue > priceValue;
  const discountPercent = hasDiscount
    ? Math.round((1 - priceValue / oldPriceValue) * 100)
    : 0;

  // Use explicit isNew if provided, otherwise check logic: sold < 50 and rating > 4.5
  const showNewBadge = isNew !== undefined ? isNew : (product.sold < 50 && product.rating > 4.5);
  const brandName = product.brand?.toUpperCase() || "KHÁC";
  const linkId = product.slug || product.id;

  const displayRating = (!product.rating || product.rating === 4.8 || !product.reviews || product.reviews === 0) ? 5.0 : product.rating;

  return (
    <motion.article
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[24px] border border-[rgb(var(--color-border))] bg-white p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(16,133,79,0.15)] hover:border-[rgb(var(--color-primary))]/30"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Animated Gradient Glow Behind Card Content */}
      <div className="pointer-events-none absolute -inset-10 -z-10 bg-gradient-to-br from-[rgb(var(--color-primary))]/0 via-[rgb(var(--color-primary))]/5 to-[#F59E0B]/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100 blur-2xl" />

      {/* Sweeping Light Shimmer Effect */}
      <div className="pointer-events-none absolute inset-0 z-30 -translate-x-[150%] -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-all duration-1000 ease-in-out group-hover:translate-x-[150%] group-hover:opacity-100" />

      {/* Wishlist Heart Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="absolute right-2 sm:right-3 top-2 sm:top-3 z-20 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-white shadow-md border border-[#F5F5F5] transition-all duration-200 hover:scale-110 active:scale-95 sm:opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100"
        aria-label={isFav ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
      >
        <Heart
          size={14}
          className={`sm:w-4 sm:h-4 transition-colors duration-200 ${
            isFav ? "fill-red-500 text-red-500" : "text-[rgb(var(--color-ink))]/30 hover:text-red-500"
          }`}
        />
      </motion.button>

      <div className="flex flex-col h-full">
        {/* Image Section */}
        <Link
          to={`/product/${linkId}`}
          className="block relative mb-3 sm:mb-4 aspect-square w-full overflow-hidden rounded-xl sm:rounded-[16px] bg-[rgb(var(--color-surface-soft))] p-2 sm:p-3 transition-colors duration-300 group-hover:bg-[rgb(var(--color-surface-soft))]"
        >
          {/* Top Left Badges (Sale & New) */}
          <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-2 origin-top-left scale-[0.25] sm:scale-[0.28] pointer-events-none">
            {hasDiscount && (
              <SaleBadge discount={discountPercent} />
            )}
            {showNewBadge && (
              <NewBadge />
            )}
          </div>

          {/* Product Image */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.12] mix-blend-multiply"
          />
        </Link>

        {/* Content Section */}
        <div className="space-y-0.5 sm:space-y-1.5 flex flex-col justify-between flex-1 min-w-0 overflow-hidden">
          <div className="min-w-0">
            {/* Category Pill */}
            <div className="mb-1 sm:mb-1.5 mt-0.5">
              <span className="inline-block rounded-full bg-[rgb(var(--color-primary-soft))] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[rgb(var(--color-primary))]">
                {getProductCategoryLabel(product)}
              </span>
            </div>
            {/* Product Name */}
            <Link to={`/product/${linkId}`} className="block">
              <h3
                className="text-[11px] sm:text-[13px] font-extrabold leading-tight sm:leading-[18px] text-[rgb(var(--color-ink))] line-clamp-2 min-h-[29px] sm:min-h-[36px] hover:text-[rgb(var(--color-primary))] transition-colors break-words"
                title={product.name}
              >
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="mt-1.5 sm:mt-2 min-w-0">
            {/* Rating & Sold */}
            <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5 min-w-0 overflow-hidden">
              <div className="flex items-center gap-0.5 text-[#F59E0B] shrink-0">
                <Star size={11} fill="currentColor" strokeWidth={2.5} className="sm:w-3 sm:h-3" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[rgb(var(--color-ink))]/60 truncate flex-1 min-w-0">
                {displayRating.toFixed(1)}
                <span className="mx-1 sm:mx-1.5 text-[rgb(var(--color-ink))]/20">•</span>
                Đã bán {formatCompactSold(product.sold)}
              </span>
            </div>

            {/* Action Buttons */}
            {showBuyNow ? (
              <div className="mt-auto flex flex-col justify-end">
                {/* Price Section */}
                <div className="mb-2 sm:mb-3 flex items-end gap-1.5 sm:gap-2 whitespace-nowrap">
                  <div className="text-[1.1rem] sm:text-[1.25rem] font-black text-[rgb(var(--color-primary))] leading-none">{product.price}</div>
                  {hasDiscount && (
                    <div className="mb-0.5 text-[10px] sm:text-xs font-semibold text-gray-400 line-through">{product.oldPrice}</div>
                  )}
                </div>
                {/* Buttons row */}
                <div className="flex gap-1.5 sm:gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.dispatchEvent(
                        new CustomEvent("open-quick-add", {
                          detail: { productId: product.id, intent: "add-to-cart" },
                        })
                      );
                    }}
                    className="flex h-8 w-8 sm:h-9 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--color-primary))] sm:border-[1.5px] bg-white text-[rgb(var(--color-primary))] transition-colors hover:bg-[rgb(var(--color-primary-soft))]"
                    aria-label={`Thêm ${product.name} vào giỏ hàng`}
                  >
                    <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.dispatchEvent(
                        new CustomEvent("open-quick-add", {
                          detail: { productId: product.id, intent: "buy-now" },
                        })
                      );
                    }}
                    className="flex h-8 sm:h-9 flex-1 items-center justify-center rounded-lg bg-[rgb(var(--color-primary))] px-2 font-bold text-white transition-colors hover:bg-[rgb(var(--color-primary-dark))]"
                    aria-label={`Mua ngay ${product.name}`}
                  >
                    <span className="text-[11px] sm:text-xs whitespace-nowrap">Mua ngay</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              /* Price & Cart row (Default Catalog Style) */
              <div className="flex items-end justify-between border-t border-[#F2EFE9] pt-2 sm:pt-3 mt-1 min-w-0 gap-2">
                <div className="flex flex-col gap-0 sm:gap-0.5 min-w-0 flex-1 overflow-hidden">
                  {hasDiscount && (
                    <div className="text-[10px] sm:text-[11px] font-bold text-gray-400 line-through truncate">
                      {product.oldPrice}
                    </div>
                  )}
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
                    <span className="text-sm sm:text-[1.1rem] font-black text-[rgb(var(--color-primary))] truncate">{product.price}</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.dispatchEvent(
                      new CustomEvent("open-quick-add", {
                        detail: { productId: product.id, intent: "add-to-cart" },
                      })
                    );
                  }}
                  title="Thêm vào giỏ"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))] shadow-sm transition-all hover:scale-105 hover:bg-[rgb(var(--color-primary))] hover:text-white active:scale-95"
                >
                  <ShoppingCart size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
