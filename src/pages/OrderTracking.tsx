import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle2, Clock, MapPin, Package, Search, ShoppingBag, ShieldCheck, CreditCard, Award } from "lucide-react";
import { getOrderDetails, checkOrdersByPhone, OrderDetail } from "@/src/api/productsApi";
import { Image } from "@/components/Image";

// Status translation & color map
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Chờ xác nhận", color: "text-amber-600", bg: "bg-amber-50" },
  confirmed: { label: "Đã xác nhận", color: "text-blue-600", bg: "bg-blue-50" },
  packing: { label: "Đang đóng gói", color: "text-indigo-600", bg: "bg-indigo-50" },
  shipping: { label: "Đang giao hàng", color: "text-purple-600", bg: "bg-purple-50" },
  completed: { label: "Đã giao thành công", color: "text-forest", bg: "bg-forest/10" },
  cancelled: { label: "Đã hủy", color: "text-red-600", bg: "bg-red-50" },
  refunded: { label: "Đã hoàn tiền", color: "text-gray-600", bg: "bg-gray-100" },
};

const PAYMENT_MAP: Record<string, { label: string; color: string }> = {
  unpaid: { label: "Chưa thanh toán", color: "text-amber-600" },
  pending: { label: "Đang kiểm tra", color: "text-blue-600" },
  paid: { label: "Đã thanh toán", color: "text-forest" },
  failed: { label: "Thất bại", color: "text-red-600" },
  refunded: { label: "Đã hoàn tiền", color: "text-gray-600" },
};

