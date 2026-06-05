"use client";

import { Image } from "@/components/Image";
import { ArrowRight, CalendarDays, Heart } from "lucide-react";
import { blogPosts } from "@/data/store";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";

export function BlogNewsletter() {
  const visiblePosts = blogPosts.slice(0, 3);

  return (
    <MotionSection id="blog">
      <MotionItem {...motionItemProps} className="mb-8">
        <h2 className="text-3xl font-black text-ink sm:text-5xl">Bài viết hữu ích</h2>
      </MotionItem>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-5 sm:grid-cols-3">
          {visiblePosts.map((post) => (
            <MotionItem key={post.title} {...motionItemProps}>
              <article className="group overflow-hidden rounded-[28px] bg-white shadow-soft transition duration-300 hover:-translate-y-2 hover:shadow-lift">
                <div className="relative h-44 overflow-hidden bg-cream">
                  <Image src={post.image} alt={post.title} fill className="object-contain p-3 transition duration-300 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-forest/80">
                    <CalendarDays size={14} />
                    {post.date} • {post.category}
                  </div>
                  <h3 className="text-base font-black leading-snug text-ink">{post.title}</h3>
                </div>
              </article>
            </MotionItem>
          ))}

          <MotionItem {...motionItemProps} className="col-span-full sm:col-span-3">
            <button className="w-full rounded-[28px] border border-[#D8E2C3] bg-white px-5 py-4 text-sm font-black text-[#4A5F47] transition hover:bg-[#F1F5EA] focus:outline-none focus:ring-2 focus:ring-[#96C289]">
              Xem thêm bài viết
            </button>
          </MotionItem>
        </div>

        <MotionItem {...motionItemProps} className="rounded-[32px] bg-[#E8ECD9] p-7 shadow-soft sm:p-9">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h3 className="text-2xl font-black text-ink">Nhận ưu đãi độc quyền!</h3>
              <p className="mt-3 max-w-md leading-7 text-ink/80">
                Đăng ký nhận bản tin để nhận ngay ưu đãi 10% cho đơn hàng đầu tiên.
              </p>
            </div>
            <Heart className="mt-1 text-forest" size={32} />
          </div>
          <form className="mt-8 space-y-4 rounded-[2rem] bg-white p-5 shadow-soft">
            <label className="flex flex-col gap-2 text-sm font-semibold text-ink/80">
              Họ và tên
              <input
                type="text"
                placeholder="Nhập họ và tên"
                className="rounded-2xl border border-[#D8E2C3] bg-[#F7F8F3] px-4 py-3 text-sm font-semibold outline-none transition focus:border-forest focus:ring-2 focus:ring-[#C7E7B6]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-ink/80">
              Email
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="rounded-2xl border border-[#D8E2C3] bg-[#F7F8F3] px-4 py-3 text-sm font-semibold outline-none transition focus:border-forest focus:ring-2 focus:ring-[#C7E7B6]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-ink/80">
              Số điện thoại
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                className="rounded-2xl border border-[#D8E2C3] bg-[#F7F8F3] px-4 py-3 text-sm font-semibold outline-none transition focus:border-forest focus:ring-2 focus:ring-[#C7E7B6]"
              />
            </label>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-forest px-5 py-4 text-sm font-black text-white transition hover:bg-[#2b6c3d] focus:outline-none focus:ring-2 focus:ring-[#98d18f]"
            >
              Nhận mã giảm giá 10%
            </button>
          </form>
        </MotionItem>
      </div>
    </MotionSection>
  );
}
