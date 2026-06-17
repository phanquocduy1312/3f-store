"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductDetail, getProducts } from "@/src/api/productsApi";
import { addToCart, parsePriceString } from "@/lib/cartHelper";
import { Image } from "@/components/Image";
import { SaleBadge } from "@/components/SaleBadge";
import { NewBadge } from "@/components/NewBadge";
import { 
  Star, ChevronRight, ShoppingCart, Heart, Share2, 
  Minus, Plus, BellRing, Truck, Ticket, Award, RefreshCcw, CheckCircle, ShieldCheck,
  Fish, BicepsFlexed, Droplets, Eye, HeartHandshake
} from "lucide-react";
import type { Product } from "@/types/store";

function getDescriptionLines(description?: string) {
  return String(description ?? "")
    .split(/<br\s*\/?>|\n/gi)
    .map((line) => line.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

const EMPTY_PRODUCT: Product = {
  id: "",
  name: "",
  price: "0đ",
  image: "",
  rating: 4.8,
  reviews: 0,
  sold: 0,
};

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product>(EMPTY_PRODUCT);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);
  
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
  const selectedVariant = productVariants.find(v => v.id === selectedVariantId) ?? null;

  const [showToast, setShowToast] = useState(false);
  const [crossSellProducts, setCrossSellProducts] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  
  // Active image: use selected variant image if available
  const [activeImage, setActiveImage] = useState(selectedVariant?.image || product.image);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    setIsLoadingProduct(true);
    setDetailError(null);
    setSelectedVariantId(null);
    setCartMessage(null);

    getProductDetail(id)
      .then(({ item }) => {
        if (!isMounted) return;
        setProduct(item);
        setActiveImage(item.image);
      })
      .catch((error) => {
        if (!isMounted) return;
        setProduct(EMPTY_PRODUCT);
        setDetailError(error instanceof Error ? error.message : "Khong tai duoc san pham.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingProduct(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getProducts({ sort: "popular", limit: 4 }),
      getProducts({ sort: "newest", limit: 4 }),
    ])
      .then(([saleResult, featuredResult]) => {
        if (!isMounted) return;
        setCrossSellProducts(saleResult.items);
        setSimilarProducts(featuredResult.items);
      })
      .catch(() => {
        if (!isMounted) return;
        setCrossSellProducts([]);
        setSimilarProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
    if (productVariants.length > 0 && !selectedVariantId) {
      setCartMessage("Vui lòng chọn phân loại sản phẩm.");
      return;
    }
    const variantPrice = selectedVariant?.price ?? product.price;
    const variantOldPrice = selectedVariant?.oldPrice ?? (product as any).oldPrice;
    addToCart({
      id: selectedVariant?.id ?? product.id,
      productId: String(product.backendId ?? product.sourceProductId ?? product.id),
      variantId: selectedVariant?.id,
      sku: selectedVariant?.sku,
      name: product.name,
      image: selectedVariant?.image ?? product.image,
      price: parsePriceString(variantPrice),
      originalPrice: variantOldPrice ? parsePriceString(variantOldPrice) : undefined,
      variantName: selectedVariant?.label,
      variant: selectedVariant?.label ?? "Mặc định"
    }, quantity);

    setCartMessage(null);
    if (goToCart) {
      navigate("/cart");
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const currentPriceValue = parsePriceString(selectedVariant?.price ?? product.price);
  const oldPriceValueStr = selectedVariant?.oldPrice ?? (product as any).oldPrice;
  const oldPriceValue = oldPriceValueStr ? parsePriceString(oldPriceValueStr) : 0;
  const hasDiscount = oldPriceValue > currentPriceValue;
  const discountPercent = hasDiscount ? Math.round((1 - currentPriceValue / oldPriceValue) * 100) : 0;
  const isNew = (product as any).sold ? (product as any).sold < 500 : true;

  const formattedTotalPrice = (currentPriceValue * quantity).toLocaleString("vi-VN") + "đ";
  const formattedOldPrice = oldPriceValue > 0 ? (oldPriceValue * quantity).toLocaleString("vi-VN") + "đ" : null;

  const descriptionLines = getDescriptionLines(product.description);

  if (isLoadingProduct) {
    return <div className="py-20 text-center font-bold text-xl">Đang tải sản phẩm...</div>;
  }

  if (detailError || !product.id) {
    return <div className="py-20 text-center font-bold text-xl">{detailError || "Không tìm thấy sản phẩm"}</div>;
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] pb-32">
      {/* Màn hình hiển thị chi tiết */}
      <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px] font-medium text-[rgb(var(--color-ink-soft))]">
          <Link to="/" className="hover:text-[rgb(var(--color-primary))]">Trang chủ</Link>
          <ChevronRight size={14} />
          {product.category?.split(' > ').map((cat: string, i: number, arr: string[]) => (
            <span key={i} className="flex items-center gap-2">
              <Link to={`/products?category=${cat}`} className="hover:text-[rgb(var(--color-primary))]">{cat}</Link>
              <ChevronRight size={14} />
            </span>
          ))}
          <span className="text-[rgb(var(--color-ink))] line-clamp-1 max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          
          {/* Left: Gallery (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit z-10">
            <div className="group relative aspect-square w-full overflow-hidden rounded-[24px] border border-[rgb(var(--color-border))] bg-white">
              {/* Badges */}
              <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2 origin-top-left scale-[0.4] sm:scale-[0.5] pointer-events-none">
                {hasDiscount && (
                  <SaleBadge discount={discountPercent} />
                )}
                {isNew && (
                  <NewBadge />
                )}
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
                  className={`relative aspect-square w-20 shrink-0 cursor-pointer rounded-[16px] border-2 bg-white p-2 transition ${activeImage === img ? "border-[rgb(var(--color-primary))]" : "border-transparent hover:border-[rgb(var(--color-border))]"}`}
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
              <span className="flex items-center gap-1 rounded-md bg-[rgb(var(--color-primary-soft))] px-2 py-1 text-[11px] font-bold text-[rgb(var(--color-primary))]">
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
            <h1 className="mb-3 text-[24px] font-black leading-tight text-[rgb(var(--color-ink))] md:text-[28px]">
              {product.name}
            </h1>
            
            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-[#f5b014]">
                {Array.from({length: 5}).map((_, i) => (
                  <Star key={i} size={15} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "transparent"} color={i < Math.floor(product.rating || 5) ? "currentColor" : "#d1d5db"} strokeWidth={2.5}/>
                ))}
              </div>
              <span className="font-bold text-[rgb(var(--color-ink))]">{(product.rating || 5.0).toFixed(1)}</span>
              <span className="text-[#d1d5db]">|</span>
              <span className="font-medium text-[rgb(var(--color-ink-soft))]"><strong className="text-[rgb(var(--color-ink))]">{(product.reviews || 0).toLocaleString("vi-VN")}</strong> đánh giá</span>
              <span className="text-[#d1d5db]">|</span>
              <span className="font-medium text-[rgb(var(--color-ink-soft))]">Đã bán <strong className="text-[rgb(var(--color-ink))]">{(product.sold || 0).toLocaleString("vi-VN")}</strong></span>
            </div>

            {/* Price Box */}
            <div className="mb-6 rounded-[20px] bg-[rgb(var(--color-primary-soft))] p-5">
              <div className="flex items-end gap-3">
                <span className="text-[28px] font-black leading-none text-[rgb(var(--color-primary))]">
                  {formattedTotalPrice}
                </span>
                {formattedOldPrice && (
                  <span className="mb-1 text-base font-semibold text-[rgb(var(--color-ink-soft))] line-through">
                    {formattedOldPrice}
                  </span>
                )}
                <span className="mb-1 rounded-md bg-[rgb(var(--color-primary))] px-1.5 py-0.5 text-xs font-black text-white">Giá tốt</span>
              </div>
            </div>

            {/* Short Desc */}
            <p className="mb-6 text-[15px] leading-relaxed text-[rgb(var(--color-ink-soft))]">
              Sản phẩm <strong>{product.name}</strong> cung cấp dinh dưỡng hoàn hảo và hương vị thơm ngon, chăm sóc sức khỏe toàn diện cho thú cưng của bạn mỗi ngày.
            </p>

            {/* Meta */}
              <div className="mb-8 grid grid-cols-2 gap-4 rounded-[16px] border border-[rgb(var(--color-border))] bg-white p-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[rgb(var(--color-ink-soft))]">Thương hiệu:</span>
                <span className="font-bold text-[rgb(var(--color-ink))]">{(product as any).brand || "Khác"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[rgb(var(--color-ink-soft))]">Xuất xứ:</span>
                <span className="font-bold text-[rgb(var(--color-ink))]">Chính hãng</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[rgb(var(--color-ink-soft))]">Phù hợp:</span>
                <span className="font-bold text-[rgb(var(--color-ink))]">Mọi thú cưng</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[rgb(var(--color-ink-soft))]">Danh mục:</span>
                <span className="font-bold text-[rgb(var(--color-ink))]">{product.category?.split(" > ").pop() || "Thú cưng"}</span>
              </div>
            </div>

            {/* Variants */}
            {productVariants.length > 0 && (
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-[rgb(var(--color-ink))]">
                    Phân loại: <span className="text-[rgb(var(--color-primary))]">{selectedVariant?.label ?? ""}</span>
                  </h3>
                  <span className="text-xs text-[rgb(var(--color-ink-soft))]">{productVariants.length} lựa chọn</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productVariants.map(v => {
                    const isActive = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setCartMessage(null);
                          if (v.image) setActiveImage(v.image);
                        }}
                        className={`flex items-center gap-2 rounded-[12px] border-2 px-3 py-2 text-left transition ${
                          isActive
                            ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary-soft))]"
                            : "border-[rgb(var(--color-border))] bg-white hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-surface))]"
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
                            isActive ? "text-[rgb(var(--color-primary-dark))]" : "text-[rgb(var(--color-ink))]"
                          }`}>
                            {v.label}
                          </span>
                          <span className={`text-[11px] font-semibold ${
                            isActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-ink-soft))]"
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
                {cartMessage && (
                  <p className="mt-3 text-sm font-bold text-red-600">{cartMessage}</p>
                )}
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-[52px] w-[140px] shrink-0 items-center justify-between rounded-[16px] border border-[rgb(var(--color-border))] bg-white p-2 shadow-sm">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--color-surface-soft))] text-[rgb(var(--color-ink-soft))] transition hover:bg-[rgb(var(--color-surface-soft))] hover:text-[rgb(var(--color-ink))]"
                  >
                    <Minus size={18} strokeWidth={2.5}/>
                  </button>
                  <span className="w-8 text-center text-[15px] font-bold text-[rgb(var(--color-ink))]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--color-surface-soft))] text-[rgb(var(--color-ink-soft))] transition hover:bg-[rgb(var(--color-surface-soft))] hover:text-[rgb(var(--color-ink))]"
                  >
                    <Plus size={18} strokeWidth={2.5}/>
                  </button>
                </div>

                {true ? (
                  <>
                    <button 
                      onClick={() => handleAddToCart(false)}
                      className="flex h-[60px] flex-1 items-center justify-center gap-2.5 rounded-[18px] bg-[rgb(var(--color-primary-soft))] px-6 text-[17px] font-black text-[rgb(var(--color-primary))] py-4 shadow-lg transition hover:bg-[rgb(var(--color-primary-muted))] hover:shadow-xl"
                    >
                      <ShoppingCart size={22} strokeWidth={2.5}/> Thêm vào giỏ 
                    </button>
                    <button 
                      onClick={() => handleAddToCart(true)}
                      className="flex h-[60px] flex-1 items-center justify-center gap-2.5 rounded-[18px] bg-[rgb(var(--color-primary))] px-6 text-[17px] font-black text-white shadow-lg py-4 shadow-[rgb(var(--color-primary))]/30 transition hover:bg-[rgb(var(--color-primary-dark))] hover:shadow-xl"
                    >
                      Mua ngay
                    </button>
                  </>
                ) : (
                  <button className="flex h-[60px] flex-1 items-center justify-center gap-2.5 rounded-[18px] bg-[rgb(var(--color-primary))] px-6 text-[17px] font-black text-white shadow-lg shadow-[rgb(var(--color-primary))]/30 transition hover:bg-[rgb(var(--color-primary-dark))] hover:shadow-xl">
                    <BellRing size={20} strokeWidth={2.5}/> Thông báo khi có hàng
                  </button>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-4 text-[12px] font-medium text-[rgb(var(--color-ink-soft))]">
                <span className="flex items-center gap-1"><CheckCircle size={14} className="text-[rgb(var(--color-primary))]"/> Chính hãng</span>
                <span className="text-[#d1d5db]">|</span>
                <span className="flex items-center gap-1"><RefreshCcw size={14} className="text-[rgb(var(--color-primary))]"/> Đổi trả 7 ngày</span>
                <span className="text-[#d1d5db]">|</span>
                <span className="flex items-center gap-1"><Truck size={14} className="text-[rgb(var(--color-primary))]"/> Giao nhanh 2H</span>
              </div>
            </div>

            {/* Coupons */}
            <div className="mb-8 rounded-[20px] bg-[#fff7ed] p-5">
              <h3 className="mb-4 flex items-center gap-2 font-black text-[#ea580c]"><Ticket size={18}/> Ưu đãi dành cho bạn</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-[12px] border border-[#ffedd5] bg-white p-3 shadow-sm relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ea580c]"></div>
                   <div>
                     <div className="text-[13px] font-black text-[rgb(var(--color-ink))]">Giảm 50K</div>
                     <div className="text-[11px] text-[rgb(var(--color-ink-soft))]">Đơn từ 399K</div>
                     <div className="mt-1 inline-block rounded bg-[#fff7ed] px-1.5 py-0.5 text-[10px] font-bold text-[#ea580c]">SENMOI</div>
                   </div>
                   <button className="rounded-full bg-[#ea580c] px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#c2410c]">Lưu</button>
                </div>
                <div className="flex items-center justify-between rounded-[12px] border border-[#ffedd5] bg-white p-3 shadow-sm relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#16a34a]"></div>
                   <div>
                     <div className="text-[13px] font-black text-[rgb(var(--color-ink))]">Freeship 25K</div>
                     <div className="text-[11px] text-[rgb(var(--color-ink-soft))]">Đơn từ 300K</div>
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
                 <div key={idx} className="group flex flex-col items-center rounded-[16px] border border-[rgb(var(--color-border))] bg-white p-3 text-center transition-all hover:-translate-y-1 hover:border-[rgb(var(--color-primary))]/30 hover:shadow-md">
                   <div className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))] transition-colors group-hover:bg-[rgb(var(--color-primary))] group-hover:text-white">
                     <tb.icon size={20} strokeWidth={2}/>
                   </div>
                   <div className="text-[12px] font-bold text-[rgb(var(--color-ink))]">{tb.title}</div>
                   <div className="text-[10px] text-[rgb(var(--color-ink-soft))]">{tb.sub}</div>
                 </div>
               ))}
            </div>

          </div>
        </div>

        {/* Tabs Content */}
        <div className="mt-16" ref={tabsRef}>
          {/* Sticky Tabs Header */}
          <div className={`flex gap-6 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] transition-all z-40 ${isSticky ? 'fixed top-0 left-0 w-full px-4 sm:px-6 lg:px-8 py-3 shadow-md' : 'py-2 overflow-x-auto scrollbar-hide'}`}>
            <div className={isSticky ? "mx-auto w-full max-w-[1280px] flex gap-6" : "flex gap-6 w-full"}>
              {["Mô tả", "Thành phần", "Hướng dẫn cho ăn", "Đánh giá"].map(tab => {
                const tabKey = tab === "Mô tả" ? "description" : tab === "Thành phần" ? "ingredients" : tab === "Hướng dẫn cho ăn" ? "guide" : "reviews";
                const isActive = activeTab === tabKey;
                return (
                  <button 
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`relative whitespace-nowrap pb-3 text-[15px] font-bold transition-colors ${isActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-ink-soft))] hover:text-[rgb(var(--color-ink))]"}`}
                  >
                    {tab}
                    {tab === "Đánh giá" && " (4.738)"}
                    {isActive && <div className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-[rgb(var(--color-primary))]"></div>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              {activeTab === "description" && (
                <div className="prose prose-sm max-w-none text-[rgb(var(--color-ink))] prose-headings:text-[rgb(var(--color-ink))] prose-a:text-[rgb(var(--color-primary))]">
                  <h2 className="text-xl font-black mb-4">{product.name}</h2>
                  {descriptionLines.length > 0 ? (
                    <div className="mb-4 space-y-3 leading-relaxed">
                      {descriptionLines.slice(0, 18).map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-4 leading-relaxed">Sản phẩm <strong>{product.name}</strong> được làm từ nguyên liệu tươi ngon và chọn lọc kỹ lưỡng. Chúng tôi cam kết mang lại nguồn dinh dưỡng tốt nhất, cân bằng và đầy đủ để thú cưng của bạn phát triển khỏe mạnh mỗi ngày.</p>
                  )}

                  <h3 className="text-lg font-bold mt-6 mb-3">Lợi ích nổi bật:</h3>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[rgb(var(--color-primary))]"/> Nguồn nguyên liệu thật, giàu dinh dưỡng</li>
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[rgb(var(--color-primary))]"/> Bổ sung Omega 3 &amp; 6 hỗ trợ tim mạch, da và lông mượt mà</li>
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[rgb(var(--color-primary))]"/> Tăng cường hệ miễn dịch và tiêu hóa tốt hơn</li>
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[rgb(var(--color-primary))]"/> Bữa ăn đầy đủ và cân bằng dưỡng chất thiết yếu</li>
                    <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[rgb(var(--color-primary))]"/> An toàn, không chứa chất bảo quản nhân tạo độc hại</li>
                  </ul>

                  <div className="mt-10 mb-10 overflow-hidden rounded-[32px] bg-[rgb(var(--color-primary-soft))] border border-[rgb(var(--color-primary-muted))]">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="relative min-h-[250px] md:min-h-full">
                        <Image src="/assets/images/pet-benefits.webp" alt="Thú cưng khỏe mạnh" className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                      <div className="p-8 lg:p-10">
                        <h3 className="mb-6 text-[22px] font-black leading-tight text-[rgb(var(--color-ink))]">
                          Vì sao boss sẽ mê <span className="text-[rgb(var(--color-primary))]">{product.name}?</span>
                        </h3>
                        <div className="flex flex-col gap-6">
                          <div className="flex gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[rgb(var(--color-primary))] shadow-sm">
                              <Fish size={24} strokeWidth={2} />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-[rgb(var(--color-ink))] mb-1">Hương vị hấp dẫn</div>
                              <div className="text-[13px] leading-relaxed text-[rgb(var(--color-ink-soft))]">Kích thích vị giác mạnh mẽ, phù hợp với cả những bé thú cưng kén ăn nhất.</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[rgb(var(--color-primary))] shadow-sm">
                              <BicepsFlexed size={24} strokeWidth={2} />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-[rgb(var(--color-ink))] mb-1">Nguồn năng lượng dồi dào</div>
                              <div className="text-[13px] leading-relaxed text-[rgb(var(--color-ink-soft))]">Giàu đạm và khoáng chất, giúp thú cưng luôn năng động, hoạt bát mỗi ngày.</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[rgb(var(--color-primary))] shadow-sm">
                              <Droplets size={24} strokeWidth={2} />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-[rgb(var(--color-ink))] mb-1">Chăm sóc sắc đẹp toàn diện</div>
                              <div className="text-[13px] leading-relaxed text-[rgb(var(--color-ink-soft))]">Cung cấp dưỡng chất thiết yếu giúp lông luôn mềm mượt, da khỏe mạnh.</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[rgb(var(--color-primary))] shadow-sm">
                              <Eye size={24} strokeWidth={2} />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-[rgb(var(--color-ink))] mb-1">Tăng cường thị lực & sức khỏe</div>
                              <div className="text-[13px] leading-relaxed text-[rgb(var(--color-ink-soft))]">Bổ sung dưỡng chất quan trọng bảo vệ đôi mắt sáng và tăng sức đề kháng.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ingredients" && (
                <div className="prose prose-sm max-w-none text-[rgb(var(--color-ink))]">
                  <h3 className="text-lg font-bold text-[rgb(var(--color-ink))] mb-3">Thành phần chính:</h3>
                  <p className="leading-relaxed">
                    Cá ngừ, chất kết dính tự nhiên, vitamin và khoáng chất bổ sung gồm Choline Chloride, Vitamin A, D3, E, Niacin, Vitamin B1, B2, B6, Vitamin K3, Axit folic, Biotin, Taurine, Kẽm, Sắt, Mangan, Iốt, Coben, Selen.
                  </p>
                </div>
              )}

              {activeTab === "guide" && (
                <div className="prose prose-sm max-w-none text-[rgb(var(--color-ink))]">
                  <h3 className="text-lg font-bold text-[rgb(var(--color-ink))] mb-3">Hướng dẫn sử dụng:</h3>
                  <ul className="space-y-2">
                    <li>Có thể cho ăn trực tiếp.</li>
                    <li>Bổ sung nước sạch hàng ngày cho mèo.</li>
                    <li><strong className="text-[rgb(var(--color-primary))]">Quan trọng:</strong> Sau khi mở nắp, bảo quản ngăn mát và dùng hết trong 48 giờ.</li>
                    <li>Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.</li>
                  </ul>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                   <div className="mb-8 flex flex-col md:flex-row gap-8 rounded-[24px] bg-white p-6 shadow-sm border border-[rgb(var(--color-border))]">
                     <div className="flex flex-col items-center justify-center text-center md:w-1/3 md:border-r md:border-[rgb(var(--color-border))]">
                       <div className="text-[48px] font-black text-[rgb(var(--color-ink))] leading-none">5.0<span className="text-xl text-[rgb(var(--color-ink-soft))]">/5</span></div>
                       <div className="my-2 flex text-[#f5b014]"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div>
                       <div className="text-sm text-[rgb(var(--color-ink-soft))]">4.738 đánh giá</div>
                       <button className="mt-4 rounded-full bg-[rgb(var(--color-primary))] px-6 py-2 text-sm font-bold text-white transition hover:bg-[rgb(var(--color-primary-dark))]">Viết đánh giá</button>
                     </div>
                     <div className="md:w-2/3 flex flex-wrap gap-2 items-start content-start">
                       {["Tất cả", "5 sao (4.700)", "Có hình ảnh (1.200)", "Đã mua hàng", "Hương vị Cá Ngừ", "Hương vị Hải Sản"].map((filter, i) => (
                         <button key={i} className={`rounded-full px-4 py-1.5 text-[13px] font-bold border transition ${i === 0 ? "bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]" : "bg-white text-[rgb(var(--color-ink-soft))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]"}`}>{filter}</button>
                       ))}
                     </div>
                   </div>

                   <div className="space-y-6">
                     {[
                       { name: "Nguyễn M.", date: "2 ngày trước", text: "Boss nhà mình rất thích vị cá ngừ, mở lon ra thơm, pate mềm dẻo ăn. Đóng gói rất cẩn thận, giao hàng siêu nhanh luôn 10 điểm!" },
                       { name: "Trần Hà", date: "1 tuần trước", text: "Mua ở 3F Store yên tâm hàng chuẩn. Pate thơm, mèo ăn mập thấy, lông mượt. Mua lúc sale siêu hời!" }
                     ].map((review, i) => (
                       <div key={i} className="flex gap-4 border-b border-[rgb(var(--color-border))] pb-6">
                         <div className="h-10 w-10 shrink-0 rounded-full bg-[#f3f4f6] flex items-center justify-center font-bold text-[rgb(var(--color-ink-soft))]">{review.name.charAt(0)}</div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <div className="font-bold text-[rgb(var(--color-ink))]">{review.name}</div>
                             <div className="flex items-center gap-1 text-[11px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded"><CheckCircle size={10}/> Đã mua hàng</div>
                             <div className="text-xs text-[rgb(var(--color-ink-soft))] ml-auto">{review.date}</div>
                           </div>
                           <div className="flex text-[#f5b014] mb-2"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                           <p className="text-sm text-[rgb(var(--color-ink-soft))] mb-3">{review.text}</p>
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
               <div className="sticky top-24 rounded-[20px] bg-white p-6 shadow-sm border border-[rgb(var(--color-border))]">
                 <h3 className="text-lg font-black text-[rgb(var(--color-ink))] mb-4">Thông tin sản phẩm</h3>
                 <div className="flex flex-col gap-3 text-[13px]">
                   <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Thương hiệu</span>
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">{product.name.split(' ')[0] || "Đang cập nhật"}</span>
                   </div>
                   <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Danh mục</span>
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">{product.category || "Đang cập nhật"}</span>
                   </div>
                   <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Loại</span>
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">Pate mèo ướt</span>
                   </div>
                   <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Trọng lượng</span>
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">400g</span>
                   </div>
                   <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Phù hợp</span>
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">Mèo mọi lứa tuổi</span>
                   </div>
                   <div className="flex pb-2">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Hương vị</span>
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">6 hương vị khác nhau</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Cross Sell & Upsell */}
        <div className="mt-20">
          <h2 className="mb-6 text-[22px] font-black text-[rgb(var(--color-ink))]">Mua kèm cho boss ăn ngon hơn 🐱</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {crossSellProducts.map((p, i) => (
               <Link to={`/product/${p.id || i}`} key={i} className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-[rgb(var(--color-border))] bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                 <div className="relative mb-3 aspect-square w-full rounded-[12px] bg-[rgb(var(--color-surface-soft))] p-2">
                   <Image src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" />
                 </div>
                 <h3 className="text-[13px] font-bold text-[rgb(var(--color-ink))] line-clamp-2 min-h-[38px]">{p.name}</h3>
                 <div className="mt-2 text-sm font-black text-[rgb(var(--color-primary))]">{p.price}</div>
                 <button className="mt-3 w-full rounded-xl bg-[rgb(var(--color-primary-soft))] py-2 text-[12px] font-bold text-[rgb(var(--color-primary))] transition group-hover:bg-[rgb(var(--color-primary))] group-hover:text-white">
                   + Thêm nhanh
                 </button>
               </Link>
             ))}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar for Mobile & Desktop when scrolled far */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[rgb(var(--color-border))] p-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 transition-transform">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between gap-4">
           <div className="hidden sm:flex items-center gap-3">
             <Image src={product.image} alt={product.name} className="h-12 w-12 rounded-lg bg-[rgb(var(--color-surface-soft))] object-contain p-1 mix-blend-multiply"/>
               <div>
               <div className="text-[13px] font-bold text-[rgb(var(--color-ink))] line-clamp-1 max-w-[300px]">{product.name}</div>
               <div className="text-[14px] font-black text-[rgb(var(--color-primary))]">{formattedTotalPrice}</div>
             </div>
           </div>
           
           {/* Mobile view primarily price */}
            <div className="sm:hidden flex flex-col">
            <span className="text-[12px] font-bold text-[rgb(var(--color-ink-soft))]">Tổng cộng:</span>
            <span className="text-[18px] font-black text-[rgb(var(--color-primary))]">{formattedTotalPrice}</span>
          </div>

           <div className="flex gap-2 w-full sm:w-auto">
             <button 
               onClick={() => handleAddToCart(false)}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-[14px] bg-[rgb(var(--color-primary-soft))] px-2 sm:px-6 py-3 text-[13px] sm:text-[14px] font-black text-[rgb(var(--color-primary))] transition hover:bg-[rgb(var(--color-primary-muted))]"
             >
               Thêm vào giỏ
             </button>
             <button 
                onClick={() => handleAddToCart(true)}
                className="flex-1 sm:flex-none flex items-center justify-center rounded-[14px] bg-[rgb(var(--color-primary))] px-8 py-3 text-[14px] font-black text-white shadow-md shadow-[rgb(var(--color-primary))]/20 transition hover:bg-[rgb(var(--color-primary-dark))]"
              >
                Mua ngay
              </button>
           </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed right-4 top-24 z-50 flex items-center gap-3 rounded-2xl bg-[rgb(var(--color-primary))] px-6 py-4 text-white shadow-xl animate-bounce">
          <CheckCircle size={20} />
          <span className="text-sm font-bold">Đã thêm vào giỏ hàng thành công!</span>
        </div>
      )}
    </div>
  );
}
