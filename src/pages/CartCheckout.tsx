import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShoppingBag, MapPin, Truck } from "lucide-react";
import { getCart, updateQuantity, removeFromCart, clearCart, getCartTotal, formatPrice } from "@/lib/cartHelper";
import { CartItemsList } from "@/components/CartCheckout/CartItemsList";
import { DeliveryForm } from "@/components/CartCheckout/DeliveryForm";
import { OrderSummary } from "@/components/CartCheckout/OrderSummary";
import { Image } from "@/components/Image";
import type { CartItem } from "@/lib/cartHelper";
import { createOrder, validateCoupon } from "@/src/api/productsApi";
import type { CreateOrderPayload } from "@/src/api/productsApi";
import { toast } from "sonner";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { listAddressesApi, type AddressData } from "@/src/api/customerAddressesApi";
import { listPublicOrderShippingMethods, type OrderShippingMethod } from "@/src/api/orderShippingMethodsApi";

export function CartCheckout() {
  const navigate = useNavigate();
  const { customer, isLoggedIn } = useCustomerAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // v2 open-api administrative division state variables
  const [provinceCode, setProvinceCode] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [note, setNote] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryMethod, setDeliveryMethod] = useState("express");
  const [shippingMethods, setShippingMethods] = useState<OrderShippingMethod[]>([]);
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number; description?: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer addresses state
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const handleSelectAddress = (addr: AddressData) => {
    setSelectedAddressId(addr.id || null);
    setFullName(addr.receiverName);
    setPhone(addr.receiverPhone);
    setProvinceCode(addr.provinceCode);
    setProvinceName(addr.provinceName);
    setWardCode(addr.wardCode);
    setWardName(addr.wardName);
    setDetailedAddress(addr.addressLine);
  };

  useEffect(() => {
    if (isLoggedIn && customer) {
      setFullName(customer.fullName || "");
      setPhone(customer.phone || "");
      setEmail(customer.email || "");

      const fetchAddresses = async () => {
        try {
          const res = await listAddressesApi();
          if (res.success && res.data && res.data.length > 0) {
            setAddresses(res.data);
            const defAddr = res.data.find(a => a.isDefault) || res.data[0];
            if (defAddr) {
              handleSelectAddress(defAddr);
            }
          }
        } catch {
          // ignore
        }
      };
      fetchAddresses();
    }
  }, [isLoggedIn, customer]);

  useEffect(() => {
    setCart(getCart());
    const handleUpdate = () => setCart(getCart());
    window.addEventListener("cart-updated", handleUpdate);
    return () => window.removeEventListener("cart-updated", handleUpdate);
  }, []);

  useEffect(() => {
    const loadShippingMethods = async () => {
      try {
        const res = await listPublicOrderShippingMethods();
        if (res.success && res.data.length > 0) {
          setShippingMethods(res.data);
          if (!res.data.some((method) => method.methodKey === deliveryMethod)) {
            setDeliveryMethod(res.data[0].methodKey);
          }
        }
      } catch (err) {
        console.error("Không tải được cấu hình phương thức giao hàng", err);
      }
    };

    loadShippingMethods();
  }, []);

  const subtotal = getCartTotal();
  const selectedShippingMethod = shippingMethods.find((method) => method.methodKey === deliveryMethod);
  const selectedShippingFee = selectedShippingMethod?.fee ?? 0;

  // Validate coupon via backend
  const handleApplyVoucher = async (code: string) => {
    try {
      const res = await validateCoupon({
        code,
        subtotal,
        customerPhone: phone || undefined
      });

      if (res.success && res.data) {
        setAppliedVoucher({
          code: res.data.code,
          discountAmount: res.data.discountAmount,
          description: res.data.description
        });
        toast.success("Áp dụng mã giảm giá thành công!");
        return { success: true };
      } else {
        return { success: false, message: res.message || "Mã giảm giá không hợp lệ." };
      }
    } catch (err: any) {
      return { success: false, message: err.message || "Mã giảm giá không hợp lệ." };
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !provinceName || !wardName || !detailedAddress) {
      toast.warning("Vui lòng điền đầy đủ các thông tin giao hàng có dấu (*)");
      return;
    }

    if (!deliveryMethod) {
      toast.warning("Vui lòng chọn phương thức giao hàng.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateOrderPayload = {
        customer: {
          name: fullName,
          phone: phone,
          email: email || undefined,
          zalo: undefined,
        },
        shipping: {
          receiverName: fullName,
          phone: phone,
          provinceCode: provinceCode,
          provinceName: provinceName,
          wardCode: wardCode,
          wardName: wardName,
          addressLine: detailedAddress,
          note: note || undefined,
          shippingMethod: deliveryMethod,
        },
        items: cart.map(item => ({
          productId: Number(item.productId) || 0,
          variantId: item.variantId ? Number(item.variantId) : null,
          quantity: item.quantity,
        })),
        paymentMethod: (paymentMethod === "vietqr" ? "bank_transfer" : "cod") as "cod" | "bank_transfer",
        couponCode: appliedVoucher ? appliedVoucher.code : undefined
      };

      const res = await createOrder(payload);
      if (res.success && res.data) {
        clearCart();
        navigate(`/order-success/${res.data.order_code}`);
      } else {
        toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.");
      }
    } catch (err: any) {
      toast.error(err.message || "Tạo đơn hàng thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:py-20 text-center">
        <div className="mx-auto mb-4 sm:mb-6 h-36 w-36 sm:h-48 sm:w-48 overflow-hidden">
          <Image src="/assets/images/empty-cart.webp" alt="Empty Cart" className="h-full w-full object-contain mix-blend-multiply" />
        </div>
        <h2 className="text-lg sm:text-xl font-black text-ink">Giỏ hàng của bạn đang trống</h2>
        <p className="mt-2 text-xs text-gray-500 px-4">Hãy thêm một vài sản phẩm thơm ngon cho các boss cưng nhé!</p>
        <Link
          to="/products"
          className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 active:scale-95"
        >
          <ShoppingBag size={14} className="sm:w-4 sm:h-4" /> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/[0.35] pb-16 sm:pb-24 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 flex items-center gap-2 text-[11px] sm:text-[12px] font-bold text-[#6b7280]">
          <Link to="/" className="hover:text-forest">Trang chủ</Link>
          <span>/</span>
          <span className="text-ink truncate">Giỏ hàng & Thanh toán</span>
        </nav>

        <h1 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-black text-ink">Giỏ hàng & Thanh toán</h1>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-12">
          {/* Left Column: Cart items list & Customer Info & Delivery Address */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">

            {isLoggedIn && addresses.length > 0 && (
              <div className="rounded-2xl border border-forest/10 bg-white p-4 sm:p-5 shadow-sm space-y-3">
                <h3 className="text-sm sm:text-[15px] font-black text-forest flex items-center gap-2">
                  <MapPin size={16} /> Chọn địa chỉ nhận hàng đã lưu
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`text-left rounded-xl border p-3.5 space-y-1.5 transition-all outline-none ${
                        selectedAddressId === addr.id
                          ? "border-forest bg-forest/5 ring-1 ring-forest"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-ink">{addr.receiverName}</span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[9px] font-bold text-forest">Mặc định</span>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-gray-500">{addr.receiverPhone}</p>
                      <p className="text-[10px] font-semibold text-gray-400 line-clamp-2">{addr.addressLine}, {addr.wardName}, {addr.provinceName}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <DeliveryForm
              fullName={fullName} setFullName={setFullName}
              phone={phone} setPhone={setPhone}
              email={email} setEmail={setEmail}
              provinceCode={provinceCode} setProvinceCode={setProvinceCode}
              provinceName={provinceName} setProvinceName={setProvinceName}
              wardCode={wardCode} setWardCode={setWardCode}
              wardName={wardName} setWardName={setWardName}
              detailedAddress={detailedAddress} setDetailedAddress={setDetailedAddress}
              note={note} setNote={setNote}
            />

            {/* Delivery Method */}
            <div className="rounded-2xl border border-forest/10 bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm sm:text-[15px] font-black text-forest">
                <Truck size={16} className="sm:w-[18px] sm:h-[18px]" /> Phương thức giao hàng
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                {shippingMethods.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-forest/20 bg-cream/20 p-3 text-xs font-bold text-gray-500">
                    Đang tải phương thức giao hàng...
                  </div>
                ) : (
                  shippingMethods.map((method) => (
                    <label key={method.id} className={`flex cursor-pointer items-start sm:items-center justify-between rounded-xl border-2 p-2.5 sm:p-3 transition active:scale-[0.98] ${deliveryMethod === method.methodKey ? "border-forest bg-forest/5" : "border-forest/10 bg-white hover:bg-cream/10"}`}>
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={method.methodKey}
                          checked={deliveryMethod === method.methodKey}
                          onChange={() => setDeliveryMethod(method.methodKey)}
                          className="accent-forest mt-0.5 sm:mt-0 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-ink">{method.name}</div>
                          {method.description && (
                            <div className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-2">{method.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-forest shrink-0">
                        {method.fee > 0 ? formatPrice(method.fee) : "Miễn phí"}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Cart Items, Coupons, Payment options, Summary & Submit button */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
              {/* Cart Items Summary */}
              <div className="rounded-2xl border border-forest/10 bg-white p-4 sm:p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm sm:text-[15px] font-black text-forest">Sản phẩm trong giỏ hàng</h3>
                  <span className="text-[10px] sm:text-xs font-bold text-forest bg-forest/5 px-2 py-1 rounded-full">{cart.reduce((total, item) => total + item.quantity, 0)} sản phẩm</span>
                </div>
                <div className="max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
                  <CartItemsList
                    items={cart}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                </div>
              </div>

              <OrderSummary
                subtotal={subtotal}
                appliedVoucher={appliedVoucher}
                onApplyVoucher={handleApplyVoucher}
                onRemoveVoucher={() => setAppliedVoucher(null)}
                onSubmit={handlePlaceOrder}
                isSubmitting={isSubmitting}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                shippingFee={selectedShippingFee}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
