import { useState, useEffect } from "react";
import { adminCustomersApi } from "@/src/api/adminCustomersApi";

export function CustomerVouchersTab({ customerId }: { customerId: number }) {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminCustomersApi.getVouchers(customerId).then(data => {
      setVouchers(data);
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
        <h2 className="text-lg font-black text-[#0B1F3A]">Voucher</h2>
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Khách hàng chưa có voucher.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-semibold rounded-l-xl">Mã voucher</th>
                <th className="px-4 py-3 font-semibold">Tên voucher</th>
                <th className="px-4 py-3 font-semibold">Giá trị giảm</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold rounded-r-xl">Hạn sử dụng</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-4 font-bold">{v.code}</td>
                  <td className="px-4 py-4">{v.name}</td>
                  <td className="px-4 py-4 text-green-600 font-bold">{v.discount_value}</td>
                  <td className="px-4 py-4">{v.status}</td>
                  <td className="px-4 py-4 text-slate-600">{new Date(v.expires_at).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
