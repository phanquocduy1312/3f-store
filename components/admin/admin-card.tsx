import React from "react";
import { cn } from "@/lib/utils"; // Wait, is there a cn function or can we write a simple className combiner? Let's check if there is a cn utility in src/lib/utils or components.
// Let's write it in a way that doesn't depend on cn or let's create a simple function.

type AdminCardProps = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AdminCard({ title, subtitle, action, children, className }: AdminCardProps) {
  return (
    <section className={`rounded-[24px] bg-white border border-[#DCEBFF] shadow-[0_10px_30px_rgba(6,43,95,0.06)] overflow-hidden ${className || ""}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div>
            {title && <h3 className="text-[18px] font-black text-[#0B1F3A]">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs font-medium text-[#64748B]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="px-5 pb-5 flex-1 min-h-0 flex flex-col">{children}</div>
    </section>
  );
}
