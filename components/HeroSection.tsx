"use client";

import { lazy, Suspense, useEffect, type ComponentType, type ReactNode } from "react";
import { ArrowRight, PawPrint, Play } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { heroFeatures } from "@/data/store";
import { fadeUp, staggerContainer } from "@/lib/animations";

function dynamic<TProps extends object>(
  loader: () => Promise<ComponentType<TProps>>,
  options: { loading?: () => ReactNode; ssr?: boolean } = {},
) {
  const LazyComponent = lazy(() => loader().then((Component) => ({ default: Component })));

  return function DynamicComponent(props: TProps) {
    const fallback = options.loading ? <options.loading /> : null;

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Lazy load với loading state
const PetHeroCanvas = dynamic(
  () => import("@/components/three/PetHeroCanvas").then(mod => mod.PetHeroCanvas),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full rounded-[2rem] sm:h-[520px] lg:h-[610px] flex items-center justify-center" style={{ background: '#CFE5D7' }}>
        <div className="animate-pulse">
          <div className="text-forest font-bold text-xl">🐕 🐱</div>
          <div className="text-forest text-sm mt-2">Loading pets...</div>
        </div>
      </div>
    )
  }
);

export function HeroSection() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }
      );
      gsap.fromTo(".hero-canvas", { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 1.1, delay: 0.25, ease: "power3.out" });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute left-1/2 top-16 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#CFE5D7]/70 blur-3xl" />
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:py-16">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative z-10">
          <div className="hero-reveal mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-[#B97024] shadow-soft">
            <PawPrint size={16} />
            Dành cho những người bạn nhỏ
          </div>
          <h1 className="hero-reveal max-w-3xl text-5xl font-black leading-[1.05] tracking-normal text-ink sm:text-6xl lg:text-7xl">
            Chăm sóc thú cưng như người thân
          </h1>
          <p className="hero-reveal mt-6 max-w-xl text-lg leading-8 text-ink/85">
            Thức ăn chất lượng • Phụ kiện xinh xắn • Sức khỏe toàn diện
          </p>
          <div className="hero-reveal mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-forest px-7 font-bold text-white shadow-soft transition hover:scale-105 hover:shadow-lift">
              Mua sắm ngay
              <PawPrint size={18} />
            </button>
            <button className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-forest/20 bg-white/55 px-7 font-bold text-forest transition hover:scale-105 hover:bg-white">
              <Play size={18} fill="currentColor" />
              Khám phá ngay
            </button>
          </div>

          <div className="hero-reveal mt-10 grid gap-3 border-y border-forest/10 py-5 sm:grid-cols-3">
            {heroFeatures.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-forest shadow-soft">
                  <item.icon size={21} />
                </span>
                <span>
                  <span className="block text-sm font-black text-ink">{item.title}</span>
                  <span className="text-xs font-semibold text-ink/75">{item.description}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="hero-canvas relative z-10">
          <PetHeroCanvas />
        </motion.div>
      </div>
    </section>
  );
}
