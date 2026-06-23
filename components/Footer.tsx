"use client";

import { Image } from "@/components/Image";
import { Facebook, Instagram, Music2 } from "lucide-react";
import { footerColumns, socialLinks } from "@/data/store";
import { Link } from "react-router-dom";

const socialIcons = [Facebook, Instagram, Music2];

export function Footer() {
  const getLinkHref = (link: string) => {
    if (link === "Giới thiệu") return "/about";
    if (link === "Liên hệ") return "/contact";
    return "#";
  };

  const handleLinkScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/about#")) {
      const elementId = href.split("#")[1];
      const target = document.getElementById(elementId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-forest text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/assets/logo/logo.webp" alt="3F Store logo" width={46} height={46} className="h-11 w-11 rounded-full bg-white/95 object-contain p-1" />
            <span className="text-2xl font-black">3F Store</span>
          </div>
          <p className="mt-4 max-w-sm leading-7 text-white/68">
            Chăm sóc thú cưng như người thân với sản phẩm chính hãng, tư vấn tận tâm và trải nghiệm mua sắm mềm mại.
          </p>
          <div className="mt-6 flex gap-3">
            {socialLinks.map((item, index) => {
              const Icon = socialIcons[index];
              return (
                <a key={item} href="#" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-honey hover:text-forest" aria-label={item}>
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-black">{column.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-white/64">
                {column.links.map((link) => {
                  const href = getLinkHref(link);
                  const isExternalOrHash = href.startsWith("#");
                  return (
                    <li key={link}>
                      {isExternalOrHash ? (
                        <a href={href} className="transition hover:text-white">
                          {link}
                        </a>
                      ) : (
                        <Link 
                          to={href} 
                          onClick={(e) => handleLinkScroll(e, href)}
                          className="transition hover:text-white"
                        >
                          {link}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-white/10 px-4 py-5 text-sm text-white/50 sm:px-6 lg:px-8">
        © 2026 3F Store. All rights reserved.
      </div>
    </footer>
  );
}
