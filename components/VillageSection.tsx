"use client";

import { ArrowRight, PawPrint } from "lucide-react";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";

import { VillageCanvas } from "@/components/three/VillageCanvas";

export function VillageSection() {
  return (
    <section className="relative overflow-hidden bg-[#DDEBE5]">
      <div className="pointer-events-none absolute right-0 top-1/2 h-[560px] w-[760px] -translate-y-1/2 rounded-full bg-[#F2E0AF]/35 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 bottom-0 h-[320px] w-[900px] -translate-x-1/2 rounded-full bg-white/30 blur-3xl" />
      <MotionSection className="relative grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <MotionItem {...motionItemProps}>
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase text-forest/75">
            <PawPrint size={16} />
            Thế giới 3F
          </p>
          <h2 className="text-4xl font-black leading-tight text-ink sm:text-5xl">
            Thế giới 3F dành riêng cho Boss
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-ink/80">
            Một không gian mua sắm được thiết kế như khu vui chơi thu nhỏ: dễ khám phá, dễ chọn món, và luôn có những lựa chọn tử tế cho từng bé cưng.
          </p>
          <button className="mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-forest px-7 font-bold text-white shadow-soft transition hover:scale-105 hover:shadow-lift">
            Khám phá ngay
            <ArrowRight size={18} />
          </button>
        </MotionItem>
        <MotionItem {...motionItemProps} className="relative min-h-[520px] lg:min-h-[640px]">
          <VillageCanvas />
        </MotionItem>
      </MotionSection>
    </section>
  );
}
