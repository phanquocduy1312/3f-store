import React, { useEffect, useState } from "react";
import { 
  Award,
  Clock,
  Coins,
  Gift,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { getClientLoyaltyRewards, redeemLoyaltyReward, type LoyaltyReward } from "@/src/services/loyaltyRewardsApi";
import { getClientLoyaltyTransactions, type CustomerPointTransaction } from "@/src/services/loyaltyTransactionsApi";
import { getAdminLoyaltyRedemptions, type LoyaltyRedemption } from "@/src/services/loyaltyRedemptionsApi";
import { getCustomerPoints } from "@/src/services/shopeePointApi";
import { ToastContainer, useToast } from "@/components/ui/toast-notification";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { useNavigate } from "react-router-dom";
import { ShopeeRequestModal } from "@/src/components/Account/ShopeeRequestModal";
import { API_BASE_URL } from "@/src/config/api";

const typeLabels: Record<string, string> = {
  earn_shopee_order: "Cộng điểm Shopee",
  earn_web_order: "Cộng điểm đơn web",
  spend_reward: "Đổi quà",
  refund_reward: "Hoàn điểm",
  adjust_manual: "Điều chỉnh thủ công",
  earn: "Cộng điểm đơn hàng",
  hold: "Tạm giữ điểm",
  release: "Giải phóng điểm",
  redeem: "Đổi quà tặng",
  expire: "Điểm hết hạn",
  cancel: "Hủy điểm",
  reverse: "Thu hồi điểm",
  adjust: "Điều chỉnh điểm"
};

const redemptionStatusLabels = {
  pending: "Chờ xử lý",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
  fulfilled: "Đã bàn giao",
  cancelled: "Đã hủy"
};

const rewardTypeLabels = {
  voucher: "Voucher giảm giá",
  physical_gift: "Quà tặng vật lý",
  free_shipping: "Miễn phí vận chuyển",
  discount_code: "Mã giảm giá",
  manual_reward: "Khác"
};

export default function CustomerRewardsPage() {
  const { customer, isLoading: isAuthLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const activePhone = customer?.phone || "";
  
  // User Data State
  const [isQueryingPoints, setIsQueryingPoints] = useState(false);
  const [pointsData, setPointsData] = useState<{
    availablePoints: number;
    holdingPoints: number;
    usedPoints: number;
    expiredPoints: number;
    phoneVerified: boolean;
    phone: string;
    otpRequired: boolean;
    tier: {
      name: string;
      multiplier: number;
      color: string;
      benefits: string;
      capPercent: number;
    };
    nextTier: {
      name: string;
      minSpend: number;
      minOrders: number;
      currentSpend: number;
      currentOrders: number;
    } | null;
    totalEarned: number;
    totalSpent: number;
  } | null>(null);
  
  // History State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);

  // Rewards list state
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [isRedeemingId, setIsRedeemingId] = useState<number | null>(null);
  const [isGuestShopeeModalOpen, setIsGuestShopeeModalOpen] = useState(false);

  // OTP Modal State for Redemption
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpReward, setOtpReward] = useState<LoyaltyReward | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);

  const { toasts, toast, removeToast } = useToast();

  const loadActiveRewards = async () => {
    setIsLoadingRewards(true);
    try {
      const res = await getClientLoyaltyRewards();
      setRewards(res.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể tải danh sách quà tặng.");
    } finally {
      setIsLoadingRewards(false);
    }
  };

  useEffect(() => {
    loadActiveRewards();
  }, []);

  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleSendOtpForRedeem = async (phone: string) => {
    setIsSendingOtp(true);
    setOtpError("");
    setOtpSuccessMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "redeem_reward" }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSuccessMessage(data.message || "Đã gửi mã OTP thành công.");
        setOtpCooldown(60);
        if (data.devOtp) {
          toast.warning(`[DEV OTP]: ${data.devOtp}`);
        } else {
          toast.success("Mã OTP đã được gửi đến số điện thoại của bạn.");
        }
      } else {
        setOtpError(data.message || "Không thể gửi OTP. Vui lòng thử lại.");
        toast.error(data.message || "Không thể gửi OTP.");
      }
    } catch (err: any) {
      setOtpError("Lỗi kết nối khi gửi OTP.");
      toast.error("Lỗi kết nối khi gửi OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const fetchCustomerData = async () => {
    setIsQueryingPoints(true);
    try {
      const token = localStorage.getItem("customer_token");
      const summaryRes = await fetch(`${API_BASE_URL}/api/customer/club/summary`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      const summaryData = await summaryRes.json();
      if (summaryData.success && summaryData.data) {
        const d = summaryData.data;
        setPointsData({
          availablePoints: d.pointsBalance,
          holdingPoints: d.holdingPoints,
          usedPoints: d.usedPoints,
          expiredPoints: d.expiredPoints,
          phoneVerified: d.phoneVerified,
          phone: d.phone,
          otpRequired: d.otpRequired,
          tier: d.tier,
          nextTier: d.nextTier,
          totalEarned: d.totalEarned,
          totalSpent: d.totalSpent
        });
      }

      const transRes = await fetch(`${API_BASE_URL}/api/customer/club/transactions`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      const transData = await transRes.json();
      if (transData.success) {
        setTransactions(transData.data || []);
      }

      const redRes = await getAdminLoyaltyRedemptions({ phone: activePhone });
      setRedemptions(redRes.data || []);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsQueryingPoints(false);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchCustomerData();
    }
  }, [customer]);

  const handleRedeem = async (reward: LoyaltyReward) => {
    if (!activePhone || !pointsData) {
      return toast.warning("Vui lòng tra cứu số điện thoại trước khi đổi quà.");
    }
    if (pointsData.availablePoints < reward.pointsRequired) {
      return toast.error("Bạn không đủ số điểm yêu cầu.");
    }
    if (reward.stockQuantity !== null && reward.stockQuantity <= 0) {
      return toast.error("Quà tặng đã hết hàng.");
    }

    if (pointsData.otpRequired) {
      // Open OTP Modal and trigger the initial OTP send
      setOtpReward(reward);
      setOtpValue("");
      setOtpError("");
      setOtpSuccessMessage("");
      setShowOtpModal(true);
      handleSendOtpForRedeem(activePhone);
      return;
    }

    if (!window.confirm(`Xác nhận đổi ${reward.pointsRequired} điểm lấy "${reward.name}"?`)) {
      return;
    }

    setIsRedeemingId(reward.id);
    try {
      const res = await redeemLoyaltyReward({
        phone: activePhone,
        customerName: customer?.fullName || "",
        rewardId: reward.id,
      });
      toast.success(res.message || "Đổi quà thành công! Đang chờ duyệt.");
      await fetchCustomerData();
      await loadActiveRewards();
    } catch (err: any) {
      toast.error(err.message || "Đổi quà thất bại.");
    } finally {
      setIsRedeemingId(null);
    }
  };

  const handleVerifyAndRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setOtpError("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }
    if (!otpReward) return;

    setOtpVerifyLoading(true);
    setOtpError("");
    try {
      // 1. Verify OTP to get verificationToken
      const verifyRes = await fetch(`${API_BASE_URL}/api/customer/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: activePhone, purpose: "redeem_reward", code: otpValue }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setOtpError(verifyData.message || "Mã OTP không chính xác hoặc đã hết hạn.");
        toast.error(verifyData.message || "Xác thực OTP thất bại.");
        setOtpVerifyLoading(false);
        return;
      }

      const token = verifyData.data?.verificationToken;
      if (!token) {
        setOtpError("Không nhận được token xác thực.");
        setOtpVerifyLoading(false);
        return;
      }

      // 2. Perform the redemption with verificationToken
      const redeemRes = await redeemLoyaltyReward({
        phone: activePhone,
        customerName: customer?.fullName || "",
        rewardId: otpReward.id,
        verificationToken: token,
      });

      toast.success(redeemRes.message || "Đổi quà thành công! Đang chờ duyệt.");
      setShowOtpModal(false);
      setOtpReward(null);
      setOtpValue("");
      await fetchCustomerData();
      await loadActiveRewards();
    } catch (err: any) {
      setOtpError(err.message || "Đổi quà thất bại.");
      toast.error(err.message || "Đổi quà thất bại.");
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold uppercase tracking-wider">
            <Award className="h-4 w-4" /> 3F Club Loyalty
          </span>
          <h1 className="text-4xl font-black text-[#0B1F3A] tracking-tight">Đổi Quà Tích Điểm</h1>
          <p className="text-[#64748B] text-sm max-w-xl mx-auto">
            Tích lũy điểm từ đơn hàng Shopee và đổi lấy những phần quà, voucher ưu đãi hấp dẫn từ 3F Store.
          </p>
        </div>

        {isAuthLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
          </div>
        ) : !customer ? (
          <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-12 text-center shadow-[0_8px_24px_rgba(6,43,95,0.04)] space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0057E7]"><ShieldAlert size={24} /></div>
            <div>
              <h3 className="text-sm font-black text-ink">Vui lòng đăng nhập</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Bạn cần đăng nhập để tham gia 3F Club và đổi quà.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button 
                onClick={() => navigate('/login?redirect=/3f-club/rewards')}
                className="rounded-full bg-[#0057E7] px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-[#003B7A] w-full sm:w-auto"
              >
                Đăng nhập ngay
              </button>
              <button 
                onClick={() => setIsGuestShopeeModalOpen(true)}
                className="rounded-full bg-white border border-[#0057E7] px-6 py-2.5 text-xs font-bold text-[#0057E7] hover:bg-blue-50 w-full sm:w-auto"
              >
                Chỉ gửi yêu cầu Shopee
              </button>
            </div>
          </div>
        ) : !customer.phone ? (
          <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-12 text-center shadow-[0_8px_24px_rgba(6,43,95,0.04)] space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600"><ShieldAlert size={24} /></div>
            <div>
              <h3 className="text-sm font-black text-ink">Chưa liên kết số điện thoại</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Liên kết số điện thoại trong hồ sơ để tích lũy và sử dụng điểm thưởng.</p>
            </div>
            <button 
              onClick={() => navigate('/account/profile')}
              className="mt-4 rounded-full bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-amber-700"
            >
              Cập nhật hồ sơ
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Query Points & History */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tra cứu điểm */}
            <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-6 shadow-[0_8px_24px_rgba(6,43,95,0.04)] space-y-5">
              <h2 className="text-[16px] font-black text-[#0B1F3A] flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-[#0057E7]" /> Điểm 3F Club của bạn
              </h2>
              
              {isQueryingPoints ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0057E7]" />
                </div>
              ) : pointsData ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#EEF6FF] pb-3">
                    <span className="text-[13px] font-semibold text-[#64748B]">Hạng thành viên:</span>
                    <span 
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-black border"
                      style={{ 
                        backgroundColor: pointsData.tier.color + '15', 
                        borderColor: pointsData.tier.color + '40', 
                        color: pointsData.tier.color 
                      }}
                    >
                      {pointsData.tier.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 text-center">
                      <span className="text-[11px] font-bold text-[#64748B] block">Khả dụng</span>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[20px] font-black text-[#0057E7]">
                        <Coins className="h-5 w-5" />
                        <span>{pointsData.availablePoints.toLocaleString("vi-VN")}</span>
                      </div>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 text-center">
                      <span className="text-[11px] font-bold text-[#64748B] block">Tạm giữ</span>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[20px] font-black text-amber-600">
                        <Coins className="h-5 w-5 text-amber-400" />
                        <span>{pointsData.holdingPoints.toLocaleString("vi-VN")}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                      <span className="text-[11px] font-bold text-[#64748B] block">Đã dùng</span>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-black text-slate-700">
                        <span>{pointsData.usedPoints.toLocaleString("vi-VN")}</span>
                      </div>
                    </div>
                    <div className="bg-red-50/30 border border-red-100/50 rounded-2xl p-3 text-center">
                      <span className="text-[11px] font-bold text-[#64748B] block">Hết hạn</span>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-black text-red-500">
                        <span>{pointsData.expiredPoints.toLocaleString("vi-VN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion display */}
                  <div className="bg-[#F8FBFF] border border-[#DCEBFF] rounded-2xl p-3 text-center text-[12px] font-bold text-[#0057E7] flex flex-col gap-0.5 shadow-sm">
                    <div>1.000 điểm = 20.000đ giá trị voucher</div>
                    <div className="text-[10px] text-[#64748B] font-semibold">Tỷ lệ thanh toán tối đa: {pointsData.tier.capPercent}% giá trị đơn hàng</div>
                  </div>

                  {/* Tier Progress */}
                  {pointsData.nextTier ? (
                    <div className="border-t border-[#EEF6FF] pt-4 space-y-3">
                      <div className="text-[12px] font-bold text-[#0B1F3A]">
                        Tiến trình lên hạng <span className="text-[#0057E7]">{pointsData.nextTier.name}</span>:
                      </div>
                      
                      {/* Spend progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-[#64748B]">
                          <span>Chi tiêu (rolling 12 tháng)</span>
                          <span>{pointsData.nextTier.currentSpend.toLocaleString("vi-VN")}đ / {pointsData.nextTier.minSpend.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (pointsData.nextTier.currentSpend / pointsData.nextTier.minSpend) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Orders progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-[#64748B]">
                          <span>Số đơn hàng (rolling 12 tháng)</span>
                          <span>{pointsData.nextTier.currentOrders} / {pointsData.nextTier.minOrders} đơn</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (pointsData.nextTier.currentOrders / pointsData.nextTier.minOrders) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-[#EEF6FF] pt-3 text-center text-[12px] font-black text-amber-600">
                      🎉 Bạn đã đạt hạng thành viên cao nhất (Diamond)
                    </div>
                  )}

                  {/* Phone Verification Warning Banner if not verified */}
                  {!pointsData.phoneVerified && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                      <div className="text-[13px] font-black text-amber-800 flex items-center gap-1.5">
                        <ShieldAlert className="h-4.5 w-4.5 text-amber-600" /> Xác thực SĐT để sử dụng điểm
                      </div>
                      <p className="text-[12px] text-amber-700 leading-normal font-semibold">
                        Bạn cần xác thực số điện thoại để có thể thực hiện đổi quà, bảo mật số dư điểm thưởng và tham gia các đặc quyền thành viên.
                      </p>
                      <button
                        onClick={() => navigate('/account/profile')}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2 px-4 text-[12px] font-black self-start mt-1 transition shadow-sm"
                      >
                        Xác thực ngay
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">
                  Không tìm thấy dữ liệu điểm của bạn.
                </div>
              )}
            </div>

            {/* Lịch sử tích lũy/đổi quà */}
            {activePhone && (
              <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-6 shadow-[0_8px_24px_rgba(6,43,95,0.04)] space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center border-b border-[#EEF6FF] pb-3">
                  <h2 className="text-[15px] font-black text-[#0B1F3A] flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-[#0057E7]" /> Lịch sử hoạt động
                  </h2>
                  <button onClick={fetchCustomerData} className="text-[#0057E7] hover:rotate-180 transition-all duration-300">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Đổi quà gần đây</h3>
                    {redemptions.length === 0 ? (
                      <p className="text-[12px] text-[#94A3B8]">Chưa đổi món quà nào.</p>
                    ) : (
                      <div className="space-y-2">
                        {redemptions.slice(0, 5).map((red) => (
                          <div key={red.id} className="border border-slate-100 rounded-xl p-2.5 flex items-start justify-between gap-3 text-[12px] hover:bg-slate-50 transition">
                            <div>
                              <div className="font-bold text-[#0B1F3A]">{red.reward_name}</div>
                              <div className="text-slate-400 mt-0.5">{red.created_at?.substring(0, 10)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-red-500">-{red.points_spent}đ</div>
                              <span className="text-[10px] font-bold text-slate-400">{redemptionStatusLabels[red.status] || red.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#EEF6FF]">
                    <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Lịch sử điểm</h3>
                    {transactions.length === 0 ? (
                      <p className="text-[12px] text-[#94A3B8]">Chưa có giao dịch điểm.</p>
                    ) : (
                      <div className="space-y-2">
                        {transactions.slice(0, 5).map((trans) => (
                          <div key={trans.id} className="border border-slate-100 rounded-xl p-2.5 flex items-start justify-between gap-3 text-[12px] hover:bg-slate-50 transition">
                            <div>
                              <div className="font-bold text-[#0B1F3A]">{typeLabels[trans.type] || trans.type}</div>
                              <div className="text-slate-400 mt-0.5">{trans.reason || trans.note || ""}</div>
                            </div>
                            <div className="text-right font-black">
                              <span className={trans.points > 0 ? "text-green-600" : "text-red-500"}>
                                {trans.points > 0 ? `+${trans.points}` : trans.points}đ
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Active Rewards list */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-[20px] font-black text-[#0B1F3A] flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#0057E7]" /> Danh sách quà đổi điểm
            </h2>

            {isLoadingRewards ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
              </div>
            ) : rewards.length === 0 ? (
              <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-8 text-center shadow-[0_8px_24px_rgba(6,43,95,0.04)]">
                <p className="text-[#64748B]">Hiện không có quà tặng nào khả dụng đổi điểm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rewards.map((reward) => {
                  const pointsNeeded = reward.pointsRequired;
                  const isOutOfStock = reward.stockQuantity !== null && reward.stockQuantity <= 0;
                  const canAfford = pointsData ? pointsData.availablePoints >= pointsNeeded : false;
                  
                  return (
                    <div 
                      key={reward.id} 
                      className={`rounded-[24px] border border-[#DCEBFF] bg-white overflow-hidden shadow-[0_8px_24px_rgba(6,43,95,0.04)] hover:shadow-[0_12px_36px_rgba(6,43,95,0.08)] transition-all flex flex-col justify-between ${
                        isOutOfStock ? "opacity-75" : ""
                      }`}
                    >
                      <div>
                        {reward.imageUrl ? (
                          <img src={reward.imageUrl} alt={reward.name} className="w-full h-40 object-cover bg-slate-50" />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-[#EEF6FF] flex items-center justify-center text-[#0057E7]">
                            <Gift className="h-10 w-10 opacity-40" />
                          </div>
                        )}
                        <div className="p-4 space-y-2">
                          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-[#EEF6FF] text-[#0057E7]">
                            {rewardTypeLabels[reward.rewardType] || reward.rewardType}
                          </span>
                          <h3 className="text-[15px] font-black text-[#0B1F3A] leading-tight line-clamp-1">{reward.name}</h3>
                          <p className="text-[12px] text-[#64748B] line-clamp-2 h-8 leading-snug">{reward.description || "Không có mô tả."}</p>
                          
                          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-[#94A3B8]">
                            <span>
                              {reward.stockQuantity !== null ? `Còn lại: ${reward.stockQuantity}` : "Luôn có sẵn"}
                            </span>
                            {reward.limitPerCustomer !== null && (
                              <span>Tối đa: {reward.limitPerCustomer} lần</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-[#EEF6FF] flex items-center justify-between gap-3 bg-[#F8FBFF]/50">
                        <div className="shrink-0">
                          <span className="text-[10px] font-bold text-[#64748B] block leading-none">Yêu cầu</span>
                          <span className="text-[16px] font-black text-[#0057E7]">{reward.pointsRequired}đ</span>
                        </div>

                        {isRedeemingId === reward.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-[#0057E7] mr-4" />
                        ) : (
                          <button
                            onClick={() => handleRedeem(reward)}
                            disabled={isOutOfStock || (activePhone ? !canAfford : false)}
                            className={`px-4 py-2 rounded-xl text-[12px] font-black transition-all ${
                              isOutOfStock
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : activePhone 
                                  ? canAfford
                                    ? "bg-[#0057E7] text-white hover:bg-[#003B7A] shadow-[0_4px_12px_rgba(0,87,231,0.2)]"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-[#0057E7]/10 text-[#0057E7] hover:bg-[#0057E7] hover:text-white"
                            }`}
                          >
                            {isOutOfStock 
                              ? "Hết hàng" 
                              : activePhone 
                                ? canAfford 
                                  ? "Đổi ngay" 
                                  : "Chưa đủ điểm" 
                                : "Đăng nhập để đổi"
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
        )}

      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {isGuestShopeeModalOpen && (
        <ShopeeRequestModal 
          onClose={() => setIsGuestShopeeModalOpen(false)} 
          onSuccess={() => {}} 
        />
      )}

      {showOtpModal && otpReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#DCEBFF] bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-[16px] font-black text-[#0B1F3A]">Xác thực OTP đổi quà</h3>
              <button 
                onClick={() => { setShowOtpModal(false); setOtpReward(null); }}
                className="text-slate-400 hover:text-slate-600 font-bold text-[18px]"
              >
                &times;
              </button>
            </div>

            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
              Bạn đang yêu cầu đổi <span className="text-[#0057E7] font-bold">{otpReward.pointsRequired} điểm</span> lấy quà tặng <span className="text-[#0B1F3A] font-bold">"{otpReward.name}"</span>. 
              Vui lòng nhập mã OTP gửi tới số điện thoại <span className="font-bold text-[#0B1F3A]">{activePhone}</span> để hoàn tất.
            </p>

            <form onSubmit={handleVerifyAndRedeem} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Nhập 6 số OTP"
                  className="h-12 w-full rounded-2xl border border-[#DCEBFF] px-4 text-center text-[20px] font-black tracking-[0.2em] outline-none focus:border-[#0057E7]"
                  required
                />
                
                {otpError && (
                  <p className="text-[11px] font-semibold text-red-500 text-center">{otpError}</p>
                )}
                {otpSuccessMessage && !otpError && (
                  <p className="text-[11px] font-semibold text-green-600 text-center">{otpSuccessMessage}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={otpVerifyLoading || otpValue.length !== 6}
                  className="w-full h-11 bg-[#0057E7] text-white rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {otpVerifyLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Xác nhận & đổi quà"}
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtpForRedeem(activePhone)}
                  disabled={isSendingOtp || otpCooldown > 0}
                  className="w-full h-11 border border-[#DCEBFF] text-[#0057E7] bg-white rounded-2xl font-black text-[13px] flex items-center justify-center hover:bg-blue-50 transition disabled:opacity-60"
                >
                  {isSendingOtp ? "Đang gửi..." : otpCooldown > 0 ? `Gửi lại sau ${otpCooldown}s` : "Gửi lại mã OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
