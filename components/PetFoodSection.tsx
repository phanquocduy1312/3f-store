"use client";

import { Link } from "react-router-dom";
import { Image } from "@/components/Image";
import { ArrowRight, Star, PawPrint, ShoppingCart } from "lucide-react";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { SaleBadge } from "@/components/SaleBadge";
import { getProducts } from "@/src/api/productsApi";
import { useEffect, useState } from "react";
import type { Product } from "@/types/store";
import { addToCart, parsePriceString } from "@/lib/cartHelper";
import { toast } from "sonner";

function getPriceValue(price: string) {
  if (!price) return 0;
  const cleanPrice = price.split("-")[0].trim();
  return Number(cleanPrice.replace(/\D/g, "")) || 0;
}

function getProductMeta(product: Product, petType: "cat" | "dog") {
  const text = `${product.name} ${product.category ?? ""}`.toLowerCase();
  const isWetFood = /pate|mousse|lon|ướt/.test(text);
  const isYoung = /con|junior|kitten|puppy|12 tháng/.test(text);
  const hasSeafood = /cá|ngừ|salmon|hải sản/.test(text);
  const hasChicken = /gà|chicken/.test(text);

  const typeLabel = isWetFood ? "Thức ăn ướt" : "Thức ăn khô";
  const ageLabel = isYoung ? (petType === "cat" ? "Mèo con" : "Chó con") : "Mọi lứa tuổi";
  const featureLabel = hasSeafood ? "Da lông khỏe" : hasChicken ? "Giàu đạm" : "Dễ tiêu hóa";
  const soldLabel = product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k` : `${product.sold}`;

  return { typeLabel, ageLabel, featureLabel, soldLabel };
}

function ProductCard({
  product,
  petType,
  accentClass,
  accentSoftClass,
  hoverBorderClass,
  imageBgClass,
  hoverTitleClass,
}: {
  product: Product;
  petType: "cat" | "dog";
  accentClass: string;
  accentSoftClass: string;
  hoverBorderClass: string;
  imageBgClass: string;
  hoverTitleClass: string;
}) {
  const meta = getProductMeta(product, petType);
  const oldPriceValue = product.oldPrice ? getPriceValue(product.oldPrice) : 0;
  const currentPriceValue = getPriceValue(product.price);
  const hasDiscount = oldPriceValue > currentPriceValue;
  const discount = hasDiscount ? Math.round((1 - currentPriceValue / oldPriceValue) * 100) : 0;

  return (
    <article className={`group flex h-full flex-col rounded-[1.5rem] border bg-white overflow-hidden shadow-glass-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-glass ${hoverBorderClass}`}>
      <Link to={`/product/${product.id || product.name}`} className={`relative flex h-[180px] w-full items-center justify-center transition-colors ${imageBgClass}`}>
        {hasDiscount && (
          <div className="absolute left-2 top-2 z-10 origin-top-left scale-[0.25] sm:scale-[0.28] pointer-events-none">
            <SaleBadge discount={discount} />
          </div>
        )}
        <Image
          src={product.image}
          alt={product.name}
          width={200}
          height={200}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      <div className="px-3 pb-3 pt-1 flex flex-col flex-1">
        <div className="mt-0">
          <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${accentSoftClass} ${accentClass}`}>
            {meta.typeLabel}
          </span>
        </div>

        <Link to={`/product/${product.id || product.name}`}>
          <h3 className={`mt-2 text-sm font-bold leading-snug text-ink line-clamp-2 min-h-[40px] transition-colors ${hoverTitleClass}`}>
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={12} fill="currentColor" strokeWidth={2} />
            <span className="text-xs font-bold text-ink/70">{product.rating}</span>
          </div>
          <span className="text-[11px] font-semibold text-ink/45">Đã bán {meta.soldLabel}</span>
        </div>

        <div className="mt-auto pt-2 flex flex-col justify-end">
          <div className="mb-2 sm:mb-3 flex items-end gap-1.5 sm:gap-2 whitespace-nowrap">
            <div className={`text-[1.1rem] sm:text-[1.25rem] font-black leading-none ${accentClass}`}>{product.price}</div>
            {product.oldPrice && (
              <div className="mb-0.5 text-[10px] sm:text-xs font-semibold text-ink/40 line-through">{product.oldPrice}</div>
            )}
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent("open-quick-add", {
                    detail: { productId: product.id, intent: "add-to-cart" },
                  })
                );
              }}
              className="flex h-8 w-8 sm:h-9 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-forest sm:border-[1.5px] bg-white text-forest transition-all active:scale-95 hover:bg-forest/5"
              aria-label={`Thêm ${product.name} vào giỏ hàng`}
            >
              <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent("open-quick-add", {
                    detail: { productId: product.id, intent: "buy-now" },
                  })
                );
              }}
              className="flex h-8 sm:h-9 flex-1 items-center justify-center rounded-lg bg-forest px-2 font-bold text-white transition-all active:scale-95 hover:bg-[rgb(var(--color-primary-dark))]"
              aria-label={`Mua ngay ${product.name}`}
            >
              <span className="text-[11px] sm:text-xs whitespace-nowrap">Mua ngay</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PetFoodSection() {
  const [catProducts, setCatProducts] = useState<Product[]>([]);
  const [dogProducts, setDogProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getProducts({ petType: "cat", limit: 12, sort: "popular" }),
      getProducts({ petType: "dog", limit: 12, sort: "popular" }),
    ])
      .then(([catResult, dogResult]) => {
        if (!isMounted) return;
        setCatProducts(catResult.items);
        setDogProducts(dogResult.items);
      })
      .catch(() => {
        if (!isMounted) return;
        setCatProducts([]);
        setDogProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative bg-white pt-12 pb-2 lg:pt-16 lg:pb-0">
      <MotionSection className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:gap-16">
          
          {/* Cat Food Section */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Banner Card - Full Width with Rich Content */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[rgb(var(--color-primary-soft))] to-[rgb(var(--color-primary-muted))] border border-[rgb(var(--color-primary-muted))] p-6 sm:p-8 lg:p-10 shadow-lg group min-h-[320px] sm:min-h-[340px] lg:min-h-[360px]">
              <div className="relative z-20 max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-wider text-[rgb(var(--color-primary))] backdrop-blur-md shadow-sm">
                  <PawPrint size={14} className="fill-current" />
                  Dành cho Mèo
                </div>
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-ink mb-3 leading-tight">
                  Dinh dưỡng cân bằng <br className="hidden sm:block" />
                  cho mèo cưng
                </h3>
                
                <p className="text-sm sm:text-base lg:text-lg text-ink/75 mb-4 max-w-xl leading-relaxed">
                  Hỗ trợ sức khỏe toàn diện, giúp mèo cưng luôn năng động, khỏe mạnh và phát triển tốt nhất.
                </p>

                {/* Features List */}
                <ul className="mb-6 space-y-2 text-sm text-ink/70">
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/60">
                      <svg className="h-3 w-3 text-[rgb(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Thành phần tự nhiên, an toàn 100%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/60">
                      <svg className="h-3 w-3 text-[rgb(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Cân bằng protein, vitamin & khoáng chất</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/60">
                      <svg className="h-3 w-3 text-[rgb(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Hỗ trợ tiêu hóa & làm đẹp lông</span>
                  </li>
                </ul>

                {/* Stats */}
                <div className="mb-6 flex flex-wrap gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-[rgb(var(--color-primary))]">200+</span>
                    <span className="text-ink/70 font-semibold">Sản phẩm</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-[rgb(var(--color-primary))]">4.8★</span>
                    <span className="text-ink/70 font-semibold">Đánh giá</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-[rgb(var(--color-primary))]">50k+</span>
                    <span className="text-ink/70 font-semibold">Đã bán</span>
                  </div>
                </div>
              </div>

              {/* Cat Image - Responsive positioning */}
              <div className="absolute -bottom-8 sm:-bottom-12 lg:-bottom-16 -right-6 sm:-right-8 lg:-right-10 z-10 w-[200px] sm:w-[280px] md:w-[350px] lg:w-[450px]">
                <Image
                  src="/assets/images/cat.webp"
                  alt="Mèo cưng"
                  width={450}
                  height={450}
                  className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Cat Products Grid - 12 products */}
            {catProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {catProducts.slice(0, 12).map((product) => (
                  <ProductCard
                    key={product.id || product.name}
                    product={product}
                    petType="cat"
                    accentClass="text-forest"
                    accentSoftClass="bg-forest/5"
                    hoverBorderClass="border-forest/5 hover:border-forest/20"
                    imageBgClass="bg-cream/30 group-hover:bg-cream/50"
                    hoverTitleClass="group-hover:text-forest"
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm font-semibold text-gray-500">
                Chưa có sản phẩm phù hợp.
              </div>
            )}

            {/* View More Button */}
            <div className="flex justify-center pt-2">
              <Link 
                to="/products?petType=cat" 
                className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--color-primary))] px-6 py-3 sm:px-8 sm:py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <span>Xem tất cả sản phẩm cho mèo</span>
                <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Dog Food Section */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Banner Card - Full Width with Rich Content */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[rgb(var(--color-primary-soft))] to-[rgb(var(--color-primary-muted))] border border-[rgb(var(--color-primary-muted))] p-6 sm:p-8 lg:p-10 shadow-lg group min-h-[320px] sm:min-h-[340px] lg:min-h-[360px]">
              <div className="relative z-20 max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-wider text-[rgb(var(--color-primary))] backdrop-blur-md shadow-sm">
                  <PawPrint size={14} className="fill-current" />
                  Dành cho Chó
                </div>
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-ink mb-3 leading-tight">
                  Phát triển toàn diện <br className="hidden sm:block" />
                  cho cún cưng
                </h3>
                
                <p className="text-sm sm:text-base lg:text-lg text-ink/75 mb-4 max-w-xl leading-relaxed">
                  Thức ăn giàu protein và vitamin giúp cún cưng luôn khỏe mạnh, vui vẻ và năng động mỗi ngày.
                </p>

                {/* Features List */}
                <ul className="mb-6 space-y-2 text-sm text-ink/70">
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/60">
                      <svg className="h-3 w-3 text-[rgb(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Protein cao từ thịt thật tươi ngon</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/60">
                      <svg className="h-3 w-3 text-[rgb(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Tăng cường xương khớp & cơ bắp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/60">
                      <svg className="h-3 w-3 text-[rgb(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Phù hợp mọi giống & lứa tuổi</span>
                  </li>
                </ul>

                {/* Stats */}
                <div className="mb-6 flex flex-wrap gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-[rgb(var(--color-primary))]">300+</span>
                    <span className="text-ink/70 font-semibold">Sản phẩm</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-[rgb(var(--color-primary))]">4.9★</span>
                    <span className="text-ink/70 font-semibold">Đánh giá</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-[rgb(var(--color-primary))]">80k+</span>
                    <span className="text-ink/70 font-semibold">Đã bán</span>
                  </div>
                </div>
              </div>

              {/* Dog Image - Responsive positioning */}
              <div className="absolute -bottom-8 sm:-bottom-12 lg:-bottom-16 -right-6 sm:-right-8 lg:-right-10 z-10 w-[220px] sm:w-[300px] md:w-[370px] lg:w-[480px]">
                <Image
                  src="/assets/images/dog.webp"
                  alt="Cún cưng"
                  width={480}
                  height={480}
                  className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Dog Products Grid - 12 products */}
            {dogProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {dogProducts.slice(0, 12).map((product) => (
                  <ProductCard
                    key={product.id || product.name}
                    product={product}
                    petType="dog"
                    accentClass="text-forest"
                    accentSoftClass="bg-forest/5"
                    hoverBorderClass="border-forest/5 hover:border-forest/20"
                    imageBgClass="bg-cream/30 group-hover:bg-cream/50"
                    hoverTitleClass="group-hover:text-forest"
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm font-semibold text-gray-500">
                Chưa có sản phẩm phù hợp.
              </div>
            )}

            {/* View More Button */}
            <div className="flex justify-center pt-2">
              <Link 
                to="/products?petType=dog" 
                className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--color-primary))] px-6 py-3 sm:px-8 sm:py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <span>Xem tất cả sản phẩm cho chó</span>
                <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

        </div>
      </MotionSection>
    </section>
  );
}
