"use client";

import { Image } from "@/components/Image";
import { Star, PawPrint, Heart, Crown, ShoppingCart } from "lucide-react";
import type { Product } from "@/types/store";

interface ProductCardProps {
  product: Product;
  isBestSeller?: boolean;
  isFavorite?: boolean;
}

export function ProductCard({ product, isBestSeller, isFavorite }: ProductCardProps) {
  const hasDiscount = !!product.oldPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price.replace(/\D/g, '')) / parseFloat(product.oldPrice!.replace(/\D/g, ''))) * 100)
    : 0;

  return (
    <article className="group relative h-full rounded-3xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F2ED] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(16,133,79,0.12)]">
      
      {/* Badge Best Seller or Favorite - top left */}
      {isBestSeller && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[#10854F] px-3 py-1.5 shadow-md">
          <Crown size={12} className="fill-[#FFD700] text-[#FFD700]" />
          <span className="text-[10px] font-black uppercase tracking-wide text-white">Best Seller</span>
        </div>
      )}
      {isFavorite && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[#EF4444] px-3 py-1.5 shadow-md">
          <Heart size={12} className="fill-white text-white" />
          <span className="text-[10px] font-black uppercase tracking-wide text-white">Yêu thích</span>
        </div>
      )}

      {/* Paw icon circle - top right */}
      <div className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white shadow-md">
        <PawPrint size={18} className="fill-[#10854F] text-[#10854F]" />
      </div>

      {/* Product image */}
      <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-[#FAFAFA] p-3 shadow-sm">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition duration-300 group-hover:scale-[1.05]"
        />
      </div>

      {/* Product info */}
      <div className="mt-4">
        <h3 className="min-h-[44px] text-sm font-black leading-tight text-[#221A12]">
          {product.name}
        </h3>

        {/* Star rating and sold count - same line */}
        <div className="mt-2.5 flex items-center gap-3 text-[#E49D22]">
          <div className="flex items-center gap-1">
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
          <span className="text-xs text-[#221A12]/60">
            Đã bán: <span className="font-bold text-[#221A12]">{product.sold}</span>
          </span>
        </div>

        {/* Price row: new price + old price + discount badge - ONE LINE */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-black text-[#10854F] sm:text-xl">{product.price}</span>
          {product.oldPrice && (
            <span className="text-xs font-semibold text-[#221A12]/40 line-through">{product.oldPrice}</span>
          )}
          {hasDiscount && (
            <span className="rounded-md bg-[#EF4444] px-2 py-0.5 text-[10px] font-black text-white">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Action buttons: Add to cart + Buy now */}
        <div className="mt-4 flex gap-2">
          <button 
            className="flex flex-1 items-center justify-center rounded-full border-2 border-[#10854F] bg-white px-3 py-2.5 text-xs font-black text-[#10854F] transition hover:bg-[#10854F] hover:text-white active:scale-95 whitespace-nowrap" 
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
          >
            <span>Thêm vào giỏ</span>
          </button>
          <button 
            className="flex flex-1 items-center justify-center rounded-full bg-[#10854F] px-3 py-2.5 text-xs font-black text-white transition hover:bg-[#0D7344] active:scale-95 whitespace-nowrap" 
            aria-label={`Mua ngay ${product.name}`}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </article>
  );
}
