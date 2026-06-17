import { useEffect, useState } from "react";
import { listVouchersApi, type VoucherData } from "@/src/api/customerClubApi";
import { Ticket, Copy, Check, ShoppingCart, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function VouchersTab() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [activeTab, setActiveTab] = useState<"available" | "used" | "expired">("available");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await listVouchersApi(activeTab);
      if (res.success && res.data) {
        setVouchers(res.data);
      }
    } catch {
      toast.error("Không thể tải danh sách voucher.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [activeTab]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUseNow = (code: string) => {
    localStorage.setItem("applied_coupon_code", code);
    toast.success(`Đã áp dụng mã ${code} cho giỏ hàng!`);
    navigate("/products");
  };

  return (
    <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-6">
      
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-base font-black text-ink">Voucher của tôi</h3>
        <p className="text-xs text-gray-400 font-semibold">Quản lý và sử dụng các mã giảm giá, quà tặng từ 3F Club.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-2">
        {[
          { id: "available", label: "Có thể dùng" },
          { id: "used", label: "Đã dùng" },
          { id: "expired", label: "Hết hạn" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id ? "bg-forest text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
      ) : vouchers.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F9FD] text-gray-400">
            <Ticket size={20} />
          </div>
          <p className="text-xs font-semibold text-gray-400">Bạn chưa có voucher nào ở mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {vouchers.map((v) => (
            <div key={v.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-forest/5 text-forest shrink-0">
                  <Ticket size={22} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-ink">{v.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold leading-normal">{v.description}</p>
                  <p className="text-[10px] text-gray-500 font-bold">
                    Trị giá: <span className="text-forest font-black">{v.discountType === "fixed" ? `${v.discountValue.toLocaleString()}đ` : `${v.discountValue}%`}</span> 
                    {v.minOrderAmount > 0 && ` - Đơn tối thiểu ${v.minOrderAmount.toLocaleString()}đ`}
                  </p>
                  {v.expiresAt && (
                    <p className="text-[9px] text-red-500 font-bold">Hạn dùng: {new Date(v.expiresAt).toLocaleDateString("vi-VN")}</p>
                  )}
                </div>
              </div>
              
              {activeTab === "available" ? (
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(v.code)}
                    className="rounded-xl border border-gray-100 p-2 text-gray-500 hover:text-forest flex items-center justify-center gap-1 text-[10px] font-bold"
                  >
                    {copiedCode === v.code ? <Check size={12} className="text-forest" /> : <Copy size={12} />} Copy
                  </button>
                  <button
                    onClick={() => handleUseNow(v.code)}
                    className="rounded-xl bg-forest px-3 py-2 text-[10px] font-bold text-white shadow-soft flex items-center justify-center gap-1 hover:bg-forest/90"
                  >
                    <ShoppingCart size={10} /> Dùng
                  </button>
                </div>
              ) : (
                <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                  {v.status === "used" ? "Đã dùng" : "Hết hạn"}
                </span>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
export default VouchersTab;
