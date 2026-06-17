import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { getClubSummaryApi, listPointTransactionsApi, listShopeeRequestsApi, type ClubSummary, type PointTransaction, type ShopeeRequestData } from "@/src/api/customerClubApi";
import { ShopeeRequestModal } from "./ShopeeRequestModal";
import { Award, Plus, Calendar, Coins, History, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function ClubTab() {
  const { customer } = useCustomerAuth();
  const [summary, setSummary] = useState<ClubSummary | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [shopeeRequests, setShopeeRequests] = useState<ShopeeRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchClubData = async () => {
    if (!customer?.phone) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [sumRes, txRes, shopRes] = await Promise.all([
        getClubSummaryApi(),
        listPointTransactionsApi(),
        listShopeeRequestsApi()
      ]);
      if (sumRes.success && sumRes.data) setSummary(sumRes.data);
      if (txRes.success && txRes.data) setTransactions(txRes.data);
      if (shopRes.success && shopRes.data) setShopeeRequests(shopRes.data);
    } catch {
      toast.error("Không thể tải thông tin 3F Club.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
  }, [customer]);

  if (!customer?.phone) {
    return (
      <div className="rounded-3xl border border-[#E0EBF7] bg-white p-12 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><ShieldAlert size={24} /></div>
        <div>
          <h3 className="text-sm font-black text-ink">Chưa kích hoạt 3F Club</h3>
          <p className="text-xs text-gray-400 font-semibold mt-1">Liên kết số điện thoại trong mục hồ sơ để bắt đầu tích lũy và sử dụng điểm thưởng.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="h-64 rounded-3xl bg-white border border-[#E0EBF7] animate-pulse" />;

  // Calculate tier progress percentage
  const points = summary?.pointsBalance ?? 0;
  const currentTier = summary?.tier?.name || "Silver";
  let progressPct = 0;
  let pointsNeeded = 0;

  if (currentTier === "Silver") {
    progressPct = Math.min(100, (points / 5000) * 100);
    pointsNeeded = Math.max(0, 5000 - points);
  } else if (currentTier === "Gold") {
    progressPct = Math.min(100, ((points - 5000) / 10000) * 100);
    pointsNeeded = Math.max(0, 15000 - points);
  }

  return (
    <div className="space-y-6">
      
      {/* Overview Card */}
      <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hạng thành viên hiện tại</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Award size={20} style={{ color: summary?.tier.color }} />
              <h2 className="text-xl font-black text-ink" style={{ color: summary?.tier.color }}>
                {summary?.tier.name} ({summary?.tier.multiplier}x Point)
              </h2>
            </div>
          </div>
          {summary?.nextTier ? (
            <div className="space-y-1">
              <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                <div className="bg-forest h-full" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-[10px] font-bold text-gray-400">
                Tích lũy thêm {pointsNeeded} điểm để lên hạng {summary.nextTier.name}
              </p>
            </div>
          ) : (
            <p className="text-[10px] font-bold text-forest uppercase tracking-wider">★ Đã đạt cấp độ thành viên cao nhất</p>
          )}
        </div>
        <div className="text-center md:border-l border-gray-100 p-4 shrink-0 space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Điểm khả dụng</p>
          <p className="text-3xl font-black text-forest flex items-center justify-center gap-1"><Coins size={24} /> {points}</p>
        </div>
      </div>

      {/* Shopee Point Requests */}
      <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-ink flex items-center gap-1.5"><History size={14} className="text-forest" /> Yêu cầu Shopee gần đây</h3>
          <button onClick={() => setShowModal(true)} className="rounded-full bg-forest px-3.5 py-2 text-[10px] font-bold text-white flex items-center gap-0.5"><Plus size={12} /> Tích điểm</button>
        </div>
        {shopeeRequests.length === 0 ? (
          <p className="text-xs font-semibold text-gray-400 text-center py-6">Không có yêu cầu tích điểm nào.</p>
        ) : (
          <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto pr-1">
            {shopeeRequests.map((req) => (
              <div key={req.id} className="py-2.5 flex items-center justify-between text-xs font-semibold text-gray-600">
                <div>
                  <p className="font-bold text-ink">Shopee #{req.shopee_order_code}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{new Date(req.createdAt).toLocaleDateString("vi-VN")} - {req.order_amount.toLocaleString()}đ</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    req.processing_status === "approved" ? "bg-green-50 text-green-700" :
                    req.processing_status === "rejected" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"
                  }`}>{req.processing_status}</span>
                  <p className="text-[10px] font-bold text-forest mt-1">+{req.expected_points} điểm</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions History */}
      <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-ink flex items-center gap-1.5"><History size={14} className="text-forest" /> Lịch sử điểm thưởng</h3>
        {transactions.length === 0 ? (
          <p className="text-xs font-semibold text-gray-400 text-center py-6">Không có giao dịch điểm nào.</p>
        ) : (
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs font-semibold text-gray-600">
                <div className="space-y-0.5">
                  <p className="font-bold text-ink">{tx.note || "Giao dịch điểm thưởng"}</p>
                  <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><Calendar size={10} /> {new Date(tx.created_at).toLocaleString("vi-VN")}</p>
                </div>
                <span className={`font-black text-sm ${tx.points >= 0 ? "text-forest" : "text-red-600"}`}>
                  {tx.points >= 0 ? `+${tx.points}` : tx.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ShopeeRequestModal onClose={() => setShowModal(false)} onSuccess={fetchClubData} />}

    </div>
  );
}
export default ClubTab;
