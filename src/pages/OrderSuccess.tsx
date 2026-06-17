import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Copy, CreditCard, ShoppingBag, Truck } from "lucide-react";
import { getOrderDetails, OrderDetail } from "@/src/api/productsApi";
import { Image } from "@/components/Image";

export function OrderSuccess() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderCode) return;
    getOrderDetails(orderCode)
      .then((res) => {
        if (res.success) {
          setOrder(res.data);
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
  }, [orderCode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream/10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-black text-red-600">Lỗi</h2>
        <p className="mt-2 text-sm text-gray-600">{error || "Đã xảy ra lỗi không xác định."}</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-forest font-bold hover:underline">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const isBankTransfer = order.payment_method === "bank_transfer";
  const qrUrl = isBankTransfer
    ? `https://img.vietqr.io/image/MB-0373852538-compact2.png?amount=${Math.round(parseFloat(order.total))}&addInfo=${order.order_code}&accountName=PHAN%20QUOC%20DUY`
    : "";

  return (
    <div className="min-h-screen bg-cream/10 pb-20 pt-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        
        {/* Success Header Card */}
        <div className="rounded-3xl border border-forest/10 bg-white p-6 sm:p-10 text-center shadow-glass-sm transition duration-300 hover:shadow-glass">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-forest animate-pulse">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink">Đặt hàng thành công!</h1>
          <p className="mt-3 text-sm text-gray-500 max-w-lg mx-auto">
            Cảm ơn bạn đã mua sắm tại 3F Store. Đơn hàng của bạn đã được tiếp nhận và đang ở trạng thái <span className="font-bold text-forest">Chờ xử lý</span>.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <div className="rounded-xl bg-cream/30 px-4 py-2 font-bold text-ink">
              Mã đơn hàng: <span className="text-forest">{order.order_code}</span>
            </div>
            <div className="rounded-xl bg-cream/30 px-4 py-2 font-bold text-ink">
              Tổng thanh toán: <span className="text-forest">{(parseFloat(order.total)).toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </div>

        {/* Bank Transfer Instructions */}
        {isBankTransfer && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-glass-sm">
            <div className="bg-forest px-6 py-4 text-white flex items-center gap-3">
              <CreditCard size={20} />
              <h2 className="font-black text-base">Thông tin thanh toán chuyển khoản</h2>
            </div>
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Bank Details */}
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Quý khách vui lòng quét mã QR bên cạnh hoặc chuyển khoản theo thông tin dưới đây:
                </p>
                <div className="space-y-3">
                  <div className="rounded-xl bg-cream/20 p-3 border border-forest/5">
                    <div className="text-xs text-gray-400 font-semibold">NGÂN HÀNG</div>
                    <div className="text-sm font-bold text-ink flex items-center justify-between">
                      <span>MB Bank (Ngân hàng Quân Đội)</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-cream/20 p-3 border border-forest/5">
                    <div className="text-xs text-gray-400 font-semibold">SỐ TÀI KHOẢN</div>
                    <div className="text-sm font-bold text-ink flex items-center justify-between">
                      <span>0373852538</span>
                      <button 
                        onClick={() => copyToClipboard("0373852538")}
                        className="text-forest hover:opacity-85 active:scale-95"
                        title="Copy số tài khoản"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl bg-cream/20 p-3 border border-forest/5">
                    <div className="text-xs text-gray-400 font-semibold">TÊN TÀI KHOẢN</div>
                    <div className="text-sm font-bold text-ink">PHAN QUOC DUY</div>
                  </div>
                  <div className="rounded-xl bg-cream/20 p-3 border border-forest/5">
                    <div className="text-xs text-gray-400 font-semibold">SỐ TIỀN</div>
                    <div className="text-sm font-bold text-forest">
                      {(parseFloat(order.total)).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                  <div className="rounded-xl bg-cream/20 p-3 border border-forest/5">
                    <div className="text-xs text-gray-400 font-semibold">NỘI DUNG CHUYỂN KHOẢN</div>
                    <div className="text-sm font-bold text-forest flex items-center justify-between">
                      <span>{order.order_code}</span>
                      <button 
                        onClick={() => copyToClipboard(order.order_code)}
                        className="text-forest hover:opacity-85 active:scale-95"
                        title="Copy mã đơn hàng"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                {copied && (
                  <p className="text-xs font-bold text-forest text-center animate-bounce">
                    ✓ Đã sao chép vào bộ nhớ tạm!
                  </p>
                )}
              </div>

              {/* QR Code Column */}
              <div className="flex flex-col items-center justify-center p-4 border border-forest/5 rounded-2xl bg-cream/10">
                <div className="w-56 h-56 bg-white p-2 rounded-xl shadow-md border border-gray-100 flex items-center justify-center">
                  <img src={qrUrl} alt="VietQR Code" className="max-w-full max-h-full object-contain" />
                </div>
                <span className="mt-3 text-xs font-bold text-gray-500 text-center">
                  Quét mã VietQR để thanh toán tự động điền thông tin
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Info & Summary */}
        <div className="mt-6 rounded-3xl border border-forest/10 bg-white p-6 sm:p-8 shadow-glass-sm">
          <h2 className="text-base font-black text-ink mb-4 flex items-center gap-2">
            <Truck size={18} className="text-forest" />
            Thông tin nhận hàng
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm border-b pb-6">
            <div>
              <div className="text-gray-400 font-semibold mb-1">Người nhận</div>
              <div className="font-bold text-ink">{order.receiver_name}</div>
              <div className="font-bold text-ink mt-1">{order.phone}</div>
            </div>
            <div>
              <div className="text-gray-400 font-semibold mb-1">Địa chỉ giao hàng</div>
              <div className="font-medium text-ink leading-relaxed">
                {order.address_line}, {order.ward ? `${order.ward}, ` : ""}{order.district}, {order.province}
              </div>
            </div>
          </div>

          <h2 className="text-base font-black text-ink mt-6 mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-forest" />
            Danh sách sản phẩm
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="h-16 w-16 shrink-0 rounded-xl border border-gray-100 bg-gray-50 p-1 flex items-center justify-center overflow-hidden">
                  <Image src={item.image_url || "/assets/images/dog-food.webp"} alt={item.product_name} className="h-full w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-ink line-clamp-1">{item.product_name}</h4>
                  {item.variant_name && (
                    <span className="text-xs text-gray-400 font-medium">Phân loại: {item.variant_name}</span>
                  )}
                  <div className="text-xs font-bold text-ink mt-1">
                    x{item.quantity}
                  </div>
                </div>
                <div className="text-sm font-bold text-ink whitespace-nowrap">
                  {(parseFloat(item.price) * item.quantity).toLocaleString("vi-VN")}đ
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/orders/${order.order_code}`}
            className="flex items-center justify-center gap-2 rounded-full border border-forest px-8 py-3.5 text-sm font-black text-forest hover:bg-forest/5 active:scale-95 transition"
          >
            Theo dõi đơn hàng
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-black text-white shadow-md hover:bg-forest/90 active:scale-95 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

      </div>
    </div>
  );
}
