import { useState } from "react";
import { X, Send, AlertTriangle } from "lucide-react";
import { createShopeeRequestApi } from "@/src/api/customerClubApi";
import { toast } from "sonner";

interface ShopeeRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ShopeeRequestModal({ onClose, onSuccess }: ShopeeRequestModalProps) {
  const [shopeeOrderCode, setShopeeOrderCode] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopeeOrderCode || !orderAmount) {
      toast.warning("Vui lòng nhập đầy đủ mã đơn hàng và số tiền.");
      return;
    }

    const amountNum = parseFloat(orderAmount.replace(/[^0-9]/g, ""));
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.warning("Số tiền đơn hàng không hợp lệ.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await createShopeeRequestApi({
        shopeeOrderCode,
        orderAmount: amountNum,
        note
      });
      if (res.success) {
        toast.success("Gửi yêu cầu tích điểm thành công! 3F sẽ phê duyệt sớm nhất.");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Không thể gửi yêu cầu.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
        
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-ink"><X size={18} /></button>

        <div className="text-center space-y-1">
          <h3 className="text-base font-black text-ink">Yêu cầu tích điểm Shopee</h3>
          <p className="text-xs text-gray-400 font-semibold">Tích điểm 3F Club bằng cách nhập thông tin hóa đơn đơn hàng Shopee của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Mã đơn hàng Shopee *</label>
            <input 
              type="text" 
              value={shopeeOrderCode} 
              onChange={(e) => setShopeeOrderCode(e.target.value)} 
              placeholder="VD: 241208XXXXXXXX" 
              className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest" 
              required 
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Số tiền đơn hàng *</label>
            <input 
              type="text" 
              value={orderAmount} 
              onChange={(e) => setOrderAmount(e.target.value)} 
              placeholder="VD: 150.000" 
              className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest" 
              required 
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Ghi chú (Tùy chọn)</label>
            <textarea 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              placeholder="Nhập ghi chú gửi Admin nếu có..." 
              rows={2}
              className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest resize-none" 
            />
          </div>

          <div className="rounded-xl bg-amber-50 p-3 border border-amber-100 flex gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
              Điểm sẽ được cộng sau khi Admin phê duyệt hóa đơn. Vui lòng nhập thông tin chính xác để tránh bị từ chối duyệt.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={isLoading} className="rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-forest/90 flex items-center gap-1.5"><Send size={12} /> {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}</button>
          </div>
        </form>

      </div>
    </div>
  );
}
export default ShopeeRequestModal;
