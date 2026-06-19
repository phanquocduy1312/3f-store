import { useState } from "react";
import { X, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { requestGuestOtpApi, verifyGuestOtpApi } from "@/src/services/shopeePointApi";

interface ShopeeRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ShopeeRequestModal({ onClose, onSuccess }: ShopeeRequestModalProps) {
  const { customer } = useCustomerAuth();
  
  // Step 1: Input Phone (for guests)
  // Step 2: Input OTP (for guests)
  // Step 3: Input Order Details (for logged-in & guests)
  const [step, setStep] = useState(customer ? 3 : 1);
  
  // Guest Fields
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const [shopeeOrderCode, setShopeeOrderCode] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.warning("Vui lòng nhập số điện thoại.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await requestGuestOtpApi(phone);
      if (res.success) {
        toast.success("Mã OTP đã được gửi đến số điện thoại của bạn.");
        // Dev helper
        if (res.devOtp) {
          console.log("DEV OTP:", res.devOtp);
          toast.info(`[DEV] Mã OTP là: ${res.devOtp}`);
        }
        setStep(2);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi gửi OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.warning("Vui lòng nhập mã OTP.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await verifyGuestOtpApi(phone, otp);
      if (res.success && res.data) {
        setVerificationToken(res.data.verificationToken);
        toast.success("Xác thực thành công!");
        setStep(3);
      }
    } catch (err: any) {
      toast.error(err.message || "Mã OTP không đúng.");
    } finally {
      setIsLoading(false);
    }
  };

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
      // We will use createShopeePointRequest from shopeePointApi since it supports the new payload
      const { createShopeePointRequest } = await import("@/src/services/shopeePointApi");
      const res = await createShopeePointRequest({
        shopeeOrderCode,
        orderAmount: amountNum,
        phone: customer ? undefined : phone,
        verificationToken: customer ? undefined : verificationToken,
        note
      } as any); // Type cast due to "note" not strictly defined but accepted

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
          <p className="text-xs text-gray-400 font-semibold">
            {step === 1 ? "Nhập số điện thoại của bạn để nhận mã OTP." : 
             step === 2 ? "Nhập mã OTP được gửi đến số điện thoại của bạn." : 
             "Tích điểm 3F Club bằng cách nhập thông tin hóa đơn đơn hàng Shopee của bạn."}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Số điện thoại *</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="VD: 0987654321" 
                className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest" 
                required 
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50">Hủy</button>
              <button type="submit" disabled={isLoading} className="rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-forest/90 flex items-center gap-1.5">{isLoading ? "Đang gửi..." : "Tiếp tục"}</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Mã OTP *</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Nhập 6 số OTP" 
                className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest text-center tracking-widest font-mono text-lg" 
                maxLength={6}
                required 
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50">Quay lại</button>
              <button type="submit" disabled={isLoading} className="rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-forest/90 flex items-center gap-1.5">{isLoading ? "Đang xác thực..." : "Xác thực"}</button>
            </div>
          </form>
        )}

        {step === 3 && (
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
        )}

      </div>
    </div>
  );
}
export default ShopeeRequestModal;
