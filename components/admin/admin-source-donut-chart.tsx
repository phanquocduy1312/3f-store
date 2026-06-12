import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AdminCard } from "./admin-card";

interface DonutSlice {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export function AdminSourceDonutChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data: DonutSlice[] = [
    { name: "Website", value: 1245, percent: 45.2, color: "#003B7A" },
    { name: "AI Pet Advisor", value: 678, percent: 24.6, color: "#7C3AED" },
    { name: "Shopee", value: 553, percent: 20.1, color: "#EF3340" }, // Red 3F instead of bright red
    { name: "Zalo / Khác", value: 278, percent: 10.1, color: "#F59E0B" }
  ];

  const totalOrders = 2754;

  // Donut geometry constants
  const r = 50;
  const strokeWidth = 18;
  const circ = 2 * Math.PI * r; // ~314.16
  const center = 65;

  let accumulatedPercent = 0;

  const headerAction = (
    <button className="flex items-center gap-1.5 bg-[#F6FAFF] border border-[#DCEBFF] text-[#062B5F] text-[12px] font-bold px-3 py-1.5 rounded-xl transition hover:bg-[#EEF6FF]">
      <span>30 ngày qua</span>
      <ChevronDown size={14} />
    </button>
  );

  return (
    <AdminCard 
      title="Nguồn đơn hàng" 
      subtitle="Tỷ lệ đơn hàng theo kênh"
      action={headerAction}
      className="h-[430px] flex flex-col"
    >
      <div className="flex flex-col items-center justify-center gap-5 flex-1 min-h-0">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0">
          <svg viewBox="0 0 130 130" className="w-full h-full transform -rotate-90 overflow-visible">
            {data.map((slice, i) => {
              const dashArray = `${(slice.percent / 100) * circ} ${circ}`;
              const dashOffset = -((accumulatedPercent / 100) * circ);
              accumulatedPercent += slice.percent;

              const isHovered = hoveredIdx === i;

              return (
                <circle
                  key={slice.name}
                  cx={center}
                  cy={center}
                  r={r}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Central Overlay Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng đơn</span>
            <span className="text-[22px] font-black text-[#0B1F3A] leading-tight">
              {hoveredIdx !== null ? data[hoveredIdx].value.toLocaleString("vi-VN") : totalOrders.toLocaleString("vi-VN")}
            </span>
            {hoveredIdx !== null ? (
              <span className="text-[12px] font-black" style={{ color: data[hoveredIdx].color }}>
                {data[hoveredIdx].percent}%
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold mt-0.5">2.754 đơn</span>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full space-y-1">
          {data.map((slice, i) => (
            <div 
              key={slice.name}
              className={`flex items-center justify-between gap-3 py-2 px-2.5 rounded-xl transition-colors duration-150 cursor-pointer ${
                hoveredIdx === i ? "bg-[#F6FAFF]" : ""
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="text-[13px] font-bold text-[#0B1F3A] truncate">{slice.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                  ({slice.value} đơn)
                </span>
              </div>
              <span className="text-[13px] font-black text-[#0B1F3A]">
                {slice.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}
