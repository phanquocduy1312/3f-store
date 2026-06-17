"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingCart, User, Heart, TrendingUp, Sparkles } from "lucide-react";
import { Image } from "@/components/Image";
import { getProducts } from "@/src/api/productsApi";
import { getCartCount } from "@/lib/cartHelper";
import { MobileNavigationDrawer } from "./mobile-navigation-drawer";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  category?: string;
};

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
      { label: "Tất cả sản phẩm", href: "/products" },
      { label: "Sản phẩm cho mèo", href: "/products?petType=cat" },
      { label: "Sản phẩm cho chó", href: "/products?petType=dog" },
      { label: "Pate & Snack", href: "/products?category=pate-snack" },
      { label: "Cát vệ sinh", href: "/products?productType=litter" },
    ],
  },
  {
    label: "Thông tin",
    href: "#",
    subItems: [
      { label: "Về chúng tôi", href: "#" },
      { label: "Liên hệ", href: "#" },
    ],
  },
  { label: "Kiểm tra đơn hàng", href: "/order-check" },
  { label: "3F Club", href: "/3f-club/rewards" },
];

const SubMenuItem = ({ item }: { item: MenuItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = Boolean(item.subItems?.length);

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
        <span className={hasSubItems && isOpen ? "font-bold text-forest" : ""}>{item.label}</span>
        {hasSubItems ? (
          <ChevronRight
            size={14}
            className={`transition-transform duration-200 ${isOpen ? "translate-x-1 text-forest" : "text-forest/40"}`}
          />
        ) : null}
      </Link>

      <AnimatePresence>
        {isOpen && hasSubItems ? (
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
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ item }: { item: MenuItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = Boolean(item.subItems?.length);

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
        {hasSubItems ? (
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${isOpen ? "-rotate-180 text-forest" : "text-forest/60"}`}
          />
        ) : null}
      </Link>

      <AnimatePresence>
        {isOpen && hasSubItems ? (
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
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCartCount(getCartCount());
    const handleCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions when search query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const result = await getProducts({ q: searchQuery.trim(), limit: 5, sort: "popular" });
        setSuggestions(result.items.slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);
  };

  const handleSuggestionClick = (productName: string) => {
    setSearchQuery(productName);
    setShowSuggestions(false);
    navigate(`/products?q=${encodeURIComponent(productName)}`);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 border-b border-forest/12 bg-cream/[0.96] shadow-[0_8px_20px_rgba(34,52,39,0.06)] backdrop-blur-2xl"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-3 lg:h-[70px] lg:gap-4">
            {/* Logo */}
            <Link to="/" className="shrink-0" aria-label="3F Store - Trang chủ">
              <Image
                src="/assets/logo/logo.webp"
                alt="3F Store logo"
                width={100}
                height={100}
                className="h-auto w-[85px] object-contain sm:w-[100px]"
              />
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden flex-1 lg:flex lg:px-4" role="search">
              <div className="flex h-12 w-full items-center rounded-full border border-forest/20 bg-white shadow-[0_2px_8px_rgba(34,52,39,0.08)] transition focus-within:border-forest/40 focus-within:shadow-[0_4px_12px_rgba(34,52,39,0.12)]">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm kiếm sản phẩm cho boss..."
                  className="h-full flex-1 bg-transparent px-6 text-[0.95rem] font-medium text-ink outline-none placeholder:text-ink/50"
                />
                <button
                  type="submit"
                  className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest text-white transition hover:scale-105 hover:bg-forest-700"
                  aria-label="Tìm kiếm"
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </div>
            </form>

            {/* Right Icons */}
            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-pet-advisor"))}
                className="flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-forest transition hover:bg-white/80 sm:px-3"
                aria-label="Tư vấn AI"
              >
                <div className="relative">
                  <Sparkles size={24} strokeWidth={2} className="text-blue-500" />
                  <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white animate-pulse"></span>
                </div>
                <span className="hidden text-[0.72rem] font-bold text-forest/90 sm:block">Tư vấn AI</span>
              </button>

              <Link
                to="/wishlist"
                className="flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-forest transition hover:bg-white/80 sm:px-3"
                aria-label="Yêu thích"
              >
                <Heart size={24} strokeWidth={2} />
                <span className="hidden text-[0.72rem] font-bold text-forest/90 sm:block">Yêu thích</span>
              </Link>

              <Link
                to="/cart"
                className="relative flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-forest transition hover:bg-white/80 sm:px-3"
                aria-label="Giỏ hàng"
              >
                <div className="relative">
                  <ShoppingCart size={24} strokeWidth={2} />
                  {cartCount > 0 ? (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-black text-white ring-2 ring-white">
                      {cartCount}
                    </span>
                  ) : null}
                </div>
                <span className="hidden text-[0.72rem] font-bold text-forest/90 sm:block">Giỏ hàng</span>
              </Link>

              <Link
                to="/login"
                className="flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-forest transition hover:bg-white/80 sm:px-3"
                aria-label="Tài khoản"
              >
                <User size={24} strokeWidth={2} />
                <span className="hidden text-[0.72rem] font-bold text-forest/90 sm:block">Tài khoản</span>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-forest shadow-md lg:hidden"
                aria-label="Mở menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="pb-3.5 pt-1 lg:hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center" role="search">
              <div className="flex h-12 w-full items-center rounded-full border border-forest/20 bg-white shadow-[0_2px_8px_rgba(34,52,39,0.08)]">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm nhanh sản phẩm..."
                  className="h-full flex-1 bg-transparent px-5 text-[0.95rem] font-medium text-ink outline-none placeholder:text-ink/50"
                />
                <button
                  type="submit"
                  className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest text-white"
                  aria-label="Tìm kiếm"
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </div>

          {/* Navigation Menu */}
          <div className="hidden border-t border-forest/10 lg:block">
            <nav className="relative flex h-[54px] items-center gap-8 text-[0.92rem] font-bold text-ink/85">
              {navigationData.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <MobileNavigationDrawer
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            navigationData={navigationData}
            cartCount={cartCount}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
