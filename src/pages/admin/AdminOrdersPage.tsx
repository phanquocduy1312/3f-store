import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { 
  getAdminOrders, 
  updateAdminOrderStatus, 
  OrderDetail, 
  AdminOrderListParams,
  getAllowedTransitions,
  getOrderDetails
} from "@/src/api/ordersApi";
import { 
  Search, 
  Eye, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  CreditCard, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Coins,
  Check,
  Package,
  Truck,
  X,
  Layers,
  Sparkles
} from "lucide-react";
import { Image } from "@/components/Image";

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Chờ xác nhận", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  pending_confirmation: { label: "Chờ xác nhận", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  confirmed: { label: "Đã xác nhận", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  packing: { label: "Đang chuẩn bị", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
  preparing: { label: "Đang chuẩn bị", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
  awaiting_pickup_or_booking: { label: "Chờ đặt ship", bg: "bg-violet-50 border-violet-200", text: "text-violet-700" },
  shipping: { label: "Đang giao", bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  delivered: { label: "Giao thành công", bg: "bg-green-50 border-green-200", text: "text-green-700" },
  completed: { label: "Hoàn tất", bg: "bg-emerald-50 border-emerald-250", text: "text-emerald-700" },
  return_requested: { label: "Yêu cầu đổi / trả", bg: "bg-rose-50 border-rose-250", text: "text-rose-700" },
  return_completed: { label: "Đã đổi trả xong", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  cancelled: { label: "Đã hủy", bg: "bg-gray-550/10 border-gray-250", text: "text-gray-600" },
};

const PAYMENT_MAP: Record<string, { label: string; color: string; bg: string }> = {
  unpaid: { label: "Chưa thanh toán", color: "text-amber-750", bg: "bg-amber-50 border-amber-200" },
  pending: { label: "Chờ xác nhận", color: "text-blue-750", bg: "bg-blue-50 border-blue-200" },
  paid: { label: "Đã thanh toán", color: "text-green-750", bg: "bg-green-50 border-green-200" },
  cod: { label: "COD", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  refunded: { label: "Đã hoàn tiền", color: "text-gray-700", bg: "bg-gray-550/10 border-gray-200" },
  payment_failed: { label: "Thanh toán lỗi", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const ORDER_STATUS_MAP = STATUS_MAP;

const SHIPPING_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  no_shipment: { label: "Chưa tạo vận đơn", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  shipment_created: { label: "Đã tạo vận đơn", bg: "bg-blue-50 border-blue-200", text: "text-blue-750" },
  picking_up: { label: "Đang lấy hàng", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-750" },
  shipping: { label: "Đang giao", bg: "bg-purple-50 border-purple-200", text: "text-purple-750" },
  delivered: { label: "Giao thành công", bg: "bg-green-50 border-green-200", text: "text-green-750" },
  delivery_failed: { label: "Giao thất bại", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  returned: { label: "Hoàn hàng", bg: "bg-gray-550/10 border-gray-200", text: "text-gray-650" },
};

const LOYALTY_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  not_earned: { label: "Chưa tích điểm", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  pending_review: { label: "Chờ duyệt điểm", bg: "bg-blue-50 border-blue-200", text: "text-blue-750" },
  holding: { label: "Điểm tạm giữ", bg: "bg-yellow-50 border-yellow-250", text: "text-yellow-750" },
  credited: { label: "Đã cộng điểm", bg: "bg-green-50 border-green-200", text: "text-green-750" },
  redeemed: { label: "Đã dùng điểm", bg: "bg-purple-50 border-purple-200", text: "text-purple-750" },
  cancelled: { label: "Hủy điểm", bg: "bg-gray-550/10 border-gray-200", text: "text-gray-650" },
};

const PAYMENT_METHOD_MAP: Record<string, string> = {
  cod: "COD",
  bank_transfer: "Chuyển khoản",
};

const SHIPPING_METHOD_MAP: Record<string, string> = {
  express: "Hỏa tốc",
  fast: "Nhanh",
  sameday: "Trong ngày",
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
  const [summary, setSummary] = useState<{
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippingOrders: number;
    completedOrders: number;
    completedRevenue: number;
  }>({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippingOrders: 0,
    completedOrders: 0,
    completedRevenue: 0,
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selected Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [allowedTransitions, setAllowedTransitions] = useState<{
    order: any[];
    payment: any[];
    shipping: any[];
    loyalty: any[];
  } | null>(null);

  // Confirmation overlay modal states
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    orderId: number;
    orderCode: string;
    newStatus: string;
    groupKey?: string;
    title: string;
    description: string;
    confirmLabel: string;
    hasTextarea: boolean;
    textareaLabel?: string;
    textareaPlaceholder?: string;
  } | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const fetchOrdersData = () => {
    setIsLoading(true);
    const params: AdminOrderListParams = {
      page: currentPage,
      limit: pageSize,
    };
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (statusFilter) params.order_status = statusFilter;
    if (paymentFilter) params.payment_status = paymentFilter;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    getAdminOrders(params)
      .then((res) => {
        if (res.success) {
          setOrders(res.data.items);
          setPagination(res.data.pagination);
          if (res.data.summary) {
            setSummary(res.data.summary);
          }
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
  }, [currentPage, pageSize, statusFilter, paymentFilter, startDate, endDate]);

  useEffect(() => {
    if (selectedOrder) {
      getAllowedTransitions(selectedOrder.id)
        .then((res) => {
          if (res.success) {
            setAllowedTransitions(res.data);
            
            // Console warning check for empty transitions on non-terminal order statuses
            const TERMINAL_STATUSES = ["completed", "cancelled", "return_completed"];
            const isTerminal = TERMINAL_STATUSES.includes(selectedOrder.order_status);
            if (!isTerminal && (!res.data || !res.data.order || res.data.order.length === 0)) {
              console.warn("Chưa cấu hình bước chuyển cho trạng thái này", {
                order_id: selectedOrder.id,
                group_key: "order",
                current_status: selectedOrder.order_status,
                api_response: res.data
              });
            }
          }
        })
        .catch((err) => {
          console.error("Lỗi lấy danh sách chuyển đổi trạng thái", err);
        });
    } else {
      setAllowedTransitions(null);
    }
  }, [selectedOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrdersData();
  };

  const executeStatusTransition = async (orderId: number, orderCode: string, newStatus: string, note: string = "", groupKey = "order") => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateAdminOrderStatus(orderId, newStatus, note, groupKey);
      if (res.success) {
        toast.success(`Cập nhật trạng thái thành công!`);
        setConfirmState(null);
        fetchOrdersData();
        // Refresh selectedOrder details and allowed transitions
        if (selectedOrder && selectedOrder.id === orderId) {
          const detailRes = await getOrderDetails(orderCode);
          if (detailRes.success) {
            setSelectedOrder(detailRes.data);
          }

          const transRes = await getAllowedTransitions(orderId);
          if (transRes.success) {
            setAllowedTransitions(transRes.data);
          }
        }
      } else {
        toast.error(res.message || "Cập nhật trạng thái thất bại.");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật trạng thái.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(pagination.totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition border ${
            currentPage === 1
              ? "bg-[#0057E7] text-white border-[#0057E7]"
              : "bg-white text-gray-650 hover:bg-slate-50 border-[#DCEBFF]"
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots-start" className="px-1 text-gray-400">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition border ${
            currentPage === i
              ? "bg-[#0057E7] text-white border-[#0057E7]"
              : "bg-white text-gray-650 hover:bg-slate-50 border-[#DCEBFF]"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(<span key="dots-end" className="px-1 text-gray-400">...</span>);
      }
      pages.push(
        <button
          key={pagination.totalPages}
          onClick={() => setCurrentPage(pagination.totalPages)}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition border ${
            currentPage === pagination.totalPages
              ? "bg-[#0057E7] text-white border-[#0057E7]"
              : "bg-white text-gray-650 hover:bg-slate-50 border-[#DCEBFF]"
          }`}
        >
          {pagination.totalPages}
        </button>
      );
    }

    return pages;
  };

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

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Card 1: Tổng đơn */}
            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <ShoppingBag size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Tổng đơn</p>
                <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">{summary.totalOrders}</h3>
              </div>
            </div>

            {/* Card 2: Chờ xác nhận */}
            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <Clock size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Chờ xác nhận</p>
                <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">{summary.pendingOrders}</h3>
              </div>
            </div>

            {/* Card 3: Đang xử lý */}
            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Package size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Đang xử lý</p>
                <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">{summary.processingOrders}</h3>
              </div>
            </div>

            {/* Card 4: Đang giao */}
            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Truck size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Đang giao</p>
                <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">{summary.shippingOrders}</h3>
              </div>
            </div>

            {/* Card 5: Hoàn tất */}
            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-green-600 shrink-0">
                <CheckCircle size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Hoàn tất</p>
                <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">{summary.completedOrders}</h3>
              </div>
            </div>

            {/* Card 6: Doanh thu hoàn tất */}
            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Coins size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Doanh thu</p>
                <h3 className="text-base font-black text-emerald-650 mt-0.5 truncate" title={summary.completedRevenue.toLocaleString("vi-VN") + "đ"}>
                  {summary.completedRevenue.toLocaleString("vi-VN")}đ
                </h3>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-5 shadow-[0_8px_24px_rgba(6,43,95,0.04)]">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
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
                  <option value="packing">Đang chuẩn bị</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="completed">Hoàn tất</option>
                  <option value="cancelled">Đã hủy</option>
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
                  <option value="pending">Chờ xác nhận</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] mb-1.5">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] mb-1.5">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                />
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
                            <div className="font-bold text-[#0B1F3A]">{order.customer_name || order.receiver_name || "Chưa có thông tin"}</div>
                            <div className="text-xs text-gray-400 font-semibold">{order.customer_phone || order.phone || "Chưa có thông tin"}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-500">
                            {new Date(order.created_at).toLocaleString("vi-VN")}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-600">
                            {PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method}
                          </td>
                          <td className="px-6 py-4 font-black text-[#0B1F3A]">
                            <div>{(parseFloat(order.total)).toLocaleString("vi-VN")}đ</div>
                            {(order.coupon_code || order.couponCode) && (
                              <div className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200 mt-1 inline-block" title={`Đã áp dụng mã ${order.coupon_code || order.couponCode}`}>
                                Mã: {order.coupon_code || order.couponCode}
                              </div>
                            )}
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
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Always show Eye details */}
                              <button
                                onClick={async () => {
                                  setSelectedOrder(order);
                                  try {
                                    const detailRes = await getOrderDetails(order.order_code);
                                    if (detailRes.success) {
                                      setSelectedOrder(detailRes.data);
                                    }
                                  } catch (e) {
                                    console.error("Lỗi lấy chi tiết đơn hàng", e);
                                  }
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 transition shadow-sm"
                                title="Chi tiết đơn hàng"
                              >
                                <Eye size={15} />
                              </button>

                              {/* Pending actions */}
                              {order.order_status === "pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setConfirmState({
                                        isOpen: true,
                                        orderId: order.id,
                                        orderCode: order.order_code,
                                        newStatus: "confirmed",
                                        title: "Xác nhận đơn hàng?",
                                        description: "Đơn sẽ chuyển sang trạng thái Đã xác nhận. Sau bước này đơn không thể hủy trong quy trình hiện tại.",
                                        confirmLabel: "Xác nhận đơn",
                                        hasTextarea: false
                                      });
                                      setConfirmText("");
                                    }}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"
                                    title="Xác nhận đơn hàng"
                                  >
                                    <Check size={15} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setConfirmState({
                                        isOpen: true,
                                        orderId: order.id,
                                        orderCode: order.order_code,
                                        newStatus: "cancelled",
                                        title: "Hủy đơn hàng?",
                                        description: "Đơn sẽ bị hủy và tồn kho đã giữ sẽ được giải phóng.",
                                        confirmLabel: "Hủy đơn",
                                        hasTextarea: true,
                                        textareaLabel: "Lý do hủy",
                                        textareaPlaceholder: "Nhập lý do hủy đơn hàng..."
                                      });
                                      setConfirmText("");
                                    }}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm"
                                    title="Hủy đơn hàng"
                                  >
                                    <X size={15} />
                                  </button>
                                </>
                              )}

                              {/* Confirmed actions */}
                              {order.order_status === "confirmed" && (
                                <button
                                  onClick={() => {
                                    setConfirmState({
                                      isOpen: true,
                                      orderId: order.id,
                                      orderCode: order.order_code,
                                      newStatus: "packing",
                                      title: "Chuyển sang chuẩn bị hàng?",
                                      description: "Nhân viên bắt đầu chuẩn bị sản phẩm cho đơn hàng.",
                                      confirmLabel: "Chuẩn bị hàng",
                                      hasTextarea: false
                                    });
                                    setConfirmText("");
                                  }}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition shadow-sm"
                                  title="Chuẩn bị hàng"
                                >
                                  <Package size={15} />
                                </button>
                              )}

                              {/* Packing actions */}
                              {order.order_status === "packing" && (
                                <button
                                  onClick={() => {
                                    setConfirmState({
                                      isOpen: true,
                                      orderId: order.id,
                                      orderCode: order.order_code,
                                      newStatus: "shipping",
                                      title: "Bắt đầu giao hàng?",
                                      description: "Đơn sẽ chuyển sang trạng thái Đang giao.",
                                      confirmLabel: "Bắt đầu giao",
                                      hasTextarea: false
                                    });
                                    setConfirmText("");
                                  }}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition shadow-sm"
                                  title="Bắt đầu giao"
                                >
                                  <Truck size={15} />
                                </button>
                              )}

                              {/* Shipping actions */}
                              {order.order_status === "shipping" && (
                                <button
                                  onClick={() => {
                                    setConfirmState({
                                      isOpen: true,
                                      orderId: order.id,
                                      orderCode: order.order_code,
                                      newStatus: "completed",
                                      title: "Hoàn tất đơn hàng?",
                                      description: "Hệ thống sẽ trừ tồn kho thật và cộng điểm 3F Club nếu chưa cộng.",
                                      confirmLabel: "Hoàn tất đơn",
                                      hasTextarea: false
                                    });
                                    setConfirmText("");
                                  }}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition shadow-sm"
                                  title="Hoàn tất đơn hàng"
                                >
                                  <CheckCircle size={15} />
                                </button>
                              )}

                              {/* Completed */}
                              {order.order_status === "completed" && (
                                <button
                                  disabled
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                  title="Đơn hàng đã hoàn tất"
                                >
                                  <CheckCircle size={15} />
                                </button>
                              )}

                              {/* Cancelled */}
                              {order.order_status === "cancelled" && (
                                <button
                                  disabled
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                  title="Đơn hàng đã hủy"
                                >
                                  <XCircle size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {pagination.total > 0 && (
              <div className="bg-white border-t border-[#EEF6FF] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-xs font-bold text-[#64748B]">
                    Hiển thị {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} đơn
                  </span>
                  
                  {/* Page size selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">Số đơn mỗi trang:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-[#DCEBFF] bg-[#F6FAFF] px-2 py-1 text-xs font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="px-3 py-1.5 border border-[#DCEBFF] rounded-xl text-xs font-bold bg-[#F6FAFF] hover:bg-white text-gray-600 transition disabled:opacity-50"
                    >
                      Trước
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      {renderPageNumbers()}
                    </div>

                    <button
                      disabled={currentPage >= pagination.totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="px-3 py-1.5 border border-[#DCEBFF] rounded-xl text-xs font-bold bg-[#F6FAFF] hover:bg-white text-gray-600 transition disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                )}
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
                  
                  {/* Left Column: Account & Shipping Info */}
                  <div className="space-y-4">
                    {/* Customer Account Info */}
                    <div className="rounded-2xl border border-slate-100 bg-[#F8FBFF]/50 p-4 space-y-3">
                      <h4 className="font-black text-sm text-[#0B1F3A] flex items-center gap-1.5 border-b pb-2">
                        <AlertCircle size={15} className="text-[#0057E7]" /> Khách hàng
                      </h4>
                      <div className="text-[12.5px] space-y-1.5">
                        <div>
                          <span className="text-gray-400 font-semibold">Tên khách: </span>
                          <span className="font-bold text-[#0B1F3A]">
                            {selectedOrder.customer_name || selectedOrder.receiver_name || "Chưa có thông tin"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold">SĐT: </span>
                          <span className="font-bold text-[#0057E7]">
                            {selectedOrder.customer_phone || selectedOrder.phone || "Chưa có thông tin"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold">Email: </span>
                          <span className="text-gray-600 font-semibold">
                            {selectedOrder.customer_email || "Chưa có thông tin"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery details */}
                    <div className="rounded-2xl border border-slate-100 bg-[#F8FBFF]/50 p-4 space-y-3">
                      <h4 className="font-black text-sm text-[#0B1F3A] flex items-center gap-1.5 border-b pb-2">
                        <MapPin size={15} className="text-[#0057E7]" /> Thông tin nhận hàng
                      </h4>
                      <div className="text-[12.5px] space-y-1.5">
                        <div>
                          <span className="text-gray-400 font-semibold">Người nhận: </span>
                          <span className="font-bold text-[#0B1F3A]">
                            {selectedOrder.receiver_name || "Chưa có thông tin"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold">SĐT nhận: </span>
                          <span className="font-bold text-[#0057E7]">
                            {selectedOrder.phone || "Chưa có thông tin"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block mb-0.5">Địa chỉ:</span>
                          <span className="text-gray-600 font-semibold block mt-0.5 leading-relaxed whitespace-normal break-words">
                            {selectedOrder.address_line || selectedOrder.ward || selectedOrder.district || selectedOrder.province ? (
                              `${selectedOrder.address_line || ""}, ${selectedOrder.ward ? `${selectedOrder.ward}, ` : ""}${selectedOrder.district || ""}, ${selectedOrder.province || ""}`.replace(/^,\s*/, "")
                            ) : (
                              "Chưa có thông tin"
                            )}
                          </span>
                        </div>
                        {selectedOrder.note && (
                          <div className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 whitespace-normal break-words">
                            Ghi chú: {selectedOrder.note}
                          </div>
                        )}
                        <div className="mt-2 text-xs font-semibold text-[#0057E7] bg-blue-50/50 p-2 rounded-lg border border-blue-100 flex items-center justify-between">
                          <span>Phương thức:</span>
                          <span className="font-black tracking-wide uppercase">{SHIPPING_METHOD_MAP[selectedOrder.shipping_method || "express"] || selectedOrder.shipping_method || "Hỏa tốc"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Multi-Dimensional status panel */}
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-100 bg-[#F8FBFF]/50 p-4 space-y-4">
                      <h4 className="font-black text-sm text-[#0B1F3A] flex items-center gap-1.5 border-b pb-2">
                        <Layers size={15} className="text-[#0057E7]" /> Quy trình & Trạng thái đa chiều
                      </h4>
                      
                      <div className="text-[12.5px] space-y-3.5">
                        
                        {/* Dimensions 1: Order Status */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái đơn hàng</div>
                            <div>
                              <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10.5px] font-black ${ORDER_STATUS_MAP[selectedOrder.order_status]?.bg || 'bg-gray-50'} ${ORDER_STATUS_MAP[selectedOrder.order_status]?.text || 'text-gray-700'}`}>
                                {ORDER_STATUS_MAP[selectedOrder.order_status]?.label || selectedOrder.order_status}
                              </span>
                            </div>
                          </div>
                          <div>
                            {(() => {
                              const TERMINAL_STATUSES = ["completed", "cancelled", "return_completed"];
                              const isTerminal = TERMINAL_STATUSES.includes(selectedOrder.order_status);
                              if (allowedTransitions?.order && allowedTransitions.order.length > 0) {
                                return (
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (!val) return;
                                      const t = allowedTransitions.order.find((x: any) => x.to_status === val);
                                      if (!t) return;
                                      setConfirmState({
                                        isOpen: true,
                                        orderId: selectedOrder.id,
                                        orderCode: selectedOrder.order_code,
                                        newStatus: t.to_status,
                                        groupKey: "order",
                                        title: `${t.label}?`,
                                        description: `Chuyển trạng thái đơn hàng sang "${t.to_status_label}".`,
                                        confirmLabel: t.label,
                                        hasTextarea: t.requires_reason === 1,
                                        textareaLabel: "Lý do thay đổi",
                                        textareaPlaceholder: "Nhập lý do chuyển trạng thái..."
                                      });
                                      setConfirmText("");
                                    }}
                                    className="rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-2.5 py-1.5 text-xs font-bold text-[#0057E7] focus:border-[#0057E7] focus:outline-none cursor-pointer transition hover:bg-slate-50"
                                  >
                                    <option value="" disabled>Chuyển trạng thái...</option>
                                    {allowedTransitions.order.map((t: any) => (
                                      <option key={t.id} value={t.to_status}>
                                        {t.label}
                                      </option>
                                    ))}
                                  </select>
                                );
                              } else {
                                if (isTerminal) {
                                  return (
                                    <span className="text-[11px] font-semibold text-gray-400 italic">Đơn hàng đã ở trạng thái cuối.</span>
                                  );
                                } else {
                                  return (
                                    <span className="text-[11px] font-semibold text-amber-600 italic">Chưa cấu hình bước chuyển cho trạng thái này</span>
                                  );
                                }
                              }
                            })()}
                          </div>
                        </div>

                        {/* Dimensions 2: Payment Status */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái thanh toán</div>
                            <div>
                              <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10.5px] font-black ${PAYMENT_MAP[selectedOrder.payment_status]?.bg || 'bg-gray-50'} ${PAYMENT_MAP[selectedOrder.payment_status]?.color || 'text-gray-700'}`}>
                                {PAYMENT_MAP[selectedOrder.payment_status]?.label || selectedOrder.payment_status}
                              </span>
                            </div>
                          </div>
                          <div>
                            {allowedTransitions?.payment && allowedTransitions.payment.length > 0 ? (
                              <select
                                value=""
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  const t = allowedTransitions.payment.find((x: any) => x.to_status === val);
                                  if (!t) return;
                                  setConfirmState({
                                    isOpen: true,
                                    orderId: selectedOrder.id,
                                    orderCode: selectedOrder.order_code,
                                    newStatus: t.to_status,
                                    groupKey: "payment",
                                    title: `${t.label}?`,
                                    description: `Chuyển trạng thái thanh toán sang "${t.to_status_label}".`,
                                    confirmLabel: t.label,
                                    hasTextarea: t.requires_reason === 1,
                                    textareaLabel: "Lý do thay đổi",
                                    textareaPlaceholder: "Nhập lý do chuyển trạng thái..."
                                  });
                                  setConfirmText("");
                                }}
                                className="rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-2.5 py-1.5 text-xs font-bold text-[#0057E7] focus:border-[#0057E7] focus:outline-none cursor-pointer transition hover:bg-slate-50"
                              >
                                <option value="" disabled>Chuyển trạng thái...</option>
                                {allowedTransitions.payment.map((t: any) => (
                                  <option key={t.id} value={t.to_status}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[11px] font-semibold text-gray-400 italic">Không có chuyển đổi</span>
                            )}
                          </div>
                        </div>

                        {/* Dimensions 3: Shipping Status */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái vận chuyển</div>
                            <div>
                              <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10.5px] font-black ${SHIPPING_STATUS_MAP[selectedOrder.shipping_status || "no_shipment"]?.bg} ${SHIPPING_STATUS_MAP[selectedOrder.shipping_status || "no_shipment"]?.text}`}>
                                {SHIPPING_STATUS_MAP[selectedOrder.shipping_status || "no_shipment"]?.label}
                              </span>
                            </div>
                          </div>
                          <div>
                            {allowedTransitions?.shipping && allowedTransitions.shipping.length > 0 ? (
                              <select
                                value=""
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  const t = allowedTransitions.shipping.find((x: any) => x.to_status === val);
                                  if (!t) return;
                                  setConfirmState({
                                    isOpen: true,
                                    orderId: selectedOrder.id,
                                    orderCode: selectedOrder.order_code,
                                    newStatus: t.to_status,
                                    groupKey: "shipping",
                                    title: `${t.label}?`,
                                    description: `Chuyển trạng thái giao hàng sang "${t.to_status_label}".`,
                                    confirmLabel: t.label,
                                    hasTextarea: t.requires_reason === 1,
                                    textareaLabel: "Lý do thay đổi",
                                    textareaPlaceholder: "Nhập lý do chuyển trạng thái..."
                                  });
                                  setConfirmText("");
                                }}
                                className="rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-2.5 py-1.5 text-xs font-bold text-[#0057E7] focus:border-[#0057E7] focus:outline-none cursor-pointer transition hover:bg-slate-50"
                              >
                                <option value="" disabled>Chuyển trạng thái...</option>
                                {allowedTransitions.shipping.map((t: any) => (
                                  <option key={t.id} value={t.to_status}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[11px] font-semibold text-gray-400 italic">Không có chuyển đổi</span>
                            )}
                          </div>
                        </div>

                        {/* Dimensions 4: Loyalty Status */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái tích điểm</div>
                            <div>
                              <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10.5px] font-black ${LOYALTY_STATUS_MAP[selectedOrder.loyalty_status || "not_earned"]?.bg} ${LOYALTY_STATUS_MAP[selectedOrder.loyalty_status || "not_earned"]?.text}`}>
                                {LOYALTY_STATUS_MAP[selectedOrder.loyalty_status || "not_earned"]?.label}
                              </span>
                            </div>
                          </div>
                          <div>
                            {allowedTransitions?.loyalty && allowedTransitions.loyalty.length > 0 ? (
                              <select
                                value=""
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  const t = allowedTransitions.loyalty.find((x: any) => x.to_status === val);
                                  if (!t) return;
                                  setConfirmState({
                                    isOpen: true,
                                    orderId: selectedOrder.id,
                                    orderCode: selectedOrder.order_code,
                                    newStatus: t.to_status,
                                    groupKey: "loyalty",
                                    title: `${t.label}?`,
                                    description: `Chuyển trạng thái tích điểm sang "${t.to_status_label}".`,
                                    confirmLabel: t.label,
                                    hasTextarea: t.requires_reason === 1,
                                    textareaLabel: "Lý do thay đổi",
                                    textareaPlaceholder: "Nhập lý do chuyển trạng thái..."
                                  });
                                  setConfirmText("");
                                }}
                                className="rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-2.5 py-1.5 text-xs font-bold text-[#0057E7] focus:border-[#0057E7] focus:outline-none cursor-pointer transition hover:bg-slate-50"
                              >
                                <option value="" disabled>Chuyển trạng thái...</option>
                                {allowedTransitions.loyalty.map((t: any) => (
                                  <option key={t.id} value={t.to_status}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[11px] font-semibold text-gray-400 italic">Không có chuyển đổi</span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Display points summary */}
                      {(() => {
                        const status = selectedOrder.order_status;
                        const points = selectedOrder.loyalty_points_earned || Math.floor(parseFloat(selectedOrder.total) / 10000);
                        
                        return (
                          <div className="border-t border-dashed pt-3 mt-3 space-y-1.5 text-[12.5px]">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 font-semibold">Tích lũy 3F Club:</span>
                              <span className={`font-black flex items-center gap-1 text-sm ${selectedOrder.loyalty_status === "credited" ? "text-green-600" : "text-amber-600"}`}>
                                <Coins size={14} /> {selectedOrder.loyalty_status === "credited" ? `+${points} điểm (Đã cộng)` : `+${points} điểm (Dự kiến)`}
                              </span>
                            </div>
                            {selectedOrder.loyalty_status !== "credited" && (
                              <p className="text-[10px] text-gray-400 text-right font-medium">Sẽ được cộng khi trạng thái tích điểm chuyển sang "Đã cộng điểm".</p>
                            )}
                          </div>
                        );
                      })()}
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
                      selectedOrder.status_logs.map((log) => {
                        let groupLabel = "";
                        let fromText = "";
                        let toText = log.to_status;
                        
                        if (log.group_key === "order") {
                          groupLabel = "ĐƠN HÀNG";
                          const stFrom = log.from_status ? ORDER_STATUS_MAP[log.from_status] : undefined;
                          const stTo = log.to_status ? ORDER_STATUS_MAP[log.to_status] : undefined;
                          fromText = stFrom ? stFrom.label : (log.from_status || "");
                          toText = stTo ? stTo.label : (log.to_status || "");
                        } else if (log.group_key === "payment") {
                          groupLabel = "THANH TOÁN";
                          const stFrom = log.from_status ? PAYMENT_MAP[log.from_status] : undefined;
                          const stTo = log.to_status ? PAYMENT_MAP[log.to_status] : undefined;
                          fromText = stFrom ? stFrom.label : (log.from_status || "");
                          toText = stTo ? stTo.label : (log.to_status || "");
                        } else if (log.group_key === "shipping") {
                          groupLabel = "VẬN CHUYỂN";
                          const stFrom = log.from_status ? SHIPPING_STATUS_MAP[log.from_status] : undefined;
                          const stTo = log.to_status ? SHIPPING_STATUS_MAP[log.to_status] : undefined;
                          fromText = stFrom ? stFrom.label : (log.from_status || "");
                          toText = stTo ? stTo.label : (log.to_status || "");
                        } else if (log.group_key === "loyalty") {
                          groupLabel = "TÍCH ĐIỂM";
                          const stFrom = log.from_status ? LOYALTY_STATUS_MAP[log.from_status] : undefined;
                          const stTo = log.to_status ? LOYALTY_STATUS_MAP[log.to_status] : undefined;
                          fromText = stFrom ? stFrom.label : (log.from_status || "");
                          toText = stTo ? stTo.label : (log.to_status || "");
                        }

                        const statusText = fromText ? `${fromText} → ${toText}` : toText;

                        return (
                          <div key={log.id} className="relative pb-2">
                            <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#0057E7]" />
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#0B1F3A] whitespace-normal break-words pr-2">
                                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-slate-150 text-slate-500 px-1.5 py-0.5 rounded mr-1.5 border inline-block">
                                  {groupLabel}
                                </span>
                                {statusText}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                                {new Date(log.created_at).toLocaleString("vi-VN")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400 font-semibold">
                              <span>Người xử lý:</span>
                              <span className="text-gray-650 font-bold">{log.changed_by || "system"}</span>
                            </div>
                            {log.note && (
                              <p className="text-gray-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                "{log.note}"
                              </p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="space-y-1 py-2">
                        <p className="font-bold text-[#0B1F3A]">
                          Trạng thái hiện tại: {ORDER_STATUS_MAP[selectedOrder.order_status]?.label || selectedOrder.order_status}
                        </p>
                        <p className="text-gray-400 italic">
                          Chưa có lịch sử chi tiết cho đơn này.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items detail list */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-4">
                  <h4 className="font-black text-sm text-[#0B1F3A] flex items-center gap-1.5 border-b pb-2">
                    <ShoppingBag size={15} className="text-[#0057E7]" /> Danh sách sản phẩm mua
                  </h4>
                  
                  {!selectedOrder.items || selectedOrder.items.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 italic text-xs">
                      Không có sản phẩm trong đơn hàng này.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => {
                        const priceNum = parseFloat(item.price);
                        const subtotalNum = priceNum * item.quantity;
                        
                        return (
                          <div key={item.id} className="flex gap-4 items-center border-b last:border-0 pb-3 last:pb-0">
                            <div className="h-12 w-12 shrink-0 rounded-xl border p-1 bg-gray-50 flex items-center justify-center overflow-hidden">
                              <Image 
                                src={item.image_url || "/assets/images/dog-food.webp"} 
                                alt={item.product_name} 
                                className="h-full w-full object-contain" 
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-xs">
                              <h5 className="font-bold text-[#0B1F3A] truncate" title={item.product_name}>
                                {item.product_name}
                              </h5>
                              {item.variant_name && (
                                <div className="text-gray-400 font-medium mt-0.5">
                                  Phân loại: {item.variant_name}
                                </div>
                              )}
                              <div className="text-gray-500 font-semibold mt-1">
                                SKU: {item.sku || "N/A"}
                              </div>
                            </div>
                            <div className="text-right text-xs">
                              <div className="text-gray-500">Đơn giá: {priceNum.toLocaleString("vi-VN")}đ</div>
                              <div className="text-gray-400 font-semibold mt-0.5">Số lượng: x{item.quantity}</div>
                              <div className="font-black text-[#0B1F3A] mt-1">
                                Thành tiền: {subtotalNum.toLocaleString("vi-VN")}đ
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

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
                      <span>Mã giảm giá:</span>
                      <span className="font-bold text-[#0b1f3a]">
                        {selectedOrder.coupon_code || selectedOrder.couponCode || "Không áp dụng"}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Giảm giá:</span>
                      <span>-{(parseFloat(selectedOrder.discount)).toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-[#0B1F3A] border-t border-dashed pt-2 mt-2">
                      <span>Tổng cộng:</span>
                      <span>{(parseFloat(selectedOrder.total)).toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Drawer Footer - Fixed at bottom */}
              <div className="px-6 py-4 border-t border-[#EEF6FF] bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                {/* Left side: current primary order status summary */}
                <div className="flex flex-col items-start min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.03em] text-[#64748B] mb-0.5">Trạng thái đơn hàng</div>
                  {(() => {
                    const stat = STATUS_MAP[selectedOrder.order_status] || { label: selectedOrder.order_status, bg: "bg-gray-50", text: "text-gray-700" };
                    return (
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10.5px] font-black ${stat.bg} ${stat.text}`}>
                        {stat.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Right side: action buttons based on allowed transitions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Secondary Close Button */}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 transition border border-[#DCEBFF]"
                  >
                    Đóng
                  </button>

                  {/* Transition actions */}
                  {(() => {
                    const TERMINAL_STATUSES = ["completed", "cancelled", "return_completed"];
                    const isTerminal = TERMINAL_STATUSES.includes(selectedOrder.order_status);
                    
                    if (isTerminal) {
                      return (
                        <span className="text-xs font-semibold text-gray-400 italic bg-gray-50 border border-slate-100 rounded-lg px-2.5 py-2">
                          Đơn hàng đã ở trạng thái cuối.
                        </span>
                      );
                    }
                    
                    if (allowedTransitions?.order && allowedTransitions.order.length > 0) {
                      return allowedTransitions.order.map((t: any) => {
                        const isDangerous = ["cancelled", "refunded", "return_completed", "delivery_failed", "returned"].includes(t.to_status);
                        
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              setConfirmState({
                                isOpen: true,
                                orderId: selectedOrder.id,
                                orderCode: selectedOrder.order_code,
                                newStatus: t.to_status,
                                groupKey: "order",
                                title: `${t.label}?`,
                                description: `Chuyển trạng thái đơn hàng sang "${t.to_status_label}".`,
                                confirmLabel: t.label,
                                hasTextarea: t.requires_reason === 1,
                                textareaLabel: "Lý do thay đổi",
                                textareaPlaceholder: "Nhập lý do chuyển trạng thái..."
                              });
                              setConfirmText("");
                            }}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                              isDangerous
                                ? "border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
                                : "bg-[#0057E7] hover:bg-[#003b7a] text-white shadow-sm"
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      });
                    } else {
                      return (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50/50 border border-amber-100 rounded-lg px-2.5 py-2">
                          Chưa cấu hình bước chuyển cho trạng thái này
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Custom Confirm Modal Dialog */}
        {confirmState?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay background */}
            <div 
              className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-sm transition-opacity animate-fade-in"
              onClick={() => setConfirmState(null)}
            />
            
            {/* Dialog content panel */}
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#dcebff] shadow-[0_20px_50px_rgba(6,43,95,0.15)] p-6 space-y-4 z-10 animate-fade-in">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 shrink-0">
                  <AlertCircle size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-[#0b1f3a] leading-tight">
                    {confirmState.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] text-[#64748b] leading-relaxed">
                    {confirmState.description}
                  </p>
                </div>
              </div>

              {(() => {
                const isDangerous = ["cancelled", "refunded", "return_completed", "delivery_failed", "returned"].includes(confirmState.newStatus) ||
                  (confirmState.groupKey === "loyalty" && confirmState.newStatus === "cancelled");
                const hasTextarea = confirmState.hasTextarea || isDangerous;
                const isReasonRequired = isDangerous || confirmState.hasTextarea;
                const textareaLabel = confirmState.textareaLabel || (isReasonRequired ? "Lý do thay đổi" : "Ghi chú");
                const textareaPlaceholder = confirmState.textareaPlaceholder || (isReasonRequired ? "Bắt buộc nhập lý do cho hành động này..." : "Nhập ghi chú tùy chọn...");
                
                return (
                  <>
                    {hasTextarea && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B]">
                          {textareaLabel} {isReasonRequired && <span className="text-red-500 font-extrabold">* (Bắt buộc)</span>}
                        </label>
                        <textarea
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder={textareaPlaceholder}
                          rows={3}
                          className="w-full rounded-2xl border border-[#dcebff] bg-[#f6faff] px-4 py-3 text-[13px] font-semibold text-[#0b1f3a] placeholder:text-[#94a3b8] focus:border-[#0057e7] focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmState(null)}
                        className="flex-1 py-2.5 border border-[#dcebff] text-[13px] font-bold text-[#64748b] hover:bg-slate-50 rounded-xl transition"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingStatus || (isReasonRequired && !confirmText.trim())}
                        onClick={() => {
                          executeStatusTransition(confirmState.orderId, confirmState.orderCode, confirmState.newStatus, confirmText, confirmState.groupKey);
                        }}
                        className={`flex-1 py-2.5 text-[13px] font-bold text-white rounded-xl shadow-sm transition disabled:opacity-50 ${
                          confirmState.newStatus === "cancelled" || confirmState.newStatus === "refunded"
                            ? "bg-red-600 hover:bg-red-700" 
                            : "bg-[#0057e7] hover:bg-[#003b7a]"
                        }`}
                      >
                        {isUpdatingStatus ? "Đang xử lý..." : confirmState.confirmLabel}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
