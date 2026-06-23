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

  const [provinceInput, setProvinceInput] = useState(provinceName);
  const [wardInput, setWardInput] = useState(wardName);
  const [showProvinceSuggestions, setShowProvinceSuggestions] = useState(false);
  const [showWardSuggestions, setShowWardSuggestions] = useState(false);

  // Sync inputs with parent state
  useEffect(() => {
    setProvinceInput(provinceName);
  }, [provinceName]);

  useEffect(() => {
    setWardInput(wardName);
  }, [wardName]);

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

  const removeAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const handleProvinceInputChange = (value: string) => {
    setProvinceInput(value);
    setProvinceName(value);
    setProvinceCode("");
    setWardCode("");
    setWardName("");
    setWardInput("");
    setWards([]);
    setShowProvinceSuggestions(true);

    const matched = provinces.find(p => p.name.trim().toLowerCase() === value.trim().toLowerCase());
    if (matched) {
      setProvinceCode(String(matched.code));
      setProvinceName(matched.name);
    }
  };

  const handleWardInputChange = (value: string) => {
    setWardInput(value);
    setWardName(value);
    setWardCode("");
    setShowWardSuggestions(true);

    const matched = wards.find(w => w.name.trim().toLowerCase() === value.trim().toLowerCase());
    if (matched) {
      setWardCode(String(matched.code));
      setWardName(matched.name);
    }
  };

  const filteredProvinces = provinceInput.trim() === ""
    ? provinces.slice(0, 10)
    : provinces.filter(p => {
        const normName = removeAccents(p.name.toLowerCase());
        const normInput = removeAccents(provinceInput.toLowerCase());
        return normName.includes(normInput);
      });

  const filteredWards = wardInput.trim() === ""
    ? wards.slice(0, 10)
    : wards.filter(w => {
        const normName = removeAccents(w.name.toLowerCase());
        const normInput = removeAccents(wardInput.toLowerCase());
        return normName.includes(normInput);
      });

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
          <div className="relative">
            <label className="mb-1 block text-[11px] sm:text-xs font-bold text-ink/70">Tỉnh / Thành phố *</label>
            <input
              type="text"
              value={provinceInput}
              onChange={(e) => handleProvinceInputChange(e.target.value)}
              onFocus={() => setShowProvinceSuggestions(true)}
              onBlur={() => setTimeout(() => setShowProvinceSuggestions(false), 200)}
              placeholder={isLoadingProvinces ? "Đang tải danh sách..." : "Nhập Tỉnh / Thành phố..."}
              className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30 disabled:opacity-55"
              required
            />
            {showProvinceSuggestions && filteredProvinces.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                {filteredProvinces.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => {
                      setProvinceCode(String(p.code));
                      setProvinceName(p.name);
                      setProvinceInput(p.name);
                      setShowProvinceSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm text-ink hover:bg-forest/5 hover:text-forest transition-colors font-semibold"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="mb-1 block text-[11px] sm:text-xs font-bold text-ink/70">Phường / Xã *</label>
            <input
              type="text"
              value={wardInput}
              onChange={(e) => handleWardInputChange(e.target.value)}
              onFocus={() => setShowWardSuggestions(true)}
              onBlur={() => setTimeout(() => setShowWardSuggestions(false), 200)}
              disabled={!provinceName.trim()}
              placeholder={
                isLoadingWards 
                  ? "Đang tải danh sách..." 
                  : !provinceName.trim() 
                    ? "Vui lòng nhập Tỉnh/Thành phố trước" 
                    : "Nhập Phường / Xã..."
              }
              className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30 disabled:opacity-55"
              required
            />
            {showWardSuggestions && filteredWards.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                {filteredWards.map((w) => (
                  <button
                    key={w.code}
                    type="button"
                    onClick={() => {
                      setWardCode(String(w.code));
                      setWardName(w.name);
                      setWardInput(w.name);
                      setShowWardSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm text-ink hover:bg-forest/5 hover:text-forest transition-colors font-semibold"
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}
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
