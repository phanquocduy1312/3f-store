import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  cancelOrderApi,
  listOrdersApi,
  orderDetailApi,
  reorderApi,
  type OrderData,
  type OrderItemData,
} from "@/src/api/customerOrdersApi";

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "processing", label: "Đang xử lý" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn tất" },
  { id: "cancelled", label: "Đã hủy" },
];

const statusMeta: Record<string, { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: "bg-amber-50 text-amber-700 border-amber-100" },
  confirmed: { label: "Đã xác nhận", className: "bg-blue-50 text-blue-700 border-blue-100" },
  packing: { label: "Đang đóng gói", className: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  shipping: { label: "Đang giao", className: "bg-purple-50 text-purple-700 border-purple-100" },
  completed: { label: "Hoàn tất", className: "bg-green-50 text-green-700 border-green-100" },
  cancelled: { label: "Đã hủy", className: "bg-red-50 text-red-700 border-red-100" },
};

const paymentMeta: Record<string, { label: string; className: string }> = {
  unpaid: { label: "Chưa thanh toán", className: "text-amber-700 bg-amber-50" },
  pending: { label: "Chờ xác nhận", className: "text-blue-700 bg-blue-50" },
  paid: { label: "Đã thanh toán", className: "text-green-700 bg-green-50" },
  refunded: { label: "Đã hoàn tiền", className: "text-slate-700 bg-slate-100" },
};

const paymentMethodLabel: Record<string, string> = {
  cod: "COD",
  bank_transfer: "Chuyển khoản",
  vietqr: "VietQR",
};

function money(value: unknown) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function getAmount(order: any, key: "subtotal" | "shipping" | "discount" | "total") {
  if (key === "subtotal") return order.subtotalAmount ?? order.subtotal ?? 0;
  if (key === "shipping") return order.shippingFee ?? order.shipping_fee ?? 0;
  if (key === "discount") return order.discountAmount ?? order.discount ?? 0;
  return order.totalAmount ?? order.total ?? 0;
}

function formatAddress(order: OrderData) {
  return [order.address_line, order.ward, order.province].filter(Boolean).join(", ") || "Chưa có thông tin";
}

function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] || { label: status || "Chưa rõ", className: "bg-slate-50 text-slate-600 border-slate-100" };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>;
}

