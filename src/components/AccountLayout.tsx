import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { buildImageUrl } from "@/src/config/api";
import { 
  User, MapPin, ClipboardList, Award, Ticket, ShieldAlert, Heart, LogOut, CheckCircle2, UserCircle, Sparkles 
} from "lucide-react";
import { toast } from "sonner";

export function AccountLayout() {
  const { customer, logout } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Đăng xuất thành công!");
    navigate("/", { replace: true });
  };

  const menuItems = [
    { path: "/account", label: "Tổng quan", icon: UserCircle },
    { path: "/account/profile", label: "Hồ sơ cá nhân", icon: User },
    { path: "/account/addresses", label: "Sổ địa chỉ", icon: MapPin },
    { path: "/account/orders", label: "Đơn hàng của tôi", icon: ClipboardList },
    { path: "/account/club", label: "3F Club Loyalty", icon: Award },
    { path: "/account/vouchers", label: "Voucher của tôi", icon: Ticket },
    { path: "/account/security", label: "Bảo mật tài khoản", icon: ShieldAlert },
    { path: "/account/pets", label: "Tư vấn AI", icon: Sparkles },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-[#F5F9FD] pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          
          {/* Left Sidebar / Mobile Header Card */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Greeting Card */}
            <div className="rounded-3xl border border-[#E0EBF7] bg-white p-5 shadow-sm text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-forest/10 bg-forest/5 flex items-center justify-center">
                  {customer?.avatarUrl ? (
                    <img src={buildImageUrl(customer.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-black text-forest">{customer?.fullName?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400">Xin chào,</p>
                  <h3 className="text-base font-black text-ink line-clamp-1">{customer?.fullName}</h3>
                  {customer?.phone ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-bold text-forest">
                      <CheckCircle2 size={10} /> 3F Club Member
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 border border-red-100">
                      Chưa liên kết SĐT
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Sidebar (Desktop) */}
            <nav className="hidden lg:block rounded-3xl border border-[#E0EBF7] bg-white p-4 shadow-sm space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path !== "/account" && currentPath.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-forest text-white shadow-soft"
                        : "text-gray-600 hover:bg-[#F5F9FD] hover:text-forest"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </nav>

            {/* Mobile Navigation Horizontal Scroll */}
            <div className="lg:hidden flex overflow-x-auto gap-2 py-2 no-scrollbar">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path !== "/account" && currentPath.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-forest text-white"
                        : "bg-white border border-[#E0EBF7] text-gray-600"
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 whitespace-nowrap rounded-2xl bg-white border border-[#E0EBF7] px-4 py-2.5 text-xs font-bold text-red-600"
              >
                <LogOut size={14} />
                Đăng xuất
              </button>
            </div>

          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
}
export default AccountLayout;
