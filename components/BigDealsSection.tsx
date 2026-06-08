"use client";

import { Image } from "@/components/Image";
import { ChevronRight, ShoppingCart, Star, PawPrint, Heart } from "lucide-react";
import { getSaleProducts } from "@/data/store";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";

const categories = [
  { id: "all", label: "Tất cả", icon: PawPrint },
  { id: "food", label: "Thức ăn", icon: PawPrint },
  { id: "accessories", label: "Phụ kiện", icon: PawPrint },
  { id: "care", label: "Chăm sóc", icon: PawPrint },
  { id: "toys", label: "Đồ chơi", icon: PawPrint }
];

export function BigDealsSection() {
  const saleProducts = getSaleProducts(12); // Get 8+ products
  
  return (
    <section className="relative bg-gradient-to-b from-[#FFF9F5] to-[#FFF2F0] py-10 sm:py-12 lg:py-16">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="relative">
          <MotionItem {...motionItemProps} className="mb-6 sm:mb-8">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <PawPrint size={16} className="fill-[#6B21A8] text-[#6B21A8]" />
                <p className="text-xs font-black uppercase tracking-wide text-[#6B21A8]/75">Ưu đãi</p>
              </div>
              <h2 className="text-2xl font-extrabold text-[#2B1226] sm:text-3xl lg:text-5xl">
                Ưu đãi khủng — Quà tặng & Voucher
              </h2>
              <p className="mt-2 text-sm text-[#2B1226]/60 sm:text-base">Ưu đãi độc quyền, giảm sâu và quà tặng hấp dẫn.</p>
            </div>
          </MotionItem>

          {/* Products Grid - 8 products */}
          <MotionItem {...motionItemProps}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
              {saleProducts.slice(0, 8).map((product, i) => {
                const discount = product.oldPrice 
                  ? Math.round((1 - parseFloat(product.price.replace(/\D/g, '')) / parseFloat(product.oldPrice!.replace(/\D/g, ''))) * 100) 
                  : 0;
                
                return (
                  <article key={`sale-${i}`} className="group relative h-full rounded-2xl bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-5">
                    {/* Discount badge */}
                    <div className="absolute left-2 top-2 z-10 rounded-lg bg-[#FF4D4F] px-2.5 py-1 text-xs font-extrabold text-white shadow-md sm:left-3 sm:top-3">
                      -{discount}%
                    </div>

                    {/* Heart icon - top right */}
                    <div className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white shadow-md sm:right-3 sm:top-3 sm:h-10 sm:w-10">
                      <Heart size={15} className="text-[#EF4444] sm:h-[18px] sm:w-[18px]" />
                    </div>

                    {/* Product image */}
                    <div className="relative mt-6 grid aspect-square place-items-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 sm:mt-8">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        width={200} 
                        height={200} 
                        className="h-32 w-32 object-contain transition duration-300 group-hover:scale-110 sm:h-40 sm:w-40" 
                      />
                    </div>

                    {/* Product info */}
                    <div className="mt-3 sm:mt-4">
                      <h4 className="min-h-[40px] text-xs font-bold leading-tight text-[#2B1226] line-clamp-2 sm:min-h-[44px] sm:text-sm">
                        {product.name}
                      </h4>

                      {/* Rating */}
                      <div className="mt-2 flex items-center gap-1 sm:mt-2.5">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star 
                            key={starIndex} 
                            size={11} 
                            fill={starIndex < Math.round(product.rating) ? "#F59E0B" : "none"}
                            className="text-amber-500 sm:h-[13px] sm:w-[13px]"
                            strokeWidth={2}
                          />
                        ))}
                        <span className="ml-1 text-[10px] font-semibold text-[#2B1226]/50 sm:text-xs">
                          ({product.reviews})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mt-2 flex items-center gap-2 sm:mt-3">
                        <div className="text-base font-extrabold text-[#EF4444] sm:text-lg">{product.price}</div>
                        {product.oldPrice && (
                          <div className="text-[10px] font-semibold text-[#2B1226]/40 line-through sm:text-xs">
                            {product.oldPrice}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 flex gap-1.5 sm:mt-4 sm:gap-2">
                        <button 
                          className="flex flex-1 items-center justify-center rounded-full border-2 border-[#0D4B3A] bg-white px-2 py-2 text-[10px] font-bold text-[#0D4B3A] transition hover:bg-[#0D4B3A] hover:text-white active:scale-95 sm:px-3 sm:py-2.5 sm:text-xs" 
                          aria-label={`Thêm ${product.name}`}
                        >
                          <ShoppingCart size={14} className="sm:mr-1" />
                          <span className="hidden sm:inline">Thêm</span>
                        </button>
                        <button 
                          className="flex flex-1 items-center justify-center rounded-full bg-[#0D4B3A] px-2 py-2 text-[10px] font-bold text-white transition hover:bg-[#0A3A2D] active:scale-95 sm:px-3 sm:py-2.5 sm:text-xs" 
                          aria-label={`Mua ${product.name}`}
                        >
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </MotionItem>

          {/* View More Button */}
          <MotionItem {...motionItemProps} className="mt-8 flex justify-center lg:mt-10">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#0D4B3A] px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-[#0A3A2D] hover:shadow-lg active:scale-95">
              <span>Xem tất cả ưu đãi</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </MotionItem>
        </MotionSection>
      </div>
    </section>
  );
}
