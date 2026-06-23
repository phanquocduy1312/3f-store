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
  getOrderStatusConfig,
  updateOrderStatusSetting,
  updateOrderTransitionSetting,
  WorkflowStatusSetting,
  WorkflowTransitionSetting
} from "@/src/api/workflowApi";
import {
  deleteAdminOrderShippingMethod,
  listAdminOrderShippingMethods,
  saveAdminOrderShippingMethod,
  toggleAdminOrderShippingMethod,
  type OrderShippingMethod,
  type OrderShippingMethodPayload
} from "@/src/api/orderShippingMethodsApi";
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
  Sparkles,
  Plus,
  Settings,
  Trash2
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
  return_completed: { label: "Đã hoàn / đổi trả xong", bg: "bg-red-50 border-red-200", text: "text-red-700" },
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

const defaultOrderTransitions: Record<string, Array<{ to_status: string; label: string; danger?: boolean; requires_reason?: boolean }>> = {
  pending_confirmation: [
    { to_status: 'confirmed', label: 'Xác nhận đơn' },
    { to_status: 'cancelled', label: 'Hủy đơn', danger: true, requires_reason: true },
  ],
  confirmed: [
    { to_status: 'preparing', label: 'Chuẩn bị hàng' },
    { to_status: 'cancelled', label: 'Hủy đơn', danger: true, requires_reason: true },
  ],
  pending_payment: [
    { to_status: 'paid_or_cod', label: 'Đã thanh toán / COD' },
    { to_status: 'cancelled', label: 'Hủy đơn', danger: true, requires_reason: true },
  ],
  paid_or_cod: [
    { to_status: 'preparing', label: 'Chuẩn bị hàng' },
  ],
  preparing: [
    { to_status: 'awaiting_pickup_or_booking', label: 'Chờ lấy hàng / Đặt ship' },
  ],
  awaiting_pickup_or_booking: [
    { to_status: 'shipping', label: 'Đang giao' },
  ],
  shipping: [
    { to_status: 'delivered', label: 'Giao thành công' },
    { to_status: 'return_requested', label: 'Yêu cầu đổi / trả', requires_reason: true },
  ],
  delivered: [
    { to_status: 'completed', label: 'Hoàn tất' },
    { to_status: 'return_requested', label: 'Yêu cầu đổi / trả', requires_reason: true },
  ],
  return_requested: [
    { to_status: 'return_completed', label: 'Đã hoàn / đổi trả xong' },
  ],
  completed: [],
  cancelled: [],
  return_completed: [],
};

const defaultPaymentTransitions: Record<string, Array<{ to_status: string; label: string; danger?: boolean; requires_reason?: boolean }>> = {
  unpaid: [
    { to_status: 'paid', label: 'Đã thanh toán' },
    { to_status: 'cod', label: 'COD' },
    { to_status: 'payment_failed', label: 'Thanh toán lỗi', danger: true },
  ],
  cod: [
    { to_status: 'paid', label: 'Đã thanh toán' },
  ],
  paid: [
    { to_status: 'refunded', label: 'Hoàn tiền', danger: true, requires_reason: true },
  ],
  payment_failed: [
    { to_status: 'unpaid', label: 'Chưa thanh toán' },
  ],
  refunded: [],
};

const defaultShippingTransitions: Record<string, Array<{ to_status: string; label: string; danger?: boolean; requires_reason?: boolean }>> = {
  no_shipment: [
    { to_status: 'shipment_created', label: 'Tạo vận đơn' },
  ],
  shipment_created: [
    { to_status: 'picking_up', label: 'Đang lấy hàng' },
    { to_status: 'shipping', label: 'Đang giao' },
  ],
  picking_up: [
    { to_status: 'shipping', label: 'Đang giao' },
  ],
  shipping: [
    { to_status: 'delivered', label: 'Giao thành công' },
    { to_status: 'delivery_failed', label: 'Giao thất bại', danger: true, requires_reason: true },
  ],
  delivery_failed: [
    { to_status: 'shipping', label: 'Giao lại' },
    { to_status: 'returned', label: 'Hoàn hàng', danger: true, requires_reason: true },
  ],
  delivered: [],
  returned: [],
};

const defaultLoyaltyTransitions: Record<string, Array<{ to_status: string; label: string; danger?: boolean; requires_reason?: boolean }>> = {
  not_earned: [
    { to_status: 'pending_review', label: 'Chờ duyệt điểm' },
    { to_status: 'holding', label: 'Tạm giữ điểm' },
    { to_status: 'cancelled', label: 'Hủy điểm', danger: true, requires_reason: true },
  ],
  pending_review: [
    { to_status: 'credited', label: 'Cộng điểm' },
    { to_status: 'cancelled', label: 'Hủy điểm', danger: true, requires_reason: true },
  ],
  holding: [
    { to_status: 'credited', label: 'Cộng điểm' },
    { to_status: 'cancelled', label: 'Hủy điểm', danger: true, requires_reason: true },
  ],
  credited: [],
  redeemed: [],
  cancelled: [],
};

const getStatusLabel = (status: string, groupKey: string): string => {
  if (groupKey === "order") {
    return STATUS_MAP[status]?.label || status;
  }
  if (groupKey === "payment") {
    return PAYMENT_MAP[status]?.label || status;
  }
  if (groupKey === "shipping") {
    return SHIPPING_STATUS_MAP[status]?.label || status;
  }
  if (groupKey === "loyalty") {
    return LOYALTY_STATUS_MAP[status]?.label || status;
  }
  return status;
};

