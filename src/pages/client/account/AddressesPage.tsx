import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Edit2,
  Home,
  Loader2,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createAddressApi,
  deleteAddressApi,
  listAddressesApi,
  setDefaultAddressApi,
  updateAddressApi,
  type AddressData,
} from "@/src/api/customerAddressesApi";

type AddressForm = AddressData & {
  districtCode?: string;
  districtName?: string;
};

const emptyAddress: AddressForm = {
  receiverName: "",
  receiverPhone: "",
  provinceCode: "",
  provinceName: "",
  districtCode: "",
  districtName: "",
  wardCode: "",
  wardName: "",
  addressLine: "",
  note: "",
  type: "home",
  isDefault: false,
};

const typeLabels: Record<NonNullable<AddressData["type"]>, string> = {
  home: "Nhà riêng",
  office: "Công ty",
  other: "Khác",
};

function normalizeLocationCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildPayload(form: AddressForm, shouldForceDefault: boolean): AddressData {
  let finalAddressLine = form.addressLine.trim();
  if (form.districtName && !finalAddressLine.includes(form.districtName.trim())) {
    finalAddressLine = finalAddressLine ? `${finalAddressLine}, ${form.districtName.trim()}` : form.districtName.trim();
  }
  
  return {
    ...form,
    receiverName: form.receiverName.trim(),
    receiverPhone: form.receiverPhone.trim(),
    provinceName: form.provinceName.trim(),
    provinceCode: form.provinceCode || normalizeLocationCode(form.provinceName),
    wardName: form.wardName.trim(),
    wardCode: form.wardCode || normalizeLocationCode(form.wardName),
    addressLine: finalAddressLine,
    note: form.note?.trim() || "",
    type: form.type || "home",
    isDefault: shouldForceDefault || Boolean(form.isDefault),
  };
}

function validateAddress(form: AddressForm) {
  if (!form.receiverName.trim()) return "Vui lòng nhập tên người nhận.";
  if (!/^(0|\+84)[0-9]{8,10}$/.test(form.receiverPhone.trim())) return "Số điện thoại chưa hợp lệ.";
  if (!form.provinceName.trim()) return "Vui lòng chọn tỉnh/thành phố.";
  if (!form.districtName?.trim()) return "Vui lòng chọn quận/huyện.";
  if (!form.wardName.trim()) return "Vui lòng chọn phường/xã.";
  if (!form.addressLine.trim()) return "Vui lòng nhập địa chỉ cụ thể.";
  return "";
}

function AddressIcon({ type }: { type?: AddressData["type"] }) {
  if (type === "office") return <Briefcase className="h-5 w-5 text-[#0057E7]" />;
  return <Home className="h-5 w-5 text-[#0057E7]" />;
}

