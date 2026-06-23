import React, { useState, useEffect } from "react";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AdminCard } from "./admin-card";
import { adminDashboardApi } from "@/src/api/adminDashboardApi";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  name: string;
  "Kỳ này": number;
  "Kỳ trước": number;
  "Đơn hàng": number;
}

interface AdminRevenueChartProps {
  filter?: string;
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const formatVnd = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(v)
      .replace("₫", "đ");

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-2xl shadow-blue-900/10 p-4 min-w-[180px]">
      <p className="text-[11px] font-bold text-slate-400 mb-2.5 tracking-wider uppercase">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: entry.color }}
            />
            <span className="text-[12px] font-semibold text-slate-600">{entry.name}</span>
          </div>
          <span className="text-[13px] font-black text-slate-900">
            {entry.name === "Đơn hàng"
              ? `${Number(entry.value).toLocaleString("vi-VN")} đơn`
              : formatVnd(Number(entry.value))}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Custom Legend ───────────────────────────────────────────────────────────
const CustomLegend = ({ payload }: any) => (
  <div className="flex items-center justify-center gap-5 mt-2 flex-wrap">
    {payload?.map((entry: any, idx: number) => (
      <div key={idx} className="flex items-center gap-1.5">
        <span
          className="inline-block rounded-sm"
          style={{
            width: entry.type === "line" ? 18 : 12,
            height: entry.type === "line" ? 3 : 12,
            background: entry.color,
            borderRadius: entry.type === "line" ? 2 : 4,
            borderTop: entry.type === "line" && entry.payload?.strokeDasharray
              ? "none"
              : undefined,
          }}
        />
        <span className="text-[11px] font-bold text-slate-500">{entry.value}</span>
      </div>
    ))}
  </div>
);

// ─── Format helpers ──────────────────────────────────────────────────────────
const formatM = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return `${v}`;
};

const formatVnd = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(v)
    .replace("₫", "đ");

