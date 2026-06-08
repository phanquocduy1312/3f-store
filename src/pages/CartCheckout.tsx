import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import { getCart, updateQuantity, removeFromCart, clearCart, getCartTotal, formatPrice } from "@/lib/cartHelper";
import { CartItemsList } from "@/components/CartCheckout/CartItemsList";
import { DeliveryForm } from "@/components/CartCheckout/DeliveryForm";
import { OrderSummary } from "@/components/CartCheckout/OrderSummary";
import { VietQRModal } from "@/components/CartCheckout/VietQRModal";
import { Image } from "@/components/Image";
import type { CartItem } from "@/lib/cartHelper";

export function CartCheckout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [note, setNote] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; type: "percent" | "fixed" } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [placedAmount, setPlacedAmount] = useState(0);

  useEffect(() => {
    setCart(getCart());
    const handleUpdate = () => setCart(getCart());
    window.addEventListener("cart-updated", handleUpdate);
    return () => window.removeEventListener("cart-updated", handleUpdate);
  }, []);

  const subtotal = getCartTotal();
  const shippingFee = shippingMethod === "express" ? 50000 : 25000;
  const voucherDiscount = appliedVoucher
    ? (appliedVoucher.type === "percent" ? Math.min(subtotal * (appliedVoucher.discount / 100), 50000) : appliedVoucher.discount)
    : 0;
  const finalTotal = Math.max(0, subtotal + shippingFee - voucherDiscount);

  const handleApplyVoucher = (code: string) => {
    if (code === "SENMOI" && subtotal >= 399000) {
      setAppliedVoucher({ code: "SENMOI", discount: 50000, type: "fixed" });
    } else if (code === "FREESHIP25K" && subtotal >= 300000) {
      setAppliedVoucher({ code: "FREESHIP25K", discount: 25000, type: "fixed" });
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !province || !district || !detailedAddress) {
      alert("Vui lòng điền đầy đủ các thông tin giao hàng có dấu (*)");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `3F-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setPlacedAmount(finalTotal);
      setIsSubmitting(false);
      setOrderPlaced(true);
      clearCart();

      if (paymentMethod === "vietqr") {
        setShowQRModal(true);
      }
    }, 1500);
  };

  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-forest">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-black text-ink">Đặt hàng thành công!</h2>
        <p className="mt-3 text-sm text-gray-500">
          Mã đơn hàng của bạn là <strong className="text-forest">{orderId}</strong>. Đơn hàng đang được xử lý và sẽ sớm giao tới bạn.
        </p>
        
        {paymentMethod === "vietqr" && (
          <div className="mt-6">
            <button
              onClick={() => setShowQRModal(true)}
              className="w-full rounded-xl bg-forest py-3 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90"
            >
              Mở lại mã QR thanh toán VietQR
            </button>
          </div>
        )}

        <div className="mt-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-forest hover:opacity-85">
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
        </div>

        <VietQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          orderId={orderId}
          amount={placedAmount}
        />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-6 h-48 w-48 overflow-hidden">
          <Image src="/assets/images/empty-cart.webp" alt="Empty Cart" className="h-full w-full object-contain mix-blend-multiply" />
        </div>
        <h2 className="text-xl font-black text-ink">Giỏ hàng của bạn đang trống</h2>
        <p className="mt-2 text-xs text-gray-500">Hãy thêm một vài sản phẩm thơm ngon cho các boss cưng nhé!</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 hover:scale-105"
        >
          <ShoppingBag size={16} /> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/[0.35] pb-24 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-[12px] font-bold text-[#6b7280]">
          <Link to="/" className="hover:text-forest">Trang chủ</Link>
          <span>/</span>
          <span className="text-ink">Giỏ hàng & Thanh toán</span>
        </nav>

        <h1 className="mb-8 text-2xl font-black text-ink">Giỏ hàng & Thanh toán</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Cart items list */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-[15px] font-black text-forest">Sản phẩm trong giỏ hàng</h3>
              <CartItemsList
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            </div>
            
            <DeliveryForm
              fullName={fullName} setFullName={setFullName}
              phone={phone} setPhone={setPhone}
              email={email} setEmail={setEmail}
              province={province} setProvince={setProvince}
              district={district} setDistrict={setDistrict}
              detailedAddress={detailedAddress} setDetailedAddress={setDetailedAddress}
              note={note} setNote={setNote}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
            />
          </div>

          {/* Right Column: Totals & Summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <OrderSummary
                subtotal={subtotal}
                shippingFee={shippingFee}
                appliedVoucher={appliedVoucher}
                onApplyVoucher={handleApplyVoucher}
                onRemoveVoucher={() => setAppliedVoucher(null)}
                onSubmit={handlePlaceOrder}
                isSubmitting={isSubmitting}
                shippingMethod={shippingMethod}
                setShippingMethod={setShippingMethod}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
