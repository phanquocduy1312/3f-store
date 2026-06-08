"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { reasonStats } from "@/data/store";

function useCountUp(target: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const isDecimal = target % 1 !== 0;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? Math.round(current * 10) / 10 : Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return count;
}

function StatItem({ item, index, inView }: {
  item: (typeof reasonStats)[number];
  index: number;
  inView: boolean;
}) {
  const count = useCountUp(item.number, inView);
  const Icon = item.icon;

  const formatNumber = (n: number) => {
    if (n >= 1000) return n.toLocaleString("vi-VN");
    return String(n);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.5, ease: "easeOut" }}
      className="flex items-center gap-4 px-6 py-4"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest/10 text-forest">
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <div className="text-3xl font-black tracking-tight text-[#0A2E1A]">
          {formatNumber(count)}
          <span className="text-forest">{item.suffix}</span>
        </div>
        <div className="text-sm font-semibold text-[#0A2E1A]/50">
          {item.label}
        </div>
      </div>
    </motion.div>
  );
}

export function ReasonStatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-16 overflow-hidden rounded-[2rem] border border-forest/10 bg-white/80 shadow-[0_20px_60px_rgba(16,133,79,0.06)] backdrop-blur-xl"
    >
      <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-forest/5">
        {reasonStats.map((item, index) => (
          <StatItem key={item.label} item={item} index={index} inView={inView} />
        ))}
      </div>
    </motion.div>
  );
}
