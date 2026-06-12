import React from "react";
import { 
  Flame, Activity, Sparkles, Droplet, 
  Smile, TrendingUp, ChevronDown 
} from "lucide-react";
import { AdminCard } from "./admin-card";

interface PetNeedItem {
  name: string;
  percent: number;
  count: number;
  icon: any;
}

export function AdminPetNeedsStats() {
  const needs: PetNeedItem[] = [
    { name: "Kén ăn", percent: 28.6, count: 786, icon: Flame },
    { name: "Tiêu hóa", percent: 24.3, count: 667, icon: Activity },
    { name: "Da lông", percent: 18.7, count: 514, icon: Sparkles },
    { name: "Tiết niệu", percent: 12.1, count: 333, icon: Droplet },
    { name: "Hairball", percent: 9.8, count: 269, icon: Smile },
    { name: "Tăng cân", percent: 6.5, count: 179, icon: TrendingUp }
  ];

  const headerAction = (
    <button className="flex items-center gap-1.5 bg-[#F6FAFF] border border-[#DCEBFF] text-[#062B5F] text-[12px] font-bold px-3 py-1.5 rounded-xl transition hover:bg-[#EEF6FF]">
      <span>30 ngày qua</span>
      <ChevronDown size={14} />
    </button>
  );

  return (
    <AdminCard 
      title="Top nhu cầu thú cưng" 
      subtitle="Từ AI Advisor và CRM"
      action={headerAction}
      className="h-[360px] flex flex-col"
    >
      <div className="space-y-3 mt-2 flex-1 overflow-y-auto admin-scrollbar pr-1">
        {needs.map((need) => {
          const Icon = need.icon;
          return (
            <div key={need.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0B1F3A]">
                {/* Name & Icon */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F6FAFF] border border-[#DCEBFF] flex items-center justify-center text-[#062B5F] shrink-0">
                    <Icon size={14} />
                  </div>
                  <span className="font-extrabold text-[#0B1F3A]">{need.name}</span>
                </div>
                {/* Stats */}
                <div className="flex items-center gap-2">
                  <span className="text-[#0B1F3A]">{need.percent}%</span>
                  <span className="text-xs text-[#64748B] font-semibold">({need.count})</span>
                </div>
              </div>

              {/* Progress Line - Pure blue gradient, no purple */}
              <div className="h-2 w-full bg-[#EEF6FF] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#0057E7] to-[#2B7FFF] transition-all duration-500"
                  style={{ width: `${need.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}
