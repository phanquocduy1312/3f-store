import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminCard } from "@/components/admin/admin-card";
import { adminAnalyticsApi, OverviewStatsData, ProductStatsData, CustomerStatsData, MarketingStatsData } from "@/src/api/adminAnalyticsApi";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertTriangle,
  ShoppingBag,
  Users,
  Award,
  BarChart3,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  Ticket
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// ─── Color Palettes ────────────────────────────────────────────────────────
const COLORS = {
  blue: ["#3B82F6", "#1D4ED8", "#60A5FA", "#93C5FD", "#2563EB"],
  tiers: {
    "Member": "#64748B",
    "Silver": "#94A3B8",
    "Gold": "#F59E0B",
    "Diamond": "#8B5CF6"
  },
  species: ["#F59E0B", "#10B981", "#6366F1"],
  gradient: {
    start: "#3B82F6",
    end: "#6366F1"
  }
};

// ─── Format Helpers ────────────────────────────────────────────────────────
const formatVnd = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(v)
    .replace("₫", "đ");

const formatCompact = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${v}`;
};

// ─── Custom Recharts Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, isCurrency = false }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md border border-[#DCEBFF] rounded-2xl shadow-[0_10px_30px_rgba(6,43,95,0.08)] p-4 min-w-[180px]">
      <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wider uppercase">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: entry.color || entry.fill }}
            />
            <span className="text-[12px] font-semibold text-slate-600">{entry.name}</span>
          </div>
          <span className="text-[13px] font-black text-slate-900">
            {entry.name === "Tỷ lệ CTR"
              ? `${entry.value}%`
              : isCurrency || entry.name.toLowerCase().includes("doanh thu")
              ? formatVnd(Number(entry.value))
              : Number(entry.value).toLocaleString("vi-VN")}
          </span>
        </div>
      ))}
    </div>
  );
};

export function AdminAnalyticsPage() {
  const [activeMenu, setActiveMenu] = useState("Báo cáo");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return true;
  });
  
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "customers" | "marketing">("overview");
  const [selectedDate, setSelectedDate] = useState("this_month");
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<OverviewStatsData | null>(null);
  const [productData, setProductData] = useState<ProductStatsData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerStatsData | null>(null);
  const [marketingData, setMarketingData] = useState<MarketingStatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("admin_user");
      if (userStr) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (e) {
      setIsAuthorized(false);
    }
  }, []);

  // Fetch Data according to activeTab & selectedDate
  useEffect(() => {
    if (!isAuthorized) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        if (activeTab === "overview") {
          const data = await adminAnalyticsApi.getOverview(selectedDate);
          if (isMounted) setOverviewData(data);
        } else if (activeTab === "products") {
          const data = await adminAnalyticsApi.getProducts(selectedDate);
          if (isMounted) setProductData(data);
        } else if (activeTab === "customers") {
          const data = await adminAnalyticsApi.getCustomers();
          if (isMounted) setCustomerData(data);
        } else if (activeTab === "marketing") {
          const data = await adminAnalyticsApi.getMarketing();
          if (isMounted) setMarketingData(data);
        }
      } catch (err: any) {
        console.error("Failed to load analytics data", err);
        // Fallbacks for testing/empty databases
        if (isMounted) {
          setError("Không thể lấy dữ liệu thật từ API. Đang sử dụng chế độ hiển thị thông tin dự phòng.");
          setupFallbackData();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedDate, isAuthorized]);

  const setupFallbackData = () => {
    if (activeTab === "overview") {
      setOverviewData({
        kpis: {
          revenue: { value: 124500000, growth: 12.5, label: "124.500.000đ" },
          orders: { value: 342, growth: 8.2, label: "342" },
          aov: { value: 364000, growth: 4.1, label: "364.000đ" },
          cancelRate: { value: 2.3, label: "2.3%" },
          returnRate: { value: 0.8, label: "0.8%" }
        },
        funnel: [
          { name: "1. Chờ xác nhận", count: 342 },
          { name: "2. Đã xác nhận", count: 310 },
          { name: "3. Chuẩn bị hàng", count: 290 },
          { name: "4. Chờ shipper", count: 280 },
          { name: "5. Đang giao", count: 275 },
          { name: "6. Giao thành công", count: 260 },
          { name: "7. Hoàn tất", count: 250 }
        ],
        shippingMix: [
          { name: "Express", value: 210, revenue: 84000000 },
          { name: "Standard", value: 102, revenue: 31200000 },
          { name: "SameDay", value: 30, revenue: 9300000 }
        ],
        paymentMix: [
          { name: "VietQR", value: 185, revenue: 78500000 },
          { name: "COD", value: 125, revenue: 36000000 },
          { name: "Card", value: 32, revenue: 10000000 }
        ],
        sourceMix: [
          { name: "website", value: 250, revenue: 95000000 },
          { name: "shopee", value: 72, revenue: 23500000 },
          { name: "tiktok", value: 20, revenue: 6000000 }
        ],
        timeline: Array.from({ length: 15 }, (_, i) => ({
          name: `${i + 10}/06`,
          "Doanh thu": Math.floor(Math.random() * 8000000) + 2000000,
          "Đơn hàng": Math.floor(Math.random() * 15) + 5
        }))
      });
    } else if (activeTab === "products") {
      setProductData({
        categories: [
          { id: 1, category_name: "Thức ăn hạt", revenue: 54000000, quantity: 180 },
          { id: 2, category_name: "Pate & Súp thưởng", revenue: 32000000, quantity: 450 },
          { id: 3, category_name: "Cát vệ sinh", revenue: 21000000, quantity: 190 },
          { id: 4, category_name: "Đồ chơi & Phụ kiện", revenue: 12000000, quantity: 85 },
          { id: 5, category_name: "Dinh dưỡng & Y tế", revenue: 5500000, quantity: 22 }
        ],
        topProducts: [
          { product_id: 1, name: "Hạt Orijen Six Fish cho Mèo", image: "", sold: 68, revenue: 34000000 },
          { product_id: 2, name: "Pate Ciao Churu Gói 40 thanh", image: "", sold: 120, revenue: 21600000 },
          { product_id: 3, name: "Cát đậu nành Tofu Cature", image: "", sold: 85, revenue: 11050000 },
          { product_id: 4, name: "Sữa bột cao cấp cho Chó Royal Canin", image: "", sold: 22, revenue: 9900000 },
          { product_id: 5, name: "Hạt Royal Canin Kitten 2kg", image: "", sold: 18, revenue: 7920000 }
        ],
        lowStock: [
          { id: 1, name: "Hạt Orijen Fit & Trim 1.8kg", stock: 3, out_of_stock: 0 },
          { id: 2, name: "Cát Cature Hương Trà Xanh", stock: 0, out_of_stock: 1 },
          { id: 3, name: "Pate Wanpy Gà & Cá Tuyết", stock: 5, out_of_stock: 0 },
          { id: 4, name: "Đồ chơi Cần câu lông vũ", stock: 0, out_of_stock: 1 },
          { id: 5, name: "Vòng cổ trị rận Seresto", stock: 2, out_of_stock: 0 }
        ]
      });
    } else if (activeTab === "customers") {
      setCustomerData({
        tiers: [
          { tier_name: "Member", tier_color: "#64748B", count: 480 },
          { tier_name: "Silver", tier_color: "#94A3B8", count: 210 },
          { tier_name: "Gold", tier_color: "#F59E0B", count: 65 },
          { tier_name: "Diamond", tier_color: "#8B5CF6", count: 18 }
        ],
        species: [
          { name: "Mèo", value: 430 },
          { name: "Chó", value: 310 },
          { name: "Khác", value: 33 }
        ],
        petNeeds: [
          { name: "Kén ăn", value: 320 },
          { name: "Tiêu hóa", value: 245 },
          { name: "Da lông", value: 198 },
          { name: "Tiết niệu", value: 87 },
          { name: "Hairball", value: 65 },
          { name: "Tăng cân", value: 42 }
        ],
        loyaltyTimeline: Array.from({ length: 10 }, (_, i) => ({
          date: `${i + 15}/06`,
          earned: Math.floor(Math.random() * 4000) + 1000,
          redeemed: Math.floor(Math.random() * 2500) + 500
        }))
      });
    } else if (activeTab === "marketing") {
      setMarketingData({
        banners: [
          { id: 1, placement: "home_hero_slider", title: "Khuyến mãi hè sôi động", image_url: "", views: 4500, clicks: 540, ctr: 12.0 },
          { id: 2, placement: "home_hero_slider", title: "Ưu đãi Shopee Request", image_url: "", views: 3200, clicks: 310, ctr: 9.69 },
          { id: 3, placement: "home_hero_slider", title: "Quà tặng 3F Club", image_url: "", views: 2800, clicks: 140, ctr: 5.0 }
        ],
        vouchers: [
          { code: "BOSS15", name: "Giảm 15%", discount_type: "percent", discount_value: 15, usage_limit: 200, used_count: 145, is_active: 1 },
          { code: "FREE30K", name: "Freeship 30K", discount_type: "fixed", discount_value: 30000, usage_limit: 300, used_count: 210, is_active: 1 },
          { code: "3F30K", name: "Voucher AI 30K", discount_type: "fixed", discount_value: 30000, usage_limit: 1000, used_count: 342, is_active: 1 },
          { code: "NEWFRIEND", name: "Giảm 50K khách mới", discount_type: "fixed", discount_value: 50000, usage_limit: 200, used_count: 56, is_active: 1 }
        ]
      });
    }
  };

  const getPeriodSuffix = () => {
    switch (selectedDate) {
      case "today": return "hôm nay";
      case "this_week": return "tuần này";
      case "this_month": return "tháng này";
      case "this_year": return "năm nay";
      case "7_days": return "7 ngày qua";
      case "30_days":
      default:
        return "30 ngày qua";
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F6FAFF]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0057E7] border-t-transparent" />
          <span className="text-sm font-semibold text-[#0B1F3A]">Đang xác thực quyền truy cập...</span>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
        <AdminSidebar activeMenu="Báo cáo" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />

        {!sidebarCollapsed && (
          <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarCollapsed(true)} />
        )}

        <div className={`min-h-screen overflow-x-hidden flex flex-col transition-all duration-300 ${sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
          <AdminHeader onToggleSidebar={() => setSidebarCollapsed((c) => !c)} selectedDate="today" onDateChange={() => {}} />

          <main className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[70vh]">
            <div className="max-w-md bg-white border border-[#DCEBFF] p-8 rounded-3xl shadow-sm flex flex-col items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0B1F3A]">Từ chối truy cập</h2>
                <p className="mt-2 text-xs font-semibold text-slate-400 leading-relaxed">
                  Tài khoản của bạn không có quyền xem báo cáo & phân tích hệ thống. Vui lòng liên hệ với Quản trị viên cấp cao để được phân quyền.
                </p>
              </div>
              <button
                onClick={() => window.location.href = "/admin"}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0057E7] hover:bg-[#003B7A] px-6 text-xs font-bold text-white transition shadow-sm"
              >
                Quay về Bảng điều khiển
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        collapsed={sidebarCollapsed}
      />

      {/* Sidebar Overlay for Mobile/Tablet */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className={`min-h-screen flex flex-col overflow-x-hidden transition-all duration-300 ${
        sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"
      }`}>
        <AdminHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchValue=""
          onSearchChange={() => {}}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          showDateFilter={activeTab === "overview" || activeTab === "products"}
        />

        <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-[24px] sm:text-[26px] font-black text-[#0B1F3A]">Phân tích & Báo cáo</h1>
              <p className="mt-0.5 text-xs sm:text-sm text-[#64748B]">
                Theo dõi hiệu suất kinh doanh, CRM và hoạt động tiếp thị
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 bg-[#EEF6FF] border border-[#DCEBFF] p-1.5 rounded-2xl self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === "overview"
                    ? "bg-[#0057E7] text-white shadow-[0_5px_15px_rgba(0,87,231,0.2)]"
                    : "text-[#082B5F] hover:bg-white/50"
                }`}
              >
                <ShoppingBag size={14} />
                <span>Doanh số</span>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === "products"
                    ? "bg-[#0057E7] text-white shadow-[0_5px_15px_rgba(0,87,231,0.2)]"
                    : "text-[#082B5F] hover:bg-white/50"
                }`}
              >
                <Layers size={14} />
                <span>Sản phẩm</span>
              </button>
              <button
                onClick={() => setActiveTab("customers")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === "customers"
                    ? "bg-[#0057E7] text-white shadow-[0_5px_15px_rgba(0,87,231,0.2)]"
                    : "text-[#082B5F] hover:bg-white/50"
                }`}
              >
                <Users size={14} />
                <span>Khách hàng & AI</span>
              </button>
              <button
                onClick={() => setActiveTab("marketing")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === "marketing"
                    ? "bg-[#0057E7] text-white shadow-[0_5px_15px_rgba(0,87,231,0.2)]"
                    : "text-[#082B5F] hover:bg-white/50"
                }`}
              >
                <Ticket size={14} />
                <span>Tiếp thị</span>
              </button>
            </div>
          </div>

          {/* Warning Banner if API fails */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 text-xs sm:text-sm font-semibold shadow-sm">
              <AlertTriangle className="text-amber-500 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* SKELETON LOADER */}
          {loading ? (
            <div className="h-[450px] flex items-center justify-center bg-white border border-[#DCEBFF] rounded-[24px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-[#0057E7]" />
                <span className="text-sm font-bold text-[#082B5F]">Đang tải dữ liệu báo cáo...</span>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: DOANH SỐ */}
              {activeTab === "overview" && overviewData && (
                <div className="space-y-6">
                  {/* KPI Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { title: `Doanh số ${getPeriodSuffix()}`, val: overviewData.kpis.revenue, icon: ShoppingBag, color: "text-[#3B82F6] bg-blue-50" },
                      { title: `Số đơn hàng ${getPeriodSuffix()}`, val: overviewData.kpis.orders, icon: ShoppingBag, color: "text-[#10B981] bg-emerald-50" },
                      { title: "Giá trị đơn TB (AOV)", val: overviewData.kpis.aov, icon: BarChart3, color: "text-[#F59E0B] bg-amber-50" },
                      { title: "Tỷ lệ hủy đơn", val: overviewData.kpis.cancelRate, icon: TrendingDown, color: "text-[#EF4444] bg-red-50", showTrend: false },
                      { title: "Tỷ lệ đổi trả", val: overviewData.kpis.returnRate, icon: TrendingDown, color: "text-[#8B5CF6] bg-purple-50", showTrend: false }
                    ].map((kpi, idx) => {
                      const Icon = kpi.icon;
                      const hasGrowth = kpi.val.growth !== undefined;
                      const isUp = (kpi.val.growth ?? 0) >= 0;

                      return (
                        <section key={idx} className="rounded-[24px] bg-white border border-[#DCEBFF] shadow-[0_10px_30px_rgba(6,43,95,0.06)] p-5 flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${kpi.color} shrink-0`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">{kpi.title}</span>
                            <h4 className="text-[18px] font-black text-[#0B1F3A] mt-0.5 leading-tight">{kpi.val.label}</h4>
                            {hasGrowth && (
                              <div className={`flex items-center gap-0.5 mt-1 text-[11px] font-bold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                                {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                <span>{isUp ? "+" : ""}{kpi.val.growth}%</span>
                              </div>
                            )}
                          </div>
                        </section>
                      );
                    })}
                  </div>

                  {/* Revenue Curve & Funnel Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-8">
                      <AdminCard title="Xu hướng doanh thu & Số đơn" subtitle="Biểu đồ chi tiết theo kỳ lọc">
                        <div className="h-[320px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={overviewData.timeline} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={COLORS.gradient.start} stopOpacity={0.8} />
                                  <stop offset="95%" stopColor={COLORS.gradient.start} stopOpacity={0.05} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <YAxis tickFormatter={formatCompact} tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="Doanh thu" stroke={COLORS.gradient.start} strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </AdminCard>
                    </div>

                    <div className="lg:col-span-4">
                      <AdminCard title="Phễu trạng thái đơn" subtitle="Tiến trình hoàn tất đơn hàng">
                        <div className="h-[320px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={overviewData.funnel} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }} width={100} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Số đơn hàng" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </AdminCard>
                    </div>
                  </div>

                  {/* Operational Mixes (Shipping, Payment, Source) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { title: "Kênh bán hàng", data: overviewData.sourceMix, colors: COLORS.blue },
                      { title: "Phương thức thanh toán", data: overviewData.paymentMix, colors: COLORS.species },
                      { title: "Đơn vị vận chuyển", data: overviewData.shippingMix, colors: COLORS.blue }
                    ].map((mix, idx) => (
                      <AdminCard key={idx} title={mix.title} subtitle="Phân chia theo số lượng và doanh thu">
                        <div className="flex items-center justify-between gap-4 mt-2">
                          <div className="w-1/2 h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={mix.data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={2}>
                                  {mix.data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={mix.colors[index % mix.colors.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-1/2 space-y-2">
                            {mix.data.map((row, i) => (
                              <div key={i} className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: mix.colors[i % mix.colors.length] }} />
                                  <span className="text-[11px] font-bold text-slate-700 truncate">{row.name}</span>
                                </div>
                                <span className="text-[12px] font-black text-slate-900 ml-4">
                                  {row.value} đơn ({formatCompact(row.revenue)}đ)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AdminCard>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: SẢN PHẨM */}
              {activeTab === "products" && productData && (
                <div className="space-y-6">
                  {/* Category Revenue Shares & Low Stock */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-8">
                      <AdminCard title="Doanh thu theo danh mục" subtitle="Cơ cấu sản phẩm bán chạy">
                        <div className="h-[320px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productData.categories} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                              <XAxis dataKey="category_name" tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <YAxis tickFormatter={formatCompact} tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip isCurrency />} />
                              <Bar dataKey="revenue" name="Doanh thu" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </AdminCard>
                    </div>

                    <div className="lg:col-span-4">
                      <AdminCard title="Cảnh báo tồn kho" subtitle="Sản phẩm sắp hết hoặc đã hết hàng">
                        <div className="mt-3 divide-y divide-[#DCEBFF] overflow-y-auto max-h-[300px] no-scrollbar">
                          {productData.lowStock.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                              <Minus size={24} />
                              <span className="text-[12px] font-bold">Không có cảnh báo tồn kho</span>
                            </div>
                          ) : (
                            productData.lowStock.map((prod) => (
                              <div key={prod.id} className="py-2.5 flex items-center justify-between gap-4">
                                <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">{prod.name}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                  prod.out_of_stock === 1
                                    ? "bg-red-50 text-red-600 border border-red-200"
                                    : "bg-amber-50 text-amber-600 border border-amber-200"
                                }`}>
                                  {prod.out_of_stock === 1 ? "Hết hàng" : `Còn ${prod.stock}`}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </AdminCard>
                    </div>
                  </div>

                  {/* Top Products Table */}
                  <AdminCard title="Top 10 sản phẩm bán chạy nhất" subtitle="Báo cáo chi tiết theo sản phẩm thực tế">
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-[#DCEBFF] bg-white">
                      <table className="min-w-full divide-y divide-[#DCEBFF] text-left text-xs font-semibold text-slate-600">
                        <thead className="bg-slate-50 text-[#0B1F3A] font-black uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-5 py-3.5 w-16">Hạng</th>
                            <th className="px-5 py-3.5">Tên sản phẩm</th>
                            <th className="px-5 py-3.5 w-32 text-right">Số lượng bán</th>
                            <th className="px-5 py-3.5 w-44 text-right">Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCEBFF]">
                          {productData.topProducts.map((prod, idx) => (
                            <tr key={prod.product_id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3 w-16">
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black text-white ${
                                  idx === 0 ? "bg-[#EF3340]" : idx === 1 ? "bg-amber-500" : idx === 2 ? "bg-blue-500" : "bg-slate-400"
                                }`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-5 py-3 font-bold text-[#0B1F3A] truncate max-w-[400px]">{prod.name}</td>
                              <td className="px-5 py-3 text-right font-black text-slate-700">{prod.sold.toLocaleString()}</td>
                              <td className="px-5 py-3 text-right font-black text-[#0057E7]">{formatVnd(prod.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AdminCard>
                </div>
              )}

              {/* TAB 3: KHÁCH HÀNG & AI */}
              {activeTab === "customers" && customerData && (
                <div className="space-y-6">
                  {/* Loyalty Points Curve & Tiers Donut */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-8">
                      <AdminCard title="Hoạt động tích & tiêu điểm Loyalty" subtitle="Số điểm Loyalty đã cấp và đổi quà">
                        <div className="h-[320px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={customerData.loyaltyTimeline} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                              <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line type="monotone" dataKey="earned" name="Cấp điểm" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                              <Line type="monotone" dataKey="redeemed" name="Tiêu điểm" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </AdminCard>
                    </div>

                    <div className="lg:col-span-4">
                      <AdminCard title="Cơ cấu Hạng thành viên" subtitle="Tỉ lệ phân bố VIP 3F Club">
                        <div className="flex flex-col items-center mt-2">
                          <div className="w-[180px] h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={customerData.tiers} dataKey="count" nameKey="tier_name" innerRadius={45} outerRadius={65} paddingAngle={2}>
                                  {customerData.tiers.map((row, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS.tiers[row.tier_name as keyof typeof COLORS.tiers] || COLORS.blue[index % COLORS.blue.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="grid grid-cols-2 gap-3 w-full mt-4">
                            {customerData.tiers.map((row, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-[#DCEBFF] rounded-xl">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS.tiers[row.tier_name as keyof typeof COLORS.tiers] }} />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] font-black text-slate-700 truncate">{row.tier_name}</span>
                                  <span className="text-[12px] font-black text-slate-900 leading-tight">{row.count} TV</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AdminCard>
                    </div>
                  </div>

                  {/* Species & Health Needs Mix */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-4">
                      <AdminCard title="Cơ cấu Thú cưng" subtitle="Tỷ lệ loài chó/mèo trong hệ thống">
                        <div className="flex flex-col items-center mt-2">
                          <div className="w-[180px] h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={customerData.species} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={2}>
                                  {customerData.species.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS.species[index % COLORS.species.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex items-center justify-center gap-6 w-full mt-4">
                            {customerData.species.map((row, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS.species[i % COLORS.species.length] }} />
                                <span className="text-xs font-bold text-slate-700">{row.name}: {row.value} bé</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AdminCard>
                    </div>

                    <div className="lg:col-span-8">
                      <AdminCard title="Vấn đề sức khỏe được AI Advisor nhận diện" subtitle="Thống kê nhu cầu từ dữ liệu tư vấn thật">
                        <div className="h-[230px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerData.petNeeds} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" name="Lượt nhận diện" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </AdminCard>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TIẾP THỊ & VOUCHER */}
              {activeTab === "marketing" && marketingData && (
                <div className="space-y-6">
                  {/* Banners CTR Grid */}
                  <AdminCard title="Hiệu suất Banner quảng cáo" subtitle="Thống kê lượt click, lượt view và CTR thật">
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-[#DCEBFF] bg-white">
                      <table className="min-w-full divide-y divide-[#DCEBFF] text-left text-xs font-semibold text-slate-600">
                        <thead className="bg-slate-50 text-[#0B1F3A] font-black uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-5 py-3.5">Tiêu đề Banner</th>
                            <th className="px-5 py-3.5 w-40">Placement</th>
                            <th className="px-5 py-3.5 w-32 text-right">Lượt Views</th>
                            <th className="px-5 py-3.5 w-32 text-right">Lượt Clicks</th>
                            <th className="px-5 py-3.5 w-32 text-right">Tỷ lệ CTR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCEBFF]">
                          {marketingData.banners.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3 font-bold text-[#0B1F3A] truncate max-w-[300px]">{b.title || "Banner mặc định"}</td>
                              <td className="px-5 py-3 font-mono text-slate-400 text-[10px]">{b.placement}</td>
                              <td className="px-5 py-3 text-right font-black text-slate-700">{b.views.toLocaleString()}</td>
                              <td className="px-5 py-3 text-right font-black text-slate-700">{b.clicks.toLocaleString()}</td>
                              <td className="px-5 py-3 text-right font-black text-[#0057E7]">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  b.ctr >= 10 ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-blue-50 text-blue-600 border border-blue-200"
                                }`}>
                                  {b.ctr}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AdminCard>

                  {/* Vouchers Campaigns */}
                  <AdminCard title="Hiệu suất các chương trình Voucher" subtitle="Theo dõi mức độ sử dụng mã giảm giá">
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-[#DCEBFF] bg-white">
                      <table className="min-w-full divide-y divide-[#DCEBFF] text-left text-xs font-semibold text-slate-600">
                        <thead className="bg-slate-50 text-[#0B1F3A] font-black uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-5 py-3.5">Mã Voucher</th>
                            <th className="px-5 py-3.5">Chương trình</th>
                            <th className="px-5 py-3.5 w-32">Loại giảm</th>
                            <th className="px-5 py-3.5 w-32 text-right">Mức giảm</th>
                            <th className="px-5 py-3.5 w-36 text-right">Lượt đã dùng</th>
                            <th className="px-5 py-3.5 w-36 text-right">Giới hạn</th>
                            <th className="px-5 py-3.5 w-32 text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCEBFF]">
                          {marketingData.vouchers.map((v) => (
                            <tr key={v.code} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3 font-mono font-black text-slate-900">{v.code}</td>
                              <td className="px-5 py-3 font-bold text-[#0B1F3A] truncate max-w-[250px]">{v.name}</td>
                              <td className="px-5 py-3 font-medium text-slate-500 capitalize">{v.discount_type}</td>
                              <td className="px-5 py-3 text-right font-black text-slate-700">
                                {v.discount_type === "percent" ? `${v.discount_value}%` : formatVnd(v.discount_value)}
                              </td>
                              <td className="px-5 py-3 text-right font-black text-slate-700">{v.used_count}</td>
                              <td className="px-5 py-3 text-right font-semibold text-slate-400">
                                {v.usage_limit ? v.usage_limit.toLocaleString() : "Vô hạn"}
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  v.is_active === 1
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                    : "bg-red-50 text-red-600 border border-red-200"
                                }`}>
                                  {v.is_active === 1 ? "Hoạt động" : "Tắt"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AdminCard>
                </div>
              )}
            </>
          )}
        </main>

        <footer className="h-14 bg-white border-t border-[#DCEBFF] px-4 sm:px-6 flex items-center justify-between text-[11px] sm:text-[12px] text-slate-400 font-semibold shrink-0">
          <span>© 2026 3F Store Admin. Tất cả quyền được bảo lưu.</span>
          <span>Phiên bản 1.0.0</span>
        </footer>
      </div>
    </div>
  );
}
