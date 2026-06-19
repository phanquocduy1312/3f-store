import { Fragment, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Clock, CreditCard, Eye, MapPin, ShoppingBag } from "lucide-react";
import { Image } from "@/components/Image";
import { adminCustomersApi } from "@/src/api/adminCustomersApi";
import { getAdminOrders, type OrderDetail, type OrderItemDetail } from "@/src/api/productsApi";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700" },
  packing: { label: "Đang đóng gói", className: "bg-indigo-100 text-indigo-700" },
  shipping: { label: "Đang giao", className: "bg-purple-100 text-purple-700" },
  completed: { label: "Hoàn tất", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
};

const PAYMENT_MAP: Record<string, { label: string; className: string }> = {
  unpaid: { label: "Chưa thanh toán", className: "text-orange-600" },
  pending: { label: "Chờ xác nhận", className: "text-blue-600" },
  paid: { label: "Đã thanh toán", className: "text-green-600" },
  refunded: { label: "Đã hoàn tiền", className: "text-slate-600" },
};

const PAYMENT_METHOD_MAP: Record<string, string> = {
  cod: "COD",
  bank_transfer: "Chuyển khoản",
};

const formatCurrency = (value: number | string | null | undefined) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const formatAddress = (order: OrderDetail) => {
  const parts = [order.address_line, order.ward, order.district, order.province].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Chưa có thông tin";
};

