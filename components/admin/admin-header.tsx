import React, { useState } from "react";
import { Menu, Search, Bell, Calendar, ChevronDown } from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  selectedDate?: string;
  onDateChange?: (val: string) => void;
  showDateFilter?: boolean;
}

export function AdminHeader({
  onToggleSidebar,
  searchValue = "",
  onSearchChange = () => {},
  selectedDate = "today",
  onDateChange = () => {},
  showDateFilter = false
}: AdminHeaderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const dates = [
    { label: "Hôm nay: 12/06/2026", value: "today" },
    { label: "Tuần này", value: "this_week" },
    { label: "Tháng này", value: "this_month" },
    { label: "Năm nay", value: "this_year" },
    { label: "Tất cả thời gian", value: "all_time" }
  ];

  const currentLabel = dates.find(d => d.value === selectedDate)?.label || dates[0].label;

  return (
    <header className="sticky top-0 z-30 h-[72px] bg-white/95 backdrop-blur-xl border-b border-[#DCEBFF] px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Left Area: Toggle & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl min-w-0">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-[#062B5F] hover:bg-[#F6FAFF] rounded-xl transition-colors duration-150 shrink-0"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar - Responsive width */}
        <div className="flex-1 max-w-[520px] h-11 rounded-2xl bg-[#F8FBFF] border border-[#DCEBFF] flex items-center px-3 sm:px-4 gap-2 sm:gap-3 focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-[#0057E7] transition-all duration-200 min-w-0">
          <Search size={18} className="text-[#64748B] shrink-0" />
          <input 
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full bg-transparent text-[13px] sm:text-[13.5px] text-[#0B1F3A] placeholder-[#64748B] outline-none"
          />
        </div>
      </div>

      {/* Right Area: Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 shrink-0">
        {/* Date Filter Dropdown */}
        {showDateFilter && (
          <div className="relative">
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 sm:gap-2 border border-[#DCEBFF] bg-white px-2.5 sm:px-4 h-11 text-[#0B1F3A] font-semibold rounded-2xl shadow-sm hover:bg-[#F6FAFF] transition-colors duration-150"
            >
              <Calendar size={16} className="text-[#0057E7] shrink-0" />
              <span className="hidden text-[13px] min-[1800px]:inline">{currentLabel}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 text-[#64748B] shrink-0 ${showDatePicker ? "rotate-180" : ""}`} />
            </button>
            
            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DCEBFF] rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => {
                        onDateChange(date.value);
                        setShowDatePicker(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                        selectedDate === date.value 
                          ? "bg-[#F6FAFF] text-[#0057E7]" 
                          : "text-[#0B1F3A] hover:bg-slate-50"
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Notifications - 44px (h-11) */}
        <button className="h-11 w-11 rounded-2xl border border-[#DCEBFF] bg-white shadow-sm relative flex items-center justify-center transition-colors text-[#062B5F] hover:bg-[#F6FAFF] shrink-0">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 bg-[#EF3340] text-white rounded-full text-[10px] font-black w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
            12
          </span>
        </button>

        {/* Vertical Divider - Hidden on extra small mobile */}
        <div className="hidden h-8 w-[1px] bg-[#DCEBFF] min-[1800px]:block" />

        {/* User Profile */}
        <div className="relative group flex items-center gap-2 sm:gap-3 cursor-pointer">
          <div className="hidden text-right min-[1800px]:block">
            <h5 className="text-[14px] font-bold text-[#0B1F3A] leading-tight">
              {JSON.parse(localStorage.getItem("admin_user") || "{}")?.name || "Admin 3F"}
            </h5>
            <p className="text-[12px] text-[#64748B]">Quản trị viên</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#0057E7] text-white font-black flex items-center justify-center shadow-md shrink-0">
            {JSON.parse(localStorage.getItem("admin_user") || "{}")?.name?.charAt(0).toUpperCase() || "AD"}
          </div>

          {/* Logout Dropdown on Hover */}
          <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-xl border border-[#DCEBFF] bg-white p-2 shadow-xl group-hover:block">
            <button
              onClick={() => {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_user");
                window.location.href = "/admin/login";
              }}
              className="w-full rounded-lg px-4 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
