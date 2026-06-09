"use client";

import { Image } from "@/components/Image";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, PawPrint, CheckCircle, Heart, Crown } from "lucide-react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getProductsByCategory } from "@/data/store";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { useState } from "react";

const categories = [
  { id: "all", label: "Tất cả", icon: PawPrint },
  { id: "food", label: "Thức ăn", icon: PawPrint },
  { id: "accessories", label: "Phụ kiện", icon: PawPrint },
  { id: "care", label: "Chăm sóc", icon: PawPrint },
  { id: "toys", label: "Đồ chơi", icon: PawPrint }
];

export function DealsSection() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <section className="relative bg-white py-8 sm:py-12">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="relative">
          {/* Header with title and navigation arrows */}
          <MotionItem {...motionItemProps} className="mb-6 flex items-start justify-between gap-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <PawPrint size={16} className="fill-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]" />
            <p className="text-xs font-black uppercase tracking-wide text-[rgb(var(--color-primary))]/75">Sản phẩm nổi bật</p>
          </div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-[rgb(var(--color-ink))] sm:text-4xl">
            Sản phẩm được yêu thích nhất
            <span className="text-3xl">❤️</span>
          </h2>
          <p className="mt-2 text-sm text-[rgb(var(--color-ink))]/60">
            Những sản phẩm chất lượng được hàng ngàn Boss và Sen tin dùng
          </p>
        </div>
        <div className="hidden gap-3 sm:flex">
          <button 
            className="product-prev grid h-12 w-12 place-items-center rounded-full border-2 border-[rgb(var(--color-primary))] bg-white text-[rgb(var(--color-primary))] shadow-sm transition hover:bg-[rgb(var(--color-primary))] hover:text-white" 
            aria-label="Sản phẩm trước"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button 
            className="product-next grid h-12 w-12 place-items-center rounded-full bg-[rgb(var(--color-primary))] text-white shadow-sm transition hover:bg-[rgb(var(--color-primary-dark))]" 
            aria-label="Sản phẩm tiếp theo"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </MotionItem>

          {/* Category tabs */}
          <MotionItem {...motionItemProps} className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition whitespace-nowrap ${
                isActive
                  ? "bg-[rgb(var(--color-primary))] text-white shadow-md"
                  : "border-2 border-[#E5E5E5] bg-white text-[rgb(var(--color-ink))]/70 hover:border-[rgb(var(--color-primary))]/30"
              }`}
            >
              <Icon size={16} className={isActive ? "fill-white" : ""} />
              {category.label}
            </button>
          );
        })}
      </MotionItem>

          {/* Products slider */}
          <MotionItem {...motionItemProps}>
            <div className="overflow-hidden">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{ prevEl: ".product-prev", nextEl: ".product-next" }}
                pagination={{ clickable: true }}
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                  480: { slidesPerView: 1, spaceBetween: 16 },
                  640: { slidesPerView: 2, spaceBetween: 16 },
                  768: { slidesPerView: 2, spaceBetween: 16 },
                  1024: { slidesPerView: 3, spaceBetween: 20 },
                  1280: { slidesPerView: 4, spaceBetween: 20 }
                }}
                className="!pb-12"
              >
          {getProductsByCategory(activeCategory, 12).map((product, index) => {
            const isBestSeller = index === 0;
            const isFavorite = index === 1;
            const hasDiscount = !!product.oldPrice;
            const discountPercent = hasDiscount 
              ? Math.round((1 - parseFloat(product.price.replace(/\D/g, '')) / parseFloat(product.oldPrice!.replace(/\D/g, ''))) * 100)
              : 0;
            
            return (
              <SwiperSlide key={product.name}>
                <article className="group relative h-full rounded-3xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F2ED] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(16,133,79,0.12)]">
                  
                  {/* Badge Best Seller or Favorite - top left */}
                  {isBestSeller && (
                    <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[rgb(var(--color-primary))] px-3 py-1.5 shadow-md">
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
                    <PawPrint size={18} className="fill-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]" />
                  </div>

                  {/* Product image */}
                  <div className="relative mt-8 grid aspect-square place-items-center rounded-2xl bg-white">
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      width={260} 
                      height={260} 
                      className="h-44 w-44 object-contain transition duration-300 group-hover:scale-110" 
                    />
                  </div>

                  {/* Product info */}
                  <div className="mt-4">
                    <h3 className="min-h-[44px] text-sm font-black leading-tight text-[rgb(var(--color-ink))]">
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
                        <span className="ml-1 text-xs font-bold text-[rgb(var(--color-ink))]/60">({product.reviews})</span>
                      </div>
                      <span className="text-xs text-[rgb(var(--color-ink))]/60">
                        Đã bán: <span className="font-bold text-[rgb(var(--color-ink))]">{product.sold}</span>
                      </span>
                    </div>

                    {/* Price row: new price + old price + discount badge - ONE LINE */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg font-black text-[rgb(var(--color-primary))] sm:text-xl">{product.price}</span>
                      {product.oldPrice && (
                        <span className="text-xs font-semibold text-[rgb(var(--color-ink))]/40 line-through">{product.oldPrice}</span>
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
                        className="flex flex-1 items-center justify-center rounded-full border-2 border-[rgb(var(--color-primary))] bg-white px-3 py-2.5 text-xs font-black text-[rgb(var(--color-primary))] transition hover:bg-[rgb(var(--color-primary))] hover:text-white active:scale-95 whitespace-nowrap" 
                        aria-label={`Thêm ${product.name} vào giỏ hàng`}
                      >
                        <span>Thêm vào giỏ</span>
                      </button>
                      <button 
                        className="flex flex-1 items-center justify-center rounded-full bg-[rgb(var(--color-primary))] px-3 py-2.5 text-xs font-black text-white transition hover:bg-[rgb(var(--color-primary-dark))] active:scale-95 whitespace-nowrap" 
                        aria-label={`Mua ngay ${product.name}`}
                      >
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
              </Swiper>
            </div>
          </MotionItem>
        </MotionSection>
      </div>
    </section>
  );
}
