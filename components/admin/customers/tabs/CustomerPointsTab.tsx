import { useState, useEffect } from "react";
import { adminCustomersApi } from "@/src/api/adminCustomersApi";
import { toast } from "sonner";
import { PlusCircle, Loader2, X } from "lucide-react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export function CustomerPointsTab({ customerId }: { customerId: number }) {
  const [pointsList, setPointsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPoints = () => {
    setLoading(true);
    adminCustomersApi.getPoints(customerId).then(data => {
      setPointsList(data);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPoints();
  }, [customerId]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(adjustPoints, 10);
    if (!pts || pts === 0) {
      toast.error("Vui lòng nhập số điểm hợp lệ");
      return;
    }
    if (!adjustReason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }
    
    setSubmitting(true);
    try {
      await adminCustomersApi.adjustPoints(customerId, pts, adjustReason);
      toast.success("Điều chỉnh điểm thành công");
      setIsModalOpen(false);
      setAdjustPoints("");
      setAdjustReason("");
      fetchPoints();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && pointsList.length === 0) return <div className="animate-pulse space-y-4"><div className="h-10 bg-slate-100 rounded-xl"></div><div className="h-32 bg-slate-100 rounded-xl"></div></div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>;

  const totalPoints = pointsList.reduce((acc, curr) => acc + curr.points, 0);

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'earn_web_order': return "Cộng điểm đơn web";
      case 'earn_shopee_order': return "Cộng điểm đơn Shopee";
      case 'redeem_reward': return "Đổi quà";
      case 'manual_adjustment': return "Điều chỉnh thủ công";
      case 'birthday_bonus': return "Quà sinh nhật";
      case 'expired': return "Điểm hết hạn";
      default: return type;
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-black text-[#0B1F3A]">Điểm thưởng 3F Club</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg">
            Tổng điểm: {formatCurrency(totalPoints).replace('đ', '')}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#0B1F3A] text-white font-bold rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            <PlusCircle size={16} /> Điều chỉnh
          </button>
        </div>
      </div>

      {pointsList.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Chưa có giao dịch điểm.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-semibold rounded-l-xl">Ngày</th>
                <th className="px-4 py-3 font-semibold">Loại giao dịch</th>
                <th className="px-4 py-3 font-semibold">Mô tả</th>
                <th className="px-4 py-3 font-semibold">Ref</th>
                <th className="px-4 py-3 font-semibold rounded-r-xl">Số điểm</th>
              </tr>
            </thead>
            <tbody>
              {pointsList.map(p => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-4 text-slate-600">{new Date(p.created_at).toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-4 font-semibold">{getTransactionTypeLabel(p.type)}</td>
                  <td className="px-4 py-4 text-slate-600 truncate max-w-[200px]">{p.note}</td>
                  <td className="px-4 py-4 text-slate-500">{p.reference_id || "-"}</td>
                  <td className={`px-4 py-4 font-bold ${p.points > 0 ? "text-green-600" : "text-red-600"}`}>
                    {p.points > 0 ? "+" : ""}{p.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Điều chỉnh điểm thưởng</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điểm (+/-)</label>
                <input 
                  type="number" 
                  value={adjustPoints}
                  onChange={e => setAdjustPoints(e.target.value)}
                  placeholder="Ví dụ: 100 hoặc -50"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0B1F3A] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do điều chỉnh</label>
                <textarea 
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="Nhập lý do điều chỉnh..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0B1F3A] outline-none resize-none"
                  rows={3}
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || !adjustPoints || !adjustReason.trim()}
                  className="flex items-center gap-2 bg-[#0B1F3A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
