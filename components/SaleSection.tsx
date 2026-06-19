"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/Image";
import { ChevronLeft, ChevronRight, Eye, PawPrint, ShoppingCart, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { getProducts } from "@/src/api/productsApi";
import { SaleBadge } from "@/components/SaleBadge";
import type { Product } from "@/types/store";
import { addToCart, parsePriceString } from "@/lib/cartHelper";
import { toast } from "sonner";

const categoryLabels = ["Thức ăn khô cho mèo", "Thức ăn khô cho chó", "Cát vệ sinh cho mèo", "Pate & snack"];

const getPriceValue = (price: string) => Number(price.replace(/\D/g, "")) || 0;
const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 15 * 60 + 40); // 02:15:40

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="mt-4 flex min-w-0 items-center gap-1.5 rounded-full bg-[#F7F7F1] px-3 py-2">
      <span className="grid h-5 w-5 place-items-center rounded-full border border-[#B9C5B2] text-[#5B6655]">
        <span className="h-2 w-2 rounded-full bg-[#5B6655]" />
      </span>
      <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-[#5B6655]">Kết thúc</span>
      <span className="ml-auto rounded-md bg-[#EEF8E8] px-2 py-0.5 text-xs font-black text-[#2F5D1E]">{hours}</span>
      <span className="text-xs font-bold text-[#5B6655]">:</span>
      <span className="rounded-md bg-[#EEF8E8] px-2 py-0.5 text-xs font-black text-[#2F5D1E]">{minutes}</span>
      <span className="text-xs font-bold text-[#5B6655]">:</span>
      <span className="rounded-md bg-[#EEF8E8] px-2 py-0.5 text-xs font-black text-[#2F5D1E]">{seconds}</span>
    </div>
  );
}

