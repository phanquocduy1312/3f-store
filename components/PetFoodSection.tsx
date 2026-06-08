"use client";

import { Link } from "react-router-dom";
import { Image } from "@/components/Image";
import { ArrowRight, Star, PawPrint } from "lucide-react";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { getCatFoodProducts, getDogFoodProducts } from "@/data/store";
import type { Product } from "@/types/store";

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
    <article className={`group flex h-full flex-col rounded-[1.5rem] border bg-white overflow-hidden shadow-glass-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-glass ${hoverBorderClass}`}>
      <Link to={`/product/${product.id || product.name}`} className={`relative flex h-[180px] w-full items-center justify-center transition-colors ${imageBgClass}`}>
        {hasDiscount && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#132117] px-2.5 py-1 text-[11px] font-black text-white shadow-md z-10">
            -{discount}%
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          width={200}
          height={200}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      <div className="p-3 flex flex-col flex-1">
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
          <div className="flex items-center gap-1 text-honey">
            <Star size={12} fill="currentColor" strokeWidth={2} />
            <span className="text-xs font-bold text-ink/70">{product.rating}</span>
          </div>
          <span className="text-[11px] font-semibold text-ink/45">Đã bán {meta.soldLabel}</span>
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-base font-black ${accentClass}`}>{product.price}</span>
              {hasDiscount && (
                <span className="text-[10px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                  -{discount}%
                </span>
              )}
            </div>
            {product.oldPrice && (
              <div className="text-[10px] font-semibold text-ink/40 line-through mt-0.5">{product.oldPrice}</div>
            )}
          </div>
          <button className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:text-white ${accentSoftClass} ${accentClass}`}>
            <PawPrint size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function PetFoodSection() {
  return (
    <section className="relative bg-white py-12 lg:py-16">
      <MotionSection className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:gap-16">
          
          {/* Cat Food Section */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Banner Card - Full Width with Rich Content */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#F6FBF4] to-[#DCECD7] border border-[#E5F0E2] p-6 sm:p-8 lg:p-10 shadow-lg group min-h-[320px] sm:min-h-[340px] lg:min-h-[360px]">
              <div className="relative z-20 max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-wider text-forest backdrop-blur-md shadow-sm">
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
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-forest/10">
                      <svg className="h-3 w-3 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Thành phần tự nhiên, an toàn 100%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-forest/10">
                      <svg className="h-3 w-3 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Cân bằng protein, vitamin & khoáng chất</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-forest/10">
                      <svg className="h-3 w-3 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Hỗ trợ tiêu hóa & làm đẹp lông</span>
                  </li>
                </ul>

                {/* Stats */}
                <div className="mb-6 flex flex-wrap gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-forest">200+</span>
                    <span className="text-ink/70 font-semibold">Sản phẩm</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-forest">4.8★</span>
                    <span className="text-ink/70 font-semibold">Đánh giá</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-forest">50k+</span>
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

            {/* View More Button */}
            <div className="flex justify-center pt-2">
              <Link 
                to="/products?category=Thức ăn cho mèo" 
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 sm:px-8 sm:py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <span>Xem tất cả sản phẩm cho mèo</span>
                <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Dog Food Section */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Banner Card - Full Width with Rich Content */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF6F4] to-[#FDE3E0] border border-[#F8DFDB] p-6 sm:p-8 lg:p-10 shadow-lg group min-h-[320px] sm:min-h-[340px] lg:min-h-[360px]">
              <div className="relative z-20 max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#D97A73] backdrop-blur-md shadow-sm">
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
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E58F89]/20">
                      <svg className="h-3 w-3 text-[#D97A73]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Protein cao từ thịt thật tươi ngon</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E58F89]/20">
                      <svg className="h-3 w-3 text-[#D97A73]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Tăng cường xương khớp & cơ bắp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E58F89]/20">
                      <svg className="h-3 w-3 text-[#D97A73]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Phù hợp mọi giống & lứa tuổi</span>
                  </li>
                </ul>

                {/* Stats */}
                <div className="mb-6 flex flex-wrap gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-[#D97A73]">300+</span>
                    <span className="text-ink/70 font-semibold">Sản phẩm</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-[#D97A73]">4.9★</span>
                    <span className="text-ink/70 font-semibold">Đánh giá</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 backdrop-blur-sm">
                    <span className="text-lg font-black text-[#D97A73]">80k+</span>
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
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {dogProducts.slice(0, 12).map((product) => (
                <ProductCard
                  key={product.id || product.name}
                  product={product}
                  petType="dog"
                  accentClass="text-[#D97A73]"
                  accentSoftClass="bg-[#E58F89]/10"
                  hoverBorderClass="border-[#E58F89]/10 hover:border-[#E58F89]/30"
                  imageBgClass="bg-[#FFF6F4]/50 group-hover:bg-[#FFF6F4]"
                  hoverTitleClass="group-hover:text-[#D97A73]"
                />
              ))}
            </div>

            {/* View More Button */}
            <div className="flex justify-center pt-2">
              <Link 
                to="/products?category=Thức ăn cho chó" 
                className="inline-flex items-center gap-2 rounded-full bg-[#E58F89] px-6 py-3 sm:px-8 sm:py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
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
