"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { X, ChevronDown, LogIn, Search, ShoppingCart, User, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import { Image } from "@/components/Image";

type MenuItem = {
  label: string;
  href: string;
  subItems?: MenuItem[];
};

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigationData: MenuItem[];
  cartCount: number;
}

export function MobileNavigationDrawer({
  isOpen,
  onClose,
  navigationData,
  cartCount,
}: MobileNavigationDrawerProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />

      {/* Drawer Content */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="absolute bottom-0 left-0 top-0 flex w-[300px] flex-col bg-cream/98 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-forest/10 pb-4">
          <Link to="/" onClick={onClose} className="flex items-center">
            <Image
              src="/assets/logo/logo.webp"
              alt="3F Store logo"
              width={90}
              height={90}
              className="h-auto w-[90px] object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-forest/5 text-forest hover:bg-forest/10 active:scale-95"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 pr-2 scrollbar-hide">
          <ul className="space-y-3">
            {navigationData.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = !!expandedItems[item.label];

              return (
                <li key={item.label} className="border-b border-forest/5 pb-2 last:border-0 last:pb-0">
                  {hasSubItems ? (
                    <div>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className="flex w-full items-center justify-between py-2 text-[0.98rem] font-bold text-ink/85"
                      >
                        <span className={isExpanded ? "text-forest" : ""}>{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "-rotate-180 text-forest" : "text-forest/50"
                          }`}
                        />
                      </button>

                      {/* Expandable Sub-items */}
                      {isExpanded && (
                        <ul className="mt-1 ml-4 border-l-2 border-forest/10 pl-3 space-y-2.5">
                          {item.subItems!.map((sub) => {
                            const hasNested = sub.subItems && sub.subItems.length > 0;
                            const isNestedExpanded = !!expandedItems[sub.label];

                            return (
                              <li key={sub.label}>
                                {hasNested ? (
                                  <div>
                                    <button
                                      onClick={() => toggleExpand(sub.label)}
                                      className="flex w-full items-center justify-between py-1.5 text-[0.9rem] font-bold text-ink/70"
                                    >
                                      <span className={isNestedExpanded ? "text-forest" : ""}>
                                        {sub.label}
                                      </span>
                                      <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-200 ${
                                          isNestedExpanded ? "-rotate-180 text-forest" : "text-forest/40"
                                        }`}
                                      />
                                    </button>

                                    {isNestedExpanded && (
                                      <ul className="mt-1 ml-3 border-l border-forest/5 pl-2.5 space-y-1.5">
                                        {sub.subItems!.map((child) => (
                                          <li key={child.label}>
                                            <Link
                                              to={child.href}
                                              onClick={onClose}
                                              className="block py-1 text-[0.85rem] font-medium text-ink/60 hover:text-forest"
                                            >
                                              {child.label}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ) : (
                                  <Link
                                    to={sub.href}
                                    onClick={onClose}
                                    className="block py-1.5 text-[0.9rem] font-bold text-ink/75 hover:text-forest"
                                  >
                                    {sub.label}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className="block py-2 text-[0.98rem] font-bold text-ink/85 hover:text-forest"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Area with actions */}
        <div className="border-t border-forest/10 pt-6 space-y-3">
          <Link
            to="/login"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-forest text-[0.95rem] font-bold text-white shadow-soft hover:bg-forest/90 active:scale-95 transition-transform"
          >
            <LogIn size={18} />
            Đăng nhập
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/cart"
              onClick={onClose}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-forest/15 bg-white text-xs font-black text-forest hover:bg-forest/5"
            >
              <div className="relative">
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                    {cartCount}
                  </span>
                )}
              </div>
              Giỏ hàng
            </Link>
            
            <Link
              to="/login"
              onClick={onClose}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-forest/15 bg-white text-xs font-black text-forest hover:bg-forest/5"
            >
              <User size={16} />
              Tài khoản
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
