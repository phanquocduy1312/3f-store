"use client";

import { Image } from "@/components/Image";
import { ArrowRight, Star, PawPrint } from "lucide-react";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { getCatFoodProducts, getDogFoodProducts } from "@/data/store";
import type { Product } from "@/types/store";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const catProducts: Product[] = getCatFoodProducts(12);
const dogProducts: Product[] = getDogFoodProducts(12);

export function PetFoodSection() {
  return (
    <section className="relative bg-white py-4">
      <MotionSection className="relative max-w-7xl px-4 sm:px-6 lg:px-8 !py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col">
            {/* Banner card - relative and overflow-visible for popping cat */}
            <div className="relative flex min-h-[240px] sm:min-h-[250px] lg:min-h-[220px] xl:min-h-[250px] w-full flex-col justify-center rounded-[2.25rem] border border-[#EBEAE6] bg-[#FAF8F5] p-6 sm:p-8">
              
              {/* Popping Cat Image - right-aligned, behind text */}
              <div className="absolute bottom-0 right-0 z-0 pointer-events-none h-[220px] sm:h-[240px] lg:h-[210px] xl:h-[250px] w-auto overflow-visible">
                <Image
                  src="/assets/images/cat.png"
                  alt="Mèo cưng và đồ ăn mèo"
                  width={230}
                  height={250}
                  className="h-full w-auto object-contain object-bottom origin-bottom transition duration-500 hover:scale-[1.03]"
                  priority
                />
              </div>

              {/* Text content - narrower width to avoid image overlap */}
              <div className="relative z-20 flex max-w-[40%] flex-col items-start text-left">
                <div className="mb-2.5 inline-flex items-center gap-1.5 text-sm font-black text-[#10854F]">
                  <PawPrint size={15} className="fill-current" />
                  Đồ ăn cho mèo
                </div>
                <p className="text-[10px] sm:text-xs leading-relaxed text-[#221A12]/75">
                  Dinh dưỡng cân bằng, hỗ trợ sức khỏe toàn diện cho mèo cưng khỏe mạnh và năng động.
                </p>
                <button className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#10854F] px-5 py-2.5 text-xs font-black text-white shadow-sm transition duration-300 hover:scale-105 hover:bg-[#0D7344] active:scale-95">
                  Xem tất cả
                  <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Cat Products Swiper - horizontal scroll */}
            <div className="mt-6">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={12}
                slidesPerView={2}
                breakpoints={{
                  640: { slidesPerView: 3, spaceBetween: 12 },
                  1024: { slidesPerView: 4, spaceBetween: 12 }
                }}
                pagination={{ clickable: true }}
                className="!pb-8"
              >
                {catProducts.map((product) => (
                  <SwiperSlide key={product.id || product.name}>
                    <article className="group flex flex-col rounded-3xl border border-[#EAEAEA] bg-white p-2.5 pb-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(31,77,58,0.05)] hover:border-[#D6E6DC]">
                      {/* Image wrapper */}
                      <div className="relative flex h-[100px] sm:h-[110px] w-full items-center justify-center rounded-2xl bg-[#FAF8F5] p-1.5">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={100}
                          height={110}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Title */}
                      <h3 className="mt-2.5 text-[10px] sm:text-xs font-black leading-snug text-[#221A12] line-clamp-2 min-h-[32px] text-left">
                        {product.name}
                      </h3>

                      {/* Rating block */}
                      <div className="mt-1.5 flex items-center gap-0.5 text-[#E49D22]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star 
                            key={index} 
                            size={10} 
                            fill={index < Math.round(product.rating) ? "currentColor" : "none"} 
                            stroke="currentColor"
                            strokeWidth={2}
                          />
                        ))}
                        <span className="ml-1 text-[8px] sm:text-[9px] font-semibold text-[#221A12]/60">({product.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="mt-2.5 flex items-baseline justify-start">
                        <span className="text-[11px] sm:text-xs font-black text-[#10854F]">{product.price}</span>
                      </div>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          <div className="flex flex-col">
            {/* Banner card - relative and overflow-visible for popping dog */}
            <div className="relative flex min-h-[240px] sm:min-h-[250px] lg:min-h-[220px] xl:min-h-[250px] w-full flex-col justify-center rounded-[2.25rem] border border-[#EBEAE6] bg-[#FAF8F5] p-6 sm:p-8">
              
              {/* Popping Dog Image - right-aligned, behind text */}
              <div className="absolute bottom-0 right-0 z-0 pointer-events-none h-[220px] sm:h-[240px] lg:h-[210px] xl:h-[250px] w-auto overflow-visible">
                <Image
                  src="/assets/images/dog.png"
                  alt="Cún cưng và đồ ăn chó"
                  width={230}
                  height={250}
                  className="h-full w-auto object-contain object-bottom origin-bottom transition duration-500 hover:scale-[1.03]"
                  priority
                />
              </div>

              {/* Text content - narrower width to avoid image overlap */}
              <div className="relative z-20 flex max-w-[40%] flex-col items-start text-left">
                <div className="mb-2.5 inline-flex items-center gap-1.5 text-sm font-black text-[#10854F]">
                  <PawPrint size={15} className="fill-current" />
                  Đồ ăn cho chó
                </div>
                <p className="text-[10px] sm:text-xs leading-relaxed text-[#221A12]/75">
                  Thức ăn chất lượng, giàu protein và vitamin giúp cún cưng phát triển khỏe mạnh.
                </p>
                <button className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#10854F] px-5 py-2.5 text-xs font-black text-white shadow-sm transition duration-300 hover:scale-105 hover:bg-[#0D7344] active:scale-95">
                  Xem tất cả
                  <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Dog Products Swiper - horizontal scroll */}
            <div className="mt-6">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={12}
                slidesPerView={2}
                breakpoints={{
                  640: { slidesPerView: 3, spaceBetween: 12 },
                  1024: { slidesPerView: 4, spaceBetween: 12 }
                }}
                pagination={{ clickable: true }}
                className="!pb-8"
              >
                {dogProducts.map((product) => (
                  <SwiperSlide key={product.id || product.name}>
                    <article className="group flex flex-col rounded-3xl border border-[#EAEAEA] bg-white p-2.5 pb-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(31,77,58,0.05)] hover:border-[#D6E6DC]">
                      {/* Image wrapper */}
                      <div className="relative flex h-[100px] sm:h-[110px] w-full items-center justify-center rounded-2xl bg-[#FAF8F5] p-1.5">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={100}
                          height={110}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Title */}
                      <h3 className="mt-2.5 text-[10px] sm:text-xs font-black leading-snug text-[#221A12] line-clamp-2 min-h-[32px] text-left">
                        {product.name}
                      </h3>

                      {/* Rating block */}
                      <div className="mt-1.5 flex items-center gap-0.5 text-[#E49D22]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star 
                            key={index} 
                            size={10} 
                            fill={index < Math.round(product.rating) ? "currentColor" : "none"} 
                            stroke="currentColor"
                            strokeWidth={2}
                          />
                        ))}
                        <span className="ml-1 text-[8px] sm:text-[9px] font-semibold text-[#221A12]/60">({product.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="mt-2.5 flex items-baseline justify-start gap-1">
                        <span className="text-[11px] sm:text-xs font-black text-[#10854F]">{product.price}</span>
                        {product.oldPrice && (
                          <span className="text-[8px] sm:text-[9px] font-semibold text-[#221A12]/40 line-through">{product.oldPrice}</span>
                        )}
                      </div>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

        </div>
      </MotionSection>
    </section>
  );
}