export function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyAddress);

  // Address API States
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  // Fetch initial provinces
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (form.provinceCode) {
      fetch(`https://provinces.open-api.vn/api/p/${form.provinceCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts || []))
        .catch(console.error);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [form.provinceCode]);

  // Fetch wards when district changes
  useEffect(() => {
    if (form.districtCode) {
      fetch(`https://provinces.open-api.vn/api/d/${form.districtCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []))
        .catch(console.error);
    } else {
      setWards([]);
    }
  }, [form.districtCode]);

  const sortedAddresses = useMemo(
    () =>
      [...addresses].sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        return (b.id ?? 0) - (a.id ?? 0);
      }),
    [addresses],
  );

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await listAddressesApi();
      if (res.success) {
        setAddresses(res.data ?? []);
      } else {
        toast.error(res.message || "Không thể tải sổ địa chỉ.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải sổ địa chỉ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingAddress(null);
    setForm({ ...emptyAddress, isDefault: addresses.length === 0 });
    setModalOpen(true);
  };

  const openEditModal = (address: AddressData) => {
    setEditingAddress(address);
    // Since district is not saved separately, we try to extract it from addressLine or just leave it empty for re-selection
    setForm({ ...emptyAddress, ...address, districtCode: "", districtName: "" });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingAddress(null);
    setForm(emptyAddress);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateAddress(form);
    if (validation) {
      toast.error(validation);
      return;
    }

    const mustBeDefault = addresses.length === 0;
    const payload = buildPayload(form, mustBeDefault);
    setSaving(true);
    try {
      const res =
        editingAddress?.id != null
          ? await updateAddressApi(editingAddress.id, payload)
          : await createAddressApi(payload);

      if (res.success) {
        toast.success(editingAddress ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ mới.");
        closeModal();
        fetchAddresses();
      } else {
        toast.error(res.message || "Không thể lưu địa chỉ.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể lưu địa chỉ.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (address: AddressData) => {
    if (!address.id) return;
    if (address.isDefault && addresses.length > 1) {
      toast.error("Vui lòng đặt địa chỉ khác làm mặc định trước khi xóa.");
      return;
    }
    if (!confirm("Bạn chắc chắn muốn xóa địa chỉ này?")) return;

    try {
      const res = await deleteAddressApi(address.id);
      if (res.success) {
        toast.success("Đã xóa địa chỉ.");
        fetchAddresses();
      } else {
        toast.error(res.message || "Không thể xóa địa chỉ.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể xóa địa chỉ.");
    }
  };

  const handleSetDefault = async (address: AddressData) => {
    if (!address.id || address.isDefault) return;
    try {
      const res = await setDefaultAddressApi(address.id);
      if (res.success) {
        toast.success("Đã đặt làm địa chỉ mặc định.");
        fetchAddresses();
      } else {
        toast.error(res.message || "Không thể đặt mặc định.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể đặt mặc định.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0057E7]">Sổ địa chỉ</p>
          <h2 className="mt-1 text-2xl font-black text-[#0B1F3A]">Địa chỉ giao hàng</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Lưu nhiều địa chỉ để đặt hàng nhanh và hạn chế sai thông tin giao nhận.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#102b50]"
        >
          <Plus className="h-4 w-4" />
          Thêm địa chỉ
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
        </div>
      ) : sortedAddresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF] px-6 py-14 text-center">
          <MapPin className="mx-auto h-14 w-14 text-[#9AB7DC]" />
          <h3 className="mt-4 text-lg font-black text-[#0B1F3A]">Chưa có địa chỉ nào</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">Thêm địa chỉ đầu tiên để dùng khi thanh toán.</p>
          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#0B1F3A] ring-1 ring-[#DCEBFF] transition hover:bg-[#EEF6FF]"
          >
            <Plus className="h-4 w-4" />
            Thêm địa chỉ
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedAddresses.map((address) => (
            <article
              key={address.id}
              className="rounded-2xl border border-[#DCEBFF] bg-white p-5 shadow-sm transition hover:border-[#9AC1FF]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF6FF]">
                    <AddressIcon type={address.type} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-[#0B1F3A]">{address.receiverName}</h3>
                      <span className="text-sm font-bold text-slate-300">|</span>
                      <span className="text-sm font-bold text-slate-600">{address.receiverPhone}</span>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-black text-green-700">
                          <Star className="h-3 w-3 fill-current" />
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
                      {address.addressLine}, {address.wardName}, {address.provinceName}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#F6FAFF] px-3 py-1 text-xs font-bold text-slate-600">
                        {typeLabels[address.type || "other"]}
                      </span>
                      {address.note && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          Ghi chú: {address.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#EEF6FF] px-3 text-xs font-black text-[#0057E7] transition hover:bg-[#DCEBFF]"
                    >
                      <Star className="h-4 w-4" />
                      Mặc định
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(address)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-100"
                  >
                    <Edit2 className="h-4 w-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(address)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F3A]/45 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl md:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-[#0B1F3A]">
                  {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">Thông tin này sẽ được dùng cho giao hàng.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Người nhận</span>
                <input
                  value={form.receiverName}
                  onChange={(event) => setForm((prev) => ({ ...prev, receiverName: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="Nguyễn Văn A"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Số điện thoại</span>
                <input
                  value={form.receiverPhone}
                  onChange={(event) => setForm((prev) => ({ ...prev, receiverPhone: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="0900000000"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Tỉnh/Thành phố</span>
                <select
                  value={form.provinceCode}
                  onChange={(e) => {
                    const sel = provinces.find((p) => p.code == e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      provinceCode: sel?.code?.toString() || "",
                      provinceName: sel?.name || "",
                      districtCode: "",
                      districtName: "",
                      wardCode: "",
                      wardName: "",
                    }));
                  }}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7] bg-white"
                >
                  <option value="">Chọn Tỉnh/Thành phố</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Quận/Huyện</span>
                <select
                  value={form.districtCode}
                  disabled={!form.provinceCode}
                  onChange={(e) => {
                    const sel = districts.find((d) => d.code == e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      districtCode: sel?.code?.toString() || "",
                      districtName: sel?.name || "",
                      wardCode: "",
                      wardName: "",
                    }));
                  }}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7] bg-white disabled:bg-slate-50 disabled:opacity-70"
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Phường/Xã</span>
                <select
                  value={form.wardCode}
                  disabled={!form.districtCode}
                  onChange={(e) => {
                    const sel = wards.find((w) => w.code == e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      wardCode: sel?.code?.toString() || "",
                      wardName: sel?.name || "",
                    }));
                  }}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7] bg-white disabled:bg-slate-50 disabled:opacity-70"
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-black text-[#0B1F3A]">Địa chỉ cụ thể</span>
                <input
                  value={form.addressLine}
                  onChange={(event) => setForm((prev) => ({ ...prev, addressLine: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="Số nhà, tên đường, tòa nhà"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Loại địa chỉ</span>
                <select
                  value={form.type || "home"}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as AddressData["type"] }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                >
                  <option value="home">Nhà riêng</option>
                  <option value="office">Công ty</option>
                  <option value="other">Khác</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Ghi chú</span>
                <input
                  value={form.note || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="Ví dụ: giao giờ hành chính"
                />
              </label>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-xl bg-[#F6FAFF] p-4 text-sm font-bold text-[#0B1F3A]">
              <input
                type="checkbox"
                checked={Boolean(form.isDefault) || addresses.length === 0}
                disabled={addresses.length === 0}
                onChange={(event) => setForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                className="h-4 w-4 rounded border-[#9AB7DC] text-[#0057E7]"
              />
              Đặt làm địa chỉ mặc định
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="min-h-11 rounded-xl bg-slate-50 px-5 text-sm font-black text-slate-600 transition hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0057E7] px-5 text-sm font-black text-white transition hover:bg-[#0046BA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingAddress ? "Lưu thay đổi" : "Thêm địa chỉ"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
