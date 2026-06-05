"use client";

import { Image } from "@/components/Image";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, PawPrint } from "lucide-react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getSaleProducts } from "@/data/store";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import type { Product } from "@/types/store";

function SaleProductCard({ product }: { product: Product }) {
  const hasDiscount = !!product.oldPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price.replace(/\D/g, '')) / parseFloat(product.oldPrice!.replace(/\D/g, ''))) * 100)
    : 0;

  return (
    <article className="group relative rounded-[2rem] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100/80 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex flex-col h-full text-left">


      {/* Product Image Container (Light beige/grey background as in preview) */}
      <div className="relative aspect-square w-full rounded-[1.5rem] bg-[#f7f6f2] flex items-center justify-center p-3 overflow-hidden">
        <Image 
          src={product.image} 
          alt={product.name} 
          width={260} 
          height={260} 
          className="h-full w-full object-contain transition duration-300 group-hover:scale-105" 
        />
      </div>

      {/* Product Details */}
      <div className="mt-4 flex-1 flex flex-col">
        {/* SALE SỐC Badge */}
        <div className="mb-2">
          <span className="inline-block bg-[#fcd34d] text-[#4d5e46] text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
            SALE SỐC
          </span>
        </div>

        <h3 className="min-h-[40px] text-xs sm:text-sm font-black leading-tight text-[#2c3e2b] group-hover:text-[#4a5f47] transition duration-200 line-clamp-2">
          {product.name}
        </h3>

        {/* Stars and Sold */}
        <div className="mt-2 flex items-center gap-2 text-[#E49D22]">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <Star 
                key={starIndex} 
                size={11} 
                fill={starIndex < Math.round(product.rating) ? "currentColor" : "none"}
                strokeWidth={2}
              />
            ))}
            <span className="ml-1 text-[10px] font-bold text-[#221A12]/60">({product.reviews})</span>
          </div>
          <span className="text-[10px] text-[#221A12]/60">
            Đã bán: <span className="font-bold text-[#221A12]">{product.sold}</span>
          </span>
        </div>

        {/* Price Row */}
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-base font-black text-[#4d6144]">{product.price}</span>
          {product.oldPrice && (
            <span className="text-xs font-semibold text-[#221A12]/40 line-through">{product.oldPrice}</span>
          )}
          {hasDiscount && (
            <span className="rounded bg-[#EF4444] px-1.5 py-0.5 text-[9px] font-black text-white">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <button 
            className="flex flex-1 items-center justify-center gap-1 rounded-full border border-[#4a5f47] bg-white h-9 px-1 text-[11px] font-black text-[#4a5f47] transition hover:bg-[#4a5f47] hover:text-white active:scale-95 whitespace-nowrap" 
            aria-label="Thêm vào giỏ"
          >
            <ShoppingCart size={13} />
            <span>Thêm vào giỏ</span>
          </button>
          <button 
            className="flex flex-1 items-center justify-center rounded-full bg-[#4a5f47] h-9 text-[11px] font-black text-white transition hover:bg-[#3d4f3a] active:scale-95 whitespace-nowrap" 
            aria-label="Mua ngay"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </article>
  );
}

export function SaleSection() {
  const saleProducts = getSaleProducts(12);

  return (
    <section className="relative bg-white pt-8 sm:pt-12 pb-2 sm:pb-4">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="relative">

          <MotionItem {...motionItemProps} className="rounded-[2.5rem] bg-[#96c289] p-6 sm:p-8 md:p-10 overflow-hidden shadow-lg border border-[#80af72] transition duration-500 relative">
            <div className="absolute right-6 top-6 opacity-[0.08] text-white pointer-events-none hidden md:block">
              <PawPrint size={120} className="fill-current" />
            </div>

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#e8f3e5]">SẢN PHẨM</p>
                  <h2 className="flex items-center gap-1.5 text-2xl font-black text-white sm:text-3xl">
                    GIẢM GIÁ
                    <PawPrint size={20} className="fill-white text-white" />
                  </h2>
                </div>
                {/* Badge Ưu đãi hấp dẫn */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f8f2] px-4 py-1.5 text-xs font-black text-[#4a5f47] shadow-sm">
                  <Star size={12} className="fill-[#4a5f47] text-[#4a5f47]" />
                  <span>ƯU ĐÃI HẤP DẪN - MUA NGAY KẺO LỠ</span>
                </div>
              </div>

              {/* Navigation arrows */}
              <div className="flex gap-2.5 self-end md:self-auto">
                <button 
                  className="sale-prev grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 text-white shadow-sm transition hover:bg-white hover:text-[#96c289]" 
                  aria-label="Trước"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
                <button 
                  className="sale-next grid h-10 w-10 place-items-center rounded-full bg-white text-[#96c289] shadow-sm transition hover:bg-gray-100" 
                  aria-label="Tiếp"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="mb-8 overflow-hidden rounded-2xl shadow-md border border-[#ffffff]/10">
              <Image 
                src="/assets/images/sale.png" 
                alt="Chương trình ưu đãi cực khủng" 
                width={1200} 
                height={558} 
                className="w-full h-auto block transition duration-700 hover:scale-[1.01]"
              />
            </div>

            <div className="overflow-hidden">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{ prevEl: ".sale-prev", nextEl: ".sale-next" }}
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
                className="!pb-12 custom-swiper-white-pagination"
              >
                {saleProducts.map((product) => (
                  <SwiperSlide key={`sale-prod-${product.id ?? product.name}`}>
                    <SaleProductCard product={product} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="mt-2 flex justify-center relative z-10">
              <button className="rounded-full bg-white px-8 py-3 text-xs font-black text-[#96c289] transition hover:bg-gray-100 hover:shadow-lg active:scale-95 flex items-center gap-1.5">
                <PawPrint size={14} className="fill-[#96c289]" />
                Xem tất cả
              </button>
            </div>
          </MotionItem>

        </MotionSection>
      </div>
    </section>
  );
}
