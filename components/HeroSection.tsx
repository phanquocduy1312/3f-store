"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, PawPrint } from "lucide-react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { Image } from "@/components/Image";
import { getActiveBanners, trackBannerClick, type Banner } from "@/src/api/bannersApi";
import { buildApiUrl } from "@/src/config/api";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const heroBanners = [
  "/assets/images/banner-1.webp",
  "/assets/images/banner-2.webp",
  "/assets/images/banner-3.webp",
  "/assets/images/banner-4.webp",
];

export function HeroSection() {
  const [sliderBanners, setSliderBanners] = useState<Banner[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    getActiveBanners("home_hero_slider")
      .then(res => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setSliderBanners(res.data);

          // Track impressions once per page load in the background
          res.data.forEach(b => {
            fetch(buildApiUrl(`/api/banners/${b.id}/impression`), { method: "POST" }).catch(() => {});
          });
        }
      })
      .catch(err => {
        console.error("Failed to load banners from API", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBannerClick = (id: number) => {
    trackBannerClick(id).catch(() => {});
  };

  return (
    <section className="relative overflow-hidden bg-[#F5F9FF] pt-4 pb-0">
      {/* Decorative paw prints matching sections below */}
      <div className="pointer-events-none absolute -left-10 top-10 rotate-12 text-forest/5">
        <PawPrint size={180} />
      </div>
      <div className="pointer-events-none absolute right-10 bottom-10 -rotate-12 text-forest/5 hidden lg:block">
        <PawPrint size={150} />
      </div>
      
      <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:grid-rows-2 lg:h-[540px]">
          {/* Main Slider - Spans 2 columns on mobile and 2 cols/2 rows on lg */}
          <div className="relative overflow-hidden rounded-[1.25rem] sm:rounded-3xl bg-[#efe5d5] shadow-glass col-span-2 lg:row-span-2 group">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              slidesPerView={1}
              loop
              speed={800}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
              pagination={{ clickable: true, el: ".hero-pagination" }}
              className="h-[200px] sm:h-[350px] lg:h-full w-full"
            >
              {sliderBanners.length > 0 ? (
                sliderBanners.map((banner, index) => (
                  <SwiperSlide key={banner.id} className="h-full w-full">
                    <Link
                      to={banner.link_url || "#"}
                      onClick={() => handleBannerClick(banner.id)}
                      className="block h-full w-full relative"
                    >
                      <Image
                        src={banner.image_url}
                        alt={banner.title || `Banner trang chu ${index + 1}`}
                        width={1600}
                        height={900}
                        priority={index === 0}
                        className="h-full w-full object-cover transition-transform duration-[10000ms] hover:scale-105"
                      />
                      {(banner.title || banner.subtitle) && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent z-10 flex flex-col justify-end p-6 text-white">
                          {banner.title && <h3 className="text-xl sm:text-3xl font-black mb-1 drop-shadow">{banner.title}</h3>}
                          {banner.subtitle && <p className="text-sm sm:text-base opacity-90 drop-shadow">{banner.subtitle}</p>}
                        </div>
                      )}
                    </Link>
                  </SwiperSlide>
                ))
              ) : (
                heroBanners.slice(0, 3).map((banner, index) => (
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
                ))
              )}
            </Swiper>

            {/* Custom Navigation */}
            <div className="absolute inset-0 z-10 pointer-events-none hidden sm:flex items-center justify-between p-4">
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
            <div className="hero-pagination absolute bottom-2 sm:bottom-4 left-0 right-0 z-10 flex justify-center gap-2"></div>
          </div>

          {/* Top Right Banner - AI Pet Advisor */}
          <Link to="#" className="relative flex overflow-hidden rounded-[1rem] sm:rounded-[2rem] shadow-glass-sm group h-[160px] xs:h-[180px] sm:h-full w-full border border-[rgb(var(--color-border))] transition-all duration-500 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
            <div className="absolute inset-0 z-0">
              <Image
                src="/assets/images/AI.png"
                alt="AI Pet Advisor"
                fill
                className="object-fill"
                priority
              />
            </div>
            
            <div className="relative z-20 flex-1 flex flex-col justify-end h-full w-full p-3 sm:p-5 lg:p-6">
              <div>
                <h3 className="text-[13px] sm:text-[20px] xl:text-[24px] font-black leading-[1.15] mb-1 text-white tracking-tight drop-shadow-sm">
                  Tìm đúng sản phẩm <br />
                  <span className="text-[#FFC107]">cho Boss</span>
                </h3>
                <p className="text-white text-[9px] xs:text-[10px] sm:text-[12px] xl:text-[13px] max-w-[190px] leading-[1.3] font-normal opacity-95 drop-shadow-sm">
                  AI gợi ý thức ăn & phụ kiện theo tuổi, nhu cầu và ngân sách của bé.
                </p>
              </div>
              
              <button className="mt-1.5 sm:mt-4 inline-flex w-fit items-center gap-1 sm:gap-1.5 rounded-full bg-[#FFC107] px-2.5 py-1 sm:px-4 sm:py-2 text-[9px] xs:text-[10px] sm:text-[13px] xl:text-[14px] font-bold text-[#1A1A1A] shadow-[0_0_15px_rgba(255,193,7,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,193,7,0.6)] active:scale-95">
                Hỏi AI ngay
                <ChevronRight size={12} className="text-[#1A1A1A] sm:w-4 sm:h-4" strokeWidth={3} />
              </button>
            </div>
          </Link>

          {/* Bottom Right Banner - Custom Promotional Card */}
          <Link to="/register" className="relative flex overflow-hidden rounded-[1rem] sm:rounded-[2rem] shadow-glass-sm group h-[160px] xs:h-[180px] sm:h-full w-full border border-[rgb(var(--color-border))] transition-all duration-500 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
            <div className="absolute inset-0 z-0">
              <Image
                src="/assets/images/voucher.png"
                alt="Khuyến mãi"
                fill
                className="object-fill"
                priority
              />
            </div>
            
            <div className="relative z-20 flex-1 flex flex-col justify-end h-full w-full p-3 sm:p-5 lg:p-6">
              <div>
                <h3 className="text-[13px] sm:text-[20px] xl:text-[23px] font-black leading-[1.15] mb-1 text-white tracking-tight drop-shadow-sm">
                  Nhận voucher <br />
                  <span className="text-[#FFC107]">30K + giảm 15%</span> <br />
                  đơn đầu
                </h3>
                <p className="text-white text-[9px] xs:text-[10px] sm:text-[12px] xl:text-[13px] max-w-[190px] leading-[1.3] font-normal opacity-95 drop-shadow-sm">
                  Đăng ký ngay để vào 3F Club, tích điểm và nhận ưu đãi riêng.
                </p>
              </div>
              
              <button className="mt-1.5 sm:mt-3 inline-flex w-fit items-center gap-1 sm:gap-1.5 rounded-full bg-[#FFC107] px-2.5 py-1 sm:px-4 sm:py-2 text-[9px] xs:text-[10px] sm:text-[13px] xl:text-[14px] font-bold text-[#1A1A1A] shadow-[0_0_15px_rgba(255,193,7,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,193,7,0.6)] active:scale-95">
                Đăng ký ngay
                <ChevronRight size={12} className="text-[#1A1A1A] sm:w-4 sm:h-4" strokeWidth={3} />
              </button>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
