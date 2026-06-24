import { useState } from "react";
import { X, Send, AlertTriangle, UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { createShopeePointRequest, scanShopeeOrderImage } from "@/src/services/shopeePointApi";
import { buildImageUrl } from "@/src/config/api";

interface ShopeeRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ShopeeRequestModal({ onClose, onSuccess }: ShopeeRequestModalProps) {
  const { customer } = useCustomerAuth();

  const [phone, setPhone] = useState(customer?.phone || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [shopeeOrderCode, setShopeeOrderCode] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [note, setNote] = useState("");
  
  const [imageId, setImageId] = useState<number | null>(null);
  const [scanId, setScanId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await scanShopeeOrderImage(file);
      setImageId(res.imageId || null);
      setScanId(res.scanId || null);
      setImageUrl(res.imageUrl || null);

      if (res.success && res.fields) {
        toast.success("Tải ảnh và quét hóa đơn thành công!");
        if (res.fields.shopeeOrderCode) setShopeeOrderCode(res.fields.shopeeOrderCode);
        if (res.fields.orderAmount) {
          const amt = Number(res.fields.orderAmount);
          if (!isNaN(amt)) {
            setOrderAmount(amt.toLocaleString("vi-VN"));
          }
        }
        if (res.fields.phone && !phone) setPhone(res.fields.phone);
        if (res.fields.email && !email) setEmail(res.fields.email);
      } else {
        toast.info("Đã tải ảnh lên. Không tự động quét được thông tin, vui lòng điền thủ công.");
      }
    } catch (err: any) {
      toast.error(err.message || "Tải ảnh thất bại.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    try {
      const resSubmit = await createShopeePointRequest({
        shopeeOrderCode,
        orderAmount: amountNum,
        phone,
        email,
        imageId,
        scanId,
        note
      });

      if (resSubmit.success) {
        toast.success("Gửi yêu cầu tích điểm thành công! 3F sẽ phê duyệt sớm nhất.");
        onSuccess();
        onClose();
      } else {
        toast.error(resSubmit.message || "Không thể gửi yêu cầu.");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi yêu cầu tích điểm.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar space-y-4">
        
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-ink"><X size={18} /></button>

        <div className="text-center space-y-1">
          <h3 className="text-base font-black text-ink">Yêu cầu tích điểm Shopee</h3>
          <p className="text-xs text-gray-400 font-semibold">
            Tích điểm 3F Club bằng cách nhập thông tin hóa đơn đơn hàng Shopee của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Block */}
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Ảnh hóa đơn / đơn hàng (Tùy chọn)</label>
              {imageUrl ? (
                <div className="relative rounded-2xl border border-[#E0EBF7] overflow-hidden h-28 bg-slate-50 flex items-center justify-center group">
                  <img src={buildImageUrl(imageUrl)} alt="Hóa đơn" className="h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageId(null);
                      setScanId(null);
                      setImageUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition shadow-md"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="border border-dashed border-[#E0EBF7] hover:border-forest/50 transition rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer h-28 bg-slate-50/50 hover:bg-slate-50 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <Loader2 size={18} className="text-forest animate-spin" />
                      <span className="text-[10px] text-gray-400 font-bold">Đang tải và quét ảnh...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <UploadCloud size={24} className="text-gray-400 group-hover:text-forest transition" />
                      <span className="text-[11px] font-bold text-gray-500">Tải ảnh hóa đơn / đơn hàng</span>
                      <span className="text-[9px] text-gray-400">Hỗ trợ tự động điền thông tin</span>
                    </div>
                  )}
                </label>
              )}
            </div>

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
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Email (Tùy chọn)</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="VD: name@example.com" 
                className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest" 
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
              <button type="submit" disabled={isLoading} className="rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-forest/90 flex items-center gap-1.5">
                {isLoading ? "Đang xử lý..." : <><Send size={14} /> Gửi yêu cầu</>}
              </button>
            </div>
        </form>

      </div>
    </div>
  );
}

export default ShopeeRequestModal;
