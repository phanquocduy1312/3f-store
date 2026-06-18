import { useEffect, useState } from "react";
import { MapPin, User } from "lucide-react";
import { getProvinces, getProvinceDetail } from "@/src/api/vietnamProvincesApi";
import type { Province, Ward } from "@/src/api/vietnamProvincesApi";

interface DeliveryFormProps {
  fullName: string;
  setFullName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  provinceCode: string;
  setProvinceCode: (v: string) => void;
  provinceName: string;
  setProvinceName: (v: string) => void;
  wardCode: string;
  setWardCode: (v: string) => void;
  wardName: string;
  setWardName: (v: string) => void;
  detailedAddress: string;
  setDetailedAddress: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
}

export function DeliveryForm({
  fullName, setFullName,
  phone, setPhone,
  email, setEmail,
  provinceCode, setProvinceCode,
  provinceName, setProvinceName,
  wardCode, setWardCode,
  wardName, setWardName,
  detailedAddress, setDetailedAddress,
  note, setNote
}: DeliveryFormProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      setErrorMsg("");
      try {
        const data = await getProvinces();
        setProvinces(data);
      } catch (err: any) {
        setErrorMsg("Không thể tải danh sách tỉnh/thành. Vui lòng thử lại.");
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Handle province selection from dropdown
  const handleProvinceSelect = (codeStr: string) => {
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
  };

  // Reactively fetch wards when provinceCode changes
  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      setIsLoadingWards(true);
      setErrorMsg("");
      try {
        const detail = await getProvinceDetail(provinceCode);
        setWards(detail.wards || []);
      } catch (err: any) {
        setErrorMsg("Không thể tải danh sách phường/xã. Vui lòng thử lại.");
      } finally {
        setIsLoadingWards(false);
      }
    };
    fetchWards();
  }, [provinceCode]);

  const handleWardChange = (codeStr: string) => {
    setWardCode(codeStr);
    if (!codeStr) {
      setWardName("");
      return;
    }
    const selected = wards.find(w => String(w.code) === codeStr);
    setWardName(selected ? selected.name : "");
  };

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <div className="rounded-2xl border border-forest/10 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm sm:text-[15px] font-black text-forest">
          <User size={16} className="sm:w-[18px] sm:h-[18px]" /> Thông tin khách hàng
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] sm:text-xs font-bold text-ink/70">Họ và tên *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full rounded-xl border border-forest/15 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] sm:text-xs font-bold text-ink/70">Số điện thoại *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="w-full rounded-xl border border-forest/15 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] sm:text-xs font-bold text-ink/70">Địa chỉ Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full rounded-xl border border-forest/15 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
            />
          </div>
        </div>
      </div>

      {/* Address Form */}
      <div className="rounded-2xl border border-forest/10 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm sm:text-[15px] font-black text-forest">
          <MapPin size={16} className="sm:w-[18px] sm:h-[18px]" /> Địa chỉ nhận hàng
        </h3>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-100">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] sm:text-xs font-bold text-ink/70">Tỉnh / Thành phố *</label>
            <select
              value={provinceCode}
              onChange={(e) => handleProvinceSelect(e.target.value)}
              disabled={isLoadingProvinces}
              className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30 disabled:opacity-55"
              required
            >
              <option value="">{isLoadingProvinces ? "Đang tải danh sách..." : "Chọn Tỉnh / Thành phố"}</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] sm:text-xs font-bold text-ink/70">Phường / Xã *</label>
            <select
              value={wardCode}
              onChange={(e) => handleWardChange(e.target.value)}
              disabled={!provinceCode || isLoadingWards}
              className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30 disabled:opacity-55"
              required
            >
              <option value="">
                {isLoadingWards 
                  ? "Đang tải danh sách..." 
                  : !provinceCode 
                    ? "Vui lòng chọn Tỉnh/Thành phố trước" 
                    : "Chọn Phường / Xã"
                }
              </option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] sm:text-xs font-bold text-ink/70">Địa chỉ cụ thể *</label>
            <input
              type="text"
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              placeholder="Số nhà, ngõ/đường..."
              className="w-full rounded-xl border border-forest/15 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] sm:text-xs font-bold text-ink/70">Ghi chú đơn hàng</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú về thời gian giao hàng, chỉ dẫn..."
              rows={2}
              className="w-full rounded-xl border border-forest/15 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
