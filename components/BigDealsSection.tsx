"use client";

import { Image } from "@/components/Image";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, PawPrint, Heart, Crown } from "lucide-react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
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
  return (
    <section className="relative bg-gradient-to-b from-[#FFF9F5] to-[#FFF2F0] py-10">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="relative">
          <MotionItem {...motionItemProps} className="mb-6">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <PawPrint size={16} className="fill-[#6B21A8] text-[#6B21A8]" />
                <p className="text-xs font-black uppercase tracking-wide text-[#6B21A8]/75">Ưu đãi</p>
              </div>
              <h2 className="text-3xl font-extrabold text-[#2B1226] sm:text-5xl">
                Ưu đãi khủng — Quà tặng & Voucher
              </h2>
              <p className="mt-2 text-sm text-[#2B1226]/60">Ưu đãi độc quyền, giảm sâu và quà tặng hấp dẫn.</p>
            </div>
          </MotionItem>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-1 lg:items-start">
            {/* Left: framed sale area using provided sale.png */}
            <div>
              <div className="relative mx-auto w-full max-w-[1200px] rounded-[36px]">
                <div className="relative overflow-visible rounded-[36px]">
                  <Image src="/assets/images/sale.png" alt="Sale frame" width={1200} height={600} className="w-full h-auto object-contain" />
                  <div className="absolute inset-x-6 top-24 bottom-6 flex items-center justify-center">
                    <div className="relative w-full max-w-6xl">
                      {/* navigation buttons */}
                      <button className="frame-prev absolute left-0 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white shadow-md" aria-label="prev">
                        <ChevronLeft size={18} />
                      </button>
                      <button className="frame-next absolute right-0 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white shadow-md" aria-label="next">
                        <ChevronRight size={18} />
                      </button>

                      <Swiper
                        modules={[Navigation, Pagination]}
                        navigation={{ prevEl: ".frame-prev", nextEl: ".frame-next" }}
                        pagination={{ clickable: true }}
                        spaceBetween={16}
                        slidesPerView={3}
                        breakpoints={{
                          320: { slidesPerView: 1, spaceBetween: 12 },
                          640: { slidesPerView: 1, spaceBetween: 14 },
                          1024: { slidesPerView: 2, spaceBetween: 16 },
                          1280: { slidesPerView: 3, spaceBetween: 18 }
                        }}
                      >
                        {getSaleProducts(9).map((product, i) => {
                          const discount = product.oldPrice ? Math.round((1 - parseFloat(product.price.replace(/\D/g, '')) / parseFloat(product.oldPrice!.replace(/\D/g, ''))) * 100) : 0;
                          return (
                            <SwiperSlide key={`frame-${i}`}>
                              <article className="relative mx-2 h-full rounded-lg bg-white p-4 shadow-sm">
                                {/* discount badge */}
                                <div className="absolute left-3 top-3 z-10 rounded-full bg-[#FF4D4F] px-2 py-1 text-[12px] font-extrabold text-white">-{discount}%</div>

                                {/* product image */}
                                <div className="mt-6 flex items-center justify-center">
                                  <div className="h-28 w-28 overflow-hidden rounded-xl bg-white p-2">
                                    <Image src={product.image} alt={product.name} width={160} height={160} className="h-full w-full object-contain" />
                                  </div>
                                </div>

                                <h4 className="mt-3 text-sm font-bold text-[#2B1226]">{product.name}</h4>

                                <div className="mt-2 flex items-center justify-between">
                                  <div>
                                    <div className="text-lg font-extrabold text-[#EF4444]">{product.price}</div>
                                    {product.oldPrice && <div className="text-xs text-[#2B1226]/40 line-through">{product.oldPrice}</div>}
                                  </div>
                                  <button className="absolute right-3 bottom-3 grid h-10 w-10 place-items-center rounded-full bg-[#0D4B3A] text-white shadow-md" aria-label={`Thêm ${product.name}`}>
                                    <ShoppingCart size={16} />
                                  </button>
                                </div>
                              </article>
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>

                      {/* CTA centered */}
                      <div className="mt-6 flex justify-center">
                        <button className="rounded-full bg-[#0D4B3A] px-6 py-3 text-sm font-bold text-white shadow-md">Xem tất cả ưu đãi</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionSection>
      </div>
    </section>
  );
}
