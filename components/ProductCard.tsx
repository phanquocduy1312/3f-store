"use client";

import { Image } from "@/components/Image";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { SaleBadge } from "@/components/SaleBadge";
import { NewBadge } from "@/components/NewBadge";
import type { Product } from "@/types/store";

interface ProductCardProps {
  product: Product;
  isBestSeller?: boolean;
  isFavorite?: boolean;
  isNew?: boolean;
  index?: number;
}

function getPriceValue(price: string) {
  return Number(price.replace(/\D/g, "")) || 0;
}

function formatCompactSold(sold: number) {
  if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k+`;
  return `${Math.max(sold, 120)}+`;
}

export function ProductCard({ product, isNew, index = 0 }: ProductCardProps) {
  const hasDiscount = !!product.oldPrice;
  const priceValue = getPriceValue(product.price);
  const oldPriceValue = product.oldPrice ? getPriceValue(product.oldPrice) : 0;
  const discountPercent = hasDiscount && oldPriceValue > priceValue
    ? Math.round((1 - priceValue / oldPriceValue) * 100)
    : 0;

  // For demonstration, assign some products as "New" if not explicitly passed
  const showNewBadge = isNew !== undefined ? isNew : (index === 1 || index === 4 || index === 7);

  return (
    <motion.article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-forest/8 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-forest/15"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Image Section */}
      <Link
        to={`/product/${product.id}`}
        className="relative block overflow-hidden bg-gradient-to-b from-cream/50 to-cream/20"
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
        <div className="relative aspect-square p-4">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-2">

        {/* Product Name */}
        <Link to={`/product/${product.id}`} className="mb-2 block">
          <h3
            className="line-clamp-2 text-sm font-bold leading-snug text-ink transition-colors hover:text-forest min-h-[40px]"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating & Sold */}
        <div className="mb-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Star size={12} fill="#F59E0B" className="text-amber-500" />
            <span className="font-bold text-ink/80">{product.rating}</span>
          </div>
          <span className="font-semibold text-ink/50">Đã bán {formatCompactSold(product.sold)}</span>
        </div>

        {/* Bottom Section (Price & Buttons) glued to bottom */}
        <div className="mt-auto flex flex-col justify-end">
          {/* Price Section */}
          <div className="mb-2 sm:mb-3 flex items-end gap-1.5 sm:gap-2 whitespace-nowrap">
            <div className="text-[1.1rem] sm:text-[1.25rem] font-black text-forest leading-none">{product.price}</div>
            {product.oldPrice && (
              <div className="mb-0.5 text-[10px] sm:text-xs font-semibold text-ink/40 line-through">{product.oldPrice}</div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 sm:gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex h-8 w-8 sm:h-9 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-forest sm:border-[1.5px] bg-white text-forest transition-colors hover:bg-forest/5"
              aria-label={`Thêm ${product.name} vào giỏ hàng`}
            >
              <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex h-8 sm:h-9 flex-1 items-center justify-center rounded-lg bg-forest px-2 font-bold text-white transition-colors hover:bg-[rgb(var(--color-primary-dark))]"
              aria-label={`Mua ngay ${product.name}`}
            >
              <span className="text-[11px] sm:text-xs whitespace-nowrap">Mua ngay</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
