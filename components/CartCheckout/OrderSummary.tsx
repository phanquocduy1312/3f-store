import { Ticket, Percent, ArrowRight, Truck } from "lucide-react";
import { formatPrice } from "@/lib/cartHelper";

interface OrderSummaryProps {
  subtotal: number;
  shippingFee: number;
  appliedVoucher: { code: string; discount: number; type: "percent" | "fixed" } | null;
  onApplyVoucher: (code: string) => void;
  onRemoveVoucher: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  shippingMethod: string;
  setShippingMethod: (v: string) => void;
}

export function OrderSummary({
  subtotal,
  shippingFee,
  appliedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  onSubmit,
  isSubmitting,
  shippingMethod,
  setShippingMethod
}: OrderSummaryProps) {
  
  // Calculate discount value
  const voucherDiscount = appliedVoucher 
    ? (appliedVoucher.type === "percent" 
        ? Math.min(subtotal * (appliedVoucher.discount / 100), 50000) 
        : appliedVoucher.discount)
    : 0;

  const finalTotal = Math.max(0, subtotal + shippingFee - voucherDiscount);

  // Available vouchers
  const vouchers = [
    { code: "SENMOI", title: "Giảm 50k", desc: "Đơn từ 399k", minSubtotal: 399000, value: 50000, type: "fixed" as const },
    { code: "FREESHIP25K", title: "Freeship 25k", desc: "Đơn từ 300k", minSubtotal: 300000, value: 25000, type: "fixed" as const }
  ];

  return (
    <div className="space-y-6">
      {/* Shipping Method Choice */}
      <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-[15px] font-black text-forest">
          <Truck size={18} /> Phương thức vận chuyển
        </h3>
        <div className="space-y-3">
          <label className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition ${shippingMethod === "standard" ? "border-forest bg-forest/5" : "border-forest/10 bg-white hover:bg-cream/10"}`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value="standard"
                checked={shippingMethod === "standard"}
                onChange={() => setShippingMethod("standard")}
                className="accent-forest"
              />
              <div>
                <div className="text-sm font-bold text-ink">Giao hàng tiêu chuẩn</div>
                <div className="text-[11px] text-gray-500">Nhận hàng sau 2-4 ngày làm việc</div>
              </div>
            </div>
            <span className="text-sm font-bold text-forest">25.000đ</span>
          </label>

          <label className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition ${shippingMethod === "express" ? "border-forest bg-forest/5" : "border-forest/10 bg-white hover:bg-cream/10"}`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value="express"
                checked={shippingMethod === "express"}
                onChange={() => setShippingMethod("express")}
                className="accent-forest"
              />
              <div>
                <div className="text-sm font-bold text-ink">Giao hàng hỏa tốc 2H</div>
                <div className="text-[11px] text-gray-500">Nhận trong 2 giờ (chỉ áp dụng HCM/Hà Nội)</div>
              </div>
            </div>
            <span className="text-sm font-bold text-forest">50.000đ</span>
          </label>
        </div>
      </div>

      {/* Discount Coupons */}
      <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-[15px] font-black text-forest">
          <Ticket size={18} /> Mã giảm giá của bạn
        </h3>
        
        {/* Quick Vouchers */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {vouchers.map((v) => {
            const isElligible = subtotal >= v.minSubtotal;
            const isApplied = appliedVoucher?.code === v.code;
            return (
              <div 
                key={v.code}
                className={`flex items-center justify-between rounded-xl border p-2.5 transition ${isApplied ? "border-forest bg-forest/5" : "border-forest/10 bg-white"} ${!isElligible ? "opacity-60" : ""}`}
              >
                <div>
                  <div className="text-xs font-black text-ink">{v.title}</div>
                  <div className="text-[10px] text-gray-400">{v.desc}</div>
                </div>
                {isApplied ? (
                  <button
                    onClick={onRemoveVoucher}
                    className="rounded-lg bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-200 transition"
                  >
                    Bỏ áp dụng
                  </button>
                ) : (
                  <button
                    onClick={() => onApplyVoucher(v.code)}
                    disabled={!isElligible}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${isElligible ? "bg-forest/10 text-forest hover:bg-forest hover:text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  >
                    Áp dụng
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bill Breakdown */}
      <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-[15px] font-black text-ink">Tổng giá trị đơn hàng</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-ink/75">
            <span>Tạm tính</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink/75">
            <span>Phí vận chuyển</span>
            <span className="font-bold">{formatPrice(shippingFee)}</span>
          </div>
          {voucherDiscount > 0 && (
            <div className="flex justify-between text-red-600">
              <span className="flex items-center gap-1"><Percent size={14}/> Giảm giá</span>
              <span className="font-bold">-{formatPrice(voucherDiscount)}</span>
            </div>
          )}
          <hr className="border-forest/10 my-2" />
          <div className="flex justify-between text-base font-black text-forest">
            <span>Tổng cộng</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isSubmitting || subtotal === 0}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Đang xử lý đơn hàng...
            </span>
          ) : (
            <>
              Xác nhận & Đặt hàng <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
