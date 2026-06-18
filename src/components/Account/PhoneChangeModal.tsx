import { useState } from "react";
import { X, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { requestPhoneChangeApi, verifyPhoneChangeApi } from "@/src/api/customerProfileApi";
import { toast } from "sonner";

interface PhoneChangeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PhoneChangeModal({ onClose, onSuccess }: PhoneChangeModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsLoading(true);
    try {
      const res = await requestPhoneChangeApi(phone);
      if (res.success) {
        toast.success(res.message || "Đã gửi mã OTP!");
        if (res.devOtp) setDevOtp(res.devOtp); // Dev bypass indicator
        setStep(2);
      } else {
        toast.error(res.message || "Không thể gửi OTP.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    try {
      const res = await verifyPhoneChangeApi(phone, otp);
      if (res.success) {
        toast.success("Cập nhật số điện thoại thành công!");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Mã OTP không chính xác.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-ink">
          <X size={18} />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-base font-black text-ink">
            {step === 1 ? "Liên kết số điện thoại" : "Xác thực mã OTP"}
          </h3>
          <p className="text-xs text-gray-400 font-semibold">
            {step === 1 
              ? "Nhập số điện thoại để nhận mã xác minh 3F Club" 
              : `Mã OTP đã được gửi đến số điện thoại ${phone}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Số điện thoại mới</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !phone}
              className="w-full rounded-full bg-forest py-3 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isLoading ? "Đang gửi..." : "Gửi mã xác minh"} <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Mã xác thực OTP (6 chữ số)</label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="xxxxxx"
                  maxLength={6}
                  className="w-full rounded-2xl border border-[#E0EBF7] pl-10 pr-4 py-3 text-xs text-center font-bold tracking-[0.5em] outline-none focus:border-forest"
                  required
                  disabled={isLoading}
                />
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
              {devOtp && (
                <p className="mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded-xl text-center">
                  Mã OTP thử nghiệm: <span className="underline">{devOtp}</span>
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full rounded-full bg-forest py-3 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isLoading ? "Đang xác thực..." : "Xác minh & Liên kết"} <ShieldCheck size={14} />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
export default PhoneChangeModal;