function PaymentBadge({ status }: { status: string }) {
  const meta = paymentMeta[status] || { label: status || "Chưa rõ", className: "text-slate-700 bg-slate-100" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>;
}

function ItemRow({ item }: { item: OrderItemData }) {
  const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
  return (
    <div className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <img
        src={item.image_url || "/assets/images/dog-food.webp"}
        alt={item.product_name}
        className="h-16 w-16 shrink-0 rounded-xl border border-slate-100 bg-slate-50 object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-sm font-black text-[#0B1F3A]">{item.product_name}</div>
        {item.variant_name && <div className="mt-1 text-xs font-semibold text-slate-500">Phân loại: {item.variant_name}</div>}
        <div className="mt-1 text-xs font-semibold text-slate-400">SKU: {item.sku || "N/A"}</div>
      </div>
      <div className="w-28 shrink-0 text-right text-xs font-semibold text-slate-500">
        <div>{money(item.price)}</div>
        <div className="mt-1">x{item.quantity}</div>
        <div className="mt-1 font-black text-[#0B1F3A]">{money(lineTotal)}</div>
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: OrderData }) {
  const items = order.items || [];
  const logs = order.status_logs || [];

  return (
    <div className="space-y-4 rounded-2xl border border-[#DCEBFF] bg-[#F8FBFF] p-4">
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-100 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 font-black text-[#0B1F3A]"><MapPin className="h-4 w-4 text-[#0057E7]" />Giao hàng</h3>
          <div className="space-y-1.5 text-xs font-semibold text-slate-500">
            <p><span className="text-slate-400">Người nhận:</span> <span className="text-[#0B1F3A]">{order.receiver_name || "Chưa có thông tin"}</span></p>
            <p><span className="text-slate-400">SĐT:</span> <span className="text-[#0057E7]">{order.phone || "Chưa có thông tin"}</span></p>
            <p className="leading-relaxed"><span className="text-slate-400">Địa chỉ:</span> {formatAddress(order)}</p>
            {order.note && <p className="rounded-lg bg-amber-50 p-2 text-amber-700">Ghi chú: {order.note}</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 font-black text-[#0B1F3A]"><CreditCard className="h-4 w-4 text-[#0057E7]" />Thanh toán</h3>
          <div className="space-y-2 text-xs font-semibold text-slate-500">
            <div className="flex justify-between gap-3"><span>Phương thức</span><span className="text-[#0B1F3A]">{paymentMethodLabel[order.payment_method] || order.payment_method || "Chưa rõ"}</span></div>
            <div className="flex justify-between gap-3"><span>Trạng thái</span><PaymentBadge status={order.payment_status} /></div>
            <div className="flex justify-between gap-3"><span>Tích điểm</span><span className="text-[#0B1F3A]">+{order.loyalty_points_earned || 0} điểm</span></div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 font-black text-[#0B1F3A]"><Clock className="h-4 w-4 text-[#0057E7]" />Timeline</h3>
          {logs.length > 0 ? (
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {logs.map(log => (
                <div key={log.id} className="border-l-2 border-[#0057E7]/20 pl-3 text-xs">
                  <div className="font-black text-[#0B1F3A]">{statusMeta[log.to_status]?.label || log.to_status || "Đơn hàng được tạo"}</div>
                  <div className="mt-0.5 font-semibold text-slate-400">{new Date(log.created_at).toLocaleString("vi-VN")}</div>
                  {log.note && <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-500">{log.note}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-500">Chưa có lịch sử trạng thái chi tiết.</p>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-4">
        <h3 className="mb-4 flex items-center gap-2 font-black text-[#0B1F3A]"><ShoppingBag className="h-4 w-4 text-[#0057E7]" />Sản phẩm trong đơn</h3>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs font-bold text-slate-400">Chưa có dữ liệu sản phẩm cho đơn này.</div>
        ) : (
          <div className="space-y-3">{items.map(item => <ItemRow key={item.id} item={item} />)}</div>
        )}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="ml-auto w-full max-w-sm space-y-2 text-xs font-semibold text-slate-500">
            <div className="flex justify-between"><span>Tạm tính</span><span>{money(getAmount(order, "subtotal"))}</span></div>
            <div className="flex justify-between"><span>Phí vận chuyển</span><span>{money(getAmount(order, "shipping"))}</span></div>
            <div className="flex justify-between"><span>Giảm giá</span><span>-{money(getAmount(order, "discount"))}</span></div>
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-base font-black text-[#0B1F3A]"><span>Tổng cộng</span><span>{money(getAmount(order, "total"))}</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrderCode, setExpandedOrderCode] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listOrdersApi();
      if (res.success) {
        setOrders(res.data || []);
      } else {
        setError(res.message || "Không thể tải danh sách đơn hàng.");
      }
    } catch (e: any) {
      setError(e.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (activeTab === "all") return true;
      if (activeTab === "processing") return ["confirmed", "packing"].includes(order.order_status);
      return order.order_status === activeTab;
    });
  }, [orders, activeTab]);

  const toggleDetail = async (order: OrderData) => {
    const nextCode = expandedOrderCode === order.order_code ? null : order.order_code;
    setExpandedOrderCode(nextCode);
    if (!nextCode || (order.items && order.items.length > 0 && order.status_logs)) return;

    setDetailLoading(order.order_code);
    try {
      const res = await orderDetailApi(order.order_code);
      if (res.success && res.data) {
        setOrders(prev => prev.map(item => item.order_code === order.order_code ? { ...item, ...res.data } : item));
      }
    } catch {
      toast.error("Không tải được chi tiết đơn hàng.");
    } finally {
      setDetailLoading(null);
    }
  };

  const handleCancel = async (order: OrderData) => {
    if (order.order_status !== "pending") return;
    if (!window.confirm(`Hủy đơn ${order.order_code}?`)) return;

    setCancelling(order.order_code);
    try {
      const res = await cancelOrderApi(order.order_code);
      if (res.success) {
        toast.success(res.message || "Đã hủy đơn hàng");
        fetchOrders();
      } else {
        toast.error(res.message || "Không thể hủy đơn hàng");
      }
    } catch (e: any) {
      toast.error(e.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelling(null);
    }
  };

  const handleReorder = async (order: OrderData) => {
    try {
      const res = await reorderApi(order.order_code);
      if (res.success && res.data?.length) {
        toast.info("API mua lại đã trả dữ liệu sản phẩm. Cần nối vào giỏ hàng ở phase tiếp theo.");
      } else {
        toast.info(res.message || "Tính năng mua lại sẽ được bật sau khi API giỏ hàng hoàn tất.");
      }
    } catch {
      toast.info("Tính năng mua lại sẽ được bật sau khi API giỏ hàng hoàn tất.");
    }
  };

  if (loading) {
    return <div className="space-y-4"><div className="h-12 animate-pulse rounded-xl bg-slate-100" /><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-600">
        <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" />{error}</div>
        <button onClick={fetchOrders} className="mt-4 rounded-xl bg-white px-4 py-2 text-xs font-black text-red-600">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0B1F3A]">Đơn hàng của tôi</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Theo dõi trạng thái, sản phẩm và thanh toán của từng đơn hàng.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-100 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition ${activeTab === tab.id ? "bg-[#0B1F3A] text-white" : "text-slate-500 hover:bg-slate-50 hover:text-[#0B1F3A]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F8FBFF] py-14 text-center">
          <Package className="mx-auto h-14 w-14 text-slate-300" />
          <h3 className="mt-4 text-lg font-black text-[#0B1F3A]">Bạn chưa có đơn hàng nào.</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">Khi bạn đặt hàng tại 3F Store, lịch sử đơn sẽ xuất hiện ở đây.</p>
          <Link to="/products" className="mt-5 inline-flex h-11 items-center rounded-xl bg-[#0B1F3A] px-5 text-sm font-bold text-white">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const expanded = expandedOrderCode === order.order_code;
            return (
              <article key={order.id} className="overflow-hidden rounded-2xl border border-[#DCEBFF] bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 bg-[#F8FBFF] p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-[#0B1F3A]">#{order.order_code}</h3>
                      <StatusBadge status={order.order_status} />
                      <PaymentBadge status={order.payment_status} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(order.created_at).toLocaleString("vi-VN")}</span>
                      <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" />{order.receiver_name || "Người nhận chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <div className="mr-2 text-right">
                      <div className="text-xs font-bold text-slate-400">Tổng tiền</div>
                      <div className="text-lg font-black text-red-600">{money(getAmount(order, "total"))}</div>
                    </div>
                    <button onClick={() => toggleDetail(order)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#DCEBFF] bg-white px-4 text-xs font-bold text-[#0057E7] hover:bg-[#EEF6FF]">
                      {expanded ? "Thu gọn" : "Chi tiết"} {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <Link to={`/orders/${order.order_code}`} className="inline-flex h-10 items-center rounded-xl border border-[#DCEBFF] bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">Theo dõi</Link>
                    {order.order_status === "pending" && (
                      <button disabled={cancelling === order.order_code} onClick={() => handleCancel(order)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-50 px-4 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60">
                        {cancelling === order.order_code ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Hủy đơn
                      </button>
                    )}
                    <button onClick={() => handleReorder(order)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0B1F3A] px-4 text-xs font-bold text-white hover:bg-slate-800">
                      <RotateCcw className="h-4 w-4" /> Mua lại
                    </button>
                  </div>
                </div>
                {expanded && (
                  <div className="p-4">
                    {detailLoading === order.order_code ? <div className="rounded-xl bg-[#F8FBFF] p-5 text-sm font-bold text-[#0057E7]">Đang tải chi tiết đơn hàng...</div> : <OrderDetail order={order} />}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
