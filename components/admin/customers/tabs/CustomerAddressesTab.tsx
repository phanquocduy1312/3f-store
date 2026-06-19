import { useState, useEffect } from "react";
import { adminCustomersApi } from "@/src/api/adminCustomersApi";
import { MapPin } from "lucide-react";

export function CustomerAddressesTab({ customerId }: { customerId: number }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminCustomersApi.getAddresses(customerId).then(data => {
      setAddresses(data);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, [customerId]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-10 bg-slate-100 rounded-xl"></div><div className="h-32 bg-slate-100 rounded-xl"></div></div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-black text-[#0B1F3A]">Sổ địa chỉ</h2>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Khách hàng chưa lưu địa chỉ.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className="border border-slate-200 rounded-2xl p-5 relative">
              {addr.is_default === 1 && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Mặc định
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className="mt-1 text-slate-400">
                  <MapPin size={20} />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-[#0B1F3A]">{addr.receiver_name}</div>
                  <div className="text-sm font-semibold text-slate-600">{addr.receiver_phone}</div>
                  <div className="text-sm text-slate-500 whitespace-normal break-words pt-1">
                    {addr.address_line1}
                    {addr.ward_name ? `, ${addr.ward_name}` : ""}
                    {addr.district_name ? `, ${addr.district_name}` : ""}
                    {addr.province_name ? `, ${addr.province_name}` : ""}
                  </div>
                  {addr.note && <div className="text-xs text-slate-400 mt-2 italic">Ghi chú: {addr.note}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
