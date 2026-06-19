import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { AdminTaskQueue } from "@/components/admin/admin-task-queue";
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart";
import { AdminTopProducts } from "@/components/admin/admin-top-products";
import { AdminPetNeedsStats } from "@/components/admin/admin-pet-needs-stats";
import { AdminShopeeRequestList } from "@/components/admin/admin-shopee-request-list";
import { adminDashboardApi, DashboardStatsResponse } from "../../api/adminDashboardApi";

interface KpiData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  formula?: string;
}

export function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return true;
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("today");
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    // Initialize
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    adminDashboardApi.getStats(selectedDate)
      .then(res => {
        if (!isMounted) return;
        setStats(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard stats", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const getPeriodSuffix = () => {
    switch (selectedDate) {
      case "this_week": return "tuần này";
      case "this_month": return "tháng này";
      case "this_year": return "năm nay";
      case "all_time": return "tất cả thời gian";
      case "today":
      default:
        return "hôm nay";
    }
  };

  const getComparisonLabel = () => {
    switch (selectedDate) {
      case "this_week": return "so với tuần trước";
      case "this_month": return "so với tháng trước";
      case "this_year": return "so với năm trước";
      case "all_time": return "";
      case "today":
      default:
        return "so với hôm qua";
    }
  };

  const kpis: KpiData[] = [
    {
      title: `Doanh thu ${getPeriodSuffix()}`,
      value: stats?.revenue.value ?? "0đ",
      change: stats?.revenue.change ?? "0%",
      trend: stats?.revenue.trend ?? "up",
      icon: "wallet",
      formula: "Tổng doanh thu bán hàng thực tế trong kỳ sau khi đã trừ giảm giá."
    },
    {
      title: `Số đơn ${getPeriodSuffix()}`,
      value: stats?.orders.value ?? "0",
      change: stats?.orders.change ?? "0%",
      trend: stats?.orders.trend ?? "up",
      icon: "cart",
      formula: "Số đơn hàng website được tạo trong kỳ."
    },
    {
      title: "Đơn chờ xác nhận",
      value: stats?.pending.value ?? "0",
      change: stats?.pending.change ?? "0",
      trend: stats?.pending.trend ?? "up",
      icon: "clock",
      formula: "Số đơn hàng mới đang chờ duyệt thanh toán hoặc xác nhận thông tin."
    },
    {
      title: "Đơn đang giao",
      value: stats?.shipping.value ?? "0",
      change: stats?.shipping.change ?? "0%",
      trend: stats?.shipping.trend ?? "up",
      icon: "truck",
      formula: "Số đơn hàng đang được đối tác vận chuyển giao tới khách hàng."
    },
    {
      title: `Khách hàng mới ${getPeriodSuffix()}`,
      value: stats?.newCustomers.value ?? "0",
      change: stats?.newCustomers.change ?? "0%",
      trend: stats?.newCustomers.trend ?? "up",
      icon: "users",
      formula: "Số tài khoản khách hàng mới đăng ký trong kỳ."
    },
    {
      title: `Điểm 3F Club đã cộng ${getPeriodSuffix()}`,
      value: stats?.points.value ?? "0",
      change: stats?.points.change ?? "0%",
      trend: stats?.points.trend ?? "up",
      icon: "gift",
      formula: "Tổng điểm earn đã được duyệt và cộng vào tài khoản 3F Club trong kỳ."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      {/* Sidebar navigation: Fixed left-0 top-0 */}
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

      {/* Main Content Wrapper: Shifted left margin to accommodate fixed sidebar */}
      <div className={`min-h-screen flex flex-col overflow-x-hidden transition-all duration-300 ${
        sidebarCollapsed
          ? "w-full lg:pl-20"
          : "w-full lg:pl-[220px]"
      }`}>
        <AdminHeader 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          showDateFilter={true}
        />

        {/* Dashboard Grid Content */}
        <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-6">
          {/* Row 0: Page heading */}
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-[24px] sm:text-[26px] font-black text-[#0B1F3A]">Dashboard</h1>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#64748B]">
                Tổng quan vận hành 3F Store {getPeriodSuffix()}
              </p>
            </div>
          </div>

          {/* Row 1: KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 shrink-0">
            {kpis.map((kpi, idx) => (
              <AdminKpiCard 
                key={idx}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                trend={kpi.trend}
                iconName={kpi.icon}
                formula={kpi.formula}
                comparisonLabel={getComparisonLabel()}
              />
            ))}
          </section>

          {/* Row 2: Cần xử lý hôm nay + Doanh thu 7 ngày qua */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 shrink-0">
            <div className="lg:col-span-4 h-full">
              <AdminTaskQueue />
            </div>
            <div className="lg:col-span-8 h-full">
              <AdminRevenueChart filter={selectedDate} />
            </div>
          </section>

          {/* Row 3: Shopee + Sản phẩm + Nhu cầu thú cưng */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
            <div className="h-full">
              <AdminShopeeRequestList searchValue={searchValue} />
            </div>
            <div className="h-full">
              <AdminTopProducts />
            </div>
            <div className="h-full">
              <AdminPetNeedsStats />
            </div>
          </section>
        </main>

        {/* Dashboard Footer */}
        <footer className="h-14 bg-white border-t border-[#DCEBFF] px-4 sm:px-6 flex items-center justify-between text-[11px] sm:text-[12px] text-slate-400 font-semibold shrink-0">
          <span>© 2026 3F Store Admin. Tất cả quyền được bảo lưu.</span>
          <span>Phiên bản 1.0.0</span>
        </footer>
      </div>
    </div>
  );
}
