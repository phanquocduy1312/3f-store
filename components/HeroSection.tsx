"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Image } from "@/components/Image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const heroBanners = [
  "/assets/images/banner-1.png",
  "/assets/images/banner-2.png",
  "/assets/images/banner-3.png",
  "/assets/images/banner-4.png",
];

export function HeroSection() {
  return (
    <section className="bg-[#f6f2ea] pt-4 pb-6">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2 lg:h-[540px]">
          {/* Main Slider - Spans 2 columns and 2 rows */}
          <div className="relative overflow-hidden rounded-3xl bg-[#efe5d5] shadow-glass lg:col-span-2 lg:row-span-2 group">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              slidesPerView={1}
              loop
              speed={800}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
              pagination={{ clickable: true, el: ".hero-pagination" }}
              className="h-full w-full"
            >
              {heroBanners.slice(0, 3).map((banner, index) => (
                <SwiperSlide key={banner} className="h-full w-full">
                  <Image
                    src={banner}
                    alt={`Banner trang chu ${index + 1}`}
                    width={1600}
                    height={900}
                    priority={index === 0}
                    className="h-full w-full object-cover transition-transform duration-[10000ms] hover:scale-105"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation */}
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-between p-4">
              <button
                className="hero-prev pointer-events-auto grid h-12 w-12 -translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 place-items-center rounded-full border border-white/20 bg-black/15 text-white backdrop-blur-md hover:scale-105 hover:bg-black/30"
                aria-label="Banner truoc"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="hero-next pointer-events-auto grid h-12 w-12 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 place-items-center rounded-full border border-white/20 bg-black/15 text-white backdrop-blur-md hover:scale-105 hover:bg-black/30"
                aria-label="Banner tiep theo"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            {/* Custom Pagination Container */}
            <div className="hero-pagination absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2"></div>
          </div>

          {/* Top Right Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-glass-sm group h-[250px] lg:h-auto">
            <Image
              src={heroBanners[3]}
              alt="Promo banner 1"
              width={800}
              height={450}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute bottom-5 left-5 right-5 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                Khám phá ngay
              </span>
            </div>
          </div>

          {/* Bottom Right Banner - Custom Promotional Card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#10854F] to-[#0A5D35] p-7 shadow-[0_20px_40px_rgba(16,133,79,0.15)] text-white flex flex-col justify-between group min-h-[260px] lg:h-auto border border-white/10">
            {/* Animated Glow Elements */}
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#F2C94C]/20 blur-[40px] transition-transform duration-700 group-hover:scale-150 group-hover:bg-[#F2C94C]/30" />
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-[30px] transition-transform duration-700 group-hover:scale-150" />

            {/* Image Section */}
            <div className="absolute right-0 top-0 bottom-0 w-[65%] overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-[#10854F] via-[#10854F]/70 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A5D35] via-transparent to-transparent z-10 opacity-60" />
              <Image 
                src="/assets/images/promo_pet_3d.png" 
                alt="Promo Pet" 
                width={500} 
                height={500} 
                className="h-[120%] w-[120%] object-cover object-[80%_center] opacity-95 transition-transform duration-1000 ease-out group-hover:scale-105 group-hover:-translate-x-2 mix-blend-screen" 
              />
            </div>
            
            <div className="relative z-20 flex-1 flex flex-col justify-between h-full">
              <div>
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
                  <Star size={12} className="fill-[#F2C94C] text-[#F2C94C]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F2C94C]">
                    Thành viên mới
                  </span>
                </div>
                <h3 className="text-[28px] font-black leading-[1.1] mb-2 drop-shadow-md tracking-tight">
                  Ưu đãi 15% <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6D9] to-[#F2C94C]">cho đơn đầu</span>
                </h3>
                <p className="text-emerald-50 text-[13px] max-w-[180px] leading-relaxed drop-shadow-sm font-medium opacity-90">
                  Đăng ký ngay để nhận ngập tràn ưu đãi từ 3F Store.
                </p>
              </div>
              
              <button className="mt-6 inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-[#F2C94C] to-[#E5B523] px-5 py-2.5 text-sm font-black text-[#3A2D00] shadow-[0_8px_20px_rgba(242,201,76,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_25px_rgba(242,201,76,0.5)] active:scale-95">
                Đăng ký ngay
                <span className="grid h-5 w-5 place-items-center rounded-full bg-black/10">
                  <ChevronRight size={14} className="text-[#3A2D00]" strokeWidth={3} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
