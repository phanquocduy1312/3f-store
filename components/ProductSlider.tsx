"use client";

import { Image } from "@/components/Image";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, PawPrint, CheckCircle, Heart, Crown } from "lucide-react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getFeaturedProducts, getProductsByCategory } from "@/data/store";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";

const categories = [
  { id: "all", label: "Tất cả", icon: PawPrint },
  { id: "food", label: "Thức ăn", icon: PawPrint },
  { id: "accessories", label: "Phụ kiện", icon: PawPrint },
  { id: "care", label: "Chăm sóc", icon: PawPrint },
  { id: "toys", label: "Đồ chơi", icon: PawPrint }
];

export function ProductSlider() {
  const [activeCategory, setActiveCategory] = useState("all");
  const featuredProducts = getFeaturedProducts(12);
  const filteredProducts = activeCategory === "all" ? featuredProducts : getProductsByCategory(activeCategory, 12);

  return (
    <section className="relative bg-white pt-2 sm:pt-4 pb-8 sm:pb-12">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="relative">
          {/* Header with title and navigation arrows */}
          <MotionItem {...motionItemProps} className="mb-6 flex items-start justify-between gap-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <PawPrint size={16} className="fill-[#10854F] text-[#10854F]" />
            <p className="text-xs font-black uppercase tracking-wide text-[#10854F]/75">Sản phẩm nổi bật</p>
          </div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-[#221A12] sm:text-4xl">
            Sản phẩm được yêu thích nhất
            <span className="text-3xl">❤️</span>
          </h2>
          <p className="mt-2 text-sm text-[#221A12]/60">
            Những sản phẩm chất lượng được hàng ngàn Boss và Sen tin dùng
          </p>
        </div>
        <div className="hidden gap-3 sm:flex">
          <button 
            className="product-prev grid h-12 w-12 place-items-center rounded-full border-2 border-[#10854F] bg-white text-[#10854F] shadow-sm transition hover:bg-[#10854F] hover:text-white" 
            aria-label="Sản phẩm trước"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button 
            className="product-next grid h-12 w-12 place-items-center rounded-full bg-[#10854F] text-white shadow-sm transition hover:bg-[#0D7344]" 
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
                  ? "bg-[#10854F] text-white shadow-md"
                  : "border-2 border-[#E5E5E5] bg-white text-[#221A12]/70 hover:border-[#10854F]/30"
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
          {filteredProducts.map((product, index) => {
            const isBestSeller = index === 0;
            const isFavorite = index === 1;
            
            return (
              <SwiperSlide key={product.id ?? product.name}>
                <ProductCard 
                  product={product} 
                  isBestSeller={isBestSeller} 
                  isFavorite={isFavorite} 
                />
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
