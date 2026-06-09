import { useState, useEffect } from "react";
import { Copy, Check, QrCode, Sparkles, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/cartHelper";

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
}

export function VietQRModal({ isOpen, onClose, orderId, amount }: VietQRModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success">("pending");
  const [countdown, setCountdown] = useState(10); // 10s simulation

  useEffect(() => {
    if (!isOpen) return;
    setPaymentStatus("pending");
    setCountdown(10);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPaymentStatus("success");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const qrUrl = `https://img.vietqr.io/image/MB-3FSTORE2026-compact.png?amount=${amount}&addInfo=${orderId}&accountName=CUA%20HANG%20THU%20CUNG%203F%20STORE`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl transition-all duration-300">
        
        {/* Header decoration */}
        <div className="bg-[rgb(var(--color-primary))] px-6 py-5 text-center text-white">
          <h3 className="flex items-center justify-center gap-2 text-base font-black">
            <QrCode size={20} /> Thanh toán qua VietQR
          </h3>
          <p className="mt-1 text-xs opacity-90">Quét mã QR dưới đây bằng app Ngân hàng để thanh toán nhanh</p>
        </div>

        {paymentStatus === "pending" ? (
          <div className="p-6">
            {/* QR Frame */}
            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-2xl border border-gray-100 bg-white p-2 shadow-inner">
              <img src={qrUrl} alt="VietQR Code" className="h-full w-full object-contain" />
            </div>

            {/* Simulated Timer */}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600">
              <span className="h-2 w-2 animate-ping rounded-full bg-orange-500"></span>
              Đang xác minh giao dịch (Tự động cập nhật sau {countdown}s)
            </div>

            {/* Bank details list */}
            <div className="mt-5 space-y-3 rounded-xl border border-gray-100 bg-cream/20 p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Ngân hàng</span>
                <span className="font-bold text-ink">MB Bank (Quân Đội)</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Số tài khoản</span>
                <div className="flex items-center gap-1.5 font-bold text-ink">
                  <span>3FSTORE2026</span>
                  <button onClick={() => handleCopy("3FSTORE2026", "acc")} className="text-forest hover:opacity-85">
                    {copiedField === "acc" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tên người nhận</span>
                <span className="font-bold text-ink">Cửa hàng thú cưng 3F Store</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Số tiền</span>
                <div className="flex items-center gap-1.5 font-bold text-forest">
                  <span>{formatPrice(amount)}</span>
                  <button onClick={() => handleCopy(String(amount), "amount")} className="text-forest hover:opacity-85">
                    {copiedField === "amount" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Nội dung chuyển khoản</span>
                <div className="flex items-center gap-1.5 font-bold text-orange-600">
                  <span>{orderId}</span>
                  <button onClick={() => handleCopy(orderId, "desc")} className="text-forest hover:opacity-85">
                    {copiedField === "desc" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-[10px] text-center text-gray-400 italic">Lưu ý: Chuyển khoản đúng số tiền và nội dung để hệ thống tự động xác nhận.</p>
          </div>
        ) : (
          /* Payment Success Screen */
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-75"></div>
              <CheckCircle2 className="relative text-green-600" size={64} strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-black text-ink">Thanh toán thành công!</h4>
            <p className="mt-2 text-xs text-gray-500 max-w-[280px]">Hệ thống đã nhận được khoản thanh toán của bạn cho đơn hàng <strong className="text-forest">{orderId}</strong>.</p>
            
            <div className="mt-6 w-full rounded-2xl bg-cream/[0.15] p-4 border border-forest/10 flex items-center gap-2 justify-center text-xs text-forest font-bold">
              <Sparkles size={16} /> Nhận ngay 150 điểm tích lũy thành viên!
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-forest py-3 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}

        {paymentStatus === "pending" && (
          <div className="border-t border-gray-100 bg-gray-50 p-3 text-center">
            <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-gray-700 transition">
              Đóng và tiếp tục mua hàng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
