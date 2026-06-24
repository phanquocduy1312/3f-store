import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckSquare,
  FileText,
  Gift,
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,
  LogOut,
  MessageSquareText,
  Shield,
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
  { name: "AI Pet Advisor", icon: Sparkles, badge: "AI", path: "/admin/pet-advisor" },
  { name: "3F Club", icon: Gift, path: "/admin/3f-club" },
  { name: "Sản phẩm", icon: Package, path: "/admin/products" },
  { name: "Đánh giá", icon: MessageSquareText, path: "/admin/reviews" },
  { name: "Danh mục", icon: Layers, path: "/admin/categories" },
  { name: "Quản lý Banner", icon: FileText, path: "/admin/banners" },
  { name: "Quản lý Tin tức", icon: FileText, path: "/admin/news" },
  { name: "Voucher", icon: Tag, path: "/admin/vouchers" },
  { name: "Báo cáo", icon: BarChart3, path: "/admin/analytics" },
  { name: "Cấu hình Workflow", icon: CheckSquare, path: "/admin/settings/workflows" },
  { name: "Nhân sự", icon: Shield, path: "/admin/accounts" },
];

const isPathVisible = (path: string | undefined, role: string, permissions: string[]) => {
  if (!path) return true;
  if (role === "dev" || role === "admin") return true;
  
  const mapping: Record<string, string> = {
    "/admin": "dashboard",
    "/admin/orders": "orders",
    "/admin/customers": "customers",
    "/admin/pet-advisor": "pet_advisor",
    "/admin/3f-club": "club_3f",
    "/admin/products": "products",
    "/admin/reviews": "reviews",
    "/admin/categories": "categories",
    "/admin/banners": "banners",
    "/admin/news": "news",
    "/admin/vouchers": "vouchers",
    "/admin/analytics": "analytics",
    "/admin/settings/workflows": "workflows",
    "/admin/accounts": "accounts"
  };

  const key = mapping[path];
  if (!key) return true;

  return permissions.includes(key);
};

export function AdminSidebar({ activeMenu, setActiveMenu, collapsed }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [adminName, setAdminName] = React.useState("Quản trị viên");
  const [adminRole, setAdminRole] = React.useState("admin");
  const [adminPermissions, setAdminPermissions] = React.useState<string[]>([]);

  React.useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem("admin_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setAdminName(user.name || "Quản trị viên");
          setAdminRole(user.role || "admin");
          setAdminPermissions(user.permissions || []);
        }
      } catch (e) {
        // Ignore
      }
    };

    loadUser();
    window.addEventListener("admin_user_updated", loadUser);
    return () => window.removeEventListener("admin_user_updated", loadUser);
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
          if (!isPathVisible(item.path, adminRole, adminPermissions)) {
            return null;
          }
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
      <div className={`shrink-0 border-t border-[#EEF6FF] p-4 bg-white flex ${collapsed ? "flex-col items-center gap-4" : "items-center gap-3"} transition-all duration-300`}>
        {collapsed ? (
          <div 
            onClick={() => navigate("/admin/profile")}
            className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0057E7] to-[#3B82F6] text-white flex items-center justify-center font-black text-xs cursor-pointer hover:shadow-md hover:scale-105 transition-all shadow-sm relative group shrink-0"
            title="Hồ sơ cá nhân"
          >
            {adminName.charAt(0).toUpperCase()}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
          </div>
        ) : (
          <div 
            onClick={() => navigate("/admin/profile")}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group/profile p-1.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-[#DCEBFF]"
            title="Xem hồ sơ cá nhân"
          >
            {/* Avatar Circle with Status */}
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0057E7] to-[#3B82F6] text-white flex items-center justify-center font-black text-xs shadow-sm group-hover/profile:scale-105 transition-transform">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
            </div>
            
            {/* User Info */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-black text-[#0B1F3A] truncate leading-tight group-hover/profile:text-[#0057E7] transition-colors">{adminName}</span>
              <span className="mt-0.5 self-start px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#EBF3FF] text-[#0057E7] border border-[#DCEBFF] uppercase tracking-wider scale-95 origin-left">
                {adminRole}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className={`flex items-center justify-center text-[#64748B] hover:text-[#EF3340] hover:bg-[#FFF2F3] rounded-xl transition-all duration-200 ${collapsed ? "h-9 w-9 bg-slate-50" : "h-9 w-9 bg-slate-50 shrink-0"}`}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
