import React, { useEffect, useState, useRef } from "react";
import { 
  Flame, Activity, Sparkles, Droplet, 
  Smile, TrendingUp, ChevronDown, Loader2 
} from "lucide-react";
import { adminDashboardApi } from "@/src/api/adminDashboardApi";
import { AdminCard } from "./admin-card";

interface PetNeedItem {
  name: string;
  percent: number;
  count: number;
}

export function AdminPetNeedsStats() {
  const [needs, setNeeds] = useState<PetNeedItem[]>([]);
  const [filter, setFilter] = useState("30_days");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { value: "today", label: "Hôm nay" },
    { value: "7_days", label: "7 ngày qua" },
    { value: "30_days", label: "30 ngày qua" },
    { value: "all_time", label: "Tất cả thời gian" },
  ];

  const activeLabel = filterOptions.find(o => o.value === filter)?.label || "30 ngày qua";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    adminDashboardApi.getPetNeeds(filter)
      .then((data) => {
        if (!isMounted) return;
        setNeeds(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load pet needs", err);
        if (isMounted) {
          setNeeds([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filter]);

  const getNeedIcon = (name: string) => {
    switch (name) {
      case "Kén ăn": return Flame;
      case "Tiêu hóa": return Activity;
      case "Da lông": return Sparkles;
      case "Tiết niệu": return Droplet;
      case "Hairball": return Smile;
      case "Tăng cân":
      case "Kiểm soát cân nặng":
      default:
        return TrendingUp;
    }
  };

  const headerAction = (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 bg-[#F6FAFF] border border-[#DCEBFF] text-[#062B5F] text-[12px] font-bold px-3 py-1.5 rounded-xl transition hover:bg-[#EEF6FF] active:scale-95"
      >
        <span>{activeLabel}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#DCEBFF] rounded-2xl shadow-[0_12px_30px_rgba(10,38,59,0.08)] py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setFilter(opt.value);
                setShowDropdown(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-[12px] font-bold transition-colors ${
                filter === opt.value 
                  ? "text-[#0057E7] bg-[#F6FAFF]" 
                  : "text-[#0B1F3A] hover:bg-[#F6FAFF] hover:text-[#0057E7]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AdminCard 
      title="Top nhu cầu thú cưng" 
      subtitle="Từ AI Advisor và CRM"
      action={headerAction}
      className="h-[360px] flex flex-col"
    >
      <div className="space-y-3 mt-2 flex-1 overflow-y-auto admin-scrollbar pr-1 relative">
        {loading ? (
          <div className="flex h-full items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#0057E7]" />
          </div>
        ) : needs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-400 text-[13px] font-medium py-12">
            Chưa có dữ liệu tư vấn trong kỳ.
          </div>
        ) : (
          needs.map((need) => {
            const Icon = getNeedIcon(need.name);
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

                {/* Progress Line */}
                <div className="h-2 w-full bg-[#EEF6FF] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#0057E7] to-[#2B7FFF] transition-all duration-500"
                    style={{ width: `${need.percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminCard>
  );
}
