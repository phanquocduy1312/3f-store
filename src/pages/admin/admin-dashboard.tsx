import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { AdminTaskQueue } from "@/components/admin/admin-task-queue";
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart";
import { AdminSourceDonutChart } from "@/components/admin/admin-source-donut-chart";
import { AdminTopProducts } from "@/components/admin/admin-top-products";
import { AdminPetNeedsStats } from "@/components/admin/admin-pet-needs-stats";
import { AdminAiLeadList } from "@/components/admin/admin-ai-lead-list";
import { AdminShopeeRequestList } from "@/components/admin/admin-shopee-request-list";

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

  const kpis: KpiData[] = [
    {
      title: "Doanh thu hôm nay",
      value: "28.450.000đ",
      change: "+18.6%",
      trend: "up",
      icon: "wallet",
      formula: "Tổng giá trị đơn hàng website trong ngày, chỉ tính đơn paid / processing / completed, không tính đơn cancelled."
    },
    {
      title: "Đơn hàng hôm nay",
      value: "156",
      change: "+14.3%",
      trend: "up",
      icon: "cart",
      formula: "Số đơn hàng website được tạo trong ngày, không tính đơn đã hủy."
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: "2.35%",
      change: "+0.35%",
      trend: "up",
      icon: "trending-up",
      formula: "Số đơn hàng chia cho số lượt truy cập website trong cùng khoảng thời gian."
    },
    {
      title: "Giá trị đơn trung bình",
      value: "182.371đ",
      change: "+6.8%",
      trend: "up",
      icon: "receipt",
      formula: "Doanh thu chia cho số đơn hàng trong cùng khoảng thời gian."
    },
    {
      title: "Lead tư vấn mới",
      value: "72",
      change: "+21.4%",
      trend: "up",
      icon: "bot",
      formula: "Số khách để lại thông tin qua AI Pet Advisor trong ngày."
    },
    {
      title: "Shopee chờ duyệt",
      value: "18",
      change: "-5",
      trend: "down",
      icon: "shopee",
      formula: "Số yêu cầu quy đổi điểm Shopee có trạng thái pending."
    },
    {
      title: "Khách hàng mới",
      value: "61",
      change: "+12.2%",
      trend: "up",
      icon: "users",
      formula: "Số khách hàng có SĐT mới được tạo trong CRM trong ngày."
    },
    {
      title: "Điểm 3F Club đã cộng",
      value: "6.240",
      change: "+22.1%",
      trend: "up",
      icon: "gift",
      formula: "Tổng điểm earn đã được duyệt và cộng vào tài khoản 3F Club trong ngày."
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
                Tổng quan vận hành 3F Store hôm nay
              </p>
            </div>
          </div>

          {/* Row 1: KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            {kpis.map((kpi, idx) => (
              <AdminKpiCard 
                key={idx}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                trend={kpi.trend}
                iconName={kpi.icon}
                formula={kpi.formula}
              />
            ))}
          </section>

          {/* Row 2: Cần xử lý hôm nay + Doanh thu 7 ngày qua */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 shrink-0">
            <div className="lg:col-span-4 h-full">
              <AdminTaskQueue />
            </div>
            <div className="lg:col-span-8 h-full">
              <AdminRevenueChart />
            </div>
          </section>

          {/* Row 3: Nguồn đơn hàng + Lead tư vấn + Shopee */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
            <div className="h-full">
              <AdminSourceDonutChart />
            </div>
            <div className="h-full">
              <AdminAiLeadList searchValue={searchValue} />
            </div>
            <div className="h-full">
              <AdminShopeeRequestList searchValue={searchValue} />
            </div>
          </section>

          {/* Row 4: Sản phẩm + Nhu cầu thú cưng */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0">
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
