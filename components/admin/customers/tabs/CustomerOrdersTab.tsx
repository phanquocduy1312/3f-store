import { useState, useEffect } from "react";
import { adminCustomersApi } from "@/src/api/adminCustomersApi";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export function CustomerOrdersTab({ customerId }: { customerId: number }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    adminCustomersApi.getOrders(customerId).then(data => {
      setOrders(data);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, [customerId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Chờ xác nhận</span>;
      case "confirmed": return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Đã xác nhận</span>;
      case "packing": return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">Đang đóng gói</span>;
      case "shipping": return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">Đang giao</span>;
      case "completed": return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Hoàn tất</span>;
      case "cancelled": return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">Đã hủy</span>;
      default: return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => {
    if (filter === "processing") return ["pending", "confirmed", "packing"].includes(o.status);
    return o.status === filter;
  });

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-10 bg-slate-100 rounded-xl"></div><div className="h-32 bg-slate-100 rounded-xl"></div></div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-black text-[#0B1F3A]">Lịch sử đơn hàng</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none">
          <option value="all">Tất cả</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Khách hàng chưa có đơn hàng.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-semibold rounded-l-xl">Mã đơn</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                <th className="px-4 py-3 font-semibold rounded-r-xl">Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-4 font-bold text-[#0057E7]"><a href={`/admin/orders/${order.id}`}>#{order.id}</a></td>
                  <td className="px-4 py-4 text-slate-600">{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-4 font-bold">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-4">
                    {order.payment_status === "paid" ? (
                      <span className="text-green-600 font-semibold text-xs">Đã thanh toán</span>
                    ) : (
                      <span className="text-orange-600 font-semibold text-xs">Chưa thanh toán</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
