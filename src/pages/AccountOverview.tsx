import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfileApi, type ProfileData } from "@/src/api/customerProfileApi";
import { listOrdersApi, type OrderData } from "@/src/api/customerOrdersApi";
import { getClubSummaryApi, type ClubSummary } from "@/src/api/customerClubApi";
import { buildImageUrl } from "@/src/config/api";
import { 
  Award, Ticket, ClipboardList, PlusCircle, ArrowRight, PhoneCall, Gift, MapPin, Heart, ShoppingBag, Eye 
} from "lucide-react";
import { toast } from "sonner";

export function AccountOverview() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [club, setClub] = useState<ClubSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, ordRes, clubRes] = await Promise.all([
          getProfileApi(),
          listOrdersApi(),
          getClubSummaryApi()
        ]);
        if (profRes.success && profRes.data) setProfile(profRes.data);
        if (ordRes.success && ordRes.data) setOrders(ordRes.data.slice(0, 3));
        if (clubRes.success && clubRes.data) setClub(clubRes.data);
      } catch (err) {
        toast.error("Không thể tải thông tin tổng quan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 rounded-3xl bg-white border border-[#E0EBF7]" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><div className="h-24 rounded-2xl bg-white border border-[#E0EBF7]" /></div>
      </div>
    );
  }

  const hasPhone = !!profile?.phone;

  return (
    <div className="space-y-6">
      
      {/* Phone Warning Card */}
      {!hasPhone && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-black text-red-700 flex items-center justify-center sm:justify-start gap-1.5">
              <PhoneCall size={16} /> Chưa liên kết số điện thoại
            </h4>
            <p className="text-xs font-semibold text-red-600">
              Liên kết số điện thoại để tích điểm, đổi voucher và đồng bộ lịch sử đơn hàng 3F Club.
            </p>
          </div>
          <button 
            onClick={() => navigate("/account/profile")}
            className="rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-soft transition hover:bg-red-700 active:scale-95 whitespace-nowrap"
          >
            Liên kết ngay
          </button>
        </div>
      )}

      {/* Greeting Header */}
      <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-forest/10 bg-forest/5 flex items-center justify-center">
            {profile?.avatarUrl ? (
              <img src={buildImageUrl(profile.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-black text-forest">{profile?.fullName.charAt(0)}</span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-black text-ink">Xin chào, {profile?.fullName}!</h2>
            <p className="text-xs font-bold text-gray-400">Chào mừng bạn đến với Account Center của 3F Store.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/account/profile")}
          className="rounded-full border border-forest px-4 py-2 text-xs font-bold text-forest transition hover:bg-forest/5"
        >
          Cập nhật hồ sơ
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Điểm 3F Club", value: club?.pointsBalance ?? 0, icon: Award, color: "text-amber-500 bg-amber-50 border-amber-100" },
          { label: "Hạng thành viên", value: club?.tier?.name || "Silver", icon: Award, color: "text-blue-500 bg-blue-50 border-blue-100" },
          { label: "Đơn đang xử lý", value: profile?.stats.processingOrders ?? 0, icon: ClipboardList, color: "text-forest bg-forest/5 border-forest/10" },
          { label: "Voucher khả dụng", value: profile?.stats.availableVouchers ?? 0, icon: Ticket, color: "text-purple-500 bg-purple-50 border-purple-100" }
        ].map((card, i) => (
          <div key={i} className={`rounded-3xl border p-5 shadow-sm space-y-2 bg-white`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
              <div className={`p-1.5 rounded-xl border ${card.color}`}><card.icon size={16} /></div>
            </div>
            <p className="text-xl font-black text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-ink flex items-center gap-2">
            <ShoppingBag size={16} className="text-forest" /> Đơn hàng gần đây
          </h3>
          <Link to="/account/orders" className="text-xs font-bold text-forest flex items-center gap-0.5 hover:underline">
            Xem tất cả <ArrowRight size={12} />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs font-semibold text-gray-400">Bạn chưa có đơn hàng nào.</p>
            <Link to="/products" className="mt-3 inline-block rounded-full bg-forest px-4 py-2 text-[11px] font-bold text-white">Mua sắm ngay</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-ink">#{order.order_code}</h4>
                  <p className="text-[10px] font-bold text-gray-400">{new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-ink">{order.totalAmount.toLocaleString()}đ</span>
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${
                    order.order_status === "completed" ? "bg-green-50 text-green-700" :
                    order.order_status === "cancelled" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"
                  }`}>
                    {order.order_status}
                  </span>
                  <Link to={`/account/orders/${order.order_code}`} className="rounded-xl border border-gray-100 p-2 text-gray-400 hover:text-forest">
                    <Eye size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Tích điểm Shopee", path: "/account/club", icon: Gift },
          { label: "Đổi quà 3F Club", path: "/3f-club/rewards", icon: Award },
          { label: "Thêm địa chỉ mới", path: "/account/addresses", icon: MapPin },
          { label: "Thêm thú cưng", path: "/account/pets", icon: Heart }
        ].map((act, i) => (
          <button 
            key={i} 
            onClick={() => navigate(act.path)}
            className="rounded-3xl border border-[#E0EBF7] bg-white p-4 text-center shadow-soft hover:bg-forest/5 group transition-all"
          >
            <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-forest/5 text-forest group-hover:bg-forest group-hover:text-white transition-all">
              <act.icon size={18} />
            </div>
            <p className="text-[11px] font-bold text-gray-700 group-hover:text-forest transition-colors">{act.label}</p>
          </button>
        ))}
      </div>

    </div>
  );
}
export default AccountOverview;
