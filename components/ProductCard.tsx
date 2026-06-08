"use client";

import { Image } from "@/components/Image";
import { Link } from "react-router-dom";
import { Star, Heart, Crown, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/types/store";

interface ProductCardProps {
  product: Product;
  isBestSeller?: boolean;
  isFavorite?: boolean;
  index?: number;
}

function getPriceValue(price: string) {
  return Number(price.replace(/\D/g, "")) || 0;
}

function formatCompactSold(sold: number) {
  if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k+`;
  return `${Math.max(sold, 120)}+`;
}

export function ProductCard({ product, isBestSeller, isFavorite, index = 0 }: ProductCardProps) {
  const hasDiscount = !!product.oldPrice;
  const priceValue = getPriceValue(product.price);
  const oldPriceValue = product.oldPrice ? getPriceValue(product.oldPrice) : 0;
  const discountPercent = hasDiscount && oldPriceValue > priceValue
    ? Math.round((1 - priceValue / oldPriceValue) * 100)
    : 0;

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
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1.5 shadow-lg">
            <span className="text-xs font-black text-white">-{discountPercent}%</span>
          </div>
        )}

        {/* Badge Section */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          {isBestSeller && (
            <div className="flex items-center gap-1 rounded-lg bg-forest px-2.5 py-1.5 shadow-lg">
              <Crown size={11} className="fill-yellow-300 text-yellow-300" />
              <span className="text-[10px] font-black uppercase text-white">Best</span>
            </div>
          )}
          {isFavorite && !isBestSeller && (
            <div className="flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1.5 shadow-lg">
              <Heart size={11} className="fill-white text-white" />
            </div>
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
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <div className="mb-2">
          <span className="inline-block rounded-md bg-forest/5 px-2 py-1 text-[10px] font-bold text-forest">
            {product.category?.split('>').pop()?.trim() || 'Sản phẩm'}
          </span>
        </div>

        {/* Product Name */}
        <Link to={`/product/${product.id}`} className="mb-3 block flex-1">
          <h3
            className="line-clamp-2 text-sm font-bold leading-snug text-ink transition-colors hover:text-forest"
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

        {/* Price Section */}
        <div className="mb-4 flex items-end gap-2">
          <div className="text-2xl font-black text-forest">{product.price}</div>
          {product.oldPrice && (
            <div className="mb-0.5 text-sm font-semibold text-ink/40 line-through">{product.oldPrice}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-forest bg-white font-bold text-forest transition-colors hover:bg-forest/5"
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
          >
            <ShoppingCart size={16} />
            <span className="text-xs">Thêm</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex h-10 flex-1 items-center justify-center rounded-xl bg-forest font-bold text-white transition-colors hover:bg-forest-700"
            aria-label={`Mua ngay ${product.name}`}
          >
            <span className="text-xs">Mua ngay</span>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
