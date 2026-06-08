"use client";

import { Link } from "react-router-dom";
import { Image } from "@/components/Image";
import { ArrowRight, Star, PawPrint, ShieldCheck, Truck } from "lucide-react";
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

function getPriceValue(price: string) {
  return Number(price.replace(/\D/g, "")) || 0;
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
  const soldLabel = product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k+` : `${Math.max(product.sold, 120)}+`;

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
    <article className={`group flex h-full flex-col rounded-[1.5rem] border bg-white p-4 shadow-glass-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-glass ${hoverBorderClass}`}>
      <Link to={`/product/${product.id || product.name}`} className={`relative flex h-[160px] w-full items-center justify-center rounded-2xl p-4 transition-colors ${imageBgClass}`}>
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-[#132117] px-2.5 py-1 text-[10px] font-black text-white">
            -{discount}%
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          width={140}
          height={140}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${accentSoftClass} ${accentClass}`}>
          {meta.typeLabel}
        </span>
        <span className="rounded-full bg-[#F6F7F5] px-2.5 py-1 text-[10px] font-bold text-ink/60">
          {meta.ageLabel}
        </span>
      </div>

      <Link to={`/product/${product.id || product.name}`}>
        <h3 className={`mt-3 text-sm font-bold leading-snug text-ink line-clamp-2 min-h-[40px] transition-colors ${hoverTitleClass}`}>
          {product.name}
        </h3>
      </Link>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-honey">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={12}
              fill={index < Math.round(product.rating) ? "currentColor" : "none"}
              strokeWidth={2}
            />
          ))}
          <span className="ml-1 text-xs font-semibold text-ink/50">({product.reviews})</span>
        </div>
        <span className="text-[11px] font-semibold text-ink/45">Đã bán {meta.soldLabel}</span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-ink/55">
        <ShieldCheck size={13} className={accentClass} />
        <span>{meta.featureLabel}</span>
        <span className="text-ink/20">•</span>
        <Truck size={13} className={accentClass} />
        <span>Giao nhanh</span>
      </div>

      <div className="mt-auto pt-3 flex items-end justify-between">
        <div>
          <span className={`text-base font-black ${accentClass}`}>{product.price}</span>
          {product.oldPrice && (
            <div className="text-[10px] font-semibold text-ink/40 line-through">{product.oldPrice}</div>
          )}
        </div>
        <button className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:text-white ${accentSoftClass} ${accentClass}`}>
          <PawPrint size={14} />
        </button>
      </div>
    </article>
  );
}

export function PetFoodSection() {
  return (
    <section className="relative bg-white py-12">
      <MotionSection className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12">
          
          {/* Cat Food Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Banner card - Clean layout */}
            <div className="relative flex lg:w-1/3 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#F6FBF4] to-[#DCECD7] border border-[#E5F0E2] p-8 shadow-glass-sm group min-h-[280px] lg:min-h-0">
              <div className="relative z-20">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-forest backdrop-blur-md">
                  <PawPrint size={14} className="fill-current" />
                  Dành cho Mèo
                </div>
                <h3 className="text-2xl font-black text-ink mb-2">Dinh dưỡng cân bằng <br/>cho mèo cưng</h3>
                <p className="text-sm text-ink/70 mb-6 max-w-[60%] sm:max-w-[80%]">Hỗ trợ sức khỏe toàn diện, giúp mèo cưng luôn năng động.</p>
                
                <Link to="/products?category=Thức ăn cho mèo" className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105">
                  Xem tất cả
                  <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="absolute -bottom-10 -right-10 z-10 w-[45%] sm:w-[50%] lg:w-[70%]">
                <Image
                  src="/assets/images/cat.webp"
                  alt="Mèo cưng"
                  width={300}
                  height={300}
                  className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Cat Products Swiper */}
            <div className="lg:w-2/3 min-w-0">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={16}
                slidesPerView={2}
                breakpoints={{
                  640: { slidesPerView: 3, spaceBetween: 20 },
                  1024: { slidesPerView: 3, spaceBetween: 24 }
                }}
                pagination={{ clickable: true, dynamicBullets: true }}
                className="!pb-12 h-full"
              >
                {catProducts.map((product) => (
                  <SwiperSlide key={product.id || product.name} className="h-auto">
                    <ProductCard
                      product={product}
                      petType="cat"
                      accentClass="text-forest"
                      accentSoftClass="bg-forest/5"
                      hoverBorderClass="border-forest/5 hover:border-forest/20"
                      imageBgClass="bg-cream/30 group-hover:bg-cream/50"
                      hoverTitleClass="group-hover:text-forest"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Dog Food Section */}
          <div className="flex flex-col lg:flex-row-reverse gap-6">
            {/* Banner card */}
            <div className="relative flex lg:w-1/3 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF6F4] to-[#FDE3E0] border border-[#F8DFDB] p-8 shadow-glass-sm group min-h-[280px] lg:min-h-0">
              <div className="relative z-20">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-[#D97A73] backdrop-blur-md">
                  <PawPrint size={14} className="fill-current" />
                  Dành cho Chó
                </div>
                <h3 className="text-2xl font-black text-ink mb-2">Phát triển toàn diện <br/>cho cún cưng</h3>
                <p className="text-sm text-ink/70 mb-6 max-w-[60%] sm:max-w-[80%]">Thức ăn giàu protein và vitamin giúp cún cưng luôn khỏe mạnh.</p>
                
                <Link to="/products?category=Thức ăn cho chó" className="inline-flex items-center gap-2 rounded-full bg-[#E58F89] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105">
                  Xem tất cả
                  <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="absolute -bottom-10 -right-10 z-10 w-[50%] sm:w-[55%] lg:w-[75%]">
                <Image
                  src="/assets/images/dog.webp"
                  alt="Cún cưng"
                  width={300}
                  height={300}
                  className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Dog Products Swiper */}
            <div className="lg:w-2/3 min-w-0">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={16}
                slidesPerView={2}
                breakpoints={{
                  640: { slidesPerView: 3, spaceBetween: 20 },
                  1024: { slidesPerView: 3, spaceBetween: 24 }
                }}
                pagination={{ clickable: true, dynamicBullets: true }}
                className="!pb-12 h-full"
              >
                {dogProducts.map((product) => (
                  <SwiperSlide key={product.id || product.name} className="h-auto">
                    <ProductCard
                      product={product}
                      petType="dog"
                      accentClass="text-[#D97A73]"
                      accentSoftClass="bg-[#E58F89]/10"
                      hoverBorderClass="border-[#E58F89]/10 hover:border-[#E58F89]/30"
                      imageBgClass="bg-[#FFF6F4]/50 group-hover:bg-[#FFF6F4]"
                      hoverTitleClass="group-hover:text-[#D97A73]"
                    />
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