export function AdminOrdersPage() {
  const [activeMenu, setActiveMenu] = useState("Đơn hàng");
  const [activeTab, setActiveTab] = useState<"orders" | "statuses" | "shippingMethods">("orders");
  const [statusConfig, setStatusConfig] = useState<{
    statuses: WorkflowStatusSetting[];
    transitions: WorkflowTransitionSetting[];
  } | null>(null);
  const [isFetchingConfig, setIsFetchingConfig] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<OrderShippingMethod[]>([]);
  const [isFetchingShippingMethods, setIsFetchingShippingMethods] = useState(false);
  const [editingShippingMethod, setEditingShippingMethod] = useState<OrderShippingMethodPayload | null>(null);
  const [isSavingShippingMethod, setIsSavingShippingMethod] = useState(false);

  // Edit status modal state
  const [editingStatus, setEditingStatus] = useState<WorkflowStatusSetting | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Edit transition modal state
  const [editingTransition, setEditingTransition] = useState<WorkflowTransitionSetting | null>(null);
  const [isSavingTransition, setIsSavingTransition] = useState(false);

  const fetchStatusConfig = async () => {
    setIsFetchingConfig(true);
    try {
      const res = await getOrderStatusConfig();
      if (res.success) {
        setStatusConfig(res.data);
      }
    } catch (e) {
      console.error("Lỗi lấy cấu hình trạng thái", e);
    } finally {
      setIsFetchingConfig(false);
    }
  };

  const fetchShippingMethods = async () => {
    setIsFetchingShippingMethods(true);
    try {
      const res = await listAdminOrderShippingMethods();
      if (res.success) {
        setShippingMethods(res.data);
      }
    } catch (e: any) {
      toast.error(e.message || "Không tải được cấu hình phương thức giao hàng.");
    } finally {
      setIsFetchingShippingMethods(false);
    }
  };

  useEffect(() => {
    fetchStatusConfig();
    fetchShippingMethods();
  }, []);

  const startCreateShippingMethod = () => {
    setEditingShippingMethod({
      methodKey: "",
      name: "",
      description: "",
      fee: 0,
      isActive: true,
      sortOrder: (shippingMethods.length + 1) * 10,
    });
  };

  const startEditShippingMethod = (method: OrderShippingMethod) => {
    setEditingShippingMethod({
      id: method.id,
      methodKey: method.methodKey,
      name: method.name,
      description: method.description || "",
      fee: method.fee,
      isActive: method.isActive,
      sortOrder: method.sortOrder,
    });
  };

  const handleSaveShippingMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShippingMethod) return;

    setIsSavingShippingMethod(true);
    try {
      const res = await saveAdminOrderShippingMethod({
        ...editingShippingMethod,
        methodKey: editingShippingMethod.methodKey.trim(),
        name: editingShippingMethod.name.trim(),
        description: editingShippingMethod.description?.trim() || "",
        fee: Number(editingShippingMethod.fee || 0),
        sortOrder: Number(editingShippingMethod.sortOrder || 0),
      });
      if (res.success) {
        toast.success(res.message || "Đã lưu phương thức giao hàng.");
        setEditingShippingMethod(null);
        fetchShippingMethods();
      }
    } catch (err: any) {
      toast.error(err.message || "Không lưu được phương thức giao hàng.");
    } finally {
      setIsSavingShippingMethod(false);
    }
  };

  const handleToggleShippingMethod = async (method: OrderShippingMethod) => {
    try {
      const res = await toggleAdminOrderShippingMethod(method.id, !method.isActive);
      toast.success(res.message || "Đã cập nhật trạng thái phương thức giao hàng.");
      fetchShippingMethods();
    } catch (err: any) {
      toast.error(err.message || "Không cập nhật được phương thức giao hàng.");
    }
  };

  const handleDeleteShippingMethod = async (method: OrderShippingMethod) => {
    const confirmed = window.confirm(`Xóa phương thức "${method.name}"? Chỉ xóa được khi chưa có đơn nào sử dụng.`);
    if (!confirmed) return;

    try {
      const res = await deleteAdminOrderShippingMethod(method.id);
      toast.success(res.message || "Đã xóa phương thức giao hàng.");
      fetchShippingMethods();
    } catch (err: any) {
      toast.error(err.message || "Không xóa được phương thức giao hàng.");
    }
  };

  const getShippingMethodName = (methodKey?: string | null) => {
    const key = methodKey || "";
    return shippingMethods.find((method) => method.methodKey === key)?.name || SHIPPING_METHOD_MAP[key] || key || "Chưa chọn";
  };

  const getStatusLabel = (status: string, groupKey: string): string => {
    if (statusConfig && statusConfig.statuses) {
      const matched = statusConfig.statuses.find(
        (s) => s.group_key === groupKey && s.status_key === status
      );
      if (matched) return matched.label;
    }
    if (groupKey === "order") {
      return STATUS_MAP[status]?.label || status;
    }
    if (groupKey === "payment") {
      return PAYMENT_MAP[status]?.label || status;
    }
    if (groupKey === "shipping") {
      return SHIPPING_STATUS_MAP[status]?.label || status;
    }
    if (groupKey === "loyalty") {
      return LOYALTY_STATUS_MAP[status]?.label || status;
    }
    return status;
  };

  const getDynamicStatusBadge = (statusKey: string, groupKey: string = "order", fallbackLabel: string = "") => {
    if (statusConfig && statusConfig.statuses) {
      const matched = statusConfig.statuses.find(
        (s) => s.group_key === groupKey && s.status_key === statusKey
      );
      if (matched) {
        const label = matched.label;
        const color = matched.color;
        if (color && color.startsWith("#")) {
          return {
            label,
            style: {
              backgroundColor: color + "15",
              borderColor: color + "30",
              color: color,
            },
            className: "inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-black whitespace-nowrap",
          };
        }
      }
    }

    // Fallbacks
    if (groupKey === "payment") {
      const payMap = PAYMENT_MAP[statusKey] || { label: statusKey, color: "text-gray-700", bg: "bg-gray-50 border-gray-250" };
      return {
        label: payMap.label,
        className: `inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-black whitespace-nowrap ${payMap.bg} ${payMap.color}`,
        style: undefined
      };
    } else if (groupKey === "shipping") {
      const shipMap = SHIPPING_STATUS_MAP[statusKey] || { label: statusKey, bg: "bg-gray-50 border-gray-250", text: "text-gray-700" };
      return {
        label: shipMap.label,
        className: `inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-black whitespace-nowrap ${shipMap.bg} ${shipMap.text}`,
        style: undefined
      };
    } else if (groupKey === "loyalty") {
      const loyalMap = LOYALTY_STATUS_MAP[statusKey] || { label: statusKey, bg: "bg-gray-50 border-gray-250", text: "text-gray-700" };
      return {
        label: loyalMap.label,
        className: `inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-black whitespace-nowrap ${loyalMap.bg} ${loyalMap.text}`,
        style: undefined
      };
    }

    const statMap = STATUS_MAP[statusKey] || { label: fallbackLabel || statusKey, bg: "bg-gray-50 border-gray-250", text: "text-gray-750" };
    return {
      label: statMap.label,
      className: `inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-black whitespace-nowrap ${statMap.bg} ${statMap.text}`,
      style: undefined
    };
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return true;
  });

  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
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
  const [pageSize, setPageSize] = useState(5);

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

  const translateBackendError = (errMsg: string, groupKey: string = "order"): string => {
    if (!errMsg) return "Lỗi cập nhật trạng thái.";

    // Check if it is a terminal state error
    if (errMsg.includes("terminal state") || errMsg.includes("trạng thái cuối cùng")) {
      return "Đơn hàng đã ở trạng thái cuối, không thể chuyển tiếp.";
    }

    // Check if it is a transition error:
    // "Quy trình chuyển đổi trạng thái order từ 'delivered' sang 'return_requested' không được phép."
    const match = errMsg.match(/Quy trình chuyển đổi trạng thái (\w+) từ '([\w_]+)' sang '([\w_]+)' không được phép/);
    if (match) {
      const group = match[1];
      const fromStatus = match[2];
      const toStatus = match[3];
      const fromLabel = getStatusLabel(fromStatus, group);
      const toLabel = getStatusLabel(toStatus, group);
      return `Không thể chuyển từ '${fromLabel}' sang '${toLabel}'. Vui lòng kiểm tra lại quy trình đơn hàng.`;
    }

    return errMsg;
  };

  const getTransitionsForGroup = (groupKey: "order" | "payment" | "shipping" | "loyalty", currentStatus: string): any[] => {
    // 1. Check if backend transitions exist and have items for this group
    if (allowedTransitions && allowedTransitions[groupKey] && allowedTransitions[groupKey].length > 0) {
      return allowedTransitions[groupKey].map((t: any) => ({
        to_status: t.to_status,
        label: t.label,
        to_status_label: t.to_status_label || getStatusLabel(t.to_status, groupKey),
        danger: t.danger === true || ["cancelled", "refunded", "return_completed", "delivery_failed", "returned"].includes(t.to_status) || (groupKey === "loyalty" && t.to_status === "cancelled"),
        requires_reason: t.requires_reason === 1 || ["cancelled", "refunded", "return_completed", "delivery_failed", "returned"].includes(t.to_status) || (groupKey === "loyalty" && t.to_status === "cancelled")
      }));
    }

    // 2. If allowedTransitions loaded but is empty for this group, check if it's terminal.
    // Do not show fallback actions for terminal statuses.
    const TERMINAL_STATUSES: Record<string, string[]> = {
      order: ["completed", "cancelled", "return_completed"],
      payment: ["paid", "refunded"],
      shipping: ["delivered", "returned"],
      loyalty: ["credited", "cancelled"],
    };

    const isTerminal = TERMINAL_STATUSES[groupKey]?.includes(currentStatus);

    // If allowedTransitions has been fetched and is empty, and the status is terminal, return empty.
    if (allowedTransitions && isTerminal) {
      return [];
    }

    // 3. Fallback to frontend map if allowedTransitions is null (not loaded yet) OR if currentStatus is not terminal.
    let fallbackMap: any = {};
    if (groupKey === "order") fallbackMap = defaultOrderTransitions;
    else if (groupKey === "payment") fallbackMap = defaultPaymentTransitions;
    else if (groupKey === "shipping") fallbackMap = defaultShippingTransitions;
    else if (groupKey === "loyalty") fallbackMap = defaultLoyaltyTransitions;

    const fallbackItems = fallbackMap[currentStatus] || [];
    return fallbackItems.map((item: any) => ({
      to_status: item.to_status,
      label: item.label,
      to_status_label: getStatusLabel(item.to_status, groupKey),
      danger: item.danger || ["cancelled", "refunded", "return_completed", "delivery_failed", "returned"].includes(item.to_status) || (groupKey === "loyalty" && item.to_status === "cancelled"),
      requires_reason: item.requires_reason || ["cancelled", "refunded", "return_completed", "delivery_failed", "returned"].includes(item.to_status) || (groupKey === "loyalty" && item.to_status === "cancelled")
    }));
  };

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
        toast.error(translateBackendError(res.message, groupKey));
      }
    } catch (err: any) {
      toast.error(translateBackendError(err.message, groupKey));
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#DCEBFF] mb-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === "orders"
                  ? "border-[#0057E7] text-[#0057E7] bg-blue-50/10"
                  : "border-transparent text-gray-500 hover:text-[#0057E7] hover:bg-slate-50"
              } rounded-t-xl`}
            >
              Danh sách đơn hàng
            </button>
            <button
              onClick={() => setActiveTab("statuses")}
              className={`px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === "statuses"
                  ? "border-[#0057E7] text-[#0057E7] bg-blue-50/10"
                  : "border-transparent text-gray-500 hover:text-[#0057E7] hover:bg-slate-50"
              } rounded-t-xl`}
            >
              Cấu hình trạng thái
            </button>
            <button
              onClick={() => setActiveTab("shippingMethods")}
              className={`px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === "shippingMethods"
                  ? "border-[#0057E7] text-[#0057E7] bg-blue-50/10"
                  : "border-transparent text-gray-500 hover:text-[#0057E7] hover:bg-slate-50"
              } rounded-t-xl`}
            >
              Phương thức giao hàng
            </button>
          </div>

          {activeTab === "orders" ? (
            <>
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
                        <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                        <th className="px-6 py-4 whitespace-nowrap">Thanh toán</th>
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
                          const badge = getDynamicStatusBadge(order.order_status, "order", order.order_status);
                          const payBadge = getDynamicStatusBadge(order.payment_status, "payment", order.payment_status);
                          const shippingLabel = getShippingMethodName(order.shipping_method);
                          
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
                                <div>{PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method}</div>
                                <div className="mt-1 text-[11px] font-semibold text-[#64748B]">
                                  {shippingLabel}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-black text-[#0B1F3A]">
                                <div>{(parseFloat(order.total)).toLocaleString("vi-VN")}đ</div>
                                {(order.coupon_code || order.couponCode) && (
                                  <div className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200 mt-1 inline-block whitespace-nowrap" title={`Đã áp dụng mã ${order.coupon_code || order.couponCode}`}>
                                    Mã: {order.coupon_code || order.couponCode}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={badge.className} style={badge.style}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={payBadge.className} style={payBadge.style}>
                                  {payBadge.label}
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
                                  {(order.order_status === "pending" || order.order_status === "pending_confirmation") && (
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
                                          newStatus: "preparing",
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

                                  {/* Preparing actions */}
                                  {(order.order_status === "packing" || order.order_status === "preparing") && (
                                    <button
                                      onClick={() => {
                                        setConfirmState({
                                          isOpen: true,
                                          orderId: order.id,
                                          orderCode: order.order_code,
                                          newStatus: "awaiting_pickup_or_booking",
                                          title: "Chờ lấy hàng / Đặt ship?",
                                          description: "Nhân viên đã chuẩn bị xong, chuyển sang trạng thái chờ vận chuyển.",
                                          confirmLabel: "Chờ lấy hàng",
                                          hasTextarea: false
                                        });
                                        setConfirmText("");
                                      }}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition shadow-sm"
                                      title="Đặt ship / Chờ lấy"
                                    >
                                      <Package size={15} />
                                    </button>
                                  )}

                                  {/* Awaiting pickup actions */}
                                  {order.order_status === "awaiting_pickup_or_booking" && (
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
                                          newStatus: "delivered",
                                          title: "Xác nhận giao thành công?",
                                          description: "Khách hàng đã nhận được hàng thành công.",
                                          confirmLabel: "Giao thành công",
                                          hasTextarea: false
                                        });
                                        setConfirmText("");
                                      }}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition shadow-sm"
                                      title="Giao thành công"
                                    >
                                      <CheckCircle size={15} />
                                    </button>
                                  )}

                                  {/* Delivered actions */}
                                  {order.order_status === "delivered" && (
                                    <button
                                      onClick={() => {
                                        setConfirmState({
                                          isOpen: true,
                                          orderId: order.id,
                                          orderCode: order.order_code,
                                          newStatus: "completed",
                                          title: "Hoàn tất đơn hàng?",
                                          description: "Hệ thống sẽ trừ tồn kho thật và cộng điểm 3F Club.",
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

                                  {/* Return Completed */}
                                  {order.order_status === "return_completed" && (
                                    <button
                                      disabled
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                      title="Đơn hàng đã hoàn đổi trả"
                                    >
                                      <CheckCircle size={15} />
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
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>

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
                  </div>
                )}
              </div>
            </>
          ) : activeTab === "statuses" ? (
            <div className="space-y-6">
              {/* Summary Header */}
              <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-6 shadow-[0_8px_24px_rgba(6,43,95,0.04)]">
                <h2 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
                  <Layers size={18} className="text-[#0057E7]" />
                  Cấu hình trạng thái và luồng xử lý đơn hàng
                </h2>
                <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">
                  Thiết lập tên hiển thị, màu sắc của các trạng thái và các bước chuyển tiếp đơn hàng. Hệ thống tự động đồng bộ hóa các tùy chọn này với màn hình xử lý đơn hàng của nhân viên.
                </p>
              </div>

              {isFetchingConfig ? (
                <div className="text-center py-12 text-[#94A3B8] font-semibold bg-white rounded-[24px] border border-[#DCEBFF]">
                  Đang tải cấu hình trạng thái...
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Table 1: Trạng thái đơn hàng chính */}
                  <div className="rounded-[24px] border border-[#DCEBFF] bg-white overflow-hidden shadow-[0_8px_24px_rgba(6,43,95,0.04)] p-6 space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-sm font-black text-[#0B1F3A]">A. Trạng thái đơn hàng chính</h3>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Danh sách các trạng thái của vòng đời đơn hàng</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[12.5px]">
                        <thead>
                          <tr className="border-b border-[#EEF6FF] text-[#64748B] font-bold">
                            <th className="pb-3 w-16">Thứ tự</th>
                            <th className="pb-3">Tên trạng thái</th>
                            <th className="pb-3 w-28">Màu sắc</th>
                            <th className="pb-3 w-24">Trạng thái cuối</th>
                            <th className="pb-3 w-20">Đang dùng</th>
                            <th className="pb-3 text-right w-16">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EEF6FF]">
                          {statusConfig?.statuses?.map((st) => (
                            <tr key={st.id} className="hover:bg-slate-50/50 transition group">
                              <td className="py-3 font-semibold text-gray-500">{st.sort_order}</td>
                              <td className="py-3">
                                <div className="font-bold text-[#0B1F3A]">{st.label}</div>
                                <div className="text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  Mã hệ thống: {st.status_key}
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-1.5">
                                  <span 
                                    className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0" 
                                    style={{ backgroundColor: st.color || '#94A3B8' }}
                                  />
                                  <span className="font-mono text-[11px] text-gray-500">{st.color || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  st.is_terminal 
                                    ? "bg-slate-100 text-slate-700" 
                                    : "bg-blue-50 text-blue-600"
                                }`}>
                                  {st.is_terminal ? "Có" : "Không"}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  st.is_active 
                                    ? "bg-green-50 text-green-700" 
                                    : "bg-gray-100 text-gray-500"
                                }`}>
                                  {st.is_active ? "Bật" : "Tắt"}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => setEditingStatus(st)}
                                  className="px-2.5 py-1 bg-blue-50 text-[#0057E7] hover:bg-[#0057E7] hover:text-white rounded-lg font-bold transition text-xs"
                                >
                                  Sửa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Table 2: Luồng chuyển trạng thái đơn hàng chính */}
                  <div className="rounded-[24px] border border-[#DCEBFF] bg-white overflow-hidden shadow-[0_8px_24px_rgba(6,43,95,0.04)] p-6 space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-sm font-black text-[#0B1F3A]">B. Luồng chuyển trạng thái đơn hàng</h3>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Các bước chuyển đổi và nhãn nút bấm tương ứng</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[12.5px]">
                        <thead>
                          <tr className="border-b border-[#EEF6FF] text-[#64748B] font-bold">
                            <th className="pb-3">Từ trạng thái</th>
                            <th className="pb-3">Sang trạng thái</th>
                            <th className="pb-3">Nút hiển thị</th>
                            <th className="pb-3 w-28">Nhập lý do</th>
                            <th className="pb-3 w-20">Đang dùng</th>
                            <th className="pb-3 text-right w-16">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EEF6FF]">
                          {statusConfig?.transitions?.map((tr) => (
                            <tr key={tr.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-3 font-semibold text-gray-700">
                                {getStatusLabel(tr.from_status, "order")}
                              </td>
                              <td className="py-3 font-semibold text-gray-700">
                                {getStatusLabel(tr.to_status, "order")}
                              </td>
                              <td className="py-3">
                                <span className="font-bold text-[#0057E7]">{tr.label}</span>
                              </td>
                              <td className="py-3">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  tr.requires_reason 
                                    ? "bg-amber-50 text-amber-700" 
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                  {tr.requires_reason ? "Bắt buộc" : "Không"}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  tr.is_active 
                                    ? "bg-green-50 text-green-700" 
                                    : "bg-gray-100 text-gray-500"
                                }`}>
                                  {tr.is_active ? "Bật" : "Tắt"}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => setEditingTransition(tr)}
                                  className="px-2.5 py-1 bg-blue-50 text-[#0057E7] hover:bg-[#0057E7] hover:text-white rounded-lg font-bold transition text-xs"
                                >
                                  Sửa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sẽ cấu hình sau section */}
              <div className="rounded-[24px] border border-dashed border-[#DCEBFF] bg-slate-50/50 p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Các cấu hình nâng cao khác</h4>
                <p className="mt-1 text-xs text-gray-400 font-medium">
                  Cổng thanh toán, cấu hình nhà vận chuyển, automation rules, notification channels và loyalty points rules sẽ hỗ trợ tùy chỉnh trong phiên bản nâng cao tiếp theo.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-6 shadow-[0_8px_24px_rgba(6,43,95,0.04)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
                      <Settings size={18} className="text-[#0057E7]" />
                      Cấu hình phương thức giao hàng
                    </h2>
                    <p className="mt-1.5 max-w-3xl text-xs text-[#64748B] leading-relaxed">
                      Các phương thức đang bật sẽ hiển thị ở trang giỏ hàng. Phí giao hàng tại đây sẽ được dùng để tính tổng tiền khi khách đặt đơn.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCreateShippingMethod}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0057E7] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#003B7A]"
                  >
                    <Plus size={15} />
                    Thêm phương thức
                  </button>
                </div>
              </div>

              {editingShippingMethod && (
                <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-6 shadow-[0_8px_24px_rgba(6,43,95,0.04)]">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#EEF6FF] pb-3">
                    <div>
                      <h3 className="text-sm font-black text-[#0B1F3A]">
                        {editingShippingMethod.id ? "Sửa phương thức giao hàng" : "Thêm phương thức giao hàng"}
                      </h3>
                      <p className="mt-0.5 text-[11px] font-semibold text-[#94A3B8]">
                        Mã phương thức dùng để lưu vào đơn hàng, không nên đổi khi đã có đơn sử dụng.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingShippingMethod(null)}
                      className="rounded-xl border border-[#DCEBFF] px-3 py-2 text-xs font-bold text-[#64748B] hover:bg-slate-50"
                    >
                      Đóng
                    </button>
                  </div>

                  <form onSubmit={handleSaveShippingMethod} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-3">
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Mã phương thức</label>
                      <input
                        required
                        value={editingShippingMethod.methodKey}
                        onChange={(e) => setEditingShippingMethod({ ...editingShippingMethod, methodKey: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                        placeholder="express"
                        className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Tên hiển thị</label>
                      <input
                        required
                        value={editingShippingMethod.name}
                        onChange={(e) => setEditingShippingMethod({ ...editingShippingMethod, name: e.target.value })}
                        placeholder="Giao hàng hỏa tốc"
                        className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Phí giao hàng</label>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={editingShippingMethod.fee}
                        onChange={(e) => setEditingShippingMethod({ ...editingShippingMethod, fee: Number(e.target.value) })}
                        className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Thứ tự</label>
                      <input
                        type="number"
                        value={editingShippingMethod.sortOrder}
                        onChange={(e) => setEditingShippingMethod({ ...editingShippingMethod, sortOrder: Number(e.target.value) })}
                        className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="lg:col-span-10">
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Mô tả</label>
                      <input
                        value={editingShippingMethod.description || ""}
                        onChange={(e) => setEditingShippingMethod({ ...editingShippingMethod, description: e.target.value })}
                        placeholder="Nhận hàng trong 2 giờ. Chỉ áp dụng khu vực TP.HCM"
                        className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[13px] font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <label className="flex items-center gap-2 rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-xs font-bold text-[#0B1F3A] lg:col-span-2">
                      <input
                        type="checkbox"
                        checked={editingShippingMethod.isActive}
                        onChange={(e) => setEditingShippingMethod({ ...editingShippingMethod, isActive: e.target.checked })}
                        className="h-4 w-4 accent-[#0057E7]"
                      />
                      Đang bật
                    </label>
                    <div className="flex justify-end gap-3 lg:col-span-12">
                      <button
                        type="button"
                        onClick={() => setEditingShippingMethod(null)}
                        className="rounded-xl border border-[#DCEBFF] px-4 py-2.5 text-xs font-bold text-[#64748B] hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingShippingMethod}
                        className="rounded-xl bg-[#0057E7] px-5 py-2.5 text-xs font-black text-white transition hover:bg-[#003B7A] disabled:opacity-50"
                      >
                        {isSavingShippingMethod ? "Đang lưu..." : "Lưu phương thức"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.04)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-[#EEF6FF] px-6 py-4">
                  <div>
                    <h3 className="text-sm font-black text-[#0B1F3A]">Danh sách phương thức</h3>
                    <p className="mt-0.5 text-[11px] font-semibold text-[#94A3B8]">
                      Hiển thị {shippingMethods.length} phương thức giao hàng
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchShippingMethods}
                    className="rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-3 py-2 text-xs font-bold text-[#0057E7] hover:bg-white"
                  >
                    Tải lại
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[#EEF6FF] bg-slate-50 text-[#64748B]">
                        <th className="px-6 py-4 font-bold">Phương thức</th>
                        <th className="px-6 py-4 font-bold">Mô tả</th>
                        <th className="px-6 py-4 font-bold">Phí</th>
                        <th className="px-6 py-4 font-bold">Thứ tự</th>
                        <th className="px-6 py-4 font-bold">Trạng thái</th>
                        <th className="px-6 py-4 text-right font-bold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF6FF]">
                      {isFetchingShippingMethods ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-sm font-bold text-[#94A3B8]">
                            Đang tải phương thức giao hàng...
                          </td>
                        </tr>
                      ) : shippingMethods.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-sm font-bold text-[#94A3B8]">
                            Chưa có phương thức giao hàng nào.
                          </td>
                        </tr>
                      ) : (
                        shippingMethods.map((method) => (
                          <tr key={method.id} className="hover:bg-slate-50/60">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#0057E7]">
                                  <Truck size={18} />
                                </div>
                                <div>
                                  <div className="font-black text-[#0B1F3A]">{method.name}</div>
                                  <div className="font-mono text-[11px] font-bold text-[#94A3B8]">{method.methodKey}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 max-w-md text-xs font-semibold leading-relaxed text-[#64748B]">
                              {method.description || "Chưa có mô tả"}
                            </td>
                            <td className="px-6 py-4 font-black text-[#0B1F3A]">
                              {method.fee > 0 ? `${method.fee.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                            </td>
                            <td className="px-6 py-4 font-bold text-[#64748B]">{method.sortOrder}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${
                                method.isActive
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : "border-slate-200 bg-slate-100 text-slate-500"
                              }`}>
                                {method.isActive ? "Đang bật" : "Đã tắt"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditShippingMethod(method)}
                                  className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-[#0057E7] transition hover:bg-[#0057E7] hover:text-white"
                                >
                                  Sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleShippingMethod(method)}
                                  className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                                    method.isActive
                                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                      : "bg-green-50 text-green-700 hover:bg-green-100"
                                  }`}
                                >
                                  {method.isActive ? "Tắt" : "Bật"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteShippingMethod(method)}
                                  className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                                  title="Xóa phương thức"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Order Details Slide-over Modal / Drawer */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-sm transition-opacity animate-fade-in"
              onClick={() => setSelectedOrder(null)}
            />

            {/* Content Modal */}
            <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#dcebff] shadow-[0_25px_60px_rgba(6,43,95,0.15)] flex flex-col max-h-[90vh] overflow-hidden z-10 animate-fade-in">
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
                          <span className="font-black tracking-wide uppercase">{getShippingMethodName(selectedOrder.shipping_method || "express")}</span>
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
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 pb-3 gap-2 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái đơn hàng</div>
                            <div>
                              {(() => {
                                const badge = getDynamicStatusBadge(selectedOrder.order_status, "order", selectedOrder.order_status);
                                return (
                                  <span className={badge.className} style={badge.style}>
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {(() => {
                              const transitions = getTransitionsForGroup("order", selectedOrder.order_status);
                              if (transitions.length > 0) {
                                return transitions.map((t: any) => (
                                  <button
                                    key={t.to_status}
                                    onClick={() => {
                                      setConfirmState({
                                        isOpen: true,
                                        orderId: selectedOrder.id,
                                        orderCode: selectedOrder.order_code,
                                        newStatus: t.to_status,
                                        groupKey: "order",
                                        title: "Xác nhận thao tác",
                                        description: `Bạn muốn chuyển đơn hàng từ "${getStatusLabel(selectedOrder.order_status, "order")}" sang "${t.to_status_label}"?`,
                                        confirmLabel: t.label,
                                        hasTextarea: t.requires_reason === true,
                                        textareaLabel: "Lý do thay đổi",
                                        textareaPlaceholder: "Nhập lý do thực hiện..."
                                      });
                                      setConfirmText("");
                                    }}
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                                      t.danger
                                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ));
                              } else {
                                return <span className="text-[11px] font-semibold text-gray-400 italic">Chưa có thao tác tiếp theo</span>;
                              }
                            })()}
                          </div>
                        </div>

                        {/* Dimensions 2: Payment Status */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 pb-3 gap-2 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái thanh toán</div>
                            <div>
                              {(() => {
                                const badge = getDynamicStatusBadge(selectedOrder.payment_status, "payment", selectedOrder.payment_status);
                                return (
                                  <span className={badge.className} style={badge.style}>
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {(() => {
                              const transitions = getTransitionsForGroup("payment", selectedOrder.payment_status);
                              if (transitions.length > 0) {
                                return transitions.map((t: any) => (
                                  <button
                                    key={t.to_status}
                                    onClick={() => {
                                      setConfirmState({
                                        isOpen: true,
                                        orderId: selectedOrder.id,
                                        orderCode: selectedOrder.order_code,
                                        newStatus: t.to_status,
                                        groupKey: "payment",
                                        title: "Xác nhận thao tác",
                                        description: `Bạn muốn chuyển trạng thái thanh toán từ "${getStatusLabel(selectedOrder.payment_status, "payment")}" sang "${t.to_status_label}"?`,
                                        confirmLabel: t.label,
                                        hasTextarea: t.requires_reason === true,
                                        textareaLabel: "Lý do thay đổi",
                                        textareaPlaceholder: "Nhập lý do thực hiện..."
                                      });
                                      setConfirmText("");
                                    }}
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                                      t.danger
                                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ));
                              } else {
                                return <span className="text-[11px] font-semibold text-gray-400 italic">Chưa có thao tác tiếp theo</span>;
                              }
                            })()}
                          </div>
                        </div>

                        {/* Dimensions 3: Shipping Status */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 pb-3 gap-2 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái vận chuyển</div>
                            <div>
                              {(() => {
                                const badge = getDynamicStatusBadge(selectedOrder.shipping_status || "no_shipment", "shipping", "Chưa tạo vận đơn");
                                return (
                                  <span className={badge.className} style={badge.style}>
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {(() => {
                              const transitions = getTransitionsForGroup("shipping", selectedOrder.shipping_status || "no_shipment");
                              if (transitions.length > 0) {
                                return transitions.map((t: any) => (
                                  <button
                                    key={t.to_status}
                                    onClick={() => {
                                      setConfirmState({
                                        isOpen: true,
                                        orderId: selectedOrder.id,
                                        orderCode: selectedOrder.order_code,
                                        newStatus: t.to_status,
                                        groupKey: "shipping",
                                        title: "Xác nhận thao tác",
                                        description: `Bạn muốn chuyển trạng thái vận chuyển từ "${getStatusLabel(selectedOrder.shipping_status || "no_shipment", "shipping")}" sang "${t.to_status_label}"?`,
                                        confirmLabel: t.label,
                                        hasTextarea: t.requires_reason === true,
                                        textareaLabel: "Lý do thay đổi",
                                        textareaPlaceholder: "Nhập lý do thực hiện..."
                                      });
                                      setConfirmText("");
                                    }}
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                                      t.danger
                                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ));
                              } else {
                                return <span className="text-[11px] font-semibold text-gray-400 italic">Chưa có thao tác tiếp theo</span>;
                              }
                            })()}
                          </div>
                        </div>

                        {/* Dimensions 4: Loyalty Status */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 pb-3 gap-2 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái tích điểm</div>
                            <div>
                              {(() => {
                                const badge = getDynamicStatusBadge(selectedOrder.loyalty_status || "not_earned", "loyalty", "Chưa tích điểm");
                                return (
                                  <span className={badge.className} style={badge.style}>
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {(() => {
                              const transitions = getTransitionsForGroup("loyalty", selectedOrder.loyalty_status || "not_earned");
                              if (transitions.length > 0) {
                                return transitions.map((t: any) => (
                                  <button
                                    key={t.to_status}
                                    onClick={() => {
                                      setConfirmState({
                                        isOpen: true,
                                        orderId: selectedOrder.id,
                                        orderCode: selectedOrder.order_code,
                                        newStatus: t.to_status,
                                        groupKey: "loyalty",
                                        title: "Xác nhận thao tác",
                                        description: `Bạn muốn chuyển trạng thái tích điểm từ "${getStatusLabel(selectedOrder.loyalty_status || "not_earned", "loyalty")}" sang "${t.to_status_label}"?`,
                                        confirmLabel: t.label,
                                        hasTextarea: t.requires_reason === true,
                                        textareaLabel: "Lý do thay đổi",
                                        textareaPlaceholder: "Nhập lý do thực hiện..."
                                      });
                                      setConfirmText("");
                                    }}
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                                      t.danger
                                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ));
                              } else {
                                return <span className="text-[11px] font-semibold text-gray-400 italic">Chưa có thao tác tiếp theo</span>;
                              }
                            })()}
                          </div>
                        </div>

                      </div>

                      {/* Display points summary */}
                      {(() => {
                        const status = selectedOrder.order_status;
                        const points = selectedOrder.loyalty_points_earned || Math.floor(parseFloat(selectedOrder.total) / 200);
                        
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
                  <div className="max-h-[240px] overflow-y-auto pr-1 admin-scrollbar">
                    <div className="pl-6 border-l-2 border-slate-100 ml-4 space-y-4 text-xs relative mr-2">
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
                    const badge = getDynamicStatusBadge(selectedOrder.order_status, "order", selectedOrder.order_status);
                    return (
                      <span className={badge.className} style={badge.style}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Right side: action buttons based on allowed transitions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Message for terminal / finished states */}
                  {(() => {
                    if (selectedOrder.order_status === "completed") {
                      return <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5 mr-2">Đơn hàng đã hoàn tất</span>;
                    }
                    if (selectedOrder.order_status === "cancelled") {
                      return <span className="text-xs font-semibold text-gray-500 bg-gray-100 border border-slate-200 rounded-lg px-2.5 py-1.5 mr-2">Đơn hàng đã hủy</span>;
                    }
                    if (selectedOrder.order_status === "return_completed") {
                      return <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 mr-2">Đơn hàng đã hoàn tất đổi trả</span>;
                    }
                    return null;
                  })()}

                  {/* Secondary Close Button */}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 transition border border-[#DCEBFF]"
                  >
                    Đóng
                  </button>

                  {/* Main next action buttons */}
                  {(() => {
                    const TERMINAL_STATUSES = ["completed", "cancelled", "return_completed"];
                    if (TERMINAL_STATUSES.includes(selectedOrder.order_status)) {
                      return null;
                    }

                    const orderTransitions = getTransitionsForGroup("order", selectedOrder.order_status);
                    if (orderTransitions.length > 0) {
                      return orderTransitions.map((t: any) => (
                        <button
                          key={t.to_status}
                          onClick={() => {
                            setConfirmState({
                              isOpen: true,
                              orderId: selectedOrder.id,
                              orderCode: selectedOrder.order_code,
                              newStatus: t.to_status,
                              groupKey: "order",
                              title: "Xác nhận thao tác",
                              description: `Bạn muốn chuyển đơn hàng từ "${getStatusLabel(selectedOrder.order_status, "order")}" sang "${t.to_status_label}"?`,
                              confirmLabel: t.label,
                              hasTextarea: t.requires_reason === true,
                              textareaLabel: "Lý do thay đổi",
                              textareaPlaceholder: "Nhập lý do thực hiện..."
                            });
                            setConfirmText("");
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                            t.danger
                              ? "border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
                              : "bg-[#0057E7] hover:bg-[#003b7a] text-white shadow-sm"
                          }`}
                        >
                          {t.label}
                        </button>
                      ));
                    } else {
                      return (
                        <span className="text-xs font-semibold text-gray-400 italic bg-gray-50 border border-slate-100 rounded-lg px-2.5 py-2">
                          Chưa có thao tác tiếp theo
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
                <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-[#0057E7] shrink-0">
                  <AlertCircle size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-[#0b1f3a] leading-tight">
                    Xác nhận thao tác
                  </h3>
                  <p className="mt-1.5 text-[12.5px] text-[#64748b] leading-relaxed">
                    {confirmState.description}
                  </p>
                </div>
              </div>

              {(() => {
                const isDangerous = ["cancelled", "refunded", "return_completed", "delivery_failed", "returned"].includes(confirmState.newStatus) ||
                  (confirmState.groupKey === "loyalty" && confirmState.newStatus === "cancelled");
                const isReasonRequired = isDangerous || confirmState.hasTextarea;
                
                return (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B]">
                        {isReasonRequired ? "Lý do thay đổi" : "Ghi chú nội bộ"} {isReasonRequired ? <span className="text-red-500 font-extrabold">* (Bắt buộc)</span> : <span className="text-gray-400 font-normal text-[10px]">(Không bắt buộc)</span>}
                      </label>
                      <textarea
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={isReasonRequired ? "Bắt buộc nhập lý do cho hành động này..." : "Nhập ghi chú nội bộ (nếu có)..."}
                        rows={3}
                        className="w-full rounded-2xl border border-[#dcebff] bg-[#f6faff] px-4 py-3 text-[13px] font-semibold text-[#0b1f3a] placeholder:text-[#94a3b8] focus:border-[#0057e7] focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmState(null)}
                        className="flex-1 py-2.5 border border-[#dcebff] text-[13px] font-bold text-[#64748b] hover:bg-slate-50 rounded-xl transition"
                      >
                        Hủy
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

      {/* Edit Status Modal Dialog */}
      {editingStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => setEditingStatus(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#dcebff] shadow-[0_20px_50px_rgba(6,43,95,0.15)] p-6 space-y-4 z-10 animate-fade-in">
            <h3 className="text-base font-black text-[#0b1f3a] border-b pb-2">Cập nhật Trạng thái</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSavingStatus(true);
              try {
                if (Number(editingStatus.is_active) === 0 && statusConfig?.transitions) {
                  const hasActiveTransition = statusConfig.transitions.some(
                    t => t.is_active === 1 && (t.from_status === editingStatus.status_key || t.to_status === editingStatus.status_key)
                  );
                  if (hasActiveTransition) {
                    toast.error("Trạng thái này đang được dùng trong luồng chuyển trạng thái. Vui lòng tắt các bước chuyển liên quan trước.");
                    setIsSavingStatus(false);
                    return;
                  }
                }
                const res = await updateOrderStatusSetting(editingStatus.id!, {
                  label: editingStatus.label,
                  color: editingStatus.color,
                  sort_order: Number(editingStatus.sort_order),
                  is_active: Number(editingStatus.is_active)
                });
                if (res.success) {
                  toast.success("Cập nhật trạng thái thành công!");
                  setEditingStatus(null);
                  fetchStatusConfig();
                } else {
                  toast.error(res.message || "Lỗi cập nhật trạng thái.");
                }
              } catch (err: any) {
                toast.error(err.message || "Lỗi kết nối.");
              } finally {
                setIsSavingStatus(false);
              }
            }} className="space-y-4 text-xs font-bold text-gray-750">
              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#64748B]">Mã hệ thống (không thể sửa)</label>
                <input
                  type="text"
                  disabled
                  value={editingStatus.status_key}
                  className="w-full rounded-xl border border-[#DCEBFF] bg-slate-100 px-4 py-2.5 text-[#0B1F3A] cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 font-normal">
                  Mã này dùng nội bộ để đồng bộ đơn hàng, không thể chỉnh sửa.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#64748B]">Tên hiển thị <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingStatus.label}
                  onChange={(e) => setEditingStatus({ ...editingStatus, label: e.target.value })}
                  className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#64748B]">Màu sắc (Hex code) <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editingStatus.color || "#0057E7"}
                    onChange={(e) => setEditingStatus({ ...editingStatus, color: e.target.value })}
                    className="h-[38px] w-[38px] rounded-lg border border-[#DCEBFF] cursor-pointer bg-white p-1"
                  />
                  <input
                    type="text"
                    required
                    value={editingStatus.color || ""}
                    onChange={(e) => setEditingStatus({ ...editingStatus, color: e.target.value })}
                    placeholder="#HEX"
                    className="flex-1 rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2 text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#64748B]">Thứ tự sắp xếp</label>
                <input
                  type="number"
                  value={editingStatus.sort_order}
                  onChange={(e) => setEditingStatus({ ...editingStatus, sort_order: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2 text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                />
              </div>

              {/* is_active checkbox, disabled for critical system keys */}
              {(() => {
                const isCriticalStatus = [
                  "pending_confirmation",
                  "confirmed",
                  "preparing",
                  "shipping",
                  "delivered",
                  "completed",
                  "return_requested",
                  "return_completed",
                  "cancelled"
                ].includes(editingStatus.status_key);

                const hasActiveTrans = statusConfig?.transitions?.some(
                  t => t.is_active === 1 && (t.from_status === editingStatus.status_key || t.to_status === editingStatus.status_key)
                ) || false;

                const cannotDeactivate = isCriticalStatus || hasActiveTrans;

                return (
                  <div className="flex flex-col gap-1.5 py-2 bg-slate-50 px-3 rounded-xl border border-[#DCEBFF]">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active_st"
                        disabled={cannotDeactivate}
                        checked={editingStatus.is_active === 1}
                        onChange={(e) => setEditingStatus({ ...editingStatus, is_active: e.target.checked ? 1 : 0 })}
                        className="h-4 w-4 text-[#0057E7] rounded border-gray-300 focus:ring-[#0057E7] cursor-pointer disabled:cursor-not-allowed"
                      />
                      <label htmlFor="is_active_st" className={`text-xs font-semibold cursor-pointer ${cannotDeactivate ? 'text-gray-400 cursor-not-allowed' : 'text-[#0B1F3A]'}`}>
                        Bật trạng thái sử dụng
                      </label>
                    </div>
                    {cannotDeactivate && (
                      <p className="text-[10px] text-amber-600 font-normal leading-relaxed">
                        Trạng thái này đang được dùng trong quy trình đơn hàng nên không thể tắt.
                      </p>
                    )}
                  </div>
                );
              })()}

              {(() => {
                const isValidHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(editingStatus.color || "");
                const isValidLabel = (editingStatus.label || "").trim().length > 0;
                const isValidSortOrder = !isNaN(Number(editingStatus.sort_order));
                const isFormInvalid = !isValidHex || !isValidLabel || !isValidSortOrder;

                return (
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingStatus(null)}
                      className="flex-1 py-2.5 border border-[#dcebff] text-[13px] font-bold text-[#64748b] hover:bg-slate-50 rounded-xl transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingStatus || isFormInvalid}
                      className="flex-1 py-2.5 text-[13px] font-bold text-white bg-[#0057e7] hover:bg-[#003b7a] rounded-xl transition disabled:opacity-50"
                    >
                      {isSavingStatus ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                );
              })()}
            </form>
          </div>
        </div>
      )}

      {/* Edit Transition Modal Dialog */}
      {editingTransition && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => setEditingTransition(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#dcebff] shadow-[0_20px_50px_rgba(6,43,95,0.15)] p-6 space-y-4 z-10 animate-fade-in">
            <h3 className="text-base font-black text-[#0b1f3a] border-b pb-2">Cập nhật Bước chuyển</h3>

            <form onSubmit={async (e) => {
              e.preventDefault();

              // Safety check: warning before disabling a critical transition
              if (editingTransition.is_active === 0) {
                const isCritical = [
                  { from: "pending_confirmation", to: "confirmed" },
                  { from: "confirmed", to: "preparing" },
                  { from: "preparing", to: "awaiting_pickup_or_booking" },
                  { from: "awaiting_pickup_or_booking", to: "shipping" },
                  { from: "shipping", to: "delivered" },
                  { from: "delivered", to: "completed" }
                ].some(c => c.from === editingTransition.from_status && c.to === editingTransition.to_status);
                
                if (isCritical) {
                  const confirmDisable = window.confirm(
                    "Tắt bước chuyển này có thể làm nhân viên không xử lý tiếp được đơn ở trạng thái liên quan. Bạn chắc chắn muốn tắt?"
                  );
                  if (!confirmDisable) {
                    return;
                  }
                }
              }

              setIsSavingTransition(true);
              try {
                const isDanger = [
                  { from: "pending_confirmation", to: "cancelled" },
                  { from: "delivered", to: "return_requested" },
                  { from: "return_requested", to: "return_completed" }
                ].some(c => c.from === editingTransition.from_status && c.to === editingTransition.to_status);

                const requiresReasonVal = isDanger ? 1 : Number(editingTransition.requires_reason);

                const res = await updateOrderTransitionSetting(editingTransition.id!, {
                  label: editingTransition.label,
                  requires_reason: requiresReasonVal,
                  is_active: Number(editingTransition.is_active),
                  sort_order: Number(editingTransition.sort_order)
                });
                if (res.success) {
                  toast.success("Cập nhật bước chuyển thành công!");
                  setEditingTransition(null);
                  fetchStatusConfig();
                } else {
                  toast.error(res.message || "Lỗi cập nhật bước chuyển.");
                }
              } catch (err: any) {
                toast.error(err.message || "Lỗi kết nối.");
              } finally {
                setIsSavingTransition(false);
              }
            }} className="space-y-4 text-xs font-bold text-gray-750">
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[#0B1F3A] font-semibold">
                <div className="flex justify-between">
                  <span className="text-gray-400">Từ trạng thái:</span>
                  <span>{getStatusLabel(editingTransition.from_status, "order")}</span>
                </div>
                <div className="flex justify-between mt-1 border-t pt-1">
                  <span className="text-gray-400">Sang trạng thái:</span>
                  <span>{getStatusLabel(editingTransition.to_status, "order")}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#64748B]">Tên nút hiển thị <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingTransition.label}
                  onChange={(e) => setEditingTransition({ ...editingTransition, label: e.target.value })}
                  className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#64748B]">Thứ tự</label>
                <input
                  type="number"
                  value={editingTransition.sort_order}
                  onChange={(e) => setEditingTransition({ ...editingTransition, sort_order: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                />
              </div>

              {(() => {
                const isDangerTransition = [
                  { from: "pending_confirmation", to: "cancelled" },
                  { from: "delivered", to: "return_requested" },
                  { from: "return_requested", to: "return_completed" }
                ].some(c => c.from === editingTransition.from_status && c.to === editingTransition.to_status);

                return (
                  <div className="flex flex-col gap-1.5 py-2 px-3 bg-slate-50 border border-[#DCEBFF] rounded-xl">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="requires_reason_tr"
                        disabled={isDangerTransition}
                        checked={isDangerTransition ? true : editingTransition.requires_reason === 1}
                        onChange={(e) => setEditingTransition({ ...editingTransition, requires_reason: e.target.checked ? 1 : 0 })}
                        className="h-4 w-4 text-[#0057E7] rounded border-gray-300 focus:ring-[#0057E7] cursor-pointer disabled:cursor-not-allowed"
                      />
                      <label htmlFor="requires_reason_tr" className={`text-xs font-semibold cursor-pointer ${isDangerTransition ? 'text-gray-400 cursor-not-allowed' : 'text-[#0B1F3A]'}`}>
                        Bắt buộc nhập lý do khi chuyển trạng thái
                      </label>
                    </div>
                    <p className="text-[10px] text-gray-400 font-normal leading-relaxed pl-6">
                      {isDangerTransition 
                        ? "Đây là bước chuyển đổi bắt buộc yêu cầu lý do." 
                        : "Nên bật với các thao tác như Hủy đơn, Hoàn tiền, Giao thất bại hoặc Đổi/trả."}
                    </p>
                  </div>
                );
              })()}

              <div className="flex items-center gap-2 py-1 px-3 bg-slate-50 border border-[#DCEBFF] rounded-xl">
                <input
                  type="checkbox"
                  id="is_active_tr"
                  checked={editingTransition.is_active === 1}
                  onChange={(e) => setEditingTransition({ ...editingTransition, is_active: e.target.checked ? 1 : 0 })}
                  className="h-4 w-4 text-[#0057E7] rounded border-gray-300 focus:ring-[#0057E7] cursor-pointer"
                />
                <label htmlFor="is_active_tr" className="text-xs font-semibold text-[#0B1F3A] cursor-pointer">
                  Đang sử dụng bước chuyển này
                </label>
              </div>

              {(() => {
                const isValidLabel = (editingTransition.label || "").trim().length > 0;
                const isValidSortOrder = !isNaN(Number(editingTransition.sort_order));
                const isFormInvalid = !isValidLabel || !isValidSortOrder;

                return (
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingTransition(null)}
                      className="flex-1 py-2.5 border border-[#dcebff] text-[13px] font-bold text-[#64748b] hover:bg-slate-50 rounded-xl transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingTransition || isFormInvalid}
                      className="flex-1 py-2.5 text-[13px] font-bold text-white bg-[#0057e7] hover:bg-[#003b7a] rounded-xl transition disabled:opacity-50"
                    >
                      {isSavingTransition ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                );
              })()}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
