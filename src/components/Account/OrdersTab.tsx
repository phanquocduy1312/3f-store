import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listOrdersApi, cancelOrderApi, reorderApi, type OrderData } from "@/src/api/customerOrdersApi";
import { addToCart } from "@/lib/cartHelper";
import { ShoppingBag, Eye, XOctagon, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

export function OrdersTab() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    const res = await listOrdersApi(activeTab);
    if (res.success && res.data) {
      setOrders(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleCancel = async (code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${code}?`)) return;
    try {
      const res = await cancelOrderApi(code);
      if (res.success) {
        toast.success("Hủy đơn hàng thành công!");
        fetchOrders();
      } else {
        toast.error(res.message || "Lỗi hủy đơn.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    }
  };

  const handleReorder = async (order: OrderData) => {
    try {
      const res = await reorderApi(order.order_code);
      if (res.success && res.data) {
        const validList = res.data;
        if (validList.length === 0) {
          toast.warning("Tất cả sản phẩm trong đơn này đã hết hàng hoặc ngừng kinh doanh.");
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

  const filteredOrders = orders.filter(o => 
    o.order_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-6">
      
      <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-ink">Đơn hàng của tôi</h3>
          <p className="text-xs text-gray-400 font-semibold">Theo dõi trạng thái giao hàng và lịch sử mua sắm của bạn.</p>
        </div>
        <div className="relative">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã đơn hàng..." className="rounded-2xl border border-[#E0EBF7] pl-9 pr-4 py-2 text-xs outline-none focus:border-forest w-full sm:w-48" />
          <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "Tất cả" },
          { id: "pending", label: "Chờ xác nhận" },
          { id: "confirmed", label: "Đang xử lý" },
          { id: "shipping", label: "Đang giao" },
          { id: "completed", label: "Hoàn tất" },
          { id: "cancelled", label: "Đã hủy" }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === tab.id ? "bg-forest text-white" : "text-gray-500 hover:bg-gray-50"
          }`}>{tab.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F9FD] text-gray-400"><ShoppingBag size={24} /></div>
          <div>
            <p className="text-sm font-bold text-ink">Bạn chưa có đơn hàng nào</p>
            <Link to="/products" className="mt-3 inline-block rounded-full bg-forest px-5 py-2.5 text-xs font-bold text-white shadow-soft">Mua sắm ngay</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-gray-100 p-4 bg-white space-y-3 shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                <div>
                  <h4 className="text-xs font-black text-ink">#{order.order_code}</h4>
                  <p className="text-[10px] font-bold text-gray-400">{new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                  order.order_status === "completed" ? "bg-green-50 text-green-700 border border-green-100" :
                  order.order_status === "cancelled" ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                }`}>{order.order_status}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <p>Số lượng: <span className="font-bold text-ink">{order.items?.length || 0} sản phẩm</span></p>
                <p>Tổng tiền: <span className="font-black text-forest">{order.totalAmount.toLocaleString()}đ</span></p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Link to={`/account/orders/${order.order_code}`} className="rounded-xl border border-gray-100 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1"><Eye size={12} /> Chi tiết</Link>
                {order.order_status === "pending" && (
                  <button onClick={() => handleCancel(order.order_code)} className="rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1"><XOctagon size={12} /> Hủy đơn</button>
                )}
                <button onClick={() => handleReorder(order)} className="rounded-xl bg-forest/10 px-3 py-2 text-xs font-bold text-forest hover:bg-forest/15 flex items-center gap-1"><RefreshCw size={12} /> Mua lại</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default OrdersTab;
