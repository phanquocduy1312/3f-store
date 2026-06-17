import { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ShopeeRequestsSection } from "@/components/admin/shopee/ShopeeRequestsSection";

export default function ShopeeRequestsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 1024;
    return false;
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("today");

  return (
    <div className="min-h-screen bg-[#F6FAFF]">
      <AdminSidebar activeMenu="Yêu cầu Shopee" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={`min-h-screen overflow-x-hidden ${sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
        <AdminHeader
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <main className="space-y-5 px-4 py-4 sm:px-6 sm:py-6">
          <ShopeeRequestsSection
            searchValue={searchValue}
            selectedDate={selectedDate}
            hideTitle={false}
            hideStats={false}
          />
        </main>

        <footer className="flex h-14 items-center justify-between border-t border-[#DCEBFF] bg-white px-4 text-[12px] font-semibold text-slate-400 sm:px-6">
          <span>© 2026 3F Store Admin. Tất cả quyền được bảo lưu.</span>
          <span>Phiên bản 1.0.0</span>
        </footer>
      </div>
    </div>
  );
}
