"use client";

import { ChevronLeft, ChevronRight, PawPrint, Bone, BadgePlus, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import { getProducts } from "@/src/api/productsApi";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { useEffect, useMemo, useState } from "react";
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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    getProducts({ sort: "popular", limit: 12 })
      .then((result) => {
        if (isMounted) setFeaturedProducts(result.items);
      })
      .catch(() => {
        if (isMounted) setFeaturedProducts([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return featuredProducts;
    return featuredProducts.filter((product) => inferCategory(product) === activeCategory);
  }, [activeCategory, featuredProducts]);

  const visibleProducts = filteredProducts.length > 0 ? filteredProducts : featuredProducts;

  return (
    <section className="relative overflow-hidden bg-transparent pt-4 pb-8 sm:pt-6 sm:pb-20">
      <div className="pointer-events-none absolute left-[10%] top-10 h-48 w-48 rounded-full bg-sky-100/40 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] bottom-8 h-52 w-52 rounded-full bg-honey/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1380px] px-2 sm:px-6 lg:px-8">
        <MotionSection className="relative !max-w-none overflow-hidden rounded-[2.5rem] border border-[#E8EFE8] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFCFA_100%)] px-6 !py-8 shadow-[0_26px_70px_rgba(16,24,40,0.06)] sm:px-8 lg:px-10 lg:!py-10">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-sky-50/80" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 rounded-tr-full bg-cream/40" />

          <MotionItem
            {...motionItemProps}
            className="relative z-10 mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-6"
          >
            <div className="max-w-3xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#DCEADB] bg-[#F4FAF5] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-primary))] sm:px-4 sm:py-2 sm:text-xs">
                <Sparkles size={12} className="sm:h-[14px] sm:w-[14px]" />
                Sản phẩm nổi bật
              </div>
              <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-tight text-[#1B170F] sm:text-[2.5rem] lg:text-[3.35rem]">
                Sản phẩm được yêu thích nhất
                <span className="ml-2 text-[rgb(var(--color-primary))]">cho Boss & Sen</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgb(var(--color-ink))]/62 sm:mt-3 sm:text-[15px] sm:leading-7">
                Tuyển chọn các sản phẩm được đánh giá cao, bán tốt và có trải nghiệm mua nhanh.
              </p>
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
                      ? "bg-[rgb(var(--color-primary))] text-white shadow-[0_12px_24px_rgba(19,72,111,0.18)]"
                      : "border border-[#E3EAE5] bg-white text-[rgb(var(--color-ink))]/72 hover:border-[rgb(var(--color-primary))]/25 hover:bg-[#F8FBF9]"
                  }`}
                >
                  <Icon size={14} className={`sm:h-4 sm:w-4 ${isActive ? "fill-white" : ""}`} />
                  {category.label}
                </button>
              );
            })}
          </MotionItem>

          <MotionItem {...motionItemProps} className="relative z-10">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 xl:gap-5">
              {visibleProducts.slice(0, 6).map((product, index) => {
                const isBestSeller = index === 0;
                const isFavorite = index === 1;

                return (
                  <ProductCard
                    key={product.id ?? product.name}
                    product={product}
                    isBestSeller={isBestSeller}
                    isFavorite={isFavorite}
                    index={index}
                  />
                );
              })}
            </div>
            
            <div className="mt-8 flex justify-center lg:mt-10">
              <Link
                to={`/products?category=${activeCategory === "all" ? "" : activeCategory}`}
                className="group inline-flex items-center gap-2 rounded-full border-2 border-[rgb(var(--color-primary))] bg-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-[rgb(var(--color-primary))] transition-all hover:bg-[rgb(var(--color-primary))] hover:text-white sm:px-8 sm:py-3"
              >
                Xem thêm
                <ChevronRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </MotionItem>
        </MotionSection>
      </div>
    </section>
  );
}