const getStatusBadge = (status: string) => {
  const statusMeta = STATUS_MAP[status] || { label: status, className: "bg-slate-100 text-slate-700" };
  return (
    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusMeta.className}`}>
      {statusMeta.label}
    </span>
  );
};

const getPaymentLabel = (status: string) => {
  const paymentMeta = PAYMENT_MAP[status] || { label: status, className: "text-slate-600" };
  return <span className={`font-semibold text-xs ${paymentMeta.className}`}>{paymentMeta.label}</span>;
};

function OrderItemRow({ item }: { item: OrderItemDetail }) {
  const price = Number(item.price || 0);
  const lineTotal = price * item.quantity;

  return (
    <div className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-1">
        <Image
          src={item.image_url || "/assets/images/dog-food.webp"}
          alt={item.product_name}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-[#0B1F3A] line-clamp-2">{item.product_name}</div>
        {item.variant_name && <div className="mt-0.5 text-xs font-semibold text-slate-500">Phân loại: {item.variant_name}</div>}
        <div className="mt-1 text-xs font-semibold text-slate-400">SKU: {item.sku || "N/A"}</div>
      </div>
      <div className="w-32 shrink-0 text-right text-xs">
        <div className="font-semibold text-slate-500">{formatCurrency(price)}</div>
        <div className="mt-0.5 text-slate-400">x{item.quantity}</div>
        <div className="mt-1 font-black text-[#0B1F3A]">{formatCurrency(lineTotal)}</div>
      </div>
    </div>
  );
}

function OrderDetails({ order }: { order: OrderDetail }) {
  const logs = order.status_logs || [];
  const items = order.items || [];

  return (
    <div className="rounded-2xl border border-[#DCEBFF] bg-[#F8FBFF] p-5 text-sm shadow-inner">
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-100 bg-white p-4 self-start">
          <h3 className="mb-3 flex items-center gap-2 font-black text-[#0B1F3A]">
            <MapPin className="h-4 w-4 text-[#0057E7]" />
            Giao hàng
          </h3>
          <div className="space-y-1.5 text-xs font-semibold text-slate-500">
            <p><span className="text-slate-400">Người nhận:</span> <span className="text-[#0B1F3A]">{order.receiver_name || "Chưa có thông tin"}</span></p>
            <p><span className="text-slate-400">SĐT:</span> <span className="text-[#0057E7]">{order.phone || "Chưa có thông tin"}</span></p>
            <p className="leading-relaxed"><span className="text-slate-400">Địa chỉ:</span> {formatAddress(order)}</p>
            {order.note && <p className="rounded-lg bg-amber-50 p-2 text-amber-700">Ghi chú: {order.note}</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-4 self-start">
          <h3 className="mb-3 flex items-center gap-2 font-black text-[#0B1F3A]">
            <CreditCard className="h-4 w-4 text-[#0057E7]" />
            Thanh toán
          </h3>
          <div className="space-y-2 text-xs font-semibold text-slate-500">
            <div className="flex justify-between gap-3">
              <span>Phương thức</span>
              <span className="text-[#0B1F3A]">{PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Trạng thái</span>
              {getPaymentLabel(order.payment_status)}
            </div>
            <div className="flex justify-between gap-3">
              <span>Mã giảm giá</span>
              <span className="text-[#0B1F3A]">{order.coupon_code || order.couponCode || "Không áp dụng"}</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-4 self-start">
          <h3 className="mb-3 flex items-center gap-2 font-black text-[#0B1F3A]">
            <Clock className="h-4 w-4 text-[#0057E7]" />
            Trạng thái
          </h3>
          {logs.length > 0 ? (
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="border-l-2 border-[#0057E7]/20 pl-3 text-xs">
                  <div className="font-bold text-[#0B1F3A]">{STATUS_MAP[log.to_status || ""]?.label || log.to_status || "Đơn hàng được tạo"}</div>
                  <div className="mt-0.5 font-semibold text-slate-400">{new Date(log.created_at).toLocaleString("vi-VN")}</div>
                  {log.note && <div className="mt-1 rounded bg-slate-50 p-2 text-slate-500">{log.note}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-500">Chưa có lịch sử trạng thái chi tiết.</p>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
        <h3 className="mb-4 flex items-center gap-2 font-black text-[#0B1F3A]">
          <ShoppingBag className="h-4 w-4 text-[#0057E7]" />
          Sản phẩm trong đơn
        </h3>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs font-semibold text-slate-400">
            Chưa có dữ liệu sản phẩm cho đơn này.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => <OrderItemRow key={item.id} item={item} />)}
          </div>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="ml-auto w-full max-w-sm space-y-2 text-xs font-semibold">
            <div className="flex justify-between text-slate-500"><span>Tạm tính</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between text-slate-500"><span>Phí vận chuyển</span><span>{formatCurrency(order.shipping_fee)}</span></div>
            <div className="flex justify-between text-slate-500"><span>Giảm giá</span><span>-{formatCurrency(order.discount)}</span></div>
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-base font-black text-[#0B1F3A]">
              <span>Tổng cộng</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function CustomerOrdersTab({ customerId }: { customerId: number }) {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [loadingDetailIds, setLoadingDetailIds] = useState<number[]>([]);
  const [loadedDetailIds, setLoadedDetailIds] = useState<number[]>([]);
  const [detailErrors, setDetailErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    setError("");
    adminCustomersApi.getOrders(customerId).then(data => {
      setOrders(data);
      setExpandedOrderId(data[0]?.id ?? null);
    }).catch(e => {
      setError(e.message);
    }).finally(() => {
      setLoading(false);
    });
  }, [customerId]);

  useEffect(() => {
    if (!expandedOrderId) return;

    const order = orders.find(item => item.id === expandedOrderId);
    if (!order || (order.items && order.items.length > 0) || loadingDetailIds.includes(order.id) || loadedDetailIds.includes(order.id)) return;

    setLoadingDetailIds(prev => [...prev, order.id]);
    setLoadedDetailIds(prev => [...prev, order.id]);
    setDetailErrors(prev => {
      const next = { ...prev };
      delete next[order.id];
      return next;
    });

    getAdminOrders({
      q: order.order_code || String(order.id),
      page: 1,
      limit: 10,
    }).then((res) => {
      const detailedOrder = res.data.items.find(item => (
        item.id === order.id || item.order_code === order.order_code
      ));

      if (detailedOrder) {
        setOrders(prev => prev.map(item => (
          item.id === order.id ? { ...item, ...detailedOrder } : item
        )));
      } else {
        setDetailErrors(prev => ({ ...prev, [order.id]: "Không tìm thấy chi tiết sản phẩm cho đơn này." }));
      }
    }).catch((err) => {
      setDetailErrors(prev => ({ ...prev, [order.id]: err.message || "Không tải được chi tiết sản phẩm." }));
    }).finally(() => {
      setLoadingDetailIds(prev => prev.filter(id => id !== order.id));
    });
  }, [expandedOrderId, orders, loadingDetailIds, loadedDetailIds]);

  const filteredOrders = filter === "all" ? orders : orders.filter(o => {
    if (filter === "processing") return ["pending", "confirmed", "packing"].includes(o.order_status);
    return o.order_status === filter;
  });

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-10 bg-slate-100 rounded-xl"></div><div className="h-32 bg-slate-100 rounded-xl"></div></div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-black text-[#0B1F3A]">Lịch sử đơn hàng</h2>
        <select
          value={filter}
          onChange={e => {
            setFilter(e.target.value);
            setExpandedOrderId(null);
          }}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none"
        >
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
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-semibold rounded-l-xl">Mã đơn</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                <th className="px-4 py-3 font-semibold">Thanh toán</th>
                <th className="px-4 py-3 font-semibold rounded-r-xl text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-4 font-bold text-[#0057E7]">#{order.order_code || order.id}</td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(order.order_status)}</td>
                      <td className="px-4 py-4 font-bold whitespace-nowrap">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{getPaymentLabel(order.payment_status)}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#DCEBFF] bg-white px-3 py-2 text-xs font-bold text-[#0057E7] transition hover:bg-[#EEF6FF]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {isExpanded ? "Thu gọn" : "Xem"}
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-0 pb-5 pt-1">
                          <OrderDetails order={order} />
                          {loadingDetailIds.includes(order.id) && (
                            <div className="mt-3 rounded-xl border border-[#DCEBFF] bg-white px-4 py-3 text-xs font-bold text-[#0057E7]">
                              Đang tải thêm chi tiết sản phẩm...
                            </div>
                          )}
                          {detailErrors[order.id] && (
                            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
                              {detailErrors[order.id]}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
