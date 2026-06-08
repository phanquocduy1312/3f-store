"use client";

import { ChevronLeft, ChevronRight, PawPrint, Bone, BadgePlus, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getFeaturedProducts } from "@/data/store";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/store";

const categories = [
  { id: "all", label: "Tất cả", icon: PawPrint },
  { id: "food", label: "Thức ăn", icon: PawPrint },
  { id: "care", label: "Chăm sóc", icon: HeartHandshake },
  { id: "accessories", label: "Phụ kiện", icon: BadgePlus },
  { id: "toys", label: "Đồ chơi", icon: Bone }
];

function normalizeText(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function inferCategory(product: Product) {
  const source = normalizeText(`${product.category ?? ""} ${product.name}`);

  if (/(thuc an|pate|hat|sup|snack|dinh duong)/.test(source)) return "food";
  if (/(cham soc|ve sinh|tam|sua tam|cat ve sinh|dieu tri)/.test(source)) return "care";
  if (/(phu kien|day dat|bat an|khay|chuong|quan ao)/.test(source)) return "accessories";
  if (/(do choi|bong|gau bong|can cau|banh)/.test(source)) return "toys";
  return "food";
}

export function ProductSlider() {
  const [activeCategory, setActiveCategory] = useState("all");
  const featuredProducts = useMemo(() => getFeaturedProducts(12), []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return featuredProducts;
    return featuredProducts.filter((product) => inferCategory(product) === activeCategory);
  }, [activeCategory, featuredProducts]);

  const visibleProducts = filteredProducts.length > 0 ? filteredProducts : featuredProducts;

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div className="pointer-events-none absolute left-[10%] top-10 h-48 w-48 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] bottom-8 h-52 w-52 rounded-full bg-honey/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <MotionSection className="relative !max-w-none overflow-hidden rounded-[2.5rem] border border-[#E8EFE8] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFCFA_100%)] px-6 !py-8 shadow-[0_26px_70px_rgba(16,24,40,0.06)] sm:px-8 lg:px-10 lg:!py-10">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-emerald-50/80" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 rounded-tr-full bg-cream/40" />

          <MotionItem
            {...motionItemProps}
            className="relative z-10 mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-6"
          >
            <div className="max-w-3xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#DCEADB] bg-[#F4FAF5] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#10854F] sm:px-4 sm:py-2 sm:text-xs">
                <Sparkles size={12} className="sm:h-[14px] sm:w-[14px]" />
                Sản phẩm nổi bật
              </div>
              <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-tight text-[#1B170F] sm:text-[2.5rem] lg:text-[3.35rem]">
                Sản phẩm được yêu thích nhất
                <span className="ml-2 text-[#10854F]">cho Boss & Sen</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#221A12]/62 sm:mt-3 sm:text-[15px] sm:leading-7">
                Tuyển chọn các sản phẩm được đánh giá cao, bán tốt và có trải nghiệm mua nhanh.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end lg:gap-4">
              <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:gap-3">
                <div className="rounded-xl border border-[#E7EFEA] bg-white px-3 py-2.5 text-center shadow-sm sm:rounded-2xl sm:px-4 sm:py-3">
                  <div className="text-base font-black text-[#10854F] sm:text-lg">4.9/5</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#221A12]/40 sm:text-[11px]">Đánh giá</div>
                </div>
                <div className="rounded-xl border border-[#E7EFEA] bg-white px-3 py-2.5 text-center shadow-sm sm:rounded-2xl sm:px-4 sm:py-3">
                  <div className="text-base font-black text-[#10854F] sm:text-lg">12+</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#221A12]/40 sm:text-[11px]">Mẫu hot</div>
                </div>
                <div className="rounded-xl border border-[#E7EFEA] bg-white px-3 py-2.5 text-center shadow-sm sm:rounded-2xl sm:px-4 sm:py-3">
                  <div className="text-base font-black text-[#10854F] sm:text-lg">2h</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#221A12]/40 sm:text-[11px]">Giao nhanh</div>
                </div>
              </div>

              <div className="hidden gap-3 sm:flex">
                <button
                  className="product-prev grid h-12 w-12 place-items-center rounded-full border border-[#10854F]/18 bg-white text-[#10854F] shadow-sm transition hover:border-[#10854F] hover:bg-[#F2FAF5]"
                  aria-label="Sản phẩm trước"
                >
                  <ChevronLeft size={19} strokeWidth={2.5} />
                </button>
                <button
                  className="product-next grid h-12 w-12 place-items-center rounded-full bg-[#10854F] text-white shadow-[0_14px_24px_rgba(16,133,79,0.22)] transition hover:bg-[#0D7344]"
                  aria-label="Sản phẩm tiếp theo"
                >
                  <ChevronRight size={19} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </MotionItem>

          <MotionItem {...motionItemProps} className="relative z-10 mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:mb-8 sm:gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-black transition whitespace-nowrap sm:gap-2 sm:px-5 sm:py-3 sm:text-sm ${
                    isActive
                      ? "bg-[#10854F] text-white shadow-[0_12px_24px_rgba(16,133,79,0.18)]"
                      : "border border-[#E3EAE5] bg-white text-[#221A12]/72 hover:border-[#10854F]/25 hover:bg-[#F8FBF9]"
                  }`}
                >
                  <Icon size={14} className={`sm:h-4 sm:w-4 ${isActive ? "fill-white" : ""}`} />
                  {category.label}
                </button>
              );
            })}
          </MotionItem>

          <MotionItem {...motionItemProps} className="relative z-10">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{ prevEl: ".product-prev", nextEl: ".product-next" }}
              pagination={{ clickable: true }}
              spaceBetween={14}
              slidesPerView={1.2}
              breakpoints={{
                480: { slidesPerView: 1.5, spaceBetween: 14 },
                640: { slidesPerView: 2, spaceBetween: 16 },
                768: { slidesPerView: 2.5, spaceBetween: 16 },
                1024: { slidesPerView: 3, spaceBetween: 18 },
                1280: { slidesPerView: 4, spaceBetween: 20 }
              }}
              className="!pb-12 sm:!pb-14"
            >
              {visibleProducts.map((product, index) => {
                const isBestSeller = index === 0;
                const isFavorite = index === 1;

                return (
                  <SwiperSlide key={product.id ?? product.name} className="!h-auto">
                    <ProductCard
                      product={product}
                      isBestSeller={isBestSeller}
                      isFavorite={isFavorite}
                      index={index}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </MotionItem>
        </MotionSection>
      </div>
    </section>
  );
}
