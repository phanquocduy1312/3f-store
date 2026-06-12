import React from "react";
import { ChevronDown } from "lucide-react";
import { AdminCard } from "./admin-card";
import products from "../../data/products.json";

interface ProductItem {
  rank: number;
  name: string;
  sold: number;
  revenue: string;
  image: string;
}

export function AdminTopProducts() {
  const topProducts: ProductItem[] = products.slice(0, 5).map((p, index) => {
    // Generate mock revenue based on index just for display since JSON doesn't have it
    const mockRevenues = ["12.233.500đ", "4.842.000đ", "24.135.000đ", "13.195.500đ", "4.009.800đ"];
    const mockSolds = [215, 180, 150, 95, 82];
    
    return {
      rank: index + 1,
      name: p.name,
      sold: mockSolds[index] || 50,
      revenue: mockRevenues[index] || "1.000.000đ",
      image: p.image
    };
  });

  const headerAction = (
    <button className="flex items-center gap-1.5 bg-[#F6FAFF] border border-[#DCEBFF] text-[#062B5F] text-[12px] font-bold px-3 py-1.5 rounded-xl transition hover:bg-[#EEF6FF]">
      <span>7 ngày qua</span>
      <ChevronDown size={14} />
    </button>
  );

  return (
    <AdminCard 
      title="Top sản phẩm bán chạy" 
      subtitle="Sản phẩm có doanh số cao nhất"
      action={headerAction}
      className="h-[360px] flex flex-col"
    >
      <div className="space-y-1 mt-2 flex-1 overflow-y-auto admin-scrollbar pr-1">
        {topProducts.map((prod) => (
          <div 
            key={prod.rank} 
            className="flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-[#F6FAFF] transition"
          >
            {/* Rank Circle */}
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${
              prod.rank === 1 ? "bg-amber-100 text-amber-700" :
              prod.rank === 2 ? "bg-slate-100 text-slate-700" :
              prod.rank === 3 ? "bg-orange-50 text-orange-700" :
              "bg-slate-50 text-slate-400"
            }`}>
              {prod.rank}
            </span>

            {/* Product Image */}
            <img 
              src={prod.image} 
              alt={prod.name}
              className="w-10 h-10 rounded-lg object-cover border border-[#DCEBFF] shrink-0"
            />

            {/* Product Name & Muted Sold Count */}
            <div className="min-w-0 flex-1">
              <h5 className="text-[13.5px] font-bold text-[#0B1F3A] line-clamp-2 leading-tight">{prod.name}</h5>
              <p className="text-xs text-[#64748B] mt-0.5">Đã bán: {prod.sold}</p>
            </div>

            {/* Revenue Bold Navy */}
            <span className="text-[14px] font-black text-[#0B1F3A] text-right shrink-0">
              {prod.revenue}
            </span>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
