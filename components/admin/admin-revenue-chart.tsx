import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { AdminCard } from "./admin-card";
import { adminDashboardApi } from "@/src/api/adminDashboardApi";

interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export function AdminRevenueChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [days, setDays] = useState<7 | 30>(7);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RevenuePoint[]>([]);

  // Stats calculated dynamically
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalRevenueChange: "0%",
    totalRevenueIsUp: true,
    totalOrders: 0,
    totalOrdersChange: "0%",
    totalOrdersIsUp: true,
    aov: 0,
    aovChange: "0%",
    aovIsUp: true,
    avgOrders: 0,
    avgOrdersChange: "0%",
    avgOrdersIsUp: true
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Fetch double the period size to compare with the preceding period
    adminDashboardApi.getRevenueChart(days * 2)
      .then((res) => {
        if (!isMounted) return;

        // Split data into current and previous periods
        const currentPeriod = res.slice(days);
        const previousPeriod = res.slice(0, days);

        const currentPoints = currentPeriod.map(item => ({
          date: item.name,
          revenue: item['Doanh thu'],
          orders: item['Đơn hàng']
        }));

        setData(currentPoints);

        // Calculate current statistics
        const curRev = currentPoints.reduce((sum, d) => sum + d.revenue, 0);
        const curOrd = currentPoints.reduce((sum, d) => sum + d.orders, 0);
        const curAov = curOrd > 0 ? curRev / curOrd : 0;
        const curAvgOrd = curOrd / days;

        // Calculate previous statistics
        const prevRev = previousPeriod.reduce((sum, d) => sum + d['Doanh thu'], 0);
        const prevOrd = previousPeriod.reduce((sum, d) => sum + d['Đơn hàng'], 0);
        const prevAov = prevOrd > 0 ? prevRev / prevOrd : 0;
        const prevAvgOrd = prevOrd / days;

        // Helper to calculate percentage change
        const getPctChange = (cur: number, prev: number) => {
          if (prev === 0) {
            return cur > 0 ? { pct: "+100%", isUp: true } : { pct: "0%", isUp: true };
          }
          const diff = ((cur - prev) / prev) * 100;
          return {
            pct: `${diff >= 0 ? "+" : ""}${Math.abs(diff).toFixed(1)}%`,
            isUp: diff >= 0
          };
        };

        const revPct = getPctChange(curRev, prevRev);
        const ordPct = getPctChange(curOrd, prevOrd);
        const aovPct = getPctChange(curAov, prevAov);
        const avgOrdPct = getPctChange(curAvgOrd, prevAvgOrd);

        setStats({
          totalRevenue: curRev,
          totalRevenueChange: revPct.pct,
          totalRevenueIsUp: revPct.isUp,
          totalOrders: curOrd,
          totalOrdersChange: ordPct.pct,
          totalOrdersIsUp: ordPct.isUp,
          aov: curAov,
          aovChange: aovPct.pct,
          aovIsUp: aovPct.isUp,
          avgOrders: curAvgOrd,
          avgOrdersChange: avgOrdPct.pct,
          avgOrdersIsUp: avgOrdPct.isUp
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load chart data", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [days]);

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num).replace("₫", "đ");
  };

  const formatM = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return `${num}`;
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

  // Calculate dynamic max value (floor of 10M)
  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.revenue), 10000000) : 10000000;

  // Compute coordinates
  const points = data.map((d, i) => {
    const x = padLeft + (data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2);
    const y = padTop + (1 - d.revenue / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Create path description line
  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  // Create shaded area path
  const areaPath = linePath && points.length > 0 ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - padBottom} L ${points[0].x} ${svgHeight - padBottom} Z` : "";

  // Grid line Y coordinate helper
  const gridY = (val: number) => padTop + (1 - val / maxVal) * chartHeight;

  // Generate 5 grid steps dynamically
  const gridSteps = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  // Helper for last item value formatted
  const lastPointFormatted = data.length > 0 ? formatM(data[data.length - 1].revenue) : "0M";

  return (
    <AdminCard 
      title={`Doanh thu ${days} ngày qua`} 
      subtitle="Doanh số bán hàng thực tế" 
      action={
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 bg-[#F6FAFF] border border-[#DCEBFF] text-[#062B5F] text-[12px] font-bold px-3 py-1.5 rounded-xl transition duration-150 hover:bg-[#EEF6FF]"
          >
            <span>{days} ngày qua</span>
            <ChevronDown size={14} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-[#DCEBFF] rounded-xl shadow-lg z-50 overflow-hidden">
              <button 
                onClick={() => { setDays(7); setDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-bold transition ${days === 7 ? "bg-[#EEF6FF] text-[#0057E7]" : "hover:bg-[#F6FAFF] text-[#0B1F3A]"}`}
              >
                7 ngày qua
              </button>
              <button 
                onClick={() => { setDays(30); setDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-bold transition ${days === 30 ? "bg-[#EEF6FF] text-[#0057E7]" : "hover:bg-[#F6FAFF] text-[#0B1F3A]"}`}
              >
                30 ngày qua
              </button>
            </div>
          )}
        </div>
      }
      className="h-[430px] flex flex-col"
    >
      <div className="relative flex-1 min-h-[160px] mt-2 flex flex-col justify-center">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-[13px] font-medium">
            Không có dữ liệu trong thời gian này.
          </div>
        ) : (
          <>
            {/* Tooltip Overlay */}
            {hoveredIdx !== null && points[hoveredIdx] && (
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
                <p className="text-[10px] text-slate-300 font-medium">Đơn hàng: {points[hoveredIdx].orders}</p>
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

              {/* Grid lines */}
              {gridSteps.map((val, idx) => {
                const y = gridY(val);
                return (
                  <g key={idx} className="opacity-30">
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
              {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

              {/* Line Path */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#0057E7" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

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
                        {lastPointFormatted}
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
          </>
        )}
      </div>

      {/* Summary boxes (Grid 2 columns on mobile/tablet, 4 columns on desktop) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 rounded-2xl border border-[#DCEBFF] bg-[#F8FBFF] overflow-hidden mt-4 shrink-0">
        {[
          { label: "Tổng doanh thu", val: formatVnd(stats.totalRevenue), pct: stats.totalRevenueChange, isUp: stats.totalRevenueIsUp },
          { label: "Tổng đơn hàng", val: stats.totalOrders.toLocaleString("vi-VN"), pct: stats.totalOrdersChange, isUp: stats.totalOrdersIsUp },
          { label: "Giá trị đơn TB", val: formatVnd(stats.aov), pct: stats.aovChange, isUp: stats.aovIsUp },
          { label: "Đơn hàng TB / ngày", val: `${stats.avgOrders.toFixed(1)} đơn/ngày`, pct: stats.avgOrdersChange, isUp: stats.avgOrdersIsUp }
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
              <span>{item.pct.replace("-", "").replace("+", "")}</span>
            </span>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
