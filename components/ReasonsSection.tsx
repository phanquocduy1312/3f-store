"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, HeartHandshake, MessageCircleHeart, ShieldCheck, Truck } from "lucide-react";
import { Image } from "@/components/Image";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";
import { ReasonCard } from "@/components/ReasonCard";
import { ReasonStatsBar } from "@/components/ReasonStatsBar";
import { reasons } from "@/data/store";

const trustPills = [
  { icon: ShieldCheck, label: "100% chính hãng", tone: "from-emerald-50 to-white" },
  { icon: Truck, label: "Freeship từ 299k", tone: "from-amber-50 to-white" },
  { icon: MessageCircleHeart, label: "Tư vấn thú y 24/7", tone: "from-rose-50 to-white" },
];

export function ReasonsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="reason-mesh-bg relative overflow-hidden bg-[#FAFCF8] py-24 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 select-none whitespace-nowrap opacity-[0.015] mix-blend-multiply">
        <span className="text-[15rem] font-black tracking-tighter text-forest">TRUST & QUALITY</span>
      </div>

      <div className="pet-float-slow pointer-events-none absolute -left-[10%] top-[18%] h-[800px] w-[800px] rounded-full bg-gradient-to-tr from-emerald-100/50 to-teal-50/40 blur-[100px]" />
      <div className="pet-float pointer-events-none absolute -right-[10%] bottom-[8%] h-[620px] w-[620px] rounded-full bg-gradient-to-bl from-amber-50/40 to-orange-50/40 blur-[120px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(#10854F 1px, transparent 1px), linear-gradient(90deg, #10854F 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <MotionSection className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <MotionItem {...motionItemProps} className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-forest shadow-[0_8px_16px_rgba(16,133,79,0.06)] backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Vì sao chọn chúng tôi
            </div>
            <h2 className="text-5xl font-black leading-[1.05] tracking-tighter text-[#0A2E1A] sm:text-[4rem]">
              Vì sao hàng ngàn <span className="text-forest">Boss</span>
              <br />
              tin chọn <span className="relative inline-block">
                3F Store?
                <span className="absolute -bottom-2 left-0 h-4 w-full -rotate-1 rounded-full bg-emerald-100/70 blur-sm" />
              </span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#0A2E1A]/68">
              Từ dinh dưỡng chuẩn mực đến dịch vụ hậu mãi rõ ràng, mọi trải nghiệm tại 3F Store đều được thiết kế để bạn yên tâm và Boss luôn khỏe mạnh.
            </p>
          </MotionItem>

          <MotionItem {...motionItemProps} className="flex flex-wrap gap-4 pb-4 lg:max-w-[460px] lg:justify-end">
            {trustPills.map((item, index) => (
              <motion.div
                key={item.label}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{ duration: 0.45, delay: 0.2 + index * 0.1 }}
                className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#E5EFE9] bg-white px-6 py-3.5 text-sm font-extrabold text-[#1F4D36] shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(16,133,79,0.08)]`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${item.tone} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <item.icon size={18} className="relative z-10 text-forest transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <span className="relative z-10">{item.label}</span>
              </motion.div>
            ))}
          </MotionItem>
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,540px)_1fr] xl:grid-cols-[minmax(0,580px)_1fr]">
          <MotionItem
            {...motionItemProps}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[3rem] bg-[#0A2E1A] p-8 text-white shadow-[0_30px_60px_rgba(10,46,26,0.15)] transition-all duration-500 hover:shadow-[0_40px_80px_rgba(10,46,26,0.25)] sm:p-12"
          >
            <div className="absolute inset-0 rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/10 to-transparent opacity-60" />
            <div className="absolute right-[-8%] top-[-10%] h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl transition-all duration-700 group-hover:scale-125" />

            <div className="relative z-20 flex-1">
              <div className="mb-8 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md">
                <HeartHandshake size={16} className="text-emerald-300" />
                Dinh dưỡng chuẩn mực cho thành viên đặc biệt nhất
              </div>
              <h3 className="text-[2.35rem] font-black leading-[1.06] tracking-tighter text-white sm:text-[2.75rem]">
                Chọn lọc kỹ lưỡng,
                <br />
                <span className="text-emerald-300">để mỗi bữa ăn đều đáng tin.</span>
              </h3>
              <p className="mt-6 max-w-md text-base font-medium leading-[1.8] text-emerald-50/78 sm:text-lg">
                Mỗi sản phẩm tại 3F Store đều được đội ngũ giàu kinh nghiệm tuyển chọn dựa trên nguồn gốc, thành phần và khả năng phù hợp với thể trạng từng bé.
              </p>
            </div>

            <div className="relative z-20 mt-10 flex flex-wrap items-center gap-4">
              <button className="inline-flex h-[60px] items-center gap-4 rounded-full bg-white px-8 text-base font-black text-[#0A2E1A] transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-50 active:scale-95">
                Xem bộ sưu tập
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0A2E1A]/5">
                  <ArrowRight size={18} strokeWidth={3} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              <div className="rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm font-semibold text-white/78 backdrop-blur-md">
                500+ thương hiệu được kiểm duyệt
              </div>
            </div>

            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [0, -1.5, 0] }}
              transition={reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -bottom-8 -right-10 z-10 w-[320px] sm:w-[380px] xl:w-[430px]"
            >
              <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[60px] transition-all duration-700 group-hover:scale-110 group-hover:bg-emerald-400/30" />
              <Image
                src="/assets/images/reasons-hero.png"
                alt="Thú cưng và sản phẩm dinh dưỡng 3F Store"
                width={620}
                height={620}
                priority
                className="relative h-auto w-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.4)] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-rotate-2"
              />
            </motion.div>
          </MotionItem>

          <div className="grid gap-6 sm:grid-cols-2">
            {reasons.map((reason, index) => (
              <ReasonCard key={reason.title} reason={reason} index={index} />
            ))}
          </div>
        </div>

        <ReasonStatsBar />
      </MotionSection>
    </section>
  );
}
