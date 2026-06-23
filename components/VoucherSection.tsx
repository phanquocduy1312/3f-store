"use client";

import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { getFeaturedVouchers, trackVoucherEvent, type PublicVoucher } from "@/src/api/vouchersApi";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bone, CheckCircle2, ChevronLeft, ChevronRight, Coins, Copy, Gift, PawPrint, Sparkles, Ticket, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

const fallbackVouchers: PublicVoucher[] = [
  {
    id: 0,
    code: "BOSS15",
    title: "GIẢM 15%",
    name: "Giảm 15%",
    description: "Đơn tối thiểu 400K. Tối đa 50K.",
    label: "HOT DEALS",
    badgeText: "Còn 2 ngày",
    themeColor: "sky",
    iconKey: "paw",
    discountType: "percent",
    discountValue: 15,
    maxDiscountAmount: 50000,
    minOrderAmount: 400000,
    endsAt: null,
    usageLimit: null,
    usedCount: 0,
  },
  {
    id: 0,
    code: "FREE30K",
    title: "FREESHIP",
    name: "Freeship",
    description: "Giảm 30K phí ship. Đơn từ 200K.",
    label: "VẬN CHUYỂN",
    badgeText: "HSD: 30/06",
    themeColor: "indigo",
    iconKey: "truck",
    discountType: "fixed",
    discountValue: 30000,
    maxDiscountAmount: null,
    minOrderAmount: 200000,
    endsAt: null,
    usageLimit: null,
    usedCount: 0,
  },
];

const themeClasses: Record<string, { color: string; bgLight: string; textDark: string }> = {
  sky: { color: "from-sky-400 to-sky-600", bgLight: "bg-sky-50", textDark: "text-sky-700" },
  indigo: { color: "from-blue-400 to-indigo-500", bgLight: "bg-blue-50", textDark: "text-indigo-700" },
  amber: { color: "from-amber-400 to-orange-500", bgLight: "bg-amber-50", textDark: "text-orange-700" },
  rose: { color: "from-rose-400 to-pink-500", bgLight: "bg-rose-50", textDark: "text-rose-700" },
  violet: { color: "from-violet-400 to-purple-600", bgLight: "bg-violet-50", textDark: "text-purple-700" },
  teal: { color: "from-teal-400 to-cyan-600", bgLight: "bg-teal-50", textDark: "text-cyan-700" },
  red: { color: "from-red-400 to-rose-500", bgLight: "bg-red-50", textDark: "text-red-700" },
};

const icons = {
  ticket: Ticket,
  paw: PawPrint,
  truck: Truck,
  gift: Gift,
  bone: Bone,
  sparkles: Sparkles,
  coins: Coins,
};

