import { useState, useEffect } from "react";
import { X, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { API_BASE_URL } from "@/src/config/api";

interface ShopeeRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ShopeeRequestModal({ onClose, onSuccess }: ShopeeRequestModalProps) {
  const { customer } = useCustomerAuth();
  
  // Step 1: Input details (Phone, Order Code, Order Amount, Note)
  // Step 2: Input OTP & Submit request
  const [step, setStep] = useState(1);
  
  const [phone, setPhone] = useState(customer?.phone || "");
  const [otp, setOtp] = useState("");
  const [shopeeOrderCode, setShopeeOrderCode] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [note, setNote] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const triggerOtpSend = async (phoneToUse: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneToUse, purpose: "shopee_point_request" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Không gửi được mã xác nhận");
      }
      
      toast.success("Mã OTP đã được gửi đến số điện thoại của bạn.");
      if (data.devOtp) {
        toast.info(`[DEV] Mã OTP là: ${data.devOtp}`);
      }
      setCooldown(60);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi gửi OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.warning("Vui lòng nhập số điện thoại.");
      return;
    }
    if (!shopeeOrderCode || !orderAmount) {
      toast.warning("Vui lòng nhập đầy đủ mã đơn hàng và số tiền.");
      return;
    }

    const amountNum = parseFloat(orderAmount.replace(/[^0-9]/g, ""));
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.warning("Số tiền đơn hàng không hợp lệ.");
      return;
    }

    await triggerOtpSend(phone);
  };

  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.warning("Vui lòng nhập mã OTP.");
      return;
    }
    setIsLoading(true);
    try {
      // 1. Verify OTP
      const resVerify = await fetch(`${API_BASE_URL}/api/customer/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "shopee_point_request", code: otp }),
      });
      const dataVerify = await resVerify.json();
      if (!resVerify.ok || !dataVerify.success) {
        throw new Error(dataVerify?.message || "Mã OTP không đúng.");
      }
      
      const verificationToken = dataVerify.data?.verificationToken;
      if (!verificationToken) {
        throw new Error("Không lấy được token xác thực.");
      }

      // 2. Submit Request
      const amountNum = parseFloat(orderAmount.replace(/[^0-9]/g, ""));
      const { createShopeePointRequest } = await import("@/src/services/shopeePointApi");
      const resSubmit = await createShopeePointRequest({
        shopeeOrderCode,
        orderAmount: amountNum,
        phone,
        verificationToken,
        note
      } as any);

      if (resSubmit.success) {
        toast.success("Gửi yêu cầu tích điểm thành công! 3F sẽ phê duyệt sớm nhất.");
        onSuccess();
        onClose();
      } else {
        toast.error(resSubmit.message || "Không thể gửi yêu cầu.");
      }
    } catch (err: any) {
      toast.error(err.message || "Xác thực mã OTP thất bại.");
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
            {step === 1 ? "Tích điểm 3F Club bằng cách nhập thông tin hóa đơn đơn hàng Shopee của bạn." : 
             "Nhập mã OTP được gửi đến số điện thoại của bạn."}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
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
              <button type="submit" disabled={isLoading} className="rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-forest/90 flex items-center gap-1.5">{isLoading ? "Đang xử lý..." : "Tiếp tục"}</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAndSubmit} className="space-y-4">
            <div className="text-xs text-gray-600 font-semibold text-center leading-relaxed">
              Mã xác thực gồm 6 chữ số đã được gửi đến số điện thoại <span className="font-bold text-ink">{phone}</span>.
            </div>
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
            
            <div className="flex justify-between items-center text-xs text-gray-500 font-semibold py-1">
              {cooldown > 0 ? (
                <span>Gửi lại mã sau {cooldown}s</span>
              ) : (
                <button 
                  type="button" 
                  onClick={() => triggerOtpSend(phone)} 
                  disabled={isLoading}
                  className="text-forest hover:underline focus:outline-none"
                >
                  Gửi lại mã
                </button>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-forest/90 flex items-center gap-1.5"
              >
                {isLoading ? "Đang xử lý..." : "Xác thực & Gửi"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default ShopeeRequestModal;
