import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Calendar, ChevronDown, ShoppingBag, Gift, MessageSquareText } from "lucide-react";
import { adminNotificationsApi, AdminNotification } from "@/src/api/adminNotificationsApi";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  selectedDate?: string;
  onDateChange?: (val: string) => void;
  showDateFilter?: boolean;
}

function formatTimeAgo(dateStr: string) {
  try {
    const cleanDateStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const date = new Date(cleanDateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hôm qua";
    return `${diffDays} ngày trước`;
  } catch (e) {
    return dateStr;
  }
}

export function AdminHeader({
  onToggleSidebar,
  searchValue = "",
  onSearchChange = () => {},
  selectedDate = "today",
  onDateChange = () => {},
  showDateFilter = false
}: AdminHeaderProps) {
  const navigate = useNavigate();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_user") || "{}");
    } catch {
      return {};
    }
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      try {
        setAdminUser(JSON.parse(localStorage.getItem("admin_user") || "{}"));
      } catch (e) {
        setAdminUser({});
      }
    };
    window.addEventListener("admin_user_updated", handleUpdate);
    return () => window.removeEventListener("admin_user_updated", handleUpdate);
  }, []);

  const fetchNotificationsData = async () => {
    try {
      const count = await adminNotificationsApi.getUnreadCount();
      setUnreadCount(count);
      const list = await adminNotificationsApi.getNotifications(10);
      setNotifications(list);
    } catch (e) {
      console.error("Failed to fetch admin notifications:", e);
    }
  };

  React.useEffect(() => {
    fetchNotificationsData();
    const interval = setInterval(fetchNotificationsData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await adminNotificationsApi.markAsRead();
      fetchNotificationsData();
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const handleNotificationClick = async (notif: AdminNotification) => {
    try {
      if (notif.is_read === 0) {
        await adminNotificationsApi.markAsRead(notif.id);
      }
      setShowNotifications(false);
      fetchNotificationsData();

      if (notif.type === "order_created") {
        navigate("/admin/orders");
      } else if (notif.type === "shopee_request") {
        navigate("/admin/3f-club");
      } else if (notif.type === "review_created") {
        navigate("/admin/reviews");
      }
    } catch (e) {
      console.error("Failed to handle notification click:", e);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_created":
        return (
          <div className="h-8 w-8 rounded-full bg-[#EEF6FF] flex items-center justify-center shrink-0">
            <ShoppingBag size={16} className="text-[#0057E7]" />
          </div>
        );
      case "shopee_request":
        return (
          <div className="h-8 w-8 rounded-full bg-[#FFF2F3] flex items-center justify-center shrink-0">
            <Gift size={16} className="text-[#EF3340]" />
          </div>
        );
      case "review_created":
        return (
          <div className="h-8 w-8 rounded-full bg-[#E8F8F5] flex items-center justify-center shrink-0">
            <MessageSquareText size={16} className="text-[#1ABC9C]" />
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Bell size={16} className="text-slate-500" />
          </div>
        );
    }
  };
  
  const getTodayLabel = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `Hôm nay: ${dd}/${mm}/${yyyy}`;
  };

  const dates = [
    { label: getTodayLabel(), value: "today" },
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
              <span className="text-[13px] text-[#0B1F3A] font-semibold">{currentLabel}</span>
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
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-11 w-11 rounded-2xl border border-[#DCEBFF] bg-white shadow-sm relative flex items-center justify-center transition-colors text-[#062B5F] hover:bg-[#F6FAFF] shrink-0"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#EF3340] text-white rounded-full text-[10px] font-black w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#DCEBFF] rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                {/* Dropdown Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#DCEBFF] bg-slate-50/50">
                  <span className="text-[14px] font-bold text-[#0B1F3A]">Thông báo</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[12px] font-bold text-[#0057E7] hover:underline"
                    >
                      Đánh dấu tất cả là đã đọc
                    </button>
                  )}
                </div>

                {/* Dropdown Items List */}
                <div className="max-h-[360px] overflow-y-auto no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <Bell size={32} className="text-slate-300 mb-2" />
                      <span className="text-[13px] font-semibold text-slate-400">Không có thông báo mới</span>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full flex gap-3 items-start text-left px-4 py-3 border-b border-[#F1F5F9]/60 last:border-b-0 transition-colors ${
                          notif.is_read === 0 
                            ? "bg-[#F6FAFF] hover:bg-[#EEF5FF]" 
                            : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        {getNotificationIcon(notif.type)}
                        <div className="flex-1 min-w-0">
                          <h6 className="text-[13px] font-bold text-[#0B1F3A] leading-tight truncate">
                            {notif.title}
                          </h6>
                          <p className="text-[11.5px] text-[#64748B] mt-1 leading-snug break-words">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
                            {formatTimeAgo(notif.created_at)}
                          </span>
                        </div>
                        {notif.is_read === 0 && (
                          <div className="h-2 w-2 rounded-full bg-[#0057E7] shrink-0 mt-1.5" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical Divider - Hidden on extra small mobile */}
        <div className="hidden h-8 w-[1px] bg-[#DCEBFF] min-[1800px]:block" />

        {/* User Profile */}
        <div className="relative group flex items-center gap-2 sm:gap-3 cursor-pointer">
          <div className="hidden text-right min-[1800px]:block">
            <h5 className="text-[14px] font-bold text-[#0B1F3A] leading-tight">
              {adminUser?.name || "Admin 3F"}
            </h5>
            <p className="text-[12px] text-[#64748B]">Quản trị viên</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#0057E7] text-white font-black flex items-center justify-center shadow-md shrink-0">
            {adminUser?.name?.charAt(0).toUpperCase() || "AD"}
          </div>

          {/* Logout Dropdown on Hover */}
          <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-xl border border-[#DCEBFF] bg-white p-2 shadow-xl group-hover:block">
            <button
              onClick={() => navigate("/admin/profile")}
              className="w-full rounded-lg px-4 py-2 text-left text-sm font-semibold text-[#0B1F3A] transition-colors hover:bg-slate-50"
            >
              Hồ sơ cá nhân
            </button>
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
