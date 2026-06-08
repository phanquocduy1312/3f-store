"use client";

import { Image } from "@/components/Image";
import { Link } from "react-router-dom";
import { Star, PawPrint, Heart, Crown, ShoppingCart, ShieldCheck, Sparkles, Truck } from "lucide-react";
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

function getProductMeta(product: Product) {
  const source = `${product.name} ${product.category ?? ""}`.toLowerCase();
  const isWetFood = /pate|mousse|ướt|lon/.test(source);
  const isKitten = /con|kitten|junior|12 tháng/.test(source);
  const hasSeafood = /cá|salmon|ngừ|hải sản/.test(source);
  const hasChicken = /gà|chicken/.test(source);

  const foodType = isWetFood ? "Thức ăn ướt" : "Thức ăn khô";
  const lifeStage = isKitten ? "Mèo con" : "Mọi lứa tuổi";
  const benefit = hasSeafood ? "Da lông khỏe" : hasChicken ? "Giàu đạm" : "Dễ tiêu hóa";

  return { foodType, lifeStage, benefit };
}

export function ProductCard({ product, isBestSeller, isFavorite, index = 0 }: ProductCardProps) {
  const hasDiscount = !!product.oldPrice;
  const priceValue = getPriceValue(product.price);
  const oldPriceValue = product.oldPrice ? getPriceValue(product.oldPrice) : 0;
  const discountPercent = hasDiscount && oldPriceValue > priceValue
    ? Math.round((1 - priceValue / oldPriceValue) * 100)
    : 0;
  const meta = getProductMeta(product);

  return (
    <motion.article
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#E7EFEA] bg-white p-4 shadow-[0_14px_40px_rgba(16,24,40,0.06)] transition-shadow duration-300 hover:shadow-[0_24px_56px_rgba(16,24,40,0.11)]"
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isBestSeller && (
            <motion.div
              className="inline-flex items-center gap-1.5 rounded-full bg-[#10854F] px-3 py-1.5 shadow-sm"
              initial={{ scale: 0.82, y: -8 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
            >
              <Crown size={12} className="fill-[#FFD761] text-[#FFD761]" />
              <span className="text-[10px] font-black uppercase tracking-wide text-white">Best Seller</span>
            </motion.div>
          )}
          {isFavorite && !isBestSeller && (
            <motion.div
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EF4444] px-3 py-1.5 shadow-sm"
              initial={{ scale: 0.82, y: -8 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
            >
              <Heart size={12} className="fill-white text-white" />
              <span className="text-[10px] font-black uppercase tracking-wide text-white">Yêu thích</span>
            </motion.div>
          )}
          {!isBestSeller && !isFavorite && (
            <span className="rounded-full bg-[#F3F7F3] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#4A6A57]">
              Top #{index + 1}
            </span>
          )}
        </div>

        <motion.button
          className="grid h-10 w-10 place-items-center rounded-full border border-[#E6EEE9] bg-white text-[#10854F] shadow-sm"
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
          transition={{ duration: 0.45 }}
          aria-label={`Lưu ${product.name}`}
        >
          <PawPrint size={17} className="fill-current" />
        </motion.button>
      </div>

      <Link
        to={`/product/${product.id}`}
        className="relative block overflow-hidden rounded-[1.7rem] border border-[#EEF3EF] bg-[linear-gradient(180deg,#FBFCFA_0%,#F3F7F2_100%)] p-4"
      >
        {hasDiscount && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-[#132117] px-2.5 py-1 text-[10px] font-black text-white">
            -{discountPercent}%
          </div>
        )}
        <div className="absolute inset-x-10 top-5 h-16 rounded-full bg-emerald-100/80 blur-2xl" />
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-3 transition duration-300 group-hover:scale-[1.05]"
        />
        <div className="relative aspect-[4/3]" />
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#EEF7F1] px-2.5 py-1 text-[10px] font-bold text-[#1F6B43]">
          {meta.foodType}
        </span>
        <span className="rounded-full bg-[#F5F7F4] px-2.5 py-1 text-[10px] font-bold text-[#5A645B]">
          {meta.lifeStage}
        </span>
      </div>

      <div className="mt-3 flex-1">
        <Link to={`/product/${product.id}`} className="block">
          <h3
            className="min-h-[52px] text-[15px] font-black leading-6 text-[#221A12] line-clamp-2 transition-colors hover:text-[#10854F]"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-[#E49D22]">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <Star
                key={starIndex}
                size={13}
                fill={starIndex < Math.round(product.rating) ? "currentColor" : "none"}
                strokeWidth={2}
              />
            ))}
            <span className="ml-1 text-xs font-bold text-[#221A12]/60">({product.reviews})</span>
          </div>
          <span className="text-xs font-semibold text-[#221A12]/52">Đã bán {formatCompactSold(product.sold)}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[#4D5D52]">
          <ShieldCheck size={13} className="text-[#10854F]" />
          <span>{meta.benefit}</span>
          <span className="text-[#221A12]/20">•</span>
          <Truck size={13} className="text-[#10854F]" />
          <span>Giao nhanh</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#EEF2ED] pt-4">
          <div>
            <div className="text-[1.7rem] font-black leading-none text-[#10854F]">{product.price}</div>
            {product.oldPrice && (
              <div className="mt-1 text-[12px] font-semibold text-[#221A12]/40 line-through">{product.oldPrice}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#221A12]/32">Giá trị thêm</div>
            <div className="mt-1 inline-flex items-center gap-1 text-[12px] font-black text-[#1F6B43]">
              <Sparkles size={12} />
              {hasDiscount ? `Tiết kiệm ${Math.max(oldPriceValue - priceValue, 0).toLocaleString("vi-VN")}đ` : "Hàng chọn lọc"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <motion.button
          whileTap={{ scale: 0.94 }}
          className="flex items-center justify-center gap-2 rounded-full border border-[#10854F]/18 bg-[#F6FBF7] px-3 py-3 text-xs font-black text-[#10854F] transition hover:bg-[#EAF6EE]"
          aria-label={`Thêm ${product.name} vào giỏ hàng`}
        >
          <ShoppingCart size={15} />
          <span>Thêm giỏ</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          className="flex items-center justify-center rounded-full bg-[#10854F] px-3 py-3 text-xs font-black text-white transition hover:bg-[#0D7344]"
          aria-label={`Mua ngay ${product.name}`}
        >
          Mua ngay
        </motion.button>
      </div>
    </motion.article>
  );
}
