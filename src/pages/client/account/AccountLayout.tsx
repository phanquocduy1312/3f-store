import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Heart,
  LogOut,
  MapPin,
  Shield,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import { removeCustomerToken } from "@/src/api/customerAuthApi";
import { getProfileApi, type ProfileData } from "@/src/api/customerProfileApi";
import { toast } from "sonner";
import { buildImageUrl } from "@/src/config/api";

const navItems = [
  { name: "Hồ sơ cá nhân", path: "/account/profile", icon: User },
  { name: "Đơn hàng của tôi", path: "/account/orders", icon: ShoppingBag },
  { name: "Sổ địa chỉ", path: "/account/addresses", icon: MapPin },
  { name: "Tư vấn AI", path: "/account/pets", icon: Sparkles },
  { name: "Bảo mật", path: "/account/security", icon: Shield },
];

export function AccountLayout() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    getProfileApi()
      .then((res) => {
        if (res.success && res.data) setProfile(res.data);
      })
      .catch(() => {
        setProfile(null);
      });
  }, []);

  const handleLogout = () => {
    removeCustomerToken();
    toast.success("Đăng xuất thành công");
    navigate("/login");
  };

  const avatarUrl = profile?.avatarUrl
    ? buildImageUrl(profile.avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "3F")}&background=0B1F3A&color=fff`;

  return (
    <div className="min-h-screen bg-[#F6FAFF] py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 rounded-2xl border border-[#DCEBFF] bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={avatarUrl}
                alt={profile?.fullName || "Avatar"}
                className="h-16 w-16 shrink-0 rounded-2xl border-4 border-[#EEF6FF] object-cover"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-black text-[#0B1F3A]">
                    {profile?.fullName || "Tài khoản 3F"}
                  </h1>
                  {profile?.phoneVerifiedAt && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Đã xác minh
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {profile?.phone || profile?.email || "Quản lý tài khoản, đơn hàng và ưu đãi 3F"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center md:w-[360px]">
              <div className="rounded-xl bg-[#F6FAFF] px-3 py-2">
                <div className="text-base font-black text-[#0B1F3A]">{profile?.stats.totalOrders ?? 0}</div>
                <div className="text-[11px] font-bold text-slate-400">Đơn hàng</div>
              </div>
              <div className="rounded-xl bg-[#F6FAFF] px-3 py-2">
                <div className="text-base font-black text-[#0B1F3A]">{profile?.stats.availableVouchers ?? 0}</div>
                <div className="text-[11px] font-bold text-slate-400">Voucher</div>
              </div>
              <div className="rounded-xl bg-[#F6FAFF] px-3 py-2">
                <div className="text-base font-black text-[#0B1F3A]">{profile?.stats.profileCompletion ?? 0}%</div>
                <div className="text-[11px] font-bold text-slate-400">Hồ sơ</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-72 lg:shrink-0">
            <div className="rounded-2xl border border-[#DCEBFF] bg-white p-3 shadow-sm lg:sticky lg:top-24">
              <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-sm font-bold transition ${
                          isActive
                            ? "bg-[#0B1F3A] text-white shadow-[0_10px_24px_rgba(11,31,58,0.18)]"
                            : "text-slate-600 hover:bg-[#F6FAFF] hover:text-[#0B1F3A]"
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span className="whitespace-nowrap">{item.name}</span>
                    </NavLink>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 lg:w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="whitespace-nowrap">Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="rounded-2xl border border-[#DCEBFF] bg-white p-4 shadow-sm md:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <Sparkles className="h-3.5 w-3.5" />
          3F Store đồng bộ hồ sơ để cá nhân hóa đơn hàng, ưu đãi và tư vấn thú cưng.
        </div>
      </div>
    </div>
  );
}
