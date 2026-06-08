import { MapPin, User, Phone, Mail, CreditCard, Banknote, Landmark } from "lucide-react";

const PROVINCES = [
  { id: "hcm", name: "Hồ Chí Minh" },
  { id: "hn", name: "Hà Nội" },
  { id: "dn", name: "Đà Nẵng" },
  { id: "hp", name: "Hải Phòng" },
  { id: "ct", name: "Cần Thơ" },
  { id: "bd", name: "Bình Dương" },
  { id: "dnai", name: "Đồng Nai" },
  { id: "la", name: "Long An" }
];

const DISTRICTS: Record<string, string[]> = {
  hcm: ["Quận 1", "Quận 3", "Quận 7", "Quận 10", "Quận Bình Thạnh", "Quận Gò Vấp", "TP. Thủ Đức"],
  hn: ["Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Tây Hồ", "Quận Cầu Giấy", "Quận Đống Đa", "Quận Hai Bà Trưng"],
  dn: ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn"],
  hp: ["Quận Hồng Bàng", "Quận Lê Chân", "Quận Ngô Quyền"],
  ct: ["Quận Ninh Kiều", "Quận Cái Răng", "Quận Bình Thủy"],
  bd: ["TP. Thủ Dầu Một", "TP. Thuận An", "TP. Dĩ An"],
  dnai: ["TP. Biên Hòa", "Huyện Nhơn Trạch", "Huyện Long Thành"],
  la: ["TP. Tân An", "Huyện Đức Hòa", "Huyện Bến Lức"]
};

interface DeliveryFormProps {
  fullName: string;
  setFullName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  province: string;
  setProvince: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  detailedAddress: string;
  setDetailedAddress: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
}

export function DeliveryForm({
  fullName, setFullName,
  phone, setPhone,
  email, setEmail,
  province, setProvince,
  district, setDistrict,
  detailedAddress, setDetailedAddress,
  note, setNote,
  paymentMethod, setPaymentMethod
}: DeliveryFormProps) {
  const currentDistricts = province ? DISTRICTS[province] || [] : [];

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-[15px] font-black text-forest">
          <User size={18} /> Thông tin khách hàng
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink/70">Họ và tên *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink/70">Số điện thoại *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink/70">Địa chỉ Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
            />
          </div>
        </div>
      </div>

      {/* Address Form */}
      <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-[15px] font-black text-forest">
          <MapPin size={18} /> Địa chỉ nhận hàng
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink/70">Tỉnh / Thành phố *</label>
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setDistrict(""); // reset district
              }}
              className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
              required
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink/70">Quận / Huyện *</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!province}
              className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30 disabled:opacity-50"
              required
            >
              <option value="">Chọn Quận/Huyện</option>
              {currentDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink/70">Địa chỉ cụ thể *</label>
            <input
              type="text"
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              placeholder="Số nhà, ngõ/đường, phường/xã..."
              className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink/70">Ghi chú đơn hàng</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú về thời gian giao hàng, chỉ dẫn..."
              rows={2}
              className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-forest/60 focus:ring-1 focus:ring-forest/30"
            />
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-[15px] font-black text-forest">
          <CreditCard size={18} /> Phương thức thanh toán
        </h3>
        <div className="space-y-3">
          <label className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition ${paymentMethod === "cod" ? "border-forest bg-forest/5" : "border-forest/10 bg-white hover:bg-cream/10"}`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="accent-forest"
              />
              <div>
                <div className="text-sm font-bold text-ink">Thanh toán khi nhận hàng (COD)</div>
                <div className="text-[11px] text-gray-500">Nhận hàng rồi mới thanh toán tiền mặt</div>
              </div>
            </div>
            <Banknote className="text-forest/60" size={20} />
          </label>

          <label className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition ${paymentMethod === "vietqr" ? "border-forest bg-forest/5" : "border-forest/10 bg-white hover:bg-cream/10"}`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="vietqr"
                checked={paymentMethod === "vietqr"}
                onChange={() => setPaymentMethod("vietqr")}
                className="accent-forest"
              />
              <div>
                <div className="text-sm font-bold text-ink">Chuyển khoản Ngân hàng (VietQR)</div>
                <div className="text-[11px] text-gray-500">Tạo mã QR chuyển khoản quét nhanh bằng app ngân hàng</div>
              </div>
            </div>
            <Landmark className="text-forest/60" size={20} />
          </label>
        </div>
      </div>
    </div>
  );
}