const getPctChange = (cur: number, prev: number, filter: string) => {
  if (filter === "all_time") return { pct: "—", isUp: true, isNeutral: true };
  if (prev === 0) return cur > 0 ? { pct: "+100%", isUp: true, isNeutral: false } : { pct: "0%", isUp: true, isNeutral: true };
  const diff = ((cur - prev) / prev) * 100;
  return {
    pct: `${diff >= 0 ? "+" : ""}${Math.abs(diff).toFixed(1)}%`,
    isUp: diff >= 0,
    isNeutral: Math.abs(diff) < 0.1,
  };
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function AdminRevenueChart({ filter = "this_week" }: AdminRevenueChartProps) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [stats, setStats] = useState({
    curRev: 0, prevRev: 0,
    curOrd: 0, prevOrd: 0,
    curAov: 0, prevAov: 0,
    curAvgOrd: 0, prevAvgOrd: 0,
  });

  const getChartTitle = () => {
    switch (filter) {
      case "today": return "Doanh thu hôm nay";
      case "this_week": return "Doanh thu tuần này";
      case "this_month": return "Doanh thu tháng này";
      case "this_year": return "Doanh thu năm nay";
      case "all_time": return "Doanh thu tổng thể";
      default: return "Doanh thu";
    }
  };

  const getAvgLabel = () => {
    switch (filter) {
      case "today": return "Đơn TB / giờ";
      case "this_year":
      case "all_time": return "Đơn TB / tháng";
      default: return "Đơn TB / ngày";
    }
  };

  const getDivisor = (len: number) => {
    switch (filter) {
      case "today": return 24;
      case "this_week": return 7;
      case "this_month": return new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      case "this_year": return 12;
      default: return len || 30;
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    adminDashboardApi.getRevenueChart(filter)
      .then((res: any) => {
        if (!isMounted) return;
        const current: any[] = res.current || [];
        const previous: any[] = res.previous || [];

        // Merge into single array for Recharts
        const merged: ChartDataPoint[] = current.map((cur, i) => ({
          name: cur.name,
          "Kỳ này": cur["Doanh thu"] || 0,
          "Kỳ trước": previous[i]?.["Doanh thu"] ?? 0,
          "Đơn hàng": cur["Đơn hàng"] || 0,
        }));

        setChartData(merged);

        const curRev = current.reduce((s: number, d: any) => s + (d["Doanh thu"] || 0), 0);
        const prevRev = previous.reduce((s: number, d: any) => s + (d["Doanh thu"] || 0), 0);
        const curOrd = current.reduce((s: number, d: any) => s + (d["Đơn hàng"] || 0), 0);
        const prevOrd = previous.reduce((s: number, d: any) => s + (d["Đơn hàng"] || 0), 0);
        const curAov = curOrd > 0 ? curRev / curOrd : 0;
        const prevAov = prevOrd > 0 ? prevRev / prevOrd : 0;
        const divisor = getDivisor(current.length);
        const curAvgOrd = curOrd / divisor;
        const prevAvgOrd = prevOrd / divisor;

        setStats({ curRev, prevRev, curOrd, prevOrd, curAov, prevAov, curAvgOrd, prevAvgOrd });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load chart data", err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filter]);

  const summaryItems = [
    {
      label: "Tổng doanh thu",
      value: formatVnd(stats.curRev),
      ...getPctChange(stats.curRev, stats.prevRev, filter),
    },
    {
      label: "Tổng đơn hàng",
      value: stats.curOrd.toLocaleString("vi-VN"),
      ...getPctChange(stats.curOrd, stats.prevOrd, filter),
    },
    {
      label: "Giá trị đơn TB",
      value: formatVnd(stats.curAov),
      ...getPctChange(stats.curAov, stats.prevAov, filter),
    },
    {
      label: getAvgLabel(),
      value: `${stats.curAvgOrd.toFixed(2)} đơn`,
      ...getPctChange(stats.curAvgOrd, stats.prevAvgOrd, filter),
    },
  ];

  // Determine Y-axis domain for orders
  const maxOrdVal = chartData.length > 0 ? Math.max(...chartData.map(d => d["Đơn hàng"]), 0) : 0;

  return (
    <AdminCard
      title={getChartTitle()}
      subtitle="So sánh với kỳ trước"
      action={null}
      className="h-[430px] flex flex-col"
    >
      <div className="flex-1 min-h-0 mt-2 flex flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-1 items-center justify-center flex-col gap-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
              <TrendingUp className="text-slate-300" size={22} />
            </div>
            <p className="text-slate-400 text-[13px] font-medium">Không có dữ liệu trong thời gian này.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={1} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.85} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />

                {/* Left Y axis: Revenue */}
                <YAxis
                  yAxisId="rev"
                  orientation="left"
                  tickFormatter={formatM}
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />

                {/* Right Y axis: Orders */}
                <YAxis
                  yAxisId="ord"
                  orientation="right"
                  tick={{ fill: "#F97316", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                  domain={[0, maxOrdVal > 0 ? Math.ceil(maxOrdVal * 1.3) : 10]}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />

                <Legend content={<CustomLegend />} />

                {/* Bar: Kỳ này (current period revenue) */}
                <Bar
                  yAxisId="rev"
                  dataKey="Kỳ này"
                  fill="url(#gradCurrent)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />

                {/* Line: Kỳ trước (previous period revenue) */}
                <Line
                  yAxisId="rev"
                  type="monotone"
                  dataKey="Kỳ trước"
                  stroke="#CBD5E1"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={false}
                  activeDot={{ r: 4, fill: "#CBD5E1", strokeWidth: 0 }}
                />

                {/* Line: Đơn hàng (order count, right axis) */}
                <Line
                  yAxisId="ord"
                  type="monotone"
                  dataKey="Đơn hàng"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#F97316", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#F97316", strokeWidth: 2, stroke: "#fff" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary boxes */}
      <div className="grid grid-cols-2 xl:grid-cols-4 rounded-2xl border border-[#DCEBFF] bg-[#F8FBFF] overflow-hidden mt-3 shrink-0">
        {summaryItems.map((item, idx) => {
          const TrendIcon = item.isNeutral ? Minus : item.isUp ? TrendingUp : TrendingDown;
          const trendColor = item.isNeutral
            ? "text-slate-400"
            : item.isUp
            ? "text-emerald-600"
            : "text-red-500";

          return (
            <div
              key={idx}
              className={`p-3.5 flex flex-col justify-center border-[#DCEBFF] ${
                idx === 1 || idx === 3 ? "border-l" : ""
              } ${idx >= 2 ? "border-t" : ""} xl:border-t-0 xl:border-l xl:first:border-l-0`}
            >
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block leading-tight">
                {item.label}
              </span>
              <h5 className="text-[14px] font-extrabold text-[#0B1F3A] mt-1 leading-tight">
                {item.value}
              </h5>
              <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
                <TrendIcon size={11} strokeWidth={2.5} />
                <span className="text-[11px] font-bold">{item.pct}</span>
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}
