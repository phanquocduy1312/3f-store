import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getProducts } from "@/src/api/productsApi";
import { AdminCard } from "./admin-card";

interface ProductItem {
  rank: number;
  name: string;
  sold: number;
  revenue: string;
  image: string;
}

function money(value: number) {
  return `${value.toLocaleString("vi-VN")}d`;
}

export function AdminTopProducts() {
  const [topProducts, setTopProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    getProducts({ sort: "popular", limit: 5 })
      .then((result) => {
        if (!isMounted) return;
        setTopProducts(result.items.map((product, index) => {
          const sold = product.sold || 0;
          const priceValue = Number(product.price.replace(/\D/g, "")) || 0;

          return {
            rank: index + 1,
            name: product.name,
            sold,
            revenue: money(priceValue * sold),
            image: product.image,
          };
        }));
      })
      .catch(() => {
        if (isMounted) setTopProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const headerAction = (
    <button className="flex items-center gap-1.5 bg-[#F6FAFF] border border-[#DCEBFF] text-[#062B5F] text-[12px] font-bold px-3 py-1.5 rounded-xl transition hover:bg-[#EEF6FF]">
      <span>7 ngay qua</span>
      <ChevronDown size={14} />
    </button>
  );

  return (
    <AdminCard
      title="Top san pham ban chay"
      subtitle="San pham co doanh so cao nhat"
      action={headerAction}
      className="h-[360px] flex flex-col"
    >
      <div className="space-y-1 mt-2 flex-1 overflow-y-auto admin-scrollbar pr-1">
        {topProducts.map((prod) => (
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
              <p className="text-xs text-[#64748B] mt-0.5">Da ban: {prod.sold}</p>
            </div>

            <span className="text-[14px] font-black text-[#0B1F3A] text-right shrink-0">
              {prod.revenue}
            </span>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