export function OrderTracking() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [phoneQuery, setPhoneQuery] = useState(searchParams.get("phone") || "");
  const [ordersList, setOrdersList] = useState<OrderDetail[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderDetail | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If orderCode in URL, fetch immediately
  useEffect(() => {
    if (orderCode) {
      setIsLoading(true);
      setError(null);
      getOrderDetails(orderCode)
        .then((res) => {
          if (res.success) {
            setActiveOrder(res.data);
            setPhoneQuery(res.data.phone);
          } else {
            setError("Không tìm thấy thông tin đơn hàng.");
          }
        })
        .catch((err) => {
          setError(err.message || "Lỗi tải thông tin đơn hàng.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setActiveOrder(null);
      // If phone in URL params, check by phone
      const phoneParam = searchParams.get("phone");
      if (phoneParam) {
        handleSearchByPhone(phoneParam);
      }
    }
  }, [orderCode, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneQuery.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }
    setSearchParams({ phone: phoneQuery });
    handleSearchByPhone(phoneQuery);
  };

  const handleSearchByPhone = (phoneNum: string) => {
    setIsLoading(true);
    setError(null);
    checkOrdersByPhone(phoneNum)
      .then((res) => {
        if (res.success) {
          setOrdersList(res.data);
          if (res.data.length === 0) {
            setError("Không tìm thấy đơn hàng nào liên kết với số điện thoại này.");
          }
        }
      })
      .catch((err) => {
        setError(err.message || "Lỗi tìm kiếm đơn hàng.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const activeStatus = activeOrder ? STATUS_MAP[activeOrder.order_status] || { label: activeOrder.order_status, color: "text-gray-600", bg: "bg-gray-50" } : null;
  const activePaymentStatus = activeOrder ? PAYMENT_MAP[activeOrder.payment_status] || { label: activeOrder.payment_status, color: "text-gray-600" } : null;

  return (
    <div className="min-h-screen bg-cream/10 pb-20 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:opacity-85">
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
        </div>

        {/* Title */}
        <h1 className="mb-8 text-2xl sm:text-3xl font-black text-ink">
          {orderCode ? `Đơn hàng ${orderCode}` : "Tra cứu đơn hàng"}
        </h1>

        {/* Phone Lookup Form (always visible at top of lookup page) */}
        {!orderCode && (
          <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-glass-sm mb-8">
            <h2 className="text-base font-black text-ink mb-4">Nhập số điện thoại để tra cứu đơn hàng</h2>
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="tel"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                placeholder="Ví dụ: 0987654321"
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3.5 text-sm font-semibold outline-none focus:border-forest/50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl bg-forest px-8 py-3.5 text-sm font-black text-white hover:bg-forest/90 transition flex items-center justify-center gap-2"
              >
                <Search size={18} /> Tra cứu
              </button>
            </form>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex py-20 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest border-t-transparent"></div>
          </div>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-center text-sm font-semibold text-red-600 mb-8">
            {error}
          </div>
        )}

        {/* Search results list (when on check page and activeOrder is null) */}
        {!orderCode && !activeOrder && ordersList.length > 0 && !isLoading && (
          <div className="space-y-4">
            <h3 className="font-black text-lg text-ink">Danh sách đơn hàng tìm thấy ({ordersList.length})</h3>
            <div className="grid grid-cols-1 gap-4">
              {ordersList.map((ord) => {
                const stat = STATUS_MAP[ord.order_status] || { label: ord.order_status, color: "text-gray-600", bg: "bg-gray-50" };
                return (
                  <div 
                    key={ord.id} 
                    className="rounded-3xl border border-forest/10 bg-white p-6 shadow-glass-sm hover:shadow-glass transition flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-forest text-base">{ord.order_code}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${stat.bg} ${stat.color}`}>
                          {stat.label}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                        <Calendar size={13} /> {new Date(ord.created_at).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="mt-1.5 text-xs text-gray-500 font-medium">
                        Số sản phẩm: {ord.items.reduce((acc, it) => acc + it.quantity, 0)} • Tổng tiền: <span className="font-bold text-ink">{(parseFloat(ord.total)).toLocaleString("vi-VN")}đ</span>
                      </div>
                    </div>
                    <Link
                      to={`/orders/${ord.order_code}`}
                      className="rounded-xl border border-forest px-5 py-2 text-xs font-bold text-forest hover:bg-forest/5 text-center"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Order Detail Tracking View */}
        {activeOrder && !isLoading && (
          <div className="space-y-6">
            
            {/* Status Timeline */}
            <div className="rounded-3xl border border-forest/10 bg-white p-6 sm:p-8 shadow-glass-sm">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4 mb-6">
                <div>
                  <h3 className="font-black text-lg text-ink">Trạng thái đơn hàng</h3>
                  <p className="text-xs font-semibold text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={13} /> Ngày đặt: {new Date(activeOrder.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className={`rounded-full px-4 py-1.5 text-sm font-black ${activeStatus?.bg} ${activeStatus?.color}`}>
                  {activeStatus?.label}
                </div>
              </div>

              {/* Status Stepper Timeline */}
              <div className="relative pl-8 border-l-2 border-gray-100 ml-4 space-y-8">
                {activeOrder.status_logs && activeOrder.status_logs.length > 0 ? (
                  activeOrder.status_logs.map((log) => {
                    const st = STATUS_MAP[log.status] || { label: log.status, color: "text-gray-600", bg: "bg-gray-100" };
                    return (
                      <div key={log.id} className="relative">
                        <div className={`absolute -left-[41px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-forest text-forest`}>
                          <CheckCircle2 size={14} className="fill-white" />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <span className="font-black text-sm text-ink">{st.label}</span>
                          <span className="text-xs font-semibold text-gray-400">
                            {new Date(log.created_at).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        {log.note && (
                          <p className="mt-1 text-xs text-gray-500 font-medium">{log.note}</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="relative">
                    <div className="absolute -left-[41px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white">
                      <Clock size={14} />
                    </div>
                    <div>
                      <span className="font-black text-sm text-ink">Tiếp nhận đơn hàng</span>
                      <p className="mt-1 text-xs text-gray-500 font-medium">Đơn hàng đang chờ quản trị viên xác nhận.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Points Reward Box */}
            <div className="rounded-3xl border border-[#ffedd5] bg-gradient-to-br from-[#fffbeb] to-[#fff7ed] p-6 shadow-glass-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="h-12 w-12 rounded-2xl bg-[#fef3c7] flex items-center justify-center text-[#d97706] shrink-0">
                  <Award size={24} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#d97706] uppercase tracking-wider">3F Club Loyalty Points</h4>
                  <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                    {activeOrder.order_status === "completed"
                      ? "Bạn đã tích lũy thành công điểm thưởng từ đơn hàng này."
                      : "Điểm thưởng dự kiến sẽ được cộng vào tài khoản khi đơn hoàn thành."}
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right shrink-0">
                <div className="text-2xl font-black text-[#d97706]">
                  {activeOrder.order_status === "completed"
                    ? `+${activeOrder.loyalty_points_earned}`
                    : `+${Math.floor(parseFloat(activeOrder.total) / 10000)}`}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">points</div>
              </div>
            </div>

            {/* Main Order Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Delivery & Payment Details */}
              <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-glass-sm space-y-6">
                <div>
                  <h3 className="font-black text-base text-ink mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-forest" />
                    Thông tin nhận hàng
                  </h3>
                  <div className="text-sm space-y-1 bg-cream/10 p-3 rounded-2xl border border-forest/5">
                    <div className="font-bold text-ink">{activeOrder.receiver_name}</div>
                    <div className="font-semibold text-gray-500">{activeOrder.phone}</div>
                    <div className="text-gray-600 mt-1 leading-relaxed font-medium">
                      {activeOrder.address_line}, {activeOrder.ward ? `${activeOrder.ward}, ` : ""}{activeOrder.district}, {activeOrder.province}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-base text-ink mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-forest" />
                    Thanh toán
                  </h3>
                  <div className="text-sm space-y-2.5 bg-cream/10 p-3 rounded-2xl border border-forest/5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-semibold">Hình thức:</span>
                      <span className="font-bold text-ink">
                        {activeOrder.payment_method === "bank_transfer" ? "Chuyển khoản ngân hàng" : "Thanh toán khi nhận hàng (COD)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-gray-500 font-semibold">Trạng thái:</span>
                      <span className={`font-black ${activePaymentStatus?.color}`}>
                        {activePaymentStatus?.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Items and Totals */}
              <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-glass-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base text-ink mb-4 flex items-center gap-2">
                    <Package size={18} className="text-forest" />
                    Danh sách sản phẩm
                  </h3>
                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                    {activeOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="h-12 w-12 shrink-0 rounded-lg border border-gray-100 bg-gray-50 p-1 flex items-center justify-center overflow-hidden">
                          <Image src={item.image_url || "/assets/images/dog-food.webp"} alt={item.product_name} className="h-full w-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-ink line-clamp-1">{item.product_name}</h4>
                          {item.variant_name && (
                            <span className="text-[10px] text-gray-400 font-medium">Phân loại: {item.variant_name}</span>
                          )}
                          <div className="text-[10px] font-bold text-ink mt-0.5">
                            x{item.quantity}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-ink whitespace-nowrap">
                          {(parseFloat(item.price) * item.quantity).toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 mt-6 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Tạm tính:</span>
                    <span>{(parseFloat(activeOrder.subtotal)).toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Phí vận chuyển:</span>
                    <span>{(parseFloat(activeOrder.shipping_fee)).toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Giảm giá:</span>
                    <span>-{(parseFloat(activeOrder.discount)).toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between items-center font-black text-ink text-base border-t pt-2 mt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-forest">{(parseFloat(activeOrder.total)).toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
