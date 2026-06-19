import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckSquare,
  FileText,
  Gift,
  Heart,
  LayoutDashboard,
  Package,
  Layers,
  PhoneCall,
  Settings,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,
  LogOut,
} from "lucide-react";
import { adminLogout } from "@/src/api/productsApi";

interface AdminSidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  collapsed: boolean;
  setCollapsed?: (val: boolean) => void;
}

type MenuItem = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  hasChevron?: boolean;
  path?: string;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Đơn hàng", icon: ShoppingBag, path: "/admin/orders" },
  { name: "Khách hàng", icon: Users, path: "/admin/customers" },
  { name: "Hồ sơ thú cưng", icon: Heart },
  { name: "AI Pet Advisor", icon: Sparkles, badge: "AI" },
  { name: "3F Club", icon: Gift, path: "/admin/3f-club" },
  { name: "Sản phẩm", icon: Package, path: "/admin/products" },
  { name: "Danh mục", icon: Layers, path: "/admin/categories" },
  { name: "Voucher / Campaign", icon: Tag, hasChevron: true },
  { name: "Nội dung / SEO", icon: FileText, hasChevron: true },
  { name: "Báo cáo", icon: BarChart3, hasChevron: true },
  { name: "Hỗ trợ khách hàng", icon: PhoneCall },
  { name: "Cài đặt", icon: Settings, hasChevron: true },
];

export function AdminSidebar({ activeMenu, setActiveMenu, collapsed }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [adminName, setAdminName] = React.useState("Quản trị viên");
  const [adminRole, setAdminRole] = React.useState("admin");

  React.useEffect(() => {
    try {
      const userStr = localStorage.getItem("admin_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminName(user.name || "Quản trị viên");
        setAdminRole(user.role || "admin");
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#DCEBFF] bg-white text-[#082B5F] shadow-[8px_0_30px_rgba(6,43,95,0.06)] transition-all duration-300 ${
        collapsed ? "w-0 -translate-x-full overflow-hidden lg:w-20 lg:translate-x-0" : "w-[220px] translate-x-0"
      }`}
    >
      <div className={`shrink-0 border-b border-[#DCEBFF] bg-white flex items-center justify-center ${collapsed ? "px-2 py-3" : "px-5 py-3"}`}>
        <img
          src="/assets/logo/logo.webp"
          alt="3F Store Admin"
          className={`object-contain transition-all duration-300 ${collapsed ? "h-10 w-10" : "h-16 w-auto max-w-[160px]"}`}
        />
      </div>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isRouteActive = item.path ? location.pathname === item.path : false;
          const isActive = isRouteActive || activeMenu === item.name;
          const isAi = item.name === "AI Pet Advisor";

          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveMenu(item.name);
                if (item.path) {
                  navigate(item.path);
                }
              }}
              className={`group flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-[13px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                isActive
                  ? "bg-[#0057E7] text-white shadow-[0_10px_24px_rgba(0,87,231,0.25)]"
                  : "text-[#082B5F] hover:bg-[#EEF6FF] hover:text-[#0057E7]"
              }`}
            >
              <Icon
                className={`shrink-0 ${collapsed ? "h-[20px] w-[20px]" : "h-[18px] w-[18px]"} ${
                  isActive ? "text-white" : "text-[#64748B] group-hover:text-[#0057E7]"
                }`}
              />

              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-left">{item.name}</span>
                  {item.badge &&
                    (isAi ? (
                      <span className="ml-auto shrink-0 rounded-full border border-[#DCEBFF] bg-[#EEF6FF] px-2 py-0.5 text-[10px] font-black text-[#0057E7]">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="ml-auto shrink-0 rounded-full bg-[#EF3340] px-2 py-0.5 text-[11px] font-black text-white">
                        {item.badge}
                      </span>
                    ))}
                  {item.hasChevron && (
                    <span
                      className={`shrink-0 text-[10px] transition-colors ${
                        isActive ? "text-white/50" : "text-[#64748B]/50 group-hover:text-[#0057E7]/50"
                      }`}
                    >
                      ▼
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Profile & Logout Section */}
      <div className={`shrink-0 border-t border-[#DCEBFF] p-4 bg-white flex ${collapsed ? "flex-col items-center gap-3" : "items-center justify-between"} transition-all duration-300`}>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-[#0B1F3A] truncate">{adminName}</span>
            <span className="text-[10px] text-slate-400 font-bold capitalize">{adminRole}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className={`flex items-center justify-center text-[#64748B] hover:text-[#EF3340] hover:bg-[#FFF2F3] rounded-xl transition-all duration-200 ${collapsed ? "h-10 w-10" : "h-9 w-9 bg-slate-50"}`}
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </aside>
  );
}
