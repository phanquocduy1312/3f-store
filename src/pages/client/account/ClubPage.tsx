import { useEffect, useState } from "react";
import { Award, Coins, Loader2, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProfileApi, type ProfileData } from "@/src/api/customerProfileApi";
import { getClubSummaryApi, type ClubSummary } from "@/src/api/customerClubApi";

const getTierGradient = (tierName: string) => {
  const name = tierName.toLowerCase();
  if (name.includes("diamond")) {
    return "from-[#0f172a] via-[#1e293b] to-[#0369a1] text-white border-sky-500/20";
  }
  if (name.includes("gold")) {
    return "from-[#78350f] via-[#b45309] to-[#d97706] text-white border-amber-500/20";
  }
  if (name.includes("silver")) {
    return "from-[#334155] via-[#475569] to-[#64748b] text-white border-slate-400/20";
  }
  return "from-[#0B1F3A] to-[#1d4ed8] text-white border-blue-500/20";
};

export function ClubPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [clubSummary, setClubSummary] = useState<ClubSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingClub, setLoadingClub] = useState(false);
  const [clubError, setClubError] = useState<string | null>(null);

  const fetchClubData = async () => {
    setLoading(true);
    setClubError(null);
    try {
      const profileRes = await getProfileApi();
      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
        
        // Fetch club summary
        setLoadingClub(true);
        const clubRes = await getClubSummaryApi();
        if (clubRes.success && clubRes.data) {
          setClubSummary(clubRes.data);
        } else {
          setClubError("Chưa tải được thông tin 3F Club. Vui lòng thử lại sau.");
        }
      } else {
        setClubError("Chưa tải được thông tin 3F Club. Vui lòng thử lại sau.");
      }
    } catch (e) {
      console.error(e);
      setClubError("Chưa tải được thông tin 3F Club. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setLoadingClub(false);
    }
  };

  useEffect(() => {
    fetchClubData();
  }, []);

  const isLocked = !profile?.phoneVerifiedAt || !clubSummary || clubSummary.locked;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0057E7]">3F Club</p>
        <h2 className="mt-1 text-2xl font-black text-[#0B1F3A]">Thành viên 3F Club</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Xem hạng thành viên, tích lũy điểm thưởng và các đặc quyền ưu đãi dành riêng cho bạn.
        </p>
      </div>

      {loading || loadingClub ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
        </div>
      ) : clubError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center text-sm font-bold text-red-600">
          {clubError}
        </div>
      ) : isLocked ? (
        <section className="rounded-2xl border border-dashed border-[#DCEBFF] bg-gradient-to-br from-slate-50 to-[#F1F5F9] p-8 text-center max-w-2xl mx-auto space-y-6 shadow-sm hover:border-slate-300 transition-all duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-inner">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800">Mở khóa 3F Club</h3>
            <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
              Xác thực số điện thoại để xem hạng thành viên, điểm thưởng và quyền lợi của bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate("/account/profile?verify=phone");
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white py-3 px-6 text-sm font-bold transition shadow-md hover:shadow-lg"
          >
            <span>Xác thực số điện thoại ngay</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      ) : clubSummary ? (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left/Main content: active tier card */}
          <div className="lg:col-span-7 space-y-6">
            <section 
              className={`rounded-3xl border p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br ${getTierGradient(clubSummary.tier.name)}`}
              style={{ borderColor: clubSummary.tier.color || undefined }}
            >
              {/* Decorative background glow */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              
              <div className="mb-6 flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6" style={{ color: clubSummary.tier.color || "#ECC56C" }} />
                  <h3 className="text-lg font-black tracking-tight">Thẻ thành viên 3F Club</h3>
                </div>
                <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                  {clubSummary.tier.name}
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70 block">Điểm khả dụng</span>
                    <div className="mt-1.5 flex items-center gap-1.5 text-3xl font-black text-white group cursor-default">
                      <Coins className="h-8 w-8 text-amber-300 transition-transform group-hover:rotate-12 duration-300" />
                      <span>{clubSummary.pointsBalance.toLocaleString("vi-VN")} Điểm</span>
                    </div>
                  </div>
                  {clubSummary.holdingPoints !== undefined && clubSummary.holdingPoints > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 block">Điểm tạm giữ</span>
                      <span className="text-sm font-black text-amber-300 mt-1 block">
                        {clubSummary.holdingPoints.toLocaleString("vi-VN")} Điểm
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-bold text-white/90">
                  <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/5 space-y-1">
                    <span className="text-[10px] font-semibold text-white/60 block uppercase">Hệ số tích lũy điểm</span>
                    <span className="text-base font-black block">{clubSummary.tier.multiplier}x Point</span>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/5 space-y-1">
                    <span className="text-[10px] font-semibold text-white/60 block uppercase">Hạn mức thanh toán tối đa</span>
                    <span className="text-base font-black block">{clubSummary.tier.capPercent ?? 10}% giá trị đơn</span>
                  </div>
                </div>

                {/* Progress bar to next tier */}
                {clubSummary.nextTier ? (
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <span>Yêu cầu thăng hạng kế tiếp:</span>
                      <span className="text-amber-300 font-extrabold">{clubSummary.nextTier.name}</span>
                    </div>

                    {/* Spend progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-white/80">
                        <span>Chi tiêu 12 tháng:</span>
                        <span>{(clubSummary.nextTier.currentSpend ?? 0).toLocaleString("vi-VN")}đ / {(clubSummary.nextTier.minSpend ?? 0).toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, ((clubSummary.nextTier.currentSpend ?? 0) / (clubSummary.nextTier.minSpend ?? 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Orders progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-white/80">
                        <span>Đơn hoàn tất:</span>
                        <span>{clubSummary.nextTier.currentOrders ?? 0} / {clubSummary.nextTier.minOrders ?? 0} đơn</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, ((clubSummary.nextTier.currentOrders ?? 0) / (clubSummary.nextTier.minOrders ?? 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-white/10 pt-4 text-center text-sm font-black text-amber-300">
                    Bạn đang ở hạng cao nhất.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right sidebar inside tab: explanation & links */}
          <div className="lg:col-span-5 space-y-6">
            <section className="rounded-2xl border border-[#DCEBFF] bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="h-5 w-5 text-[#0057E7]" />
                <h3 className="font-black text-[#0B1F3A]">Quyền lợi 3F Club</h3>
              </div>
              <ul className="text-xs font-semibold text-slate-500 space-y-2.5 list-disc pl-4">
                <li>Tích lũy điểm trên mọi đơn hàng (bao gồm đơn Web và đơn Shopee).</li>
                <li>Hệ số nhân điểm tăng dần khi thăng hạng (Silver: 1.1x, Gold: 1.2x, Diamond: 1.5x).</li>
                <li>Dùng điểm khả dụng để đổi lấy các phần quà, coupon và mã vận chuyển độc quyền.</li>
                <li>Quà tặng sinh nhật đặc biệt cho các hạng thành viên Gold & Diamond.</li>
              </ul>
              <button
                type="button"
                onClick={() => navigate("/3f-club/rewards")}
                className="w-full flex items-center justify-center gap-1 rounded-xl border border-[#0057E7] text-[#0057E7] hover:bg-[#EEF6FF] py-2.5 px-4 text-xs font-bold transition"
              >
                Đổi quà tích điểm ngay
              </button>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
export default ClubPage;