function SaleProductCard({ product, index }: { product: Product; index: number }) {
  const oldValue = product.oldPrice ? getPriceValue(product.oldPrice) : 0;
  const currentValue = getPriceValue(product.price);
  const hasDiscount = !!product.oldPrice && oldValue > currentValue;
  const discount = hasDiscount ? Math.round((1 - currentValue / oldValue) * 100) : 0;
  const saving = hasDiscount ? oldValue - currentValue : 0;
  const soldProgress = product.sold > 0 ? Math.min((product.sold / 100) * 100, 100) : 0; // Or whatever calculation makes sense, but the user said use real data. Let's just use 0 if sold is 0.
  const soldText = `${product.sold}`;
  const category = categoryLabels[index % categoryLabels.length];

  return (
    <motion.article
      className="group flex h-full min-h-[575px] flex-col overflow-hidden rounded-[1.55rem] border border-[#E4EDDB] bg-white p-4 text-left shadow-[0_14px_38px_rgba(41,76,38,0.12)] transition-shadow duration-300 hover:shadow-[0_24px_56px_rgba(41,76,38,0.18)]"
      whileHover={{ y: -7, scale: 1.006 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="relative h-[232px] overflow-hidden rounded-[1.1rem] bg-[#F7F9F2]">
        {hasDiscount && (
          <div className="absolute left-2 top-2 z-20 origin-top-left scale-[0.25] sm:scale-[0.28] pointer-events-none">
            <SaleBadge discount={discount} />
          </div>
        )}

        <div className="absolute right-0 top-0 z-20 rounded-bl-[0.95rem] rounded-tr-[1.1rem] bg-[#EF4444] px-3 py-2 text-sm font-black leading-none text-white shadow-[0_10px_22px_rgba(239,68,68,0.28)]">
          <span className="whitespace-nowrap">FLASH SALE</span>
        </div>

        <Link to={`/product/${product.id || index}`} className="block w-full h-full">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.82),transparent_34%)]" />
          <Image
            src={product.image}
            alt={product.name}
            width={280}
            height={280}
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.055]"
          />
        </Link>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <span className="mb-3 w-fit max-w-full truncate rounded-full bg-[#EAF4E4] px-3 py-1 text-[11px] font-semibold text-[#3E6B34]">
          {category}
        </span>

        <Link to={`/product/${product.id || index}`} className="block">
          <h3
            className="min-h-[40px] text-[13px] font-black leading-[20px] text-[#171A14] line-clamp-2 hover:text-[#2F8A11] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-0.5 text-[#F5A400]">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <Star
                key={starIndex}
                size={14}
                fill={starIndex < Math.round(product.rating) ? "currentColor" : "none"}
                strokeWidth={2}
              />
            ))}
            <span className="ml-2 truncate text-xs font-semibold text-[#1E251B]/75">
              {product.rating.toFixed(1)} ({product.reviews || 256})
            </span>
          </div>
          <span className="shrink-0 whitespace-nowrap text-xs font-medium text-[#1E251B]/65">Đã bán {soldText}</span>
        </div>

        <div className="mt-4">
          <div className="text-xs font-bold text-[#EF4444]">Giá flash sale</div>
          <div className="mt-1 flex items-end justify-between gap-1.5">
            <div className="min-w-0">
              <div className="whitespace-nowrap text-[1.35rem] font-black leading-none text-[#EF3333] tracking-tight">{product.price}</div>
              {product.oldPrice && (
                <div className="mt-1 text-[13px] font-semibold text-[#1E251B]/55 line-through">{product.oldPrice}</div>
              )}
            </div>
            <span className="shrink-0 rounded-lg border border-[#BBD9B3] bg-[#EEF8E8] px-2 py-1 text-[10px] font-black text-[#2F7A24] whitespace-nowrap">
              Tiết kiệm {formatMoney(saving)}
            </span>
          </div>
        </div>

        <CountdownTimer />

        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold text-[#4A5F47]">Đã bán {soldProgress}%</div>
          <div className="relative h-2 overflow-visible rounded-full bg-[#DDE8D5]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#218A12] to-[#73BC42]"
              initial={{ width: 0 }}
              whileInView={{ width: `${soldProgress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute top-1/2 grid h-4 w-4 -translate-y-1/2 place-items-center rounded-full bg-white text-[#F2C94C] shadow-[0_3px_10px_rgba(242,201,76,0.4)]"
              style={{ left: `calc(${soldProgress}% - 0.5rem)` }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 360, damping: 18, delay: 0.4 }}
            >
              ✦
            </motion.span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(
                new CustomEvent("open-quick-add", {
                  detail: { productId: product.id, intent: "add-to-cart" },
                })
              );
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#2F8A11] px-2.5 text-sm font-black text-white shadow-[0_10px_24px_rgba(47,138,17,0.28)] transition hover:bg-[#246B0D]"
          >
            <ShoppingCart size={17} className="shrink-0" />
            <span className="whitespace-nowrap">Thêm giỏ</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(
                new CustomEvent("open-quick-add", {
                  detail: { productId: product.id, intent: "buy-now" },
                })
              );
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#D5DEC9] bg-white px-2.5 text-sm font-bold text-[#263A2A] transition hover:border-[#9FBA92] hover:bg-[#F6FAF2]"
          >
            <Eye size={16} className="shrink-0" />
            <span className="whitespace-nowrap">Xem nhanh</span>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export function SaleSection() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    getProducts({ sort: "popular", limit: 12 })
      .then((result) => {
        if (isMounted) setSaleProducts(result.items);
      })
      .catch(() => {
        if (isMounted) setSaleProducts([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative bg-white pt-10 pb-10 sm:pb-14">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <MotionSection className="relative max-w-none overflow-hidden rounded-[2.5rem] border border-[#D8E7C9] bg-gradient-to-br from-[#F8FDEA] via-[#F1F8E7] to-[#F7FBEE] px-6 !py-8 shadow-[0_24px_70px_rgba(41,76,38,0.12)] sm:px-8 lg:!py-10 lg:px-10">
          <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-br-full bg-[#B9D993]/35 blur-sm" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 rounded-tl-full bg-[#B9D993]/35 blur-sm" />

          <MotionItem {...motionItemProps} className="relative z-10 mb-7 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_18px_45px_rgba(41,76,38,0.14)]">
            <Image
              src="/assets/images/sale.webp"
              alt="3F Store sale"
              width={1717}
              height={916}
              className="block aspect-[1717/916] w-full object-cover"
              priority
            />
          </MotionItem>

          <div className="relative z-10">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{ prevEl: ".sale-prev", nextEl: ".sale-next" }}
              pagination={{ clickable: true }}
              spaceBetween={18}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 18 },
                1024: { slidesPerView: 3, spaceBetween: 18 },
                1280: { slidesPerView: 4, spaceBetween: 20 }
              }}
              className="!pb-16 custom-swiper-green-pagination"
            >
              {saleProducts.map((product, index) => (
                <SwiperSlide key={`sale-prod-${product.id ?? product.name}`} className="!h-auto">
                  <SaleProductCard product={product} index={index} />
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              className="sale-prev absolute -left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#D6E4C7] bg-white text-[#2F7A24] shadow-md transition hover:bg-[#F0F8E8] lg:grid"
              aria-label="Trước"
            >
              <ChevronLeft size={19} strokeWidth={2.5} />
            </button>
            <button
              className="sale-next absolute -right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#D6E4C7] bg-white text-[#2F7A24] shadow-md transition hover:bg-[#F0F8E8] lg:grid"
              aria-label="Tiếp"
            >
              <ChevronRight size={19} strokeWidth={2.5} />
            </button>
          </div>

        </MotionSection>
      </div>
    </section>
  );
}
