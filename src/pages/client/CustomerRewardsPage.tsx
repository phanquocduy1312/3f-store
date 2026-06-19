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

const typeLabels = {
  earn_shopee_order: "Cộng điểm Shopee",
  earn_web_order: "Cộng điểm đơn web",
  spend_reward: "Đổi quà",
  refund_reward: "Hoàn điểm",
  adjust_manual: "Điều chỉnh thủ công"
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
    lifetimePoints: number;
    memberTier: string;
  } | null>(null);
  
  // History State
  const [transactions, setTransactions] = useState<CustomerPointTransaction[]>([]);
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);

  // Rewards list state
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [isRedeemingId, setIsRedeemingId] = useState<number | null>(null);
  const [isGuestShopeeModalOpen, setIsGuestShopeeModalOpen] = useState(false);

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

  const fetchCustomerData = async () => {
    if (!activePhone) return;
    setIsQueryingPoints(true);
    try {
      const pointsRes = await getCustomerPoints(activePhone);
      setPointsData({
        availablePoints: pointsRes.availablePoints,
        lifetimePoints: pointsRes.lifetimePoints,
        memberTier: pointsRes.memberTier
      });
      const transRes = await getClientLoyaltyTransactions(activePhone);
      setTransactions(transRes.data || []);
      const redRes = await getAdminLoyaltyRedemptions({ phone: activePhone });
      setRedemptions(redRes.data || []);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsQueryingPoints(false);
    }
  };

  useEffect(() => {
    if (customer && customer.phone) {
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
    if (!window.confirm(`Xác nhận đổi ${reward.pointsRequired} điểm lấy "${reward.name}"?`)) {
      return;
    }

    setIsRedeemingId(reward.id);
    try {
      const res = await redeemLoyaltyReward({
        phone: activePhone,
        customerName: "", // Optional
        rewardId: reward.id
      });
      toast.success(res.message || "Đổi quà thành công! Đang chờ duyệt.");
      await fetchCustomerData();
      await loadActiveRewards(); // Refresh stocks
    } catch (err: any) {
      toast.error(err.message || "Đổi quà thất bại.");
    } finally {
      setIsRedeemingId(null);
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
            <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-6 shadow-[0_8px_24px_rgba(6,43,95,0.04)] space-y-4">
              <h2 className="text-[16px] font-black text-[#0B1F3A] flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-[#0057E7]" /> Điểm 3F Club của bạn
              </h2>
              
              {isQueryingPoints ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0057E7]" />
                </div>
              ) : pointsData ? (
                <div className="pt-4 border-t border-[#EEF6FF] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-semibold text-[#64748B]">Hạng thành viên:</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                      {pointsData.memberTier}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-center">
                      <span className="text-[11px] font-bold text-[#64748B] block">Điểm khả dụng</span>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[20px] font-black text-[#0057E7]">
                        <Coins className="h-5 w-5" />
                        <span>{pointsData.availablePoints}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                      <span className="text-[11px] font-bold text-[#64748B] block">Điểm trọn đời</span>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[20px] font-black text-[#0B1F3A]">
                        <Coins className="h-5 w-5 text-slate-400" />
                        <span>{pointsData.lifetimePoints}</span>
                      </div>
                    </div>
                  </div>
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
                              <div className="text-slate-400 mt-0.5">{trans.note}</div>
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
    </div>
  );
}
