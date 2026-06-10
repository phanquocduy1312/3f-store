"use client";

import { Image } from "@/components/Image";
import { MotionItem, motionItemProps } from "@/components/MotionSection";

type Reason = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  image: string;
  stats: string;
  statsLabel: string;
  accentColor: string;
};

const accentMap: Record<string, { bg: string; text: string; ring: string; statsBg: string }> = {
  emerald: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    ring: "group-hover:ring-sky-200",
    statsBg: "bg-sky-100/80 text-sky-700",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    ring: "group-hover:ring-amber-200",
    statsBg: "bg-amber-100/80 text-amber-700",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    ring: "group-hover:ring-sky-200",
    statsBg: "bg-sky-100/80 text-sky-700",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    ring: "group-hover:ring-violet-200",
    statsBg: "bg-violet-100/80 text-violet-700",
  },
};

export function ReasonCard({ reason, index }: { reason: Reason; index: number }) {
  const accent = accentMap[reason.accentColor] ?? accentMap.emerald;

  return (
    <MotionItem
      {...motionItemProps}
      className={`group relative flex flex-col overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-2 ring-transparent transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(19,72,111,0.1)] ${accent.ring}`}
    >
      {/* Background number watermark */}
      <div className="absolute -right-3 -top-6 select-none text-[7rem] font-black leading-none text-black/[0.025] transition-all duration-700 group-hover:scale-110 group-hover:text-forest/[0.05]">
        0{index + 1}
      </div>

      {/* Illustration */}
      <div className="relative z-10 mb-6 h-[100px] w-[100px] overflow-hidden rounded-[1.5rem] transition-transform duration-500 group-hover:scale-105">
        <Image
          src={reason.image}
          alt={reason.title}
          width={100}
          height={100}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Icon + Stats badge */}
      <div className="relative z-10 mb-5 flex items-center gap-3">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent.bg} ${accent.text} transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6`}>
          <reason.icon size={22} strokeWidth={2.5} />
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${accent.statsBg}`}>
          <span>{reason.stats}</span>
          <span className="opacity-70">{reason.statsLabel}</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        <h3 className="mb-3 text-[1.75rem] font-black leading-tight tracking-tight text-[#0A263B] transition-colors duration-300 group-hover:text-forest">
          {reason.title}
        </h3>
        <p className="mt-auto text-base font-medium leading-[1.7] text-[#0A263B]/70">
          {reason.description}
        </p>
      </div>
    </MotionItem>
  );
}
