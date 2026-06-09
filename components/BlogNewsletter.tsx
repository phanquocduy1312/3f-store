"use client";

import { Image } from "@/components/Image";
import { ArrowRight, CalendarDays, Heart, Mail, ShieldCheck, PawPrint, Gift, Tag, User, Phone } from "lucide-react";
import { blogPosts } from "@/data/store";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";

export function BlogNewsletter() {
  const visiblePosts = blogPosts.slice(0, 4);
  const postDescriptions = [
    "Cát đậu nành tự nhiên, vón cục nhanh, khử mùi vượt trội và thân thiện với mèo...",
    "Giải pháp vệ sinh tối ưu cho mèo cưng với khả năng thấm hút mạnh mẽ, ít bụi...",
    "Sản phẩm an toàn, không hóa chất độc hại, bảo vệ sức khỏe cho mèo và gia đình...",
    "Đồ chơi thông minh giúp mèo vận động, giảm stress và phát triển trí thông minh...",
  ];

  return (
    <MotionSection id="blog" className="relative bg-white pb-24 pt-16">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <MotionItem 
          {...motionItemProps} 
          className="relative overflow-hidden rounded-[2.5rem] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6 shadow-[0_14px_40px_rgba(var(--color-primary),0.04)] sm:p-8 lg:p-10"
        >
          {/* Decorative paw prints (faint background) */}
          <div className="pointer-events-none absolute left-[15%] top-[5%] opacity-5">
            <PawPrint size={80} className="rotate-12" />
          </div>
          <div className="pointer-events-none absolute right-[35%] top-[10%] opacity-5">
            <PawPrint size={60} className="-rotate-12" />
          </div>
          <div className="pointer-events-none absolute bottom-[20%] left-[40%] opacity-5">
            <PawPrint size={100} className="rotate-45" />
          </div>

          {/* Header */}
          <div className="relative z-10 mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))]">
                <PawPrint size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-[#171A14] sm:text-4xl">Bài viết hữu ích</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm font-semibold text-[rgb(var(--color-ink-soft))] sm:text-base">
                  Chia sẻ kiến thức chăm sóc thú cưng hữu ích từ PetChoice
                  <Heart size={16} className="fill-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout: Stacked vertically */}
          <div className="relative z-10 flex flex-col gap-12">
            
            {/* Top Section: Blog Posts */}
            <div className="flex flex-col gap-8">
              {/* Blog Posts Grid: 4 columns */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {visiblePosts.map((post, index) => (
                  <article
                    key={post.title}
                    className="flex flex-col overflow-hidden rounded-[1.5rem] border border-[rgb(var(--color-border))] bg-white p-3 shadow-[0_4px_20px_rgba(var(--color-primary),0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(var(--color-primary),0.08)]"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[rgb(var(--color-surface))]">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-contain p-2 transition duration-500 hover:scale-[1.05]"
                      />
                    </div>

                    <div className="mt-4 flex flex-1 flex-col px-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-md bg-[rgb(var(--color-primary-soft))] px-2 py-1 text-[10px] font-bold text-[rgb(var(--color-primary))]">
                          <CalendarDays size={12} />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md bg-[rgb(var(--color-primary-soft))] px-2 py-1 text-[10px] font-bold text-[rgb(var(--color-primary))]">
                          {post.category}
                        </div>
                      </div>

                      <h3
                        className="mt-3 min-h-[40px] text-sm font-black leading-[20px] text-[#171A14] line-clamp-2"
                        title={post.title}
                      >
                        {post.title}
                      </h3>
                      
                      <p className="mt-2 text-[13px] leading-relaxed text-[rgb(var(--color-ink-soft))] line-clamp-3">
                        {postDescriptions[index] || "Thông tin hữu ích dành cho thú cưng của bạn. Cùng khám phá thêm nhé!"}
                      </p>

                      <div className="mt-4 mt-auto">
                        <button className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[rgb(var(--color-primary))] transition hover:text-[rgb(var(--color-primary-dark))]">
                          Đọc thêm <ArrowRight size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Bottom Section: Newsletter Form Banner */}
            <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-[rgb(var(--color-primary-muted))] bg-[linear-gradient(135deg,rgb(var(--color-primary-soft))_0%,rgb(var(--color-primary-muted))_100%)] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10 shadow-[0_14px_40px_rgba(var(--color-primary),0.06)]">
              
              {/* Dog and cat image (Desktop Only to prevent text overlap) */}
              <div className="pointer-events-none absolute hidden lg:block lg:left-[55%] lg:top-auto lg:bottom-[-20px] lg:h-[260px] lg:w-[300px] lg:-translate-x-1/2">
                <Image
                  src="/assets/images/dogandcat.webp"
                  alt="Dog and Cat"
                  fill
                  className="object-contain object-bottom"
                />
              </div>

              {/* Left Content */}
              <div className="relative z-10 flex w-full flex-col lg:w-5/12">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[rgb(var(--color-primary-muted))] text-[rgb(var(--color-primary))] shadow-sm">
                  <Gift size={28} />
                </div>
                <h3 className="mt-5 text-[1.75rem] font-black leading-[1.15] text-[#1A2E1C] sm:text-4xl">
                  Nhận ưu đãi độc quyền!
                </h3>
                <div className="mt-4 inline-flex items-center gap-2 self-start rounded-xl border border-[rgb(var(--color-primary-muted))] bg-white/90 px-3 py-2 backdrop-blur-md">
                  <Tag size={16} className="shrink-0 text-[rgb(var(--color-primary))]" />
                  <span className="text-[11px] font-bold leading-tight text-[rgb(var(--color-primary))] sm:text-xs">
                    Đăng ký ngay để nhận 10%<br className="sm:hidden" /> cho đơn hàng đầu tiên
                  </span>
                </div>
              </div>

              {/* Right Content (Form) */}
              <form className="relative z-10 mt-8 flex w-full flex-col gap-3 rounded-[1.5rem] bg-white/70 p-2 backdrop-blur-md lg:mt-0 lg:w-[35%]">
                <div className="px-3 pt-3">
                  <label className="mb-1.5 block text-[11px] font-bold text-[rgb(var(--color-ink-soft))]">Họ và tên</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-ink-soft))]" />
                    <input
                      type="text"
                      placeholder="Nhập họ và tên của bạn"
                      className="h-11 w-full rounded-xl border border-[rgb(var(--color-border))] bg-white pl-9 pr-3 text-[11px] font-semibold outline-none transition placeholder:text-[rgb(var(--color-ink-soft))] focus:border-[rgb(var(--color-primary))] sm:text-xs"
                    />
                  </div>
                </div>

                <div className="px-3">
                  <label className="mb-1.5 block text-[11px] font-bold text-[rgb(var(--color-ink-soft))]">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-ink-soft))]" />
                    <input
                      type="email"
                      placeholder="Nhập email của bạn"
                      className="h-11 w-full rounded-xl border border-[rgb(var(--color-border))] bg-white pl-9 pr-3 text-[11px] font-semibold outline-none transition placeholder:text-[rgb(var(--color-ink-soft))] focus:border-[rgb(var(--color-primary))] sm:text-xs"
                    />
                  </div>
                </div>

                <div className="px-3">
                  <label className="mb-1.5 block text-[11px] font-bold text-[rgb(var(--color-ink-soft))]">Số điện thoại</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-ink-soft))]" />
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại của bạn"
                      className="h-11 w-full rounded-xl border border-[rgb(var(--color-border))] bg-white pl-9 pr-3 text-[11px] font-semibold outline-none transition placeholder:text-[rgb(var(--color-ink-soft))] focus:border-[rgb(var(--color-primary))] sm:text-xs"
                    />
                  </div>
                </div>

                <div className="mt-2 px-3 pb-3">
                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[rgb(var(--color-primary))] px-4 text-[12px] font-black text-white shadow-md transition hover:bg-[rgb(var(--color-primary-dark))] sm:text-[13px]"
                  >
                    <Gift size={16} className="shrink-0" />
                    Nhận mã giảm giá 10%
                  </button>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[rgb(var(--color-ink-soft))]">
                    <ShieldCheck size={14} className="shrink-0" />
                    <span className="text-[10px] font-semibold">Thông tin của bạn được bảo mật tuyệt đối</span>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </MotionItem>
      </div>
    </MotionSection>
  );
}
