import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { 
  getAdminOrders, 
  updateAdminOrderStatus, 
  markAdminOrderPaid, 
  OrderDetail, 
  AdminOrderListParams 
} from "@/src/api/productsApi";
import { 
  Search, 
  Eye, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Coins
} from "lucide-react";
import { Image } from "@/components/Image";

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Chờ xác nhận", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  confirmed: { label: "Đã xác nhận", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  packing: { label: "Đang đóng gói", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
  shipping: { label: "Đang giao", bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  completed: { label: "Hoàn tất", bg: "bg-green-50 border-green-200", text: "text-green-700" },
  cancelled: { label: "Đã hủy", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  refunded: { label: "Đã hoàn tiền", bg: "bg-gray-50 border-gray-200", text: "text-gray-700" },
};

const PAYMENT_MAP: Record<string, { label: string; color: string; bg: string }> = {
  unpaid: { label: "Chưa thanh toán", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  pending: { label: "Chờ duyệt", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  paid: { label: "Đã thanh toán", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  failed: { label: "Thất bại", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  refunded: { label: "Đã hoàn tiền", color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
};

export function AdminOrdersPage() {
  const [activeMenu, setActiveMenu] = useState("Đơn hàng");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return true;
  });

  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [transitionNote, setTransitionNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrdersData = () => {
    setIsLoading(true);
    const params: AdminOrderListParams = {
      page: currentPage,
      limit: 20,
    };
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (statusFilter) params.order_status = statusFilter;
    if (paymentFilter) params.payment_status = paymentFilter;

    getAdminOrders(params)
      .then((res) => {
        if (res.success) {
          setOrders(res.data.items);
          setPagination(res.data.pagination);
          // Auto update selected order if open
          if (selectedOrder) {
            const updated = res.data.items.find(o => o.id === selectedOrder.id);
            if (updated) {
              setSelectedOrder(updated);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách đơn hàng", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrdersData();
  }, [currentPage, statusFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrdersData();
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (!selectedOrder) return;
    const vietnameseStatusLabel = STATUS_MAP[newStatus]?.label || newStatus;
    if (!window.confirm(`Xác nhận chuyển đơn hàng sang trạng thái "${vietnameseStatusLabel}"?`)) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await updateAdminOrderStatus(selectedOrder.id, newStatus, transitionNote);
      if (res.success) {
        alert("Cập nhật trạng thái đơn hàng thành công!");
        setTransitionNote("");
        fetchOrdersData();
      } else {
        alert(res.message || "Cập nhật trạng thái thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật trạng thái.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedOrder) return;
    if (!window.confirm("Xác nhận đánh dấu đơn hàng này ĐÃ THANH TOÁN?")) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await markAdminOrderPaid(selectedOrder.id, "Xác nhận chuyển khoản ngân hàng thành công.");
      if (res.success) {
        alert("Đã đánh dấu thanh toán thành công!");
        fetchOrdersData();
      } else {
        alert(res.message || "Xác nhận thanh toán thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi đánh dấu thanh toán.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Check valid status transitions
  const getAllowedTransitions = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["packing", "cancelled"];
      case "packing":
        return ["shipping", "cancelled"];
      case "shipping":
        return ["completed"];
      default:
        return [];
    }
  };

  const allowedTransitions = selectedOrder ? getAllowedTransitions(selectedOrder.order_status) : [];

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        collapsed={sidebarCollapsed} 
      />

      <div className={`min-h-screen flex flex-col overflow-x-hidden transition-all duration-300 ${
        sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"
      }`}>
        <AdminHeader 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDate="today"
          onDateChange={() => {}}
        />

        <main className="flex-1 px-4 sm:px-6 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-black text-[#0B1F3A]">Quản lý Đơn hàng</h1>
              <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
                Theo dõi, xử lý giao vận và tích lũy điểm thưởng đơn hàng website
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-5 shadow-[0_8px_24px_rgba(6,43,95,0.04)]">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Search input */}
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] mb-1.5">Tìm kiếm</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mã đơn, SĐT, Tên khách..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] py-2.5 pl-10 pr-4 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                  />
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] mb-1.5">Trạng thái đơn</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="packing">Đang đóng gói</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="completed">Hoàn tất</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] mb-1.5">Thanh toán</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                >
                  <option value="">Tất cả</option>
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Thất bại</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>

              {/* Search Submit button */}
              <button
                type="submit"
                className="inline-flex h-[38px] items-center justify-center rounded-xl bg-[#0057E7] text-[13px] font-bold text-white transition hover:bg-[#003B7A] focus:outline-none"
              >
                Lọc kết quả
              </button>
            </form>
          </div>

          {/* Orders Listing Table */}
          <div className="rounded-[24px] border border-[#DCEBFF] bg-white overflow-hidden shadow-[0_8px_24px_rgba(6,43,95,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[#EEF6FF] bg-slate-50 text-[#64748B] font-bold">
                    <th className="px-6 py-4">Mã đơn</th>
                    <th className="px-6 py-4">Khách hàng</th>
                    <th className="px-6 py-4">Thời gian tạo</th>
                    <th className="px-6 py-4">Phương thức</th>
                    <th className="px-6 py-4">Tổng tiền</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Thanh toán</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-[#94A3B8] font-semibold">
                        Đang tải danh sách đơn hàng...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-[#94A3B8] font-semibold">
                        Không tìm thấy đơn hàng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const stat = STATUS_MAP[order.order_status] || { label: order.order_status, bg: "bg-gray-50", text: "text-gray-700" };
                      const pay = PAYMENT_MAP[order.payment_status] || { label: order.payment_status, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
                      
                      return (
                        <tr key={order.id} className="border-b border-[#EEF6FF] hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-black text-[#0057E7]">{order.order_code}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#0B1F3A]">{order.receiver_name}</div>
                            <div className="text-xs text-gray-400 font-semibold">{order.phone}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-500">
                            {new Date(order.created_at).toLocaleString("vi-VN")}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-600">
                            {order.payment_method === "bank_transfer" ? "Chuyển khoản" : "COD"}
                          </td>
                          <td className="px-6 py-4 font-black text-[#0B1F3A]">
                            {(parseFloat(order.total)).toLocaleString("vi-VN")}đ
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-black ${stat.bg} ${stat.text}`}>
                              {stat.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-black ${pay.bg} ${pay.color}`}>
                              {pay.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0057E7] hover:bg-[#0057E7] hover:text-white transition shadow-sm"
                              title="Chi tiết đơn hàng"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {pagination.totalPages > 1 && (
              <div className="bg-white border-t border-[#EEF6FF] px-6 py-4 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} đơn
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold bg-[#F6FAFF] hover:bg-white transition disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold bg-[#F6FAFF] hover:bg-white transition disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Order Details Slide-over Modal / Drawer */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedOrder(null)}
            />

            {/* Content Drawer */}
            <div className="relative w-full max-w-2xl bg-white h-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col justify-between z-10 animate-slide-in">
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#EEF6FF] flex items-center justify-between bg-slate-50">
                <div>
                  <h2 className="text-[18px] font-black text-[#0B1F3A] flex items-center gap-2">
                    <ShoppingBag className="text-[#0057E7]" size={20} />
                    Đơn hàng {selectedOrder.order_code}
                  </h2>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">
                    ID Đơn hàng: #{selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full bg-white border h-8 w-8 grid place-items-center text-gray-400 hover:text-ink font-bold shadow-sm"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
                
                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Delivery details */}
                  <div className="rounded-2xl border border-slate-100 bg-[#F8FBFF]/50 p-4 space-y-3">
                    <h4 className="font-black text-sm text-[#0B1F3A] flex items-center gap-1.5 border-b pb-2">
                      <MapPin size={15} className="text-[#0057E7]" /> Thông tin giao nhận
                    </h4>
                    <div className="text-[12.5px] space-y-1">
                      <div className="font-bold text-[#0B1F3A]">{selectedOrder.receiver_name}</div>
                      <div className="font-bold text-[#0057E7]">{selectedOrder.phone}</div>
                      {selectedOrder.email && <div className="text-gray-500 font-semibold">{selectedOrder.email}</div>}
                      <div className="text-gray-600 mt-1 leading-relaxed">
                        {selectedOrder.address_line}, {selectedOrder.ward ? `${selectedOrder.ward}, ` : ""}{selectedOrder.district}, {selectedOrder.province}
                      </div>
                      {selectedOrder.note && (
                        <div className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                          Ghi chú: {selectedOrder.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="rounded-2xl border border-slate-100 bg-[#F8FBFF]/50 p-4 space-y-3">
                    <h4 className="font-black text-sm text-[#0B1F3A] flex items-center gap-1.5 border-b pb-2">
                      <CreditCard size={15} className="text-[#0057E7]" /> Thanh toán & Điểm
                    </h4>
                    <div className="text-[12.5px] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-semibold">Hình thức:</span>
                        <span className="font-bold text-[#0B1F3A]">
                          {selectedOrder.payment_method === "bank_transfer" ? "Chuyển khoản" : "COD"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-semibold">Trạng thái:</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-black ${PAYMENT_MAP[selectedOrder.payment_status]?.bg} ${PAYMENT_MAP[selectedOrder.payment_status]?.color}`}>
                          {PAYMENT_MAP[selectedOrder.payment_status]?.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-dashed pt-2 mt-2">
                        <span className="text-gray-400 font-semibold">Tích lũy 3F Club:</span>
                        <span className="font-black text-amber-600 flex items-center gap-1 text-sm">
                          <Coins size={14} /> +{selectedOrder.loyalty_points_earned || Math.floor(parseFloat(selectedOrder.total) / 10000)}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Logs Timeline */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-4">
                  <h4 className="font-black text-sm text-[#0B1F3A] flex items-center gap-1.5 border-b pb-2">
                    <Clock size={15} className="text-[#0057E7]" /> Nhật ký trạng thái
                  </h4>
                  <div className="pl-6 border-l-2 border-slate-100 ml-2 space-y-4 text-xs">
                    {selectedOrder.status_logs && selectedOrder.status_logs.length > 0 ? (
                      selectedOrder.status_logs.map((log) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#0057E7]" />
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#0B1F3A]">{STATUS_MAP[log.status]?.label || log.status}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">
                              {new Date(log.created_at).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          {log.note && <p className="text-gray-500 mt-0.5">{log.note}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 italic">Chưa ghi nhận nhật ký trạng thái.</p>
                    )}
                  </div>
                </div>

                {/* Items detail list */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-4">
                  <h4 className="font-black text-sm text-[#0B1F3A] flex items-center gap-1.5 border-b pb-2">
                    <ShoppingBag size={15} className="text-[#0057E7]" /> Danh sách sản phẩm mua
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center border-b last:border-0 pb-3 last:pb-0">
                        <div className="h-12 w-12 shrink-0 rounded-xl border p-1 bg-gray-50 flex items-center justify-center overflow-hidden">
                          <Image src={item.image_url || "/assets/images/dog-food.webp"} alt={item.product_name} className="h-full w-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <h5 className="font-bold text-[#0B1F3A] truncate">{item.product_name}</h5>
                          {item.variant_name && <div className="text-gray-400 font-medium mt-0.5">Phân loại: {item.variant_name}</div>}
                          <div className="text-gray-500 font-semibold mt-1">
                            SKU: {item.sku || "N/A"}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="font-bold text-[#0B1F3A]">{(parseFloat(item.price)).toLocaleString("vi-VN")}đ</div>
                          <div className="text-gray-400 font-semibold mt-0.5">x{item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals Summary */}
                  <div className="border-t pt-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Tạm tính:</span>
                      <span>{(parseFloat(selectedOrder.subtotal)).toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Phí vận chuyển:</span>
                      <span>{(parseFloat(selectedOrder.shipping_fee)).toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Giảm giá:</span>
                      <span>-{(parseFloat(selectedOrder.discount)).toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-black text-[#0B1F3A] border-t pt-2 mt-2">
                      <span>Tổng tiền:</span>
                      <span className="text-[#0057E7] text-base">{(parseFloat(selectedOrder.total)).toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Status Update & Payment Controls Footer */}
              <div className="px-6 py-5 border-t border-[#EEF6FF] bg-slate-50 space-y-4">
                {allowedTransitions.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B]">
                      Ghi chú chuyển trạng thái (Lý do cập nhật)
                    </label>
                    <textarea
                      placeholder="Nhập ghi chú hoặc lý do thay đổi..."
                      value={transitionNote}
                      onChange={(e) => setTransitionNote(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-[#DCEBFF] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#0B1F3A] outline-none focus:border-[#0057E7]"
                    />
                    
                    <div className="flex flex-wrap gap-2.5">
                      {allowedTransitions.map((nextStatus) => {
                        const style = nextStatus === "cancelled" 
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-[#0057E7] hover:bg-[#003B7A] text-white";
                        return (
                          <button
                            key={nextStatus}
                            disabled={isUpdatingStatus}
                            onClick={() => handleStatusTransition(nextStatus)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${style}`}
                          >
                            {nextStatus === "cancelled" ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            {STATUS_MAP[nextStatus]?.label || nextStatus}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mark Paid Button for Bank Transfer */}
                {selectedOrder.payment_method === "bank_transfer" && selectedOrder.payment_status !== "paid" && (
                  <div className="pt-2 border-t border-gray-200/50 flex justify-between items-center">
                    <span className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                      <AlertCircle size={14} /> Đơn chuyển khoản ngân hàng chưa được duyệt thanh toán.
                    </span>
                    <button
                      disabled={isUpdatingStatus}
                      onClick={handleMarkPaid}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <CheckCircle size={14} /> Duyệt thanh toán
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
