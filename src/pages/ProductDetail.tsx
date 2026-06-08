"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById, getSaleProducts, getFeaturedProducts } from "@/data/store";
import { addToCart, parsePriceString } from "@/lib/cartHelper";
import { Image } from "@/components/Image";
import { 
  Star, ChevronRight, ShoppingCart, Heart, Share2, 
  Minus, Plus, BellRing, Truck, Ticket, Award, RefreshCcw, CheckCircle, ShieldCheck,
  Fish, BicepsFlexed, Droplets, Eye, HeartHandshake
} from "lucide-react";

export function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id as string);
  const navigate = useNavigate();
  
  if (!product) {
    return <div className="py-20 text-center font-bold text-xl">Không tìm thấy sản phẩm</div>;
  }
  
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);

  // Real variants from product data
  const productVariants = product.variants ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState(
    productVariants.length > 0 ? productVariants[0].id : null
  );
  const selectedVariant = productVariants.find(v => v.id === selectedVariantId) ?? productVariants[0] ?? null;

  const [showToast, setShowToast] = useState(false);
  
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  
  // Active image: use selected variant image if available
  const [activeImage, setActiveImage] = useState(selectedVariant?.image || product.image);

  useEffect(() => {
    if (selectedVariant?.image) setActiveImage(selectedVariant.image);
  }, [selectedVariantId]);

  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        setIsSticky(window.scrollY > tabsRef.current.offsetTop);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = (goToCart = false) => {
    if (!product) return;
    const variantPrice = selectedVariant?.price ?? product.price;
    const variantOldPrice = selectedVariant?.oldPrice ?? (product as any).oldPrice;
    addToCart({
      id: selectedVariant?.id ?? product.id,
      name: product.name,
      image: selectedVariant?.image ?? product.image,
      price: parsePriceString(variantPrice),
      originalPrice: variantOldPrice ? parsePriceString(variantOldPrice) : undefined,
      variant: selectedVariant?.label ?? "Mặc định"
    }, quantity);

    if (goToCart) {
      navigate("/cart");
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const crossSellProducts = getSaleProducts(4);
  const similarProducts = getFeaturedProducts(4);

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      {/* Màn hình hiển thị chi tiết */}
      <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px] font-medium text-[#6b7280]">
          <Link to="/" className="hover:text-[#10854F]">Trang chủ</Link>
          <ChevronRight size={14} />
          {product.category?.split(' > ').map((cat: string, i: number, arr: string[]) => (
            <span key={i} className="flex items-center gap-2">
              <Link to={`/products?category=${cat}`} className="hover:text-[#10854F]">{cat}</Link>
              <ChevronRight size={14} />
            </span>
          ))}
          <span className="text-[#111827] line-clamp-1 max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          
          {/* Left: Gallery (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit z-10">
            <div className="group relative aspect-square w-full overflow-hidden rounded-[24px] border border-[#f1f1f1] bg-white">
              {/* Badges */}
              <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                <span className="w-max rounded-md bg-[#10854F] px-2.5 py-1.5 text-[11px] font-black text-white shadow-sm">
                  Giảm 21%
                </span>
                <span className="w-max rounded-md bg-[#f5b014] px-2.5 py-1.5 text-[11px] font-black text-white shadow-sm">
                  Best Seller
                </span>
                <span className="w-max mt-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#10854F] shadow-sm backdrop-blur-sm flex items-center gap-1">
                  🔥 94k+ đã bán
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
                <button className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-[#6b7280] shadow-sm backdrop-blur-md transition hover:bg-white hover:text-[#10854F]">
                  <Heart size={18} strokeWidth={2.5} />
                </button>
                <button className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-[#6b7280] shadow-sm backdrop-blur-md transition hover:bg-white hover:text-[#111827]">
                  <Share2 size={18} strokeWidth={2.5} />
                </button>
              </div>

              <Image 
                src={activeImage} 
                alt={product.name}
                className="h-full w-full object-contain p-8 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            
            {/* Thumbnails - show variant images */}
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {(product.images && product.images.length > 0 ? product.images.slice(0, 6) : [product.image]).map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-square w-20 shrink-0 cursor-pointer rounded-[16px] border-2 bg-white p-2 transition ${activeImage === img ? "border-[#10854F]" : "border-transparent hover:border-[#f1f1f1]"}`}
                >
                  <Image src={img} alt={`thumb-${idx}`} className="h-full w-full object-contain mix-blend-multiply" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info (7 cols) */}
          <div className="lg:col-span-7">
            
            {/* Tag line */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-[#F2F8EE] px-2 py-1 text-[11px] font-bold text-[#10854F]">
                <ShieldCheck size={14} /> Giảm giá
              </span>
              <span className="flex items-center gap-1 rounded-md bg-[#f0fdf4] px-2 py-1 text-[11px] font-bold text-[#16a34a]">
                <CheckCircle size={14} /> 100% chính hãng
              </span>
              <span className="flex items-center gap-1 rounded-md bg-[#fff7ed] px-2 py-1 text-[11px] font-bold text-[#ea580c]">
                <Award size={14} /> Bán chạy
              </span>
            </div>

            {/* Title & Rating */}
            <h1 className="mb-3 text-[24px] font-black leading-tight text-[#111827] md:text-[28px]">
              {product.name}
            </h1>
            
            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-[#f5b014]">
                {Array.from({length: 5}).map((_, i) => (
                  <Star key={i} size={15} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "transparent"} color={i < Math.floor(product.rating || 5) ? "currentColor" : "#d1d5db"} strokeWidth={2.5}/>
                ))}
              </div>
              <span className="font-bold text-[#111827]">{(product.rating || 5.0).toFixed(1)}</span>
              <span className="text-[#d1d5db]">|</span>
              <span className="font-medium text-[#6b7280]"><strong className="text-[#111827]">{(product.reviews || 0).toLocaleString("vi-VN")}</strong> đánh giá</span>
              <span className="text-[#d1d5db]">|</span>
              <span className="font-medium text-[#6b7280]">Đã bán <strong className="text-[#111827]">{(product.sold || 0).toLocaleString("vi-VN")}</strong></span>
            </div>

            {/* Price Box */}
            <div className="mb-6 rounded-[20px] bg-[#F2F8EE] p-5">
              <div className="flex items-end gap-3">
                <span className="text-[28px] font-black leading-none text-[#10854F]">
                  {selectedVariant?.price ?? product.price}
                </span>
                {(selectedVariant?.oldPrice ?? (product as any).oldPrice) && (
                  <span className="mb-1 text-base font-semibold text-[#9ca3af] line-through">
                    {selectedVariant?.oldPrice ?? (product as any).oldPrice}
                  </span>
                )}
                <span className="mb-1 rounded-md bg-[#10854F] px-1.5 py-0.5 text-xs font-black text-white">Giá tốt</span>
              </div>
            </div>

            {/* Short Desc */}
            <p className="mb-6 text-[15px] leading-relaxed text-[#4b5563]">
              Sản phẩm <strong>{product.name}</strong> cung cấp dinh dưỡng hoàn hảo và hương vị thơm ngon, chăm sóc sức khỏe toàn diện cho thú cưng của bạn mỗi ngày.
            </p>

            {/* Meta */}
              <div className="mb-8 grid grid-cols-2 gap-4 rounded-[16px] border border-[#f1f1f1] bg-white p-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[#6b7280]">Thương hiệu:</span>
                <span className="font-bold text-[#111827]">{(product as any).brand || "Khác"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6b7280]">Xuất xứ:</span>
                <span className="font-bold text-[#111827]">Chính hãng</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6b7280]">Phù hợp:</span>
                <span className="font-bold text-[#111827]">Mọi thú cưng</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6b7280]">Danh mục:</span>
                <span className="font-bold text-[#111827]">{product.category?.split(" > ").pop() || "Thú cưng"}</span>
              </div>
            </div>

            {/* Variants */}
            {productVariants.length > 0 && (
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-[#111827]">
                    Phân loại: <span className="text-[#10854F]">{selectedVariant?.label ?? ""}</span>
                  </h3>
                  <span className="text-xs text-[#6b7280]">{productVariants.length} lựa chọn</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productVariants.map(v => {
                    const isActive = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          if (v.image) setActiveImage(v.image);
                        }}
                        className={`flex items-center gap-2 rounded-[12px] border-2 px-3 py-2 text-left transition ${
                          isActive
                            ? "border-[#10854F] bg-[#F2F8EE]"
                            : "border-[#e5e7eb] bg-white hover:border-[#10854F]/40 hover:bg-[#fafafa]"
                        }`}
                      >
                        {v.image && (
                          <img
                            src={v.image}
                            alt={v.label}
                            className="h-8 w-8 rounded-lg object-contain bg-gray-50 shrink-0"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-bold leading-tight ${
                            isActive ? "text-[#0D7344]" : "text-[#374151]"
                          }`}>
                            {v.label}
                          </span>
                          <span className={`text-[11px] font-semibold ${
                            isActive ? "text-[#10854F]" : "text-[#6b7280]"
                          }`}>
                            {v.price}
                            {v.oldPrice && (
                              <span className="ml-1 line-through text-[#d1d5db]">{v.oldPrice}</span>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-[52px] w-[140px] shrink-0 items-center justify-between rounded-[16px] border border-[#f1f1f1] bg-white p-2 shadow-sm">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9fafb] text-[#4b5563] transition hover:bg-[#f1f5f9] hover:text-[#111827]"
                  >
                    <Minus size={18} strokeWidth={2.5}/>
                  </button>
                  <span className="w-8 text-center text-[15px] font-bold text-[#111827]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9fafb] text-[#4b5563] transition hover:bg-[#f1f5f9] hover:text-[#111827]"
                  >
                    <Plus size={18} strokeWidth={2.5}/>
                  </button>
                </div>

                {true ? (
                  <>
                    <button 
                      onClick={() => handleAddToCart(false)}
                      className="flex h-[60px] flex-1 items-center justify-center gap-2.5 rounded-[18px] bg-[#F2F8EE] px-6 text-[17px] font-black text-[#10854F] py-4 shadow-lg transition hover:bg-[#E4EDDB] hover:shadow-xl"
                    >
                      <ShoppingCart size={22} strokeWidth={2.5}/> Thêm vào giỏ 
                    </button>
                    <button 
                      onClick={() => handleAddToCart(true)}
                      className="flex h-[60px] flex-1 items-center justify-center gap-2.5 rounded-[18px] bg-[#10854F] px-6 text-[17px] font-black text-white shadow-lg py-4 shadow-[#10854F]/30 transition hover:bg-[#0D7344] hover:shadow-xl"
                    >
                      Mua ngay
                    </button>
                  </>
                ) : (
                  <button className="flex h-[60px] flex-1 items-center justify-center gap-2.5 rounded-[18px] bg-[#10854F] px-6 text-[17px] font-black text-white shadow-lg shadow-[#10854F]/30 transition hover:bg-[#0D7344] hover:shadow-xl">
                    <BellRing size={20} strokeWidth={2.5}/> Thông báo khi có hàng
                  </button>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-4 text-[12px] font-medium text-[#6b7280]">
                <span className="flex items-center gap-1"><CheckCircle size={14} className="text-[#10854F]"/> Chính hãng</span>
                <span className="text-[#d1d5db]">|</span>
                <span className="flex items-center gap-1"><RefreshCcw size={14} className="text-[#10854F]"/> Đổi trả 7 ngày</span>
                <span className="text-[#d1d5db]">|</span>
                <span className="flex items-center gap-1"><Truck size={14} className="text-[#10854F]"/> Giao nhanh 2H</span>
              </div>
            </div>

            {/* Coupons */}
            <div className="mb-8 rounded-[20px] bg-[#fff7ed] p-5">
              <h3 className="mb-4 flex items-center gap-2 font-black text-[#ea580c]"><Ticket size={18}/> Ưu đãi dành cho bạn</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-[12px] border border-[#ffedd5] bg-white p-3 shadow-sm relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ea580c]"></div>
                   <div>
                     <div className="text-[13px] font-black text-[#111827]">Giảm 50K</div>
                     <div className="text-[11px] text-[#6b7280]">Đơn từ 399K</div>
                     <div className="mt-1 inline-block rounded bg-[#fff7ed] px-1.5 py-0.5 text-[10px] font-bold text-[#ea580c]">SENMOI</div>
                   </div>
                   <button className="rounded-full bg-[#ea580c] px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#c2410c]">Lưu</button>
                </div>
                <div className="flex items-center justify-between rounded-[12px] border border-[#ffedd5] bg-white p-3 shadow-sm relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#16a34a]"></div>
                   <div>
                     <div className="text-[13px] font-black text-[#111827]">Freeship 25K</div>
                     <div className="text-[11px] text-[#6b7280]">Đơn từ 300K</div>
                     <div className="mt-1 inline-block rounded bg-[#f0fdf4] px-1.5 py-0.5 text-[10px] font-bold text-[#16a34a]">FREESHIP25K</div>
                   </div>
                   <button className="rounded-full bg-[#16a34a] px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#15803d]">Lưu</button>
                </div>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
               {[
                 {icon: Truck, title: "Giao hỏa tốc 2H", sub: "Nội thành TP.HCM"},
                 {icon: Award, title: "Freeship toàn quốc", sub: "Từ hạng Gold"},
                 {icon: Ticket, title: "Voucher thăng hạng", sub: "Đến 400k mỗi cấp"},
                 {icon: Star, title: "Tích điểm", sub: "Hoàn đến 12%"},
                 {icon: RefreshCcw, title: "Đổi trả miễn phí", sub: "Trong 7 ngày"},
                 {icon: ShieldCheck, title: "100% Chính hãng", sub: "200+ thương hiệu"},
               ].map((tb, idx) => (
                 <div key={idx} className="group flex flex-col items-center rounded-[16px] border border-[#f1f1f1] bg-white p-3 text-center transition-all hover:-translate-y-1 hover:border-[#10854F]/30 hover:shadow-md">
                   <div className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-[#F2F8EE] text-[#10854F] transition-colors group-hover:bg-[#10854F] group-hover:text-white">
                     <tb.icon size={20} strokeWidth={2}/>
                   </div>
                   <div className="text-[12px] font-bold text-[#111827]">{tb.title}</div>
                   <div className="text-[10px] text-[#6b7280]">{tb.sub}</div>
                 </div>
               ))}
            </div>

          </div>
        </div>

        {/* Tabs Content */}
        <div className="mt-16" ref={tabsRef}>
          {/* Sticky Tabs Header */}
          <div className={`flex gap-6 border-b border-[#e5e7eb] bg-[#fafafa] transition-all z-40 ${isSticky ? 'fixed top-0 left-0 w-full px-4 sm:px-6 lg:px-8 py-3 shadow-md' : 'py-2 overflow-x-auto scrollbar-hide'}`}>
            <div className={isSticky ? "mx-auto w-full max-w-[1280px] flex gap-6" : "flex gap-6 w-full"}>
              {["Mô tả", "Thành phần", "Hướng dẫn cho ăn", "Đánh giá"].map(tab => {
                const tabKey = tab === "Mô tả" ? "description" : tab === "Thành phần" ? "ingredients" : tab === "Hướng dẫn cho ăn" ? "guide" : "reviews";
                const isActive = activeTab === tabKey;
                return (
                  <button 
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`relative whitespace-nowrap pb-3 text-[15px] font-bold transition-colors ${isActive ? "text-[#10854F]" : "text-[#6b7280] hover:text-[#111827]"}`}
                  >
                    {tab}
                    {tab === "Đánh giá" && " (4.738)"}
                    {isActive && <div className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-[#10854F]"></div>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              {activeTab === "description" && (
                <div className="prose prose-sm max-w-none text-[#374151] prose-headings:text-[#111827] prose-a:text-[#10854F]">
                  <h2 className="text-xl font-black mb-4">{product.name}</h2>
                  <p className="mb-4 leading-relaxed">Sản phẩm <strong>{product.name}</strong> được làm từ nguyên liệu tươi ngon và chọn lọc kỹ lưỡng. Chúng tôi cam kết mang lại nguồn dinh dưỡng tốt nhất, cân bằng và đầy đủ để thú cưng của bạn phát triển khỏe mạnh mỗi ngày.</p>

                  <h3 className="text-lg font-bold mt-6 mb-3">Lợi ích nổi bật:</h3>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#10854F]"/> Nguồn nguyên liệu thật, giàu dinh dưỡng</li>
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#10854F]"/> Bổ sung Omega 3 &amp; 6 hỗ trợ tim mạch, da và lông mượt mà</li>
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#10854F]"/> Tăng cường hệ miễn dịch và tiêu hóa tốt hơn</li>
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#10854F]"/> Bữa ăn đầy đủ và cân bằng dưỡng chất thiết yếu</li>
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#10854F]"/> An toàn, không chứa chất bảo quản nhân tạo độc hại</li>
                  </ul>

                  <div className="mt-10 mb-10 overflow-hidden rounded-[32px] bg-[#F2F8EE] border border-[#E4EDDB]">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="relative min-h-[250px] md:min-h-full">
                        <Image src="/assets/images/pet-benefits.webp" alt="Thú cưng khỏe mạnh" className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                      <div className="p-8 lg:p-10">
                        <h3 className="mb-6 text-[22px] font-black leading-tight text-[#111827]">
                          Vì sao boss sẽ mê <span className="text-[#10854F]">{product.name}?</span>
                        </h3>
                        <div className="flex flex-col gap-6">
                          <div className="flex gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[#10854F] shadow-sm">
                              <Fish size={24} strokeWidth={2} />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-[#111827] mb-1">Hương vị hấp dẫn</div>
                              <div className="text-[13px] leading-relaxed text-[#4b5563]">Kích thích vị giác mạnh mẽ, phù hợp với cả những bé thú cưng kén ăn nhất.</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[#10854F] shadow-sm">
                              <BicepsFlexed size={24} strokeWidth={2} />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-[#111827] mb-1">Nguồn năng lượng dồi dào</div>
                              <div className="text-[13px] leading-relaxed text-[#4b5563]">Giàu đạm và khoáng chất, giúp thú cưng luôn năng động, hoạt bát mỗi ngày.</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[#10854F] shadow-sm">
                              <Droplets size={24} strokeWidth={2} />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-[#111827] mb-1">Chăm sóc sắc đẹp toàn diện</div>
                              <div className="text-[13px] leading-relaxed text-[#4b5563]">Cung cấp dưỡng chất thiết yếu giúp lông luôn mềm mượt, da khỏe mạnh.</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[#10854F] shadow-sm">
                              <Eye size={24} strokeWidth={2} />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-[#111827] mb-1">Tăng cường thị lực & sức khỏe</div>
                              <div className="text-[13px] leading-relaxed text-[#4b5563]">Bổ sung dưỡng chất quan trọng bảo vệ đôi mắt sáng và tăng sức đề kháng.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ingredients" && (
                <div className="prose prose-sm max-w-none text-[#374151]">
                  <h3 className="text-lg font-bold text-[#111827] mb-3">Thành phần chính:</h3>
                  <p className="leading-relaxed">
                    Cá ngừ, chất kết dính tự nhiên, vitamin và khoáng chất bổ sung gồm Choline Chloride, Vitamin A, D3, E, Niacin, Vitamin B1, B2, B6, Vitamin K3, Axit folic, Biotin, Taurine, Kẽm, Sắt, Mangan, Iốt, Coben, Selen.
                  </p>
                </div>
              )}

              {activeTab === "guide" && (
                <div className="prose prose-sm max-w-none text-[#374151]">
                  <h3 className="text-lg font-bold text-[#111827] mb-3">Hướng dẫn sử dụng:</h3>
                  <ul className="space-y-2">
                    <li>Có thể cho ăn trực tiếp.</li>
                    <li>Bổ sung nước sạch hàng ngày cho mèo.</li>
                    <li><strong className="text-[#10854F]">Quan trọng:</strong> Sau khi mở nắp, bảo quản ngăn mát và dùng hết trong 48 giờ.</li>
                    <li>Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.</li>
                  </ul>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                   <div className="mb-8 flex flex-col md:flex-row gap-8 rounded-[24px] bg-white p-6 shadow-sm border border-[#f1f1f1]">
                     <div className="flex flex-col items-center justify-center text-center md:w-1/3 md:border-r md:border-[#f1f1f1]">
                       <div className="text-[48px] font-black text-[#111827] leading-none">5.0<span className="text-xl text-[#9ca3af]">/5</span></div>
                       <div className="my-2 flex text-[#f5b014]"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div>
                       <div className="text-sm text-[#6b7280]">4.738 đánh giá</div>
                       <button className="mt-4 rounded-full bg-[#10854F] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#0D7344]">Viết đánh giá</button>
                     </div>
                     <div className="md:w-2/3 flex flex-wrap gap-2 items-start content-start">
                       {["Tất cả", "5 sao (4.700)", "Có hình ảnh (1.200)", "Đã mua hàng", "Hương vị Cá Ngừ", "Hương vị Hải Sản"].map((filter, i) => (
                         <button key={i} className={`rounded-full px-4 py-1.5 text-[13px] font-bold border transition ${i === 0 ? "bg-[#F2F8EE] text-[#10854F] border-[#10854F]" : "bg-white text-[#4b5563] border-[#e5e7eb] hover:border-[#10854F]"}`}>{filter}</button>
                       ))}
                     </div>
                   </div>

                   <div className="space-y-6">
                     {[
                       { name: "Nguyễn M.", date: "2 ngày trước", text: "Boss nhà mình rất thích vị cá ngừ, mở lon ra thơm, pate mềm dẻo ăn. Đóng gói rất cẩn thận, giao hàng siêu nhanh luôn 10 điểm!" },
                       { name: "Trần Hà", date: "1 tuần trước", text: "Mua ở 3F Store yên tâm hàng chuẩn. Pate thơm, mèo ăn mập thấy, lông mượt. Mua lúc sale siêu hời!" }
                     ].map((review, i) => (
                       <div key={i} className="flex gap-4 border-b border-[#f1f1f1] pb-6">
                         <div className="h-10 w-10 shrink-0 rounded-full bg-[#f3f4f6] flex items-center justify-center font-bold text-[#9ca3af]">{review.name.charAt(0)}</div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <div className="font-bold text-[#111827]">{review.name}</div>
                             <div className="flex items-center gap-1 text-[11px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded"><CheckCircle size={10}/> Đã mua hàng</div>
                             <div className="text-xs text-[#9ca3af] ml-auto">{review.date}</div>
                           </div>
                           <div className="flex text-[#f5b014] mb-2"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                           <p className="text-sm text-[#4b5563] mb-3">{review.text}</p>
                           <div className="flex gap-2">
                             <div className="h-16 w-16 bg-[#f3f4f6] rounded-lg overflow-hidden"><Image src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply opacity-50"/></div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

            {/* Bảng thông tin */}
            <div className="lg:col-span-4">
               <div className="sticky top-24 rounded-[20px] bg-white p-6 shadow-sm border border-[#f1f1f1]">
                 <h3 className="text-lg font-black text-[#111827] mb-4">Thông tin sản phẩm</h3>
                 <div className="flex flex-col gap-3 text-[13px]">
                   <div className="flex border-b border-[#f9fafb] pb-2">
                     <span className="w-1/3 text-[#6b7280]">Thương hiệu</span>
                     <span className="w-2/3 font-bold text-[#111827]">{product.name.split(' ')[0] || "Đang cập nhật"}</span>
                   </div>
                   <div className="flex border-b border-[#f9fafb] pb-2">
                     <span className="w-1/3 text-[#6b7280]">Danh mục</span>
                     <span className="w-2/3 font-bold text-[#111827]">{product.category || "Đang cập nhật"}</span>
                   </div>
                   <div className="flex border-b border-[#f9fafb] pb-2">
                     <span className="w-1/3 text-[#6b7280]">Loại</span>
                     <span className="w-2/3 font-bold text-[#111827]">Pate mèo ướt</span>
                   </div>
                   <div className="flex border-b border-[#f9fafb] pb-2">
                     <span className="w-1/3 text-[#6b7280]">Trọng lượng</span>
                     <span className="w-2/3 font-bold text-[#111827]">400g</span>
                   </div>
                   <div className="flex border-b border-[#f9fafb] pb-2">
                     <span className="w-1/3 text-[#6b7280]">Phù hợp</span>
                     <span className="w-2/3 font-bold text-[#111827]">Mèo mọi lứa tuổi</span>
                   </div>
                   <div className="flex pb-2">
                     <span className="w-1/3 text-[#6b7280]">Hương vị</span>
                     <span className="w-2/3 font-bold text-[#111827]">6 hương vị khác nhau</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Cross Sell & Upsell */}
        <div className="mt-20">
          <h2 className="mb-6 text-[22px] font-black text-[#111827]">Mua kèm cho boss ăn ngon hơn 🐱</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {crossSellProducts.map((p, i) => (
               <Link to={`/product/${p.id || i}`} key={i} className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-[#f1f1f1] bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                 <div className="relative mb-3 aspect-square w-full rounded-[12px] bg-[#f8f9fa] p-2">
                   <Image src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" />
                 </div>
                 <h3 className="text-[13px] font-bold text-[#111827] line-clamp-2 min-h-[38px]">{p.name}</h3>
                 <div className="mt-2 text-sm font-black text-[#10854F]">{p.price}</div>
                 <button className="mt-3 w-full rounded-xl bg-[#F2F8EE] py-2 text-[12px] font-bold text-[#10854F] transition group-hover:bg-[#10854F] group-hover:text-white">
                   + Thêm nhanh
                 </button>
               </Link>
             ))}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar for Mobile & Desktop when scrolled far */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#f1f1f1] p-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 transition-transform">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between gap-4">
           <div className="hidden sm:flex items-center gap-3">
             <Image src={product.image} alt={product.name} className="h-12 w-12 rounded-lg bg-[#f9fafb] object-contain p-1 mix-blend-multiply"/>
               <div>
               <div className="text-[13px] font-bold text-[#111827] line-clamp-1 max-w-[300px]">{product.name}</div>
               <div className="text-[14px] font-black text-[#10854F]">{product.price}</div>
             </div>
           </div>
           
           {/* Mobile view primarily price */}
            <div className="sm:hidden flex flex-col">
            <span className="text-[12px] font-bold text-[#6b7280]">Tổng cộng:</span>
            <span className="text-[18px] font-black text-[#10854F]">{product.price}</span>
          </div>

           <div className="flex gap-2 w-full sm:w-auto">
             <button 
               onClick={() => handleAddToCart(false)}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-[14px] bg-[#F2F8EE] px-6 py-3 text-[14px] font-black text-[#10854F] transition hover:bg-[#E4EDDB]"
             >
               <ShoppingCart size={18} strokeWidth={2.5}/> Thêm vào giỏ
             </button>
             <button 
                onClick={() => handleAddToCart(true)}
                className="flex-1 sm:flex-none flex items-center justify-center rounded-[14px] bg-[#10854F] px-8 py-3 text-[14px] font-black text-white shadow-md shadow-[#10854F]/20 transition hover:bg-[#0D7344]"
              >
                Mua ngay
              </button>
           </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed right-4 top-24 z-50 flex items-center gap-3 rounded-2xl bg-[#10854F] px-6 py-4 text-white shadow-xl animate-bounce">
          <CheckCircle size={20} />
          <span className="text-sm font-bold">Đã thêm vào giỏ hàng thành công!</span>
        </div>
      )}
    </div>
  );
}
