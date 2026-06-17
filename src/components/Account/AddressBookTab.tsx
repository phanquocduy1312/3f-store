import { useEffect, useState } from "react";
import { listAddressesApi, deleteAddressApi, setDefaultAddressApi, type AddressData } from "@/src/api/customerAddressesApi";
import { AddressFormModal } from "./AddressFormModal";
import { MapPin, Plus, Trash2, Edit3, Home, Briefcase, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export function AddressBookTab() {
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await listAddressesApi();
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch {
      toast.error("Không thể tải danh sách địa chỉ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      const res = await deleteAddressApi(id);
      if (res.success) {
        toast.success("Xóa địa chỉ thành công!");
        fetchAddresses();
      } else {
        toast.error(res.message || "Lỗi xóa địa chỉ.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const res = await setDefaultAddressApi(id);
      if (res.success) {
        toast.success("Đặt địa chỉ mặc định thành công!");
        fetchAddresses();
      } else {
        toast.error(res.message || "Không thể đặt mặc định.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    }
  };

  if (isLoading) {
    return <div className="h-48 rounded-3xl bg-white border border-[#E0EBF7] animate-pulse" />;
  }

  return (
    <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-6">
      
      <div className="border-b border-gray-100 pb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-ink">Sổ địa chỉ nhận hàng</h3>
          <p className="text-xs text-gray-400 font-semibold">Lưu trữ các địa chỉ nhận hàng để thanh toán nhanh hơn khi đặt đơn mới.</p>
        </div>
        <button
          onClick={() => { setSelectedAddress(null); setShowModal(true); }}
          className="rounded-full bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 flex items-center gap-1"
        >
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F9FD] text-gray-400"><MapPin size={24} /></div>
          <div>
            <p className="text-sm font-bold text-ink">Bạn chưa lưu địa chỉ nhận hàng nào</p>
            <p className="text-xs text-gray-400 font-semibold mt-1">Hãy thêm địa chỉ để 3F Store tự động điền khi thanh toán đơn hàng.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className={`rounded-2xl border p-4 space-y-3 relative flex flex-col justify-between ${
              addr.isDefault ? "border-forest/40 bg-forest/[0.02] shadow-sm" : "border-gray-100 bg-white"
            }`}>
              
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-lg bg-gray-100 text-gray-500">
                      {addr.type === "home" ? <Home size={12} /> : addr.type === "office" ? <Briefcase size={12} /> : <HelpCircle size={12} />}
                    </span>
                    <span className="text-xs font-black text-ink">{addr.receiverName}</span>
                  </div>
                  {addr.isDefault && (
                    <span className="rounded-full bg-forest/15 px-2 py-0.5 text-[9px] font-bold text-forest">Mặc định</span>
                  )}
                </div>
                
                <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                  SĐT: {addr.receiverPhone} <br />
                  ĐC: {addr.addressLine}, {addr.wardName}, {addr.provinceName}
                  {addr.note && <span className="block text-[10px] text-gray-400 font-bold italic mt-1">Ghi chú: {addr.note}</span>}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50/50">
                {!addr.isDefault ? (
                  <button onClick={() => handleSetDefault(addr.id!)} className="text-[10px] font-bold text-forest hover:underline">Đặt làm mặc định</button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelectedAddress(addr); setShowModal(true); }} className="rounded-lg border border-gray-100 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-forest transition-colors"><Edit3 size={12} /></button>
                  <button onClick={() => handleDelete(addr.id!)} className="rounded-lg border border-red-50 p-1.5 text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddressFormModal
          address={selectedAddress}
          onClose={() => setShowModal(false)}
          onSuccess={fetchAddresses}
        />
      )}

    </div>
  );
}
export default AddressBookTab;
