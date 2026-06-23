"use client";

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Menu, ShoppingCart, User, Heart, Sparkles, LogOut } from "lucide-react";
import { Image } from "@/components/Image";
import { getCartCount } from "@/lib/cartHelper";
import { MobileNavigationDrawer } from "./mobile-navigation-drawer";
import { ProductSearchBox } from "@/src/components/ProductSearchBox";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { getProductCategories } from "@/src/api/productsApi";
import { useWishlist } from "@/src/context/WishlistContext";

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
    href: "/about",
    subItems: [
      { label: "Về chúng tôi", href: "/about" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
  { label: "Kiểm tra đơn hàng", href: "/order-check" },
  { label: "Tin tức", href: "/tin-tuc" },
];

const SubMenuItem = ({ item }: { item: MenuItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = Boolean(item.subItems?.length);

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <Link to={item.href}
        className="flex w-full items-center justify-between px-5 py-3 text-[0.92rem] font-medium text-ink/80 transition-colors duration-200 hover:bg-forest/5 hover:text-forest">
        <span className={hasSubItems && isOpen ? "font-bold text-forest" : ""}>{item.label}</span>
        {hasSubItems ? (
          <ChevronRight size={14} className={`transition-transform duration-200 ${isOpen ? "translate-x-1 text-forest" : "text-forest/40"}`} />
        ) : null}
      </Link>
      <AnimatePresence>
        {isOpen && hasSubItems ? (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }} className="absolute left-full top-0 pl-1">
            <div className="w-56 overflow-hidden rounded-xl border border-forest/10 bg-white py-2 shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
              {item.subItems!.map((child) => (
                <Link key={child.label} to={child.href}
                  className="block px-5 py-3 text-[0.9rem] font-medium text-ink/80 transition-colors hover:bg-forest/5 hover:text-forest">
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
    <div className="flex h-full items-center" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <Link to={item.href}
        className={`flex items-center gap-1.5 transition-colors duration-200 ${isOpen ? "text-forest" : "hover:text-forest"}`}>
        {item.label}
        {hasSubItems ? (
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "-rotate-180 text-forest" : "text-forest/60"}`} />
        ) : null}
      </Link>
      <AnimatePresence>
        {isOpen && hasSubItems ? (
          <motion.div initial={{ opacity: 0, y: 15, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-[-10px] pt-4">
            <div className="w-64 rounded-[1.25rem] border border-forest/10 bg-white py-2 shadow-[0_20px_40px_rgba(41,76,38,0.08)]">
              {item.subItems!.map((sub) => (<SubMenuItem key={sub.label} item={sub} />))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

/**
 * Account dropdown menu for logged-in customers.
 */
function AccountMenu() {
  const { customer, logout } = useCustomerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/");
  };

  const displayName = customer?.fullName || customer?.email || customer?.phone || "Tài khoản";

  return (
    <div ref={menuRef} className="relative">
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-forest transition hover:bg-white/80 sm:px-3">
        <div className="relative">
          <div className="h-6 w-6 rounded-full bg-forest/15 flex items-center justify-center">
            <User size={16} strokeWidth={2.5} className="text-forest" />
          </div>
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full bg-forest ring-2 ring-cream" />
        </div>
        <span className="hidden text-[0.72rem] font-bold text-forest/90 sm:block max-w-[60px] truncate">{displayName.split(" ").pop()}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-forest/10 bg-white py-2 shadow-[0_20px_40px_rgba(41,76,38,0.12)] z-50">

            {/* Greeting */}
            <div className="px-4 py-3 border-b border-forest/8">
              <p className="text-sm font-black text-ink truncate">Xin chào, {displayName}!</p>
              <p className="text-[11px] font-semibold text-ink/50 truncate">{customer?.email || customer?.phone}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link to="/account" onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-ink/80 hover:bg-forest/5 hover:text-forest transition">
                <User size={16} /> Tài khoản của tôi
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-forest/8 pt-1">
              <button onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition rounded-b-2xl">
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn } = useCustomerAuth();
  const { wishlist } = useWishlist();
  const [navData, setNavData] = useState<MenuItem[]>(navigationData);
  
  const wishlistCount = wishlist.length;

  useEffect(() => {
    setCartCount(getCartCount());
    const handleCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", handleCartUpdate);
    
    const loadCategories = async () => {
      try {
        const res = await getProductCategories();
        if (res.success && res.data) {
          const map = new Map<number, MenuItem>();
          const roots: MenuItem[] = [];
          
          res.data.forEach((c) => {
             map.set(c.id, { label: c.name, href: `/products?category=${c.slug}`, subItems: [] });
          });
          
          res.data.forEach((c) => {
             const menuItem = map.get(c.id)!;
             if (c.parentId && map.has(c.parentId)) {
                 map.get(c.parentId)!.subItems!.push(menuItem);
             } else {
                 roots.push(menuItem);
             }
          });
          
          const cleanSubItems = (items: MenuItem[]) => {
              items.forEach(item => {
                 if (item.subItems && item.subItems.length === 0) {
                     delete item.subItems;
                 } else if (item.subItems) {
                     cleanSubItems(item.subItems);
                 }
              });
          };
          cleanSubItems(roots);
          
          setNavData(prev => prev.map(item => {
             if (item.label === "Sản phẩm") {
                return {
                   ...item,
                   subItems: [
                     { label: "Tất cả sản phẩm", href: "/products" },
                     ...roots
                   ]
                };
             }
             return item;
          }));
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    
    loadCategories();

    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

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
              <Image src="/assets/logo/logo.webp" alt="3F Store logo" width={100} height={100}
                className="h-auto w-[85px] object-contain sm:w-[100px]" />
            </Link>

            {/* Search Bar - Desktop */}
            <ProductSearchBox className="hidden lg:block lg:flex-1 lg:px-4" />

            {/* Right Icons */}
            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <button onClick={() => window.dispatchEvent(new CustomEvent("open-pet-advisor"))}
                className="flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-forest transition hover:bg-white/80 sm:px-3"
                aria-label="Tư vấn AI">
                <div className="relative">
                  <Sparkles size={24} strokeWidth={2} className="text-blue-500" />
                  <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white animate-pulse"></span>
                </div>
                <span className="hidden text-[0.72rem] font-bold text-forest/90 sm:block">Tư vấn AI</span>
              </button>

              <Link to="/wishlist"
                className="relative flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-forest transition hover:bg-white/80 sm:px-3"
                aria-label="Yêu thích">
                <div className="relative">
                  <Heart size={24} strokeWidth={2} />
                  {wishlistCount > 0 ? (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-black text-white ring-2 ring-white">
                      {wishlistCount}
                    </span>
                  ) : null}
                </div>
                <span className="hidden text-[0.72rem] font-bold text-forest/90 sm:block">Yêu thích</span>
              </Link>

              <Link to="/cart"
                className="relative flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-forest transition hover:bg-white/80 sm:px-3"
                aria-label="Giỏ hàng">
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

              {/* Account: dynamic based on login state */}
              {isLoggedIn ? (
                <AccountMenu />
              ) : (
                <Link to="/login"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-forest transition hover:bg-white/80 sm:px-3"
                  aria-label="Tài khoản">
                  <User size={24} strokeWidth={2} />
                  <span className="hidden text-[0.72rem] font-bold text-forest/90 sm:block">Tài khoản</span>
                </Link>
              )}

              <button onClick={() => setIsMobileMenuOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-forest shadow-md lg:hidden"
                aria-label="Mở menu">
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="pb-3.5 pt-1 lg:hidden">
            <ProductSearchBox placeholder="Tìm nhanh sản phẩm..." />
          </div>

          {/* Navigation Menu */}
          <div className="hidden border-t border-forest/10 lg:block">
            <nav className="relative flex h-[54px] items-center gap-8 text-[0.92rem] font-bold text-ink/85">
              {navData.map((item) => (<NavItem key={item.label} item={item} />))}
            </nav>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <MobileNavigationDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}
            navigationData={navData} cartCount={cartCount} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
