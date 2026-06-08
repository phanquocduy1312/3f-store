"use client";

import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { Ticket, Copy, CheckCircle2, PawPrint, Bone, Gift, Truck, Coins, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

const vouchers = [
  {
    id: "v1",
    title: "GIẢM 15%",
    desc: "Đơn tối thiểu 400K. Tối đa 50K.",
    code: "BOSS15",
    exp: "Còn 2 ngày",
    color: "from-emerald-400 to-emerald-600",
    bgLight: "bg-emerald-50",
    textDark: "text-emerald-700",
    icon: PawPrint,
    label: "HOT DEALS"
  },
  {
    id: "v2",
    title: "FREESHIP",
    desc: "Giảm 30K phí ship. Đơn từ 200K.",
    code: "FREE30K",
    exp: "HSD: 30/06",
    color: "from-blue-400 to-indigo-500",
    bgLight: "bg-blue-50",
    textDark: "text-indigo-700",
    icon: Truck,
    label: "VẬN CHUYỂN"
  },
  {
    id: "v3",
    title: "GIẢM 50K",
    desc: "Dành cho Khách mới. Mọi đơn hàng.",
    code: "NEWFRIEND",
    exp: "Không thời hạn",
    color: "from-amber-400 to-orange-500",
    bgLight: "bg-amber-50",
    textDark: "text-orange-700",
    icon: Gift,
    label: "KHÁCH MỚI"
  },
  {
    id: "v4",
    title: "TẶNG PATE",
    desc: "Mua 2 tặng 1 Pate Mèo Cao Cấp.",
    code: "MEOWPATE",
    exp: "Số lượng có hạn",
    color: "from-rose-400 to-pink-500",
    bgLight: "bg-rose-50",
    textDark: "text-rose-700",
    icon: Bone, // Using Bone as a generic pet treat icon
    label: "TẶNG QUÀ"
  },
  {
    id: "v5",
    title: "GIẢM 10%",
    desc: "Áp dụng cho Phụ Kiện và Đồ Chơi.",
    code: "PLAY10",
    exp: "HSD: 15/07",
    color: "from-violet-400 to-purple-600",
    bgLight: "bg-violet-50",
    textDark: "text-purple-700",
    icon: Sparkles,
    label: "PHỤ KIỆN"
  },
  {
    id: "v6",
    title: "HOÀN 10%",
    desc: "Hoàn xu tối đa 100K cho đơn tiếp.",
    code: "CASHBACK",
    exp: "Chỉ cuối tuần",
    color: "from-teal-400 to-cyan-600",
    bgLight: "bg-teal-50",
    textDark: "text-cyan-700",
    icon: Coins,
    label: "HOÀN TIỀN"
  }
];

export function VoucherSection() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="relative overflow-hidden bg-[#F6F2EA] py-16 lg:py-24">
      {/* Pet-themed playful background elements */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-40" 
        style={{ backgroundImage: "radial-gradient(#10854F 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} 
      />
      
      {/* Decorative large paws in background */}
      <div className="pointer-events-none absolute -left-10 top-10 rotate-12 text-forest/5">
        <PawPrint size={200} />
      </div>
      <div className="pointer-events-none absolute right-10 -bottom-10 -rotate-12 text-honey/10">
        <Bone size={250} />
      </div>

      <MotionSection className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <MotionItem {...motionItemProps} className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white/60 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-forest backdrop-blur-md">
              <Ticket size={14} className="text-forest" />
              Đặc Quyền Hội Yêu Thú
            </div>
            <h2 className="text-[2.5rem] font-black leading-tight text-ink sm:text-[3rem] tracking-tight">
              Gôm Ngay Voucher
              <br />
              <span className="text-forest">Nuôi Boss Nhàn Tênh</span>
            </h2>
          </MotionItem>

          <MotionItem {...motionItemProps} className="flex gap-3">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all hover:bg-forest hover:text-white hover:shadow-[0_8px_20px_rgba(16,133,79,0.2)] active:scale-95"
            >
              <ChevronLeft size={24} className="transition-transform group-hover:-translate-x-1" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all hover:bg-forest hover:text-white hover:shadow-[0_8px_20px_rgba(16,133,79,0.2)] active:scale-95"
            >
              <ChevronRight size={24} className="transition-transform group-hover:translate-x-1" />
            </button>
          </MotionItem>
        </div>

        <MotionItem {...motionItemProps} className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.1}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4 },
            }}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="!pb-12 !pt-4"
          >
            {vouchers.map((voucher) => (
              <SwiperSlide key={voucher.id} className="py-2">
                <div className="group relative flex h-[140px] w-full overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(16,133,79,0.12)]">
                  
                  {/* Left Side: Themed Colored Block */}
                  <div className={`relative flex w-[110px] shrink-0 flex-col items-center justify-center bg-gradient-to-br ${voucher.color} text-white`}>
                    {/* Faint paw prints on left block */}
                    <div className="absolute inset-0 overflow-hidden opacity-20">
                      <PawPrint size={40} className="absolute -left-2 -top-2 rotate-12" />
                      <PawPrint size={30} className="absolute -bottom-3 -right-2 -rotate-12" />
                    </div>
                    
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-sm">
                      <voucher.icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10 mt-3 text-center text-[10px] font-black uppercase tracking-widest text-white/90">
                      {voucher.label}
                    </div>
                  </div>

                  {/* Cutout details on the border between left and right */}
                  <div className="absolute left-[104px] -top-3 z-10 h-6 w-6 rounded-full bg-[#F6F2EA] shadow-inner" />
                  <div className="absolute left-[104px] -bottom-3 z-10 h-6 w-6 rounded-full bg-[#F6F2EA] shadow-inner" />
                  <div className="absolute left-[109px] top-0 bottom-0 border-l-[3px] border-dashed border-white/40" />

                  {/* Right Side: Details & Action */}
                  <div className="flex flex-1 flex-col justify-between p-4 pl-6 relative">
                    {/* Watermark in right side */}
                    <voucher.icon size={80} className={`absolute right-4 top-4 opacity-[0.03] ${voucher.textDark}`} />
                    
                    <div>
                      <h3 className={`text-[1.35rem] font-black leading-none tracking-tight ${voucher.textDark}`}>
                        {voucher.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] font-medium leading-snug text-ink/70 line-clamp-2 pr-2">
                        {voucher.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${voucher.bgLight} ${voucher.textDark}`}>
                        {voucher.exp}
                      </div>
                      
                      <button
                        onClick={() => handleCopy(voucher.id, voucher.code)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                          copiedId === voucher.id 
                            ? "bg-emerald-500 text-white" 
                            : `bg-ink text-white hover:${voucher.bgLight} hover:${voucher.textDark}`
                        }`}
                        title="Lưu mã"
                      >
                        {copiedId === voucher.id ? <CheckCircle2 size={16} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </MotionItem>
      </MotionSection>
    </section>
  );
}
