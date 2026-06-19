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
    "clock": LucideIcons.Clock,
    "truck": LucideIcons.Truck,
    "check-circle": LucideIcons.CheckCircle2 || LucideIcons.CheckCircle,
    "alert-triangle": LucideIcons.AlertTriangle,
  };

  const IconComponent = iconMap[iconName] || LucideIcons.HelpCircle;
  const isUp = trend === "up";
  const isWarningMetric = 
    title.toLowerCase().includes("shopee") || 
    title.toLowerCase().includes("chờ xác nhận") || 
    title.toLowerCase().includes("hết hàng");

  return (
    <div className="h-full min-h-[106px] lg:min-h-[135px] xl:min-h-[145px] rounded-[20px] xl:rounded-[24px] bg-white border border-[#DCEBFF] shadow-[0_6px_20px_rgba(6,43,95,0.05)] hover:shadow-[0_10px_28px_rgba(6,43,95,0.08)] p-3.5 sm:p-4 lg:p-3 xl:p-4 flex flex-row lg:flex-col items-center lg:items-start gap-2.5 sm:gap-3 lg:gap-2 transition-all duration-200">
      {/* Icon Wrapper */}
      <div className={`h-10 w-10 sm:h-11 sm:w-11 lg:h-8 lg:w-8 xl:h-10 xl:w-10 rounded-xl xl:rounded-2xl flex items-center justify-center shrink-0 ${
        isWarningMetric ? "bg-orange-50 text-orange-500" : "bg-[#EEF6FF] text-[#0057E7]"
      }`}>
        <IconComponent className="h-5 w-5 sm:h-[22px] sm:w-[22px] lg:h-4 lg:w-4 xl:h-5 xl:w-5" />
      </div>

      {/* Metric details */}
      <div className="flex-1 min-w-0 lg:w-full lg:mt-1">
        <div className="flex items-start justify-between gap-1 w-full">
          <span className="text-[12px] sm:text-[13px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] font-bold text-[#64748B] leading-tight line-clamp-2">{title}</span>
          {formula && (
            <div className="relative group shrink-0">
              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3 lg:w-3 xl:h-3.5 xl:w-3.5 text-[#94A3B8] hover:text-[#0057E7] cursor-pointer transition-colors" />
              <div className="absolute right-0 top-full mt-2 w-[220px] sm:w-[260px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white border border-[#DCEBFF] shadow-[0_10px_30px_rgba(6,43,95,0.1)] rounded-xl p-3 text-[12px] font-medium text-[#64748B] leading-relaxed relative">
                  <div className="absolute -top-1.5 right-1.5 w-3 h-3 bg-white border-t border-l border-[#DCEBFF] rotate-45"></div>
                  <div className="relative z-10">{formula}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <h4 className="mt-0.5 sm:mt-1 lg:mt-0.5 xl:mt-1 text-[20px] sm:text-[26px] lg:text-[16px] xl:text-[20px] 2xl:text-[24px] font-black text-[#0B1F3A] leading-none tracking-tighter truncate">{value}</h4>
        
        {/* Trend badge */}
        <div className="mt-1 sm:mt-2 lg:mt-1.5 xl:mt-2 text-[10px] sm:text-xs lg:text-[9px] xl:text-[10px] 2xl:text-xs font-bold flex flex-wrap items-center gap-x-1 gap-y-0.5">
          <span className={`flex items-center gap-0.5 ${isUp ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
            <span>{isUp ? "▲" : "▼"}</span>
            <span>{change.replace("-", "").replace("+", "").trim()}</span>
          </span>
          <span className="text-[#64748B] font-medium">so với hôm qua</span>
        </div>
      </div>
    </div>
  );
}
