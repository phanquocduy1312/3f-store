"use client";

import { Image } from "@/components/Image";
import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { motion } from "framer-motion";
import { navItems } from "@/data/store";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-forest/10 bg-cream/86 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Logo - Width 120px - more balanced */}
        <a href="#" className="flex items-center" aria-label="3F Store - Trang chủ">
          <Image 
            src="/assets/logo/logo.webp" 
            alt="3F Store logo" 
            width={120} 
            height={120} 
            className="h-auto w-[120px] object-contain" 
          />
        </a>

        <nav className="hidden items-center gap-8 text-[0.95rem] font-bold text-ink/88 lg:flex">
          {navItems.map((item) => (
            <a key={item} href="#" className="transition hover:text-forest">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Icon buttons with labels */}
          <button
            className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-forest transition hover:bg-white/50"
            aria-label="Tìm kiếm"
          >
            <Search size={22} strokeWidth={2.2} />
            <span className="text-[0.7rem] font-bold">Tìm kiếm</span>
          </button>
          
          <button
            className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-forest transition hover:bg-white/50"
            aria-label="Tài khoản"
          >
            <User size={22} strokeWidth={2.2} />
            <span className="text-[0.7rem] font-bold">Tài khoản</span>
          </button>
          
          <button
            className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-forest transition hover:bg-white/50"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart size={22} strokeWidth={2.2} />
            <span className="text-[0.7rem] font-bold">Giỏ hàng</span>
          </button>

          {/* CTA Button - Desktop */}
          <button className="hidden h-12 items-center gap-2 rounded-full bg-forest px-6 text-[0.95rem] font-bold text-white shadow-soft transition hover:scale-105 hover:bg-forest/92 lg:flex">
            Giỏ hàng
            <ShoppingCart size={18} />
          </button>
          
          {/* Mobile Menu */}
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-forest shadow-soft lg:hidden" aria-label="Mở menu">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
