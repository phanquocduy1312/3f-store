import React, { useState, useEffect } from "react";

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTocProps {
  headings: HeadingItem[];
  hideHeader?: boolean;
  className?: string;
  title?: string;
}

export function BlogToc({ 
  headings, 
  hideHeader = false, 
  className = "bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]",
  title = "Mục lục"
}: BlogTocProps) {
  const [activeId, setActiveId] = useState<string>("intro");

  // Compile list with virtual sections (Introduction at top)
  const allSections = [
    { id: "intro", text: "Giới thiệu", level: 2, isVirtual: true },
    ...headings.map((h, i) => ({
      id: h.id,
      text: `${i + 1}. ${h.text}`,
      level: h.level,
      isVirtual: false
    }))
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible section
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-90px 0px -70% 0px",
        threshold: 0
      }
    );

    // Observe top header/intro element
    const introEl = document.getElementById("article-title");
    if (introEl) observer.observe(introEl);

    // Observe parsed headings
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    let el = document.getElementById(id);
    if (id === "intro") {
      el = document.getElementById("article-title");
    }

    if (el) {
      const offset = 160; // sticky header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveId(id);
    }
  };

  return (
    <div className={className}>
      {!hideHeader && (
        <h3 className="text-[10px] font-black text-slate-400 tracking-wider uppercase border-b border-slate-50 pb-2.5">
          {title}
        </h3>
      )}
      <nav className={hideHeader ? "" : "mt-3"}>
        <ul className="space-y-2">
          {allSections.map((sec) => {
            const isActive = activeId === sec.id;
            return (
              <li
                key={sec.id}
                style={{ paddingLeft: sec.level === 3 ? "12px" : "0px" }}
              >
                <a
                  href={`#${sec.id}`}
                  onClick={(e) => handleScrollTo(e, sec.id)}
                  className={`block text-[12.5px] leading-relaxed transition-all duration-200 ${
                    isActive
                      ? "text-[#0057E7] font-black"
                      : "text-slate-500 hover:text-[#0057E7] font-semibold"
                  }`}
                >
                  {sec.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
