import { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";
import { getProvinces, getProvinceDetail, type Province, type Ward } from "@/src/api/vietnamProvincesApi";
import { createAddressApi, updateAddressApi, type AddressData } from "@/src/api/customerAddressesApi";
import { toast } from "sonner";

interface AddressFormModalProps {
  address?: AddressData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddressFormModal({ address, onClose, onSuccess }: AddressFormModalProps) {
  const [receiverName, setReceiverName] = useState(address?.receiverName || "");
  const [receiverPhone, setReceiverPhone] = useState(address?.receiverPhone || "");
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [provinceCode, setProvinceCode] = useState(address?.provinceCode || "");
  const [provinceName, setProvinceName] = useState(address?.provinceName || "");
  const [wardCode, setWardCode] = useState(address?.wardCode || "");
  const [wardName, setWardName] = useState(address?.wardName || "");
  
  const [addressLine, setAddressLine] = useState(address?.addressLine || "");
  const [note, setNote] = useState(address?.note || "");
  const [type, setType] = useState<"home" | "office" | "other">(address?.type || "home");
  const [isDefault, setIsDefault] = useState(address?.isDefault || false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const data = await getProvinces();
        setProvinces(data);
        if (address?.provinceCode) {
          setIsLoadingWards(true);
          const detail = await getProvinceDetail(address.provinceCode);
          setWards(detail.wards || []);
        }
      } catch {
        toast.error("Không thể tải danh sách tỉnh/thành.");
      } finally {
        setIsLoadingProvinces(false);
        setIsLoadingWards(false);
      }
    };
    fetchProvinces();
  }, [address]);

  const handleProvinceChange = async (codeStr: string) => {
    setProvinceCode(codeStr);
    setWardCode("");
    setWardName("");
    setWards([]);
    if (!codeStr) {
      setProvinceName("");
      return;
    }
    const selected = provinces.find(p => String(p.code) === codeStr);
    setProvinceName(selected ? selected.name : "");

    setIsLoadingWards(true);
    try {
      const detail = await getProvinceDetail(codeStr);
      setWards(detail.wards || []);
    } catch {
      toast.error("Không thể tải danh sách phường/xã.");
    } finally {
      setIsLoadingWards(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName || !receiverPhone || !provinceName || !wardName || !addressLine) {
      toast.warning("Vui lòng điền đầy đủ các thông tin có dấu (*)");
      return;
    }
    setIsLoading(true);
    const payload: AddressData = {
      receiverName, receiverPhone, provinceCode, provinceName,
      wardCode, wardName, addressLine, note, type, isDefault
    };
    try {
      const res = address?.id 
        ? await updateAddressApi(address.id, payload)
        : await createAddressApi(payload);
      if (res.success) {
        toast.success(address?.id ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ mới thành công!");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Lỗi xử lý.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-ink"><X size={18} /></button>

        <h3 className="mb-4 text-sm font-black text-ink flex items-center gap-1.5"><MapPin size={16} className="text-forest" /> {address ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Họ và tên người nhận *</label>
              <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest" required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Số điện thoại *</label>
              <input type="tel" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest" required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Tỉnh / Thành phố *</label>
              <select value={provinceCode} onChange={(e) => handleProvinceChange(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs bg-white outline-none focus:border-forest" required disabled={isLoadingProvinces}>
                <option value="">{isLoadingProvinces ? "Đang tải..." : "Chọn Tỉnh / Thành phố"}</option>
                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Phường / Xã *</label>
              <select value={wardCode} onChange={(e) => { setWardCode(e.target.value); const w = wards.find(x => String(x.code) === e.target.value); setWardName(w ? w.name : ""); }} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs bg-white outline-none focus:border-forest" required disabled={!provinceCode || isLoadingWards}>
                <option value="">{isLoadingWards ? "Đang tải..." : !provinceCode ? "Chọn Tỉnh/Thành phố trước" : "Chọn Phường / Xã"}</option>
                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Địa chỉ cụ thể *</label>
              <input type="text" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Số nhà, ngõ/đường..." className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest" required />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Ghi chú giao hàng</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Giao giờ hành chính..." className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Loại địa chỉ</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-3 text-xs bg-white outline-none focus:border-forest">
                <option value="home">Nhà riêng</option>
                <option value="office">Văn phòng / Công ty</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded text-forest focus:ring-forest" />
                Đặt làm địa chỉ mặc định
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={isLoading} className="rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-forest/90">{isLoading ? "Đang xử lý..." : "Lưu địa chỉ"}</button>
          </div>
        </form>

      </div>
    </div>
  );
}
export default AddressFormModal;
