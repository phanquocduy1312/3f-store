import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { orderDetailApi, cancelOrderApi, reorderApi, type OrderData } from "@/src/api/customerOrdersApi";
import { addToCart } from "@/lib/cartHelper";
import { ArrowLeft, CreditCard, ShoppingBag, Truck, Calendar, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function OrderDetailTab() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrderDetail = async () => {
    if (!orderCode) return;
    setIsLoading(true);
    try {
      const res = await orderDetailApi(orderCode);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        toast.error("Không tìm thấy thông tin đơn hàng.");
      }
    } catch {
      toast.error("Lỗi tải thông tin đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderCode]);

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${order.order_code}?`)) return;
    try {
      const res = await cancelOrderApi(order.order_code);
      if (res.success) {
        toast.success("Hủy đơn hàng thành công!");
        fetchOrderDetail();
      } else {
        toast.error(res.message || "Lỗi hủy đơn.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    try {
      const res = await reorderApi(order.order_code);
      if (res.success && res.data) {
        const validList = res.data;
        if (validList.length === 0) {
          toast.warning("Sản phẩm đã hết hàng hoặc ngừng kinh doanh.");
          return;
        }
        validList.forEach((validItem) => {
          const originalItem = order.items?.find(
            (item) =>
              item.product_id === validItem.productId &&
              (item.variant_id === validItem.variantId || (!item.variant_id && !validItem.variantId))
          );
          if (originalItem) {
            addToCart({
              id: `${originalItem.product_id}-${originalItem.variant_id || "default"}`,
              productId: String(originalItem.product_id),
              variantId: originalItem.variant_id ? String(originalItem.variant_id) : undefined,
              sku: originalItem.sku || undefined,
              name: originalItem.product_name,
              image: originalItem.image_url || "/assets/images/default-product.webp",
              price: originalItem.price,
              variant: originalItem.variant_name || "Mặc định"
            }, validItem.quantity);
          }
        });
        toast.success("Đã thêm các sản phẩm khả dụng vào giỏ hàng!");
        navigate("/cart");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    }
  };

  if (isLoading) return <div className="h-64 rounded-3xl bg-white border border-[#E0EBF7] animate-pulse" />;
  if (!order) return <div className="text-center py-12 text-gray-500">Đơn hàng không tồn tại.</div>;

  const isBankTransfer = order.payment_method === "bank_transfer";
  const isUnpaid = order.payment_status === "unpaid" || order.payment_status === "pending";

  return (
    <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-6">
      
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
        <Link to="/account/orders" className="p-2 rounded-xl border border-gray-150 text-gray-500 hover:bg-gray-50"><ArrowLeft size={14} /></Link>
        <div>
          <h3 className="text-base font-black text-ink">Chi tiết đơn hàng #{order.order_code}</h3>
          <p className="text-xs text-gray-400 font-bold">Ngày đặt: {new Date(order.created_at).toLocaleString("vi-VN")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delivery Details */}
        <div className="border border-[#E0EBF7] rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black text-ink flex items-center gap-1.5"><Truck size={14} className="text-forest" /> Giao hàng</h4>
          <p className="text-xs font-semibold text-gray-600 leading-relaxed">
            <span className="font-bold text-ink">{order.receiver_name}</span> <br />
            SĐT: {order.phone} <br />
            ĐC: {order.address_line}, {order.ward ? `${order.ward}, ` : ""}{order.province}
            {order.note && <span className="block text-[10px] text-gray-400 font-bold italic mt-1">Ghi chú: {order.note}</span>}
          </p>
        </div>

        {/* Payment Details */}
        <div className="border border-[#E0EBF7] rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black text-ink flex items-center gap-1.5"><CreditCard size={14} className="text-forest" /> Thanh toán</h4>
          <p className="text-xs font-semibold text-gray-600 leading-relaxed">
            Hộp thức: {order.payment_method === "bank_transfer" ? "Chuyển khoản VietQR" : "Thanh toán COD"} <br />
            Trạng thái: <span className="font-bold text-ink uppercase">{order.payment_status}</span>
          </p>
        </div>

        {/* Points & Stats */}
        <div className="border border-[#E0EBF7] rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black text-ink flex items-center gap-1.5"><Calendar size={14} className="text-forest" /> Điểm tích lũy</h4>
          <p className="text-xs font-semibold text-gray-600 leading-relaxed">
            Điểm nhận được: <span className="font-bold text-forest">+{order.loyalty_points_earned || 0} điểm</span> <br />
            Trạng thái đơn: <span className="font-bold text-ink uppercase">{order.order_status}</span>
          </p>
        </div>
      </div>

      {/* QR code transfer instructions */}
      {isBankTransfer && isUnpaid && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-2">
            <h4 className="text-xs font-black text-amber-800">Thanh toán chuyển khoản qua VietQR</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Vui lòng chuyển khoản đến tài khoản <strong>MB Bank - 0373852538 (PHAN QUOC DUY)</strong> với nội dung chuyển khoản là <strong>{order.order_code}</strong>.
            </p>
          </div>
          <div className="h-36 w-36 bg-white p-1 rounded-xl shadow-sm border border-amber-100 flex items-center justify-center shrink-0">
            <img 
              src={`https://img.vietqr.io/image/MB-0373852538-compact2.png?amount=${Math.round(order.totalAmount)}&addInfo=${order.order_code}&accountName=PHAN%20QUOC%20DUY`}
              alt="VietQR Code" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        <h4 className="text-xs font-black text-ink flex items-center gap-1.5"><ShoppingBag size={14} className="text-forest" /> Sản phẩm đã mua</h4>
        <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={item.image_url || "/assets/images/default-product.webp"} alt={item.product_name} className="h-12 w-12 rounded-xl object-contain border border-gray-100" />
                <div>
                  <h5 className="text-xs font-bold text-ink line-clamp-1">{item.product_name}</h5>
                  {item.variant_name && <p className="text-[10px] text-gray-400 font-bold">Phân loại: {item.variant_name}</p>}
                  <p className="text-[10px] text-gray-500 font-bold">x{item.quantity} - {item.price.toLocaleString()}đ</p>
                </div>
              </div>
              <span className="text-xs font-bold text-ink">{(item.price * item.quantity).toLocaleString()}đ</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2 text-xs font-semibold text-gray-600 max-w-sm ml-auto">
        <div className="flex justify-between"><span>Tạm tính:</span><span className="font-bold text-ink">{order.subtotalAmount.toLocaleString()}đ</span></div>
        <div className="flex justify-between"><span>Phí vận chuyển:</span><span className="font-bold text-ink">{order.shippingFee.toLocaleString()}đ</span></div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-red-600"><span>Giảm giá:</span><span className="font-bold">-{order.discountAmount.toLocaleString()}đ</span></div>
        )}
        <div className="flex justify-between text-sm font-black text-forest border-t border-gray-100 pt-2"><span>Tổng thanh toán:</span><span>{order.totalAmount.toLocaleString()}đ</span></div>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-100">
        {order.order_status === "pending" ? (
          <button onClick={handleCancel} className="rounded-full border border-red-200 px-5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1"><Trash2 size={12} /> Hủy đơn hàng</button>
        ) : (
          <div />
        )}
        <button onClick={handleReorder} className="rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-forest/90 flex items-center gap-1"><RefreshCw size={12} /> Mua lại đơn hàng</button>
      </div>

    </div>
  );
}
export default OrderDetailTab;
