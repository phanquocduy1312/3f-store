import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AdminCard } from "./admin-card";

interface RevenuePoint {
  date: string;
  revenue: number;
}

export function AdminRevenueChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data: RevenuePoint[] = [
    { date: "06/06", revenue: 12500000 },
    { date: "07/06", revenue: 18700000 },
    { date: "08/06", revenue: 22100000 },
    { date: "09/06", revenue: 19800000 },
    { date: "10/06", revenue: 25300000 },
    { date: "11/06", revenue: 24900000 },
    { date: "12/06", revenue: 28450000 }
  ];

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num).replace("₫", "đ");
  };

  const formatM = (num: number) => {
    return `${(num / 1000000).toFixed(0)}M`;
  };

  // SVG Chart Dimension parameters
  const svgWidth = 600;
  const svgHeight = 200;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 25;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;
  const maxVal = 40000000; // 40M cap

  // Compute coordinates
  const points = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartWidth;
    const y = padTop + (1 - d.revenue / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Create path description line
  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  // Create shaded area path
  const areaPath = linePath ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - padBottom} L ${points[0].x} ${svgHeight - padBottom} Z` : "";

  // Grid line Y coordinate helper
  const gridY = (val: number) => padTop + (1 - val / maxVal) * chartHeight;

  const chartHeaderAction = (
    <button className="flex items-center gap-1.5 bg-[#F6FAFF] border border-[#DCEBFF] text-[#062B5F] text-[12px] font-bold px-3 py-1.5 rounded-xl transition duration-150 hover:bg-[#EEF6FF]">
      <span>7 ngày qua</span>
      <ChevronDown size={14} />
    </button>
  );

  return (
    <AdminCard 
      title="Doanh thu 7 ngày qua" 
      subtitle="Doanh số bán hàng thực tế" 
      action={chartHeaderAction}
      className="h-[430px] flex flex-col"
    >
      {/* SVG Canvas wrapper */}
      <div className="relative flex-1 min-h-[160px] mt-2">
        {/* Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div 
            className="absolute bg-[#021B3A] text-white text-[11px] font-bold p-2.5 rounded-xl shadow-lg border border-white/10 pointer-events-none z-10 transition-all duration-150"
            style={{ 
              left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
              top: `${(points[hoveredIdx].y / svgHeight) * 100 - 10}%`,
              transform: "translate(-50%, -100%)"
            }}
          >
            <p className="text-[9px] text-blue-200/70">{points[hoveredIdx].date}</p>
            <p>{formatVnd(points[hoveredIdx].revenue)}</p>
          </div>
        )}

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            {/* Shading area gradient */}
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0057E7" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0057E7" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines (0M, 10M, 20M, 30M, 40M) */}
          {[0, 10000000, 20000000, 30000000, 40000000].map((val) => {
            const y = gridY(val);
            return (
              <g key={val} className="opacity-30">
                <line 
                  x1={padLeft} 
                  y1={y} 
                  x2={svgWidth - padRight} 
                  y2={y} 
                  stroke="#DCEBFF" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={padLeft - 8} 
                  y={y + 3} 
                  textAnchor="end" 
                  className="text-[9px] font-bold fill-[#64748B]"
                >
                  {formatM(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Line Path */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="#0057E7" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Interactive circles and label text */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Highlight background active circle */}
              {hoveredIdx === i && (
                <circle cx={p.x} cy={p.y} r="9" fill="#0057E7" fillOpacity="0.15" />
              )}
              {/* Main dot circle */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="5.5" 
                fill={hoveredIdx === i ? "#0057E7" : "white"} 
                stroke="#0057E7" 
                strokeWidth="3" 
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              
              {/* Top value badge label for endpoint */}
              {i === points.length - 1 && (
                <g transform={`translate(${p.x - 20}, ${p.y - 15})`}>
                  <rect width="40" height="14" rx="4" fill="#0057E7" />
                  <text x="20" y="9.5" textAnchor="middle" className="text-[8px] font-black fill-white">
                    28.45M
                  </text>
                </g>
              )}

              {/* X Axis Labels */}
              <text 
                x={p.x} 
                y={svgHeight - 4} 
                textAnchor="middle" 
                className="text-[9px] font-bold fill-[#64748B]"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Summary boxes (Grid 2 columns on mobile/tablet, 4 columns on desktop) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 rounded-2xl border border-[#DCEBFF] bg-[#F8FBFF] overflow-hidden mt-4 shrink-0">
        {[
          { label: "Tổng doanh thu", val: "151.750.000đ", pct: "+16.5%", isUp: true },
          { label: "Tổng đơn hàng", val: "834", pct: "+13.7%", isUp: true },
          { label: "Giá trị đơn TB", val: "182.371đ", pct: "+6.8%", isUp: true },
          { label: "Tỷ lệ chuyển đổi", val: "2.35%", pct: "+0.35%", isUp: true }
        ].map((item, idx) => (
          <div 
            key={idx} 
            className={`p-4 flex flex-col justify-center border-[#DCEBFF] ${
              idx === 1 || idx === 3 ? "border-l" : ""
            } ${
              idx >= 2 ? "border-t" : ""
            } xl:border-t-0 xl:border-l xl:first:border-l-0`}
          >
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">{item.label}</span>
            <h5 className="text-[15px] font-extrabold text-[#0B1F3A] mt-1">{item.val}</h5>
            <span className={`text-[12px] font-bold mt-1 flex items-center gap-0.5 ${
              item.isUp ? "text-[#16A34A]" : "text-[#EF4444]"
            }`}>
              <span>{item.isUp ? "▲" : "▼"}</span>
              <span>{item.pct}</span>
            </span>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
