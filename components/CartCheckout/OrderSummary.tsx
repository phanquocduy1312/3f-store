import { useEffect, useState } from "react";
import { Ticket, Percent, ArrowRight, CreditCard, Banknote, Landmark, Tag } from "lucide-react";
import { formatPrice } from "@/lib/cartHelper";
import { getCartVoucherSuggestions, type PublicVoucher } from "@/src/api/vouchersApi";

interface OrderSummaryProps {
  subtotal: number;
  appliedVoucher: { code: string; discountAmount: number; description?: string } | null;
  onApplyVoucher: (code: string) => Promise<{ success: boolean; message?: string }>;
  onRemoveVoucher: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  shippingFee?: number;
}

export function OrderSummary({
  subtotal,
  appliedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  onSubmit,
  isSubmitting,
  paymentMethod,
  setPaymentMethod,
  shippingFee = 0
}: OrderSummaryProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<PublicVoucher[]>([]);

  useEffect(() => {
    let alive = true;
    getCartVoucherSuggestions()
      .then((res) => {
        if (alive) setSuggestions(res.data || []);
      })
      .catch(() => {
        if (alive) setSuggestions([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleApply = async (code = couponInput) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setIsValidating(true);
    setCouponError("");
    const res = await onApplyVoucher(trimmed);
    setIsValidating(false);
    if (res.success) {
      setCouponInput("");
    } else {
      setCouponError(res.message || "Mã giảm giá không hợp lệ.");
    }
  };

  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  return (
    <div className="space-y-6">
      {/* Discount Coupon Box */}
      <div className="rounded-2xl border border-forest/10 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-sm sm:text-[15px] font-black text-forest">
          <Ticket size={16} className="sm:w-[18px] sm:h-[18px]" /> Mã giảm giá
        </h3>

        {appliedVoucher ? (
          /* Applied Voucher Card */
          <div className="flex items-center justify-between gap-3 rounded-xl border border-forest bg-forest/5 p-3 sm:p-3.5 transition">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-black text-forest">
                <Percent size={12} />
                Mã: {appliedVoucher.code}
              </div>
              <div className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">
                {appliedVoucher.description || `Giảm ${formatPrice(appliedVoucher.discountAmount)}`}
              </div>
              <div className="text-xs font-bold text-forest mt-1">
                Giảm: -{formatPrice(appliedVoucher.discountAmount)}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveVoucher}
              className="shrink-0 rounded-lg bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-black text-red-600 shadow-sm transition active:scale-95"
            >
              Gỡ mã
            </button>
          </div>
        ) : (
          /* Coupon Input Form */
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponError("");
                }}
                placeholder="Nhập mã giảm giá"
                className="flex-1 min-w-0 rounded-xl border border-forest/15 px-3 py-2 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30 uppercase"
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={() => handleApply()}
                disabled={!couponInput.trim() || isValidating}
                className="shrink-0 rounded-xl bg-forest px-4 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isValidating ? "Đang check..." : "Áp dụng"}
              </button>
            </div>
            {couponError && (
              <p className="text-[11px] font-bold text-red-500 mt-1 pl-1">
                {couponError}
              </p>
            )}
            {suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-forest/70">
                  <Tag size={12} />
                  Gợi ý voucher
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {suggestions.map((voucher) => (
                    <button
                      key={`${voucher.id}-${voucher.code}`}
                      type="button"
                      onClick={() => handleApply(voucher.code)}
                      disabled={isValidating}
                      className="min-w-[145px] rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-left transition hover:border-forest/40 hover:bg-forest/10 disabled:opacity-60"
                      title={voucher.description || voucher.name}
                    >
                      <div className="text-xs font-black text-forest">{voucher.code}</div>
                      <div className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-gray-500">
                        {voucher.description || voucher.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Options Section */}
      <div className="rounded-2xl border border-forest/10 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm sm:text-[15px] font-black text-forest">
          <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" /> Phương thức thanh toán
        </h3>
        <div className="space-y-2.5 sm:space-y-3">
          <label className={`flex cursor-pointer items-start sm:items-center justify-between rounded-xl border-2 p-2.5 sm:p-3 transition active:scale-[0.98] ${paymentMethod === "cod" ? "border-forest bg-forest/5" : "border-forest/10 bg-white hover:bg-cream/10"}`}>
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="accent-forest mt-0.5 sm:mt-0 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-ink">Thanh toán khi nhận hàng (COD)</div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-2">Nhận hàng rồi mới thanh toán tiền mặt</div>
              </div>
            </div>
            <Banknote className="text-forest/60 shrink-0" size={18} />
          </label>

          <label className={`flex cursor-pointer items-start sm:items-center justify-between rounded-xl border-2 p-2.5 sm:p-3 transition active:scale-[0.98] ${paymentMethod === "vietqr" ? "border-forest bg-forest/5" : "border-forest/10 bg-white hover:bg-cream/10"}`}>
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2">
              <input
                type="radio"
                name="payment"
                value="vietqr"
                checked={paymentMethod === "vietqr"}
                onChange={() => setPaymentMethod("vietqr")}
                className="accent-forest mt-0.5 sm:mt-0 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-ink">Chuyển khoản Ngân hàng (VietQR)</div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-2">Tạo mã QR chuyển khoản sau khi đặt hàng</div>
              </div>
            </div>
            <Landmark className="text-forest/60 shrink-0" size={18} />
          </label>
        </div>
      </div>

      {/* Bill Summary totals */}
      <div className="rounded-2xl border border-forest/10 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="mb-4 text-sm sm:text-[15px] font-black text-ink">Tổng giá trị đơn hàng</h3>
        <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between text-ink/75">
            <span>Tạm tính</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink/75">
            <span>Phí vận chuyển</span>
            <span className="font-bold">{formatPrice(shippingFee)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span className="flex items-center gap-1"><Percent size={12} className="sm:w-[14px] sm:h-[14px]"/> Giảm giá</span>
              <span className="font-bold">-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <hr className="border-forest/10 my-2" />
          <div className="flex justify-between text-sm sm:text-base font-black text-forest">
            <span>Tổng cộng</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isSubmitting || subtotal === 0}
          className="mt-5 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-soft transition hover:bg-forest/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Đang xử lý...
            </span>
          ) : (
            <>
              Xác nhận & Đặt hàng <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
