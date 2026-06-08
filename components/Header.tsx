"use client";

import { useState, useEffect } from "react";
import { getCartCount } from "@/lib/cartHelper";
import { Image } from "@/components/Image";
import { Menu, Search, ShoppingCart, User, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Link } from "react-router-dom";

type MenuItem = {
  label: string;
  href: string;
  subItems?: MenuItem[];
};

const navigationData: MenuItem[] = [
  { label: "Trang chủ", href: "/" },
  { 
    label: "Sản phẩm", 
    href: "/products",
    subItems: [
      {
        label: "Thức ăn dành cho chó",
        href: "/products?category=Thức ăn cho chó",
        subItems: [
          { label: "Thức ăn khô cho Chó", href: "/products?category=Thức ăn khô cho chó" },
          { label: "Thức ăn ướt cho Chó", href: "/products?category=Thức ăn ướt cho chó" }
        ]
      },
      {
        label: "Thức ăn dành cho mèo",
        href: "/products?category=Thức ăn cho mèo",
        subItems: [
          { label: "Thức ăn khô dành cho Mèo", href: "/products?category=Thức ăn khô dành cho Mèo" },
          { label: "Thức ăn ướt cho Mèo", href: "/products?category=Thức ăn ướt cho Mèo" }
        ]
      },
      { label: "Phụ kiện cho thú cưng", href: "/products?category=Phụ kiện & Đồ chơi" },
      { label: "Chăm sóc sức khỏe", href: "/products" },
      { label: "Vệ sinh cho thú cưng", href: "/products?category=Vệ sinh cho thú cưng" },
      { label: "Pate & Snack", href: "/products?category=Pate & Snack" },
      { label: "4PAWS", href: "/products" }
    ]
  },
  { 
    label: "Thông tin", 
    href: "#",
    subItems: [
      { label: "Về chúng tôi", href: "#" },
      { label: "Liên hệ", href: "#" }
    ]
  },
  { label: "Tin tức", href: "#" },
  { label: "Kiểm tra đơn hàng", href: "#" }
];

const SubMenuItem = ({ item }: { item: MenuItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link 
        to={item.href} 
        className="flex w-full items-center justify-between px-5 py-3 text-[0.92rem] font-medium text-ink/80 transition-colors duration-200 hover:bg-forest/5 hover:text-forest"
      >
        <span className={`${hasSubItems && isOpen ? "text-forest font-bold" : ""}`}>{item.label}</span>
        {hasSubItems && (
          <ChevronRight size={14} className={`transition-transform duration-200 ${isOpen ? "text-forest translate-x-1" : "text-forest/40"}`} />
        )}
      </Link>

      <AnimatePresence>
        {isOpen && hasSubItems && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-full top-0 pl-1"
          >
            <div className="w-56 overflow-hidden rounded-xl border border-forest/10 bg-white py-2 shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
              {item.subItems!.map((child) => (
                <Link 
                  key={child.label} 
                  to={child.href} 
                  className="block px-5 py-3 text-[0.9rem] font-medium text-ink/80 transition-colors hover:bg-forest/5 hover:text-forest"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ item }: { item: MenuItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <div 
      className="flex h-full items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link 
        to={item.href} 
        className={`flex items-center gap-1.5 transition-colors duration-200 ${isOpen ? "text-forest" : "hover:text-forest"}`}
      >
        {item.label}
        {hasSubItems && (
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "-rotate-180 text-forest" : "text-forest/60"}`} />
        )}
      </Link>

      <AnimatePresence>
        {isOpen && hasSubItems && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-[-10px] pt-4"
          >
            <div className="w-64 rounded-[1.25rem] border border-forest/10 bg-white py-2 shadow-[0_20px_40px_rgba(41,76,38,0.08)]">
              {item.subItems!.map((sub) => (
                <SubMenuItem key={sub.label} item={sub} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { MobileNavigationDrawer } from "./mobile-navigation-drawer";

export function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCartCount(getCartCount());
    const handleCartUpdate = () => {
      setCartCount(getCartCount());
    };
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 border-b border-forest/12 bg-cream/[0.94] shadow-[0_10px_30px_rgba(34,52,39,0.08)] backdrop-blur-2xl"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Logo - Width 120px - more balanced */}
          <a href="/" className="flex items-center" aria-label="3F Store - Trang chủ">
            <Image 
              src="/assets/logo/logo.webp" 
              alt="3F Store logo" 
              width={120} 
              height={120} 
              className="h-auto w-[120px] object-contain" 
            />
          </a>

          {/* Navigation */}
          <nav className="relative hidden h-full items-center gap-8 text-[0.95rem] font-bold text-ink/88 lg:flex">
            {navigationData.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Icon buttons with labels */}
            <button
              className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-forest transition hover:bg-white/50"
              aria-label="Tìm kiếm"
            >
              <Search size={22} strokeWidth={2.2} />
              <span className="text-[0.7rem] font-bold text-center w-full block">Tìm kiếm</span>
            </button>
            
            <Link
              to="/cart"
              className="relative flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-forest transition hover:bg-white/50"
              aria-label="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingCart size={22} strokeWidth={2.2} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-black text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[0.7rem] font-bold text-center w-full block">Giỏ hàng</span>
            </Link>

            <Link
              to="/login"
              className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-forest transition hover:bg-white/50"
              aria-label="Tài khoản"
            >
              <User size={22} strokeWidth={2.2} />
              <span className="text-[0.7rem] font-bold text-center w-full block">Tài khoản</span>
            </Link>

            {/* Mobile Menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-forest shadow-soft lg:hidden" 
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileNavigationDrawer
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            navigationData={navigationData}
            cartCount={cartCount}
          />
        )}
      </AnimatePresence>
    </>
  );
}