function VoucherCard({
  voucher,
  copiedId,
  handleCopy,
}: {
  voucher: PublicVoucher;
  copiedId: number | null;
  handleCopy: (voucher: PublicVoucher) => void;
}) {
  const theme = themeClasses[voucher.themeColor] || themeClasses.sky;
  const Icon = icons[voucher.iconKey as keyof typeof icons] || Ticket;

  return (
    <div className="group relative flex h-[115px] w-full overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(16,133,79,0.12)] sm:h-[140px] sm:rounded-[1.25rem] sm:shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:hover:-translate-y-2">
      <div className={`relative flex w-[48px] shrink-0 flex-col items-center justify-center bg-gradient-to-br ${theme.color} text-white sm:w-[110px]`}>
        <div className="absolute inset-0 hidden overflow-hidden opacity-20 sm:block">
          <PawPrint className="absolute -left-2 -top-2 h-10 w-10 rotate-12" />
          <PawPrint className="absolute -bottom-3 -right-2 h-[30px] w-[30px] -rotate-12" />
        </div>
        <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 shadow-sm backdrop-blur-md sm:h-12 sm:w-12">
          <Icon className="h-3.5 w-3.5 sm:h-6 sm:w-6" strokeWidth={2.5} />
        </div>
        <div className="relative z-10 mt-3 hidden text-center text-[10px] font-black uppercase tracking-widest text-white/90 sm:block">
          {voucher.label || "VOUCHER"}
        </div>
      </div>

      <div className="absolute left-[42px] -top-2 z-10 h-4 w-4 rounded-full bg-[#F5F9FF] shadow-inner sm:left-[104px] sm:-top-3 sm:h-6 sm:w-6" />
      <div className="absolute left-[42px] -bottom-2 z-10 h-4 w-4 rounded-full bg-[#F5F9FF] shadow-inner sm:left-[104px] sm:-bottom-3 sm:h-6 sm:w-6" />
      <div className="absolute bottom-0 left-[47px] top-0 border-l-[2px] border-dashed border-white/40 sm:left-[109px] sm:border-l-[3px]" />

      <div className="relative flex min-w-0 flex-1 flex-col justify-between p-2.5 pl-3 sm:p-4 sm:pl-6">
        <Icon className={`absolute right-1 top-1 h-10 w-10 opacity-[0.03] sm:right-4 sm:top-4 sm:h-20 sm:w-20 ${theme.textDark}`} />
        <div>
          <h3 className={`text-[12px] font-black leading-none tracking-tight sm:text-[1.35rem] ${theme.textDark}`}>
            {voucher.title}
          </h3>
          <p className="mt-1 line-clamp-2 pr-1 text-[9px] font-medium leading-[1.3] text-ink/70 sm:mt-1.5 sm:pr-2 sm:text-[13px] sm:leading-snug">
            {voucher.description || voucher.name}
          </p>
        </div>

        <div className="mt-1 flex w-full flex-col items-start gap-1.5 sm:mt-0 sm:flex-row sm:items-center sm:justify-between">
          <div className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-bold sm:px-2.5 sm:py-1 sm:text-[10px] ${theme.bgLight} ${theme.textDark}`}>
            {voucher.badgeText || (voucher.minOrderAmount > 0 ? `Đơn từ ${Math.round(voucher.minOrderAmount / 1000)}K` : "Đang áp dụng")}
          </div>
          <button
            onClick={() => handleCopy(voucher)}
            className={`relative z-20 flex h-5 w-full items-center justify-center rounded-full px-2 text-[8px] font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 sm:h-8 sm:w-auto sm:px-4 sm:text-[11px] ${
              copiedId === voucher.id ? "bg-sky-500 text-white" : "bg-ink text-white"
            }`}
            title="Copy voucher"
          >
            {copiedId === voucher.id ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
            {copiedId === voucher.id ? "SAVED" : "SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VoucherSection() {
  const { isLoggedIn } = useCustomerAuth();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [vouchers, setVouchers] = useState<PublicVoucher[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    let alive = true;
    getFeaturedVouchers()
      .then((res) => {
        if (alive) setVouchers(res.data || []);
      })
      .catch(() => {
        if (alive) setVouchers(fallbackVouchers);
      });
    return () => {
      alive = false;
    };
  }, []);

  const desktopBreakpoints = useMemo(() => ({
    640: { slidesPerView: 2.2 },
    1024: { slidesPerView: 3.2 },
    1280: { slidesPerView: 4 },
  }), []);

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fallback
      }
    }
    fallbackCopyText(text);
    return true;
  };

  const handleCopy = async (voucher: PublicVoucher) => {
    if (!isLoggedIn) {
      setShowAuthWarning(true);
      return;
    }
    await copyToClipboard(voucher.code);
    setCopiedId(voucher.id);
    trackVoucherEvent({ couponId: voucher.id || null, code: voucher.code, eventType: "copy", metadata: { source: "home_voucher_section" } }).catch(() => undefined);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  if (!vouchers.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#F5F9FF] py-0">
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-40"
        style={{ backgroundImage: "radial-gradient(rgb(var(--color-primary)) 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
      />
      <div className="pointer-events-none absolute -left-10 top-10 rotate-12 text-forest/5">
        <PawPrint size={200} />
      </div>
      <div className="pointer-events-none absolute right-10 -bottom-10 -rotate-12 text-honey/10">
        <Bone size={250} />
      </div>

      <MotionSection className="relative z-10 mx-auto mt-0 max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col items-center justify-between gap-3 sm:flex-row sm:items-end">
          <MotionItem {...motionItemProps} className="max-w-xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white/60 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-forest backdrop-blur-md">
              <Ticket size={14} className="text-forest" />
              Đặc Quyền Hội Yêu Thú
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
              Gôm Ngay Voucher
              <br />
              <span className="text-forest">Nuôi Boss Nhàn Tênh</span>
            </h2>
          </MotionItem>

          <MotionItem {...motionItemProps} className="hidden gap-3 sm:flex">
            <button onClick={() => swiperRef.current?.slidePrev()} className="group flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all hover:bg-forest hover:text-white active:scale-95">
              <ChevronLeft size={24} className="transition-transform group-hover:-translate-x-1" />
            </button>
            <button onClick={() => swiperRef.current?.slideNext()} className="group flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all hover:bg-forest hover:text-white active:scale-95">
              <ChevronRight size={24} className="transition-transform group-hover:translate-x-1" />
            </button>
          </MotionItem>
        </div>

        <MotionItem {...motionItemProps} className="relative -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="grid grid-cols-2 gap-2.5 pb-4 pt-1 sm:hidden">
            {vouchers.map((voucher) => <VoucherCard key={`${voucher.id}-${voucher.code}`} voucher={voucher} copiedId={copiedId} handleCopy={handleCopy} />)}
          </div>

          <div className="hidden sm:block">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView={1.1}
              breakpoints={desktopBreakpoints}
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              className="!pb-4 !pt-1"
            >
              {vouchers.map((voucher) => (
                <SwiperSlide key={`${voucher.id}-${voucher.code}`} className="py-2">
                  <VoucherCard voucher={voucher} copiedId={copiedId} handleCopy={handleCopy} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </MotionItem>
      </MotionSection>

      <AnimatePresence>
        {showAuthWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthWarning(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[24px] bg-white p-6 text-center shadow-[0_24px_48px_rgba(0,0,0,0.16)] border border-slate-100"
            >
              {/* Warning/Lock Icon with animated gradient circle */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                <Ticket className="h-8 w-8 animate-pulse" />
              </div>
              
              <h3 className="mb-2 text-lg font-black text-[#0B1F3A]">
                Yêu cầu đăng nhập
              </h3>
              <p className="mb-6 text-sm font-semibold leading-relaxed text-[#64748B]">
                Vui lòng đăng nhập tài khoản 3F Store để lưu mã giảm giá và nhận thêm nhiều ưu đãi đặc quyền hội yêu thú!
              </p>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full rounded-xl bg-[#0057E7] py-3 text-sm font-black text-white transition hover:bg-[#0047C4] shadow-md hover:shadow-lg active:scale-95"
                >
                  Đăng nhập ngay
                </button>
                <button
                  onClick={() => setShowAuthWarning(false)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-ink/75 transition hover:bg-slate-50 active:scale-95"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
