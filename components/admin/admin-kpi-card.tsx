import React from "react";
import * as LucideIcons from "lucide-react";
import { Info } from "lucide-react";

interface AdminKpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  iconName: string;
  formula?: string;
}

export function AdminKpiCard({ title, value, change, trend, iconName, formula }: AdminKpiCardProps) {
  // Map icon strings to Lucide components
  const iconMap: Record<string, any> = {
    "wallet": LucideIcons.Wallet,
    "cart": LucideIcons.ShoppingCart,
    "trending-up": LucideIcons.TrendingUp,
    "receipt": LucideIcons.Receipt,
    "bot": LucideIcons.Sparkles,
    "shopee": LucideIcons.ShoppingBag,
    "users": LucideIcons.Users,
    "gift": LucideIcons.Gift,
  };

  const IconComponent = iconMap[iconName] || LucideIcons.HelpCircle;
  const isUp = trend === "up";
  const isShopeePending = title.toLowerCase().includes("shopee");

  return (
    <div className="min-h-[124px] rounded-[24px] bg-white border border-[#DCEBFF] shadow-[0_8px_24px_rgba(6,43,95,0.06)] p-5 flex items-center gap-4 hover:shadow-[0_14px_36px_rgba(6,43,95,0.10)] transition-all duration-200">
      {/* Icon Wrapper */}
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
        isShopeePending ? "bg-orange-50 text-orange-500" : "bg-[#EEF6FF] text-[#0057E7]"
      }`}>
        <IconComponent size={22} />
      </div>

      {/* Metric details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] font-bold text-[#64748B] leading-snug line-clamp-2">{title}</span>
          {formula && (
            <div className="relative group shrink-0">
              <Info className="h-4 w-4 text-[#94A3B8] hover:text-[#0057E7] cursor-pointer transition-colors" />
              <div className="absolute right-0 top-full mt-2 w-[260px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white border border-[#DCEBFF] shadow-[0_10px_30px_rgba(6,43,95,0.1)] rounded-xl p-3 text-[12px] font-medium text-[#64748B] leading-relaxed relative">
                  <div className="absolute -top-1.5 right-1.5 w-3 h-3 bg-white border-t border-l border-[#DCEBFF] rotate-45"></div>
                  <div className="relative z-10">{formula}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <h4 className="mt-1 text-[28px] font-black text-[#0B1F3A] leading-none tracking-tight">{value}</h4>
        
        {/* Trend badge */}
        <div className="mt-2 text-xs font-bold flex items-center gap-1">
          <span className={`flex items-center gap-0.5 ${isUp ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
            <span>{isUp ? "▲" : "▼"}</span>
            <span>{change.replace("-", "").replace("+", "").trim()}</span>
          </span>
          <span className="text-[#64748B] font-medium ml-1">so với hôm qua</span>
        </div>
      </div>
    </div>
  );
}
