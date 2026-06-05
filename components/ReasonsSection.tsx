"use client";

import { Image } from "@/components/Image";
import { ArrowRight } from "lucide-react";
import { reasons } from "@/data/store";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";

export function ReasonsSection() {
  return (
    <section className="bg-gradient-to-br from-[#FEFCF6] via-white to-[#F4FAF6]">
      <MotionSection className="max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid items-stretch gap-5 lg:grid-cols-[390px_1fr] xl:grid-cols-[420px_1fr]">
          {/* Left - Image, Title, and CTA */}
          <MotionItem {...motionItemProps} className="flex h-full flex-col justify-center gap-5">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 text-sm font-black text-forest/85">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
              </svg>
              Dành cho thú cưng - Từ trái tim
            </div>

            {/* Image - Bigger */}
            <div className="relative -my-2">
              <Image 
                src="/assets/images/banner-section.webp" 
                alt="3F Store - Thức ăn chất lượng" 
                width={460} 
                height={460} 
                className="h-auto w-full max-w-[430px] object-contain xl:max-w-[470px]" 
              />
            </div>

            {/* Title */}
            <h2 className="text-[2.25rem] font-black leading-[1.05] text-ink lg:text-[2.6rem]">
              Vì sao nên chọn<br />3F Store?
            </h2>

            {/* Description */}
            <p className="max-w-md text-lg leading-8 text-ink/80">
              Chúng tôi cam kết mang đến cho thú cưng những sản phẩm chất lượng và dịch vụ tốt nhất.
            </p>

            {/* CTA Button */}
            <button className="inline-flex h-14 w-fit items-center gap-3 rounded-full bg-forest px-7 text-base font-black text-white shadow-md transition hover:scale-105 hover:shadow-lg">
              Khám phá ngay
              <ArrowRight size={18} strokeWidth={3} />
            </button>
          </MotionItem>

          {/* Right - Feature Cards Grid (3 columns, 2 rows) - MUCH BIGGER */}
          <div className="grid gap-5 sm:grid-cols-2">
            {reasons.map((reason) => (
              <MotionItem 
                key={reason.title} 
                {...motionItemProps}
                className="group flex min-h-[172px] items-center gap-6 rounded-[1.5rem] border border-[#E8EFE8] bg-white p-7 shadow-[0_12px_34px_rgba(31,77,58,0.055)] transition duration-300 hover:-translate-y-1 hover:border-[#D9E8DD] hover:shadow-[0_20px_48px_rgba(31,77,58,0.1)]"
              >
                {/* Icon - MUCH BIGGER */}
                <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F3F8F4] text-forest transition duration-300 group-hover:scale-105 group-hover:bg-[#EAF4EC]">
                  <reason.icon size={30} strokeWidth={2.4} />
                </div>

                <div className="min-w-0">
                  {/* Title - MUCH BIGGER */}
                  <h3 className="text-[1.35rem] font-black leading-tight text-ink">
                    {reason.title}
                  </h3>

                  {/* Description - MUCH BIGGER */}
                  <p className="mt-3 text-base leading-7 text-ink/75">
                    {reason.description}
                  </p>
                </div>
              </MotionItem>
            ))}
          </div>
        </div>
      </MotionSection>
    </section>
  );
}
