import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminCard } from "./admin-card";
import { adminDashboardApi } from "@/src/api/adminDashboardApi";

interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

interface AdminRevenueChartProps {
  filter?: string;
}

export function AdminRevenueChart({ filter = "this_week" }: AdminRevenueChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
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

  const getDivisorAndSuffix = (currentLen: number) => {
    switch (filter) {
      case "today":
        return { divisor: 24, suffix: "đơn/giờ" };
      case "this_week":
        return { divisor: 7, suffix: "đơn/ngày" };
      case "this_month": {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return { divisor: daysInMonth, suffix: "đơn/ngày" };
      }
      case "this_year":
        return { divisor: 12, suffix: "đơn/tháng" };
      case "all_time":
      default:
        return { divisor: currentLen || 30, suffix: "đơn/ngày" };
    }
  };

  const getAvgOrdersLabel = () => {
    switch (filter) {
      case "today": return "Đơn hàng TB / giờ";
      case "this_year":
      case "all_time":
        return "Đơn hàng TB / tháng";
      case "this_week":
      case "this_month":
      default:
        return "Đơn hàng TB / ngày";
    }
  };

  const getChartTitle = () => {
    switch (filter) {
      case "today": return "Doanh thu hôm nay";
      case "this_week": return "Doanh thu tuần này";
      case "this_month": return "Doanh thu tháng này";
      case "this_year": return "Doanh thu năm nay";
      case "all_time": return "Doanh thu tất cả thời gian";
      default:
        return "Doanh thu";
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    adminDashboardApi.getRevenueChart(filter)
      .then((res: any) => {
        if (!isMounted) return;

        const currentPeriod = res.current || [];
        const previousPeriod = res.previous || [];

        const currentPoints = currentPeriod.map((item: any) => ({
          date: item.name,
          revenue: item['Doanh thu'] || 0,
          orders: item['Đơn hàng'] || 0
        }));

        setData(currentPoints);

        // Calculate current statistics
        const curRev = currentPoints.reduce((sum: number, d: any) => sum + d.revenue, 0);
        const curOrd = currentPoints.reduce((sum: number, d: any) => sum + d.orders, 0);
        const curAov = curOrd > 0 ? curRev / curOrd : 0;
        
        const { divisor } = getDivisorAndSuffix(currentPoints.length);
        const curAvgOrd = curOrd / divisor;

        // Calculate previous statistics
        const prevRev = previousPeriod.reduce((sum: number, d: any) => sum + (d['Doanh thu'] || 0), 0);
        const prevOrd = previousPeriod.reduce((sum: number, d: any) => sum + (d['Đơn hàng'] || 0), 0);
        const prevAov = prevOrd > 0 ? prevRev / prevOrd : 0;
        const prevAvgOrd = prevOrd / divisor;

        // Helper to calculate percentage change
        const getPctChange = (cur: number, prev: number) => {
          if (filter === 'all_time') {
            return { pct: "0%", isUp: true };
          }
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
  }, [filter]);

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

  // Determine if there is any revenue or orders
  const hasRevenue = data.some(d => d.revenue > 0);
  const hasOrders = data.some(d => d.orders > 0);

  let maxVal = 10000;
  if (hasRevenue) {
    maxVal = Math.max(...data.map(d => d.revenue), 10000);
  } else if (hasOrders) {
    const peakOrders = Math.max(...data.map(d => d.orders));
    // Ceil to a multiple of 4 (min 4) to ensure grid lines show clean integer ticks
    maxVal = Math.max(4, Math.ceil(peakOrders / 4) * 4);
  } else {
    maxVal = 10000;
  }

  // Compute coordinates for bars
  const slotWidth = chartWidth / (data.length || 1);
  const barWidth = Math.max(6, Math.min(24, slotWidth * 0.45));

  const points = data.map((d, i) => {
    const x = padLeft + (i + 0.5) * slotWidth;
    let y = padTop + chartHeight;
    if (hasRevenue) {
      y = padTop + (1 - d.revenue / maxVal) * chartHeight;
    } else if (hasOrders) {
      y = padTop + (1 - d.orders / maxVal) * chartHeight;
    }
    return { x, y, ...d };
  });

  // Grid line Y coordinate helper
  const gridY = (val: number) => padTop + (1 - val / maxVal) * chartHeight;

  // Generate 5 grid steps dynamically
  const gridSteps = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  // Helper for divisor and suffix for average orders / day
  const { suffix: avgOrdersSuffix } = getDivisorAndSuffix(data.length);

  return (
    <AdminCard 
      title={getChartTitle()} 
      subtitle="Doanh số bán hàng thực tế" 
      action={null}
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
            {/* Premium Glassmorphism Tooltip Overlay */}
            {hoveredIdx !== null && points[hoveredIdx] && (
              <div 
                className="absolute bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold p-3 rounded-2xl shadow-xl border border-slate-100/80 pointer-events-none z-25 transition-all duration-150 flex flex-col gap-1.5 min-w-[125px]"
                style={{ 
                  left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
                  top: `${(points[hoveredIdx].y / svgHeight) * 100 - 12}%`,
                  transform: "translate(-50%, -100%)"
                }}
              >
                <span className="text-[10px] text-slate-400 font-semibold">{points[hoveredIdx].date}</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-slate-900 font-black">{formatVnd(points[hoveredIdx].revenue)}</span>
                  <span className="text-[10px] text-blue-600 font-extrabold mt-0.5">Đơn hàng: {points[hoveredIdx].orders}</span>
                </div>
              </div>
            )}

            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              {/* Grid lines */}
              {gridSteps.map((val, idx) => {
                const y = gridY(val);
                return (
                  <g key={idx}>
                    <line 
                      x1={padLeft} 
                      y1={y} 
                      x2={svgWidth - padRight} 
                      y2={y} 
                      stroke="#F1F5F9" 
                      strokeWidth={1}
                    />
                    <text 
                      x={padLeft - 8} 
                      y={y + 3} 
                      textAnchor="end" 
                      className="text-[9px] font-bold fill-[#94A3B8]"
                    >
                      {hasRevenue ? formatM(val) : Math.round(val)}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {points.map((p, i) => {
                const yBottom = svgHeight - padBottom;
                let barHeight = 0;
                if (hasRevenue) {
                  barHeight = p.revenue > 0 ? Math.max(6, yBottom - p.y) : (p.orders > 0 ? 6 : 0);
                } else if (hasOrders) {
                  barHeight = p.orders > 0 ? Math.max(6, yBottom - p.y) : 0;
                }
                const isHovered = hoveredIdx === i;
                const trackWidth = Math.min(36, slotWidth - 4);
                let showLabel = false;
                if (filter === "today") {
                  showLabel = i % 4 === 0; // Show every 4 hours
                } else if (filter === "this_week") {
                  showLabel = true; // Show all 7 days
                } else if (filter === "this_month") {
                  showLabel = i % 5 === 0; // Show every 5 days (e.g. 1st, 6th, 11th, 16th, 21st, 26th, 31st)
                } else if (filter === "this_year") {
                  showLabel = true; // Show all 12 months
                } else {
                  showLabel = data.length <= 10 ? true : (i % (Math.ceil(data.length / 8)) === 0 || i === data.length - 1);
                }

                return (
                  <g key={i}>
                    {/* Hover column background guide track */}
                    {isHovered && (
                      <rect
                        x={p.x - trackWidth / 2}
                        y={padTop}
                        width={trackWidth}
                        height={chartHeight}
                        fill="#F8FAFC"
                        rx="6"
                        className="pointer-events-none"
                      />
                    )}

                    {/* Interactive background rect for easier hovering */}
                    <rect
                      x={p.x - slotWidth / 2}
                      y={padTop}
                      width={slotWidth}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />

                    {/* Visual Bar */}
                    {barHeight > 0 && (
                      <rect
                        x={p.x - barWidth / 2}
                        y={yBottom - barHeight}
                        width={barWidth}
                        height={barHeight}
                        rx={barWidth / 2}
                        fill={isHovered ? "#2563EB" : "#3B82F6"}
                        className="transition-all duration-150 cursor-pointer pointer-events-none"
                      />
                    )}

                    {/* Top value badge label for hovered bar or last bar */}
                    {(isHovered || (hoveredIdx === null && i === points.length - 1)) && (hasRevenue ? p.revenue > 0 : p.orders > 0) && (
                      <g transform={`translate(${p.x - 20}, ${p.y - 18})`} className="pointer-events-none">
                        <rect width="40" height="14" rx="4" fill="#021B3A" />
                        <text x="20" y="9.5" textAnchor="middle" className="text-[8px] font-black fill-white">
                          {hasRevenue ? formatM(p.revenue) : `${p.orders} đơn`}
                        </text>
                      </g>
                    )}

                    {/* X Axis Labels (conditional to prevent overlap) */}
                    {showLabel && (
                      <text 
                        x={p.x} 
                        y={svgHeight - 4} 
                        textAnchor="middle" 
                        className="text-[9px] font-bold fill-[#94A3B8]"
                      >
                        {p.date}
                      </text>
                    )}
                  </g>
                );
              })}
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
          { label: getAvgOrdersLabel(), val: `${stats.avgOrders.toFixed(2)} ${avgOrdersSuffix}`, pct: stats.avgOrdersChange, isUp: stats.avgOrdersIsUp }
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
