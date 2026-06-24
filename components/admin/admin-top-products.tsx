import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { adminDashboardApi } from "@/src/api/adminDashboardApi";
import { AdminCard } from "./admin-card";

interface ProductItem {
  rank: number;
  name: string;
  sold: number;
  revenue: string;
  image: string;
}

export function AdminTopProducts() {
  const [topProducts, setTopProducts] = useState<ProductItem[]>([]);
  const [filter, setFilter] = useState("7_days");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { value: "today", label: "Hôm nay" },
    { value: "7_days", label: "7 ngày qua" },
    { value: "30_days", label: "30 ngày qua" },
    { value: "all_time", label: "Tất cả" },
  ];

  const activeLabel = filterOptions.find(o => o.value === filter)?.label || "7 ngày qua";

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

    adminDashboardApi.getTopProducts(filter)
      .then((data) => {
        if (!isMounted) return;
        setTopProducts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load top products", err);
        if (isMounted) {
          setTopProducts([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filter]);

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
        <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#DCEBFF] rounded-2xl shadow-[0_12px_30px_rgba(10,38,59,0.08)] py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
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
      title="Top sản phẩm bán chạy"
      subtitle="Sản phẩm có doanh số cao nhất"
      action={headerAction}
      className="h-[360px] flex flex-col"
    >
      <div className="space-y-1 mt-2 flex-1 overflow-y-auto admin-scrollbar pr-1 relative">
        {loading ? (
          <div className="flex h-full items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#0057E7]" />
          </div>
        ) : topProducts.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-400 text-[13px] font-medium py-12">
            Chưa có số liệu bán hàng trong kỳ.
          </div>
        ) : (
          topProducts.map((prod) => (
            <div
              key={prod.rank}
              className="flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-[#F6FAFF] transition"
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${
                prod.rank === 1 ? "bg-amber-100 text-amber-700" :
                prod.rank === 2 ? "bg-slate-100 text-slate-700" :
                prod.rank === 3 ? "bg-orange-50 text-orange-700" :
                "bg-slate-50 text-slate-400"
              }`}>
                {prod.rank}
              </span>

              <img
                src={prod.image}
                alt={prod.name}
                className="w-10 h-10 rounded-lg object-cover border border-[#DCEBFF] shrink-0"
              />

              <div className="min-w-0 flex-1">
                <h5 className="text-[13.5px] font-bold text-[#0B1F3A] line-clamp-2 leading-tight">{prod.name}</h5>
                <p className="text-xs text-[#64748B] mt-0.5">Đã bán: {prod.sold}</p>
              </div>

              <span className="text-[14px] font-black text-[#0B1F3A] text-right shrink-0">
                {prod.revenue}
              </span>
            </div>
          ))
        )}
      </div>
    </AdminCard>
  );
}
