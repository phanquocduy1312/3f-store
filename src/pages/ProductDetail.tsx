"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  createProductReview,
  getProductDetail,
  getProductReviewEligibility,
  getProductReviews,
  getProducts,
  type ProductReview,
  type ProductReviewEligibility,
} from "@/src/api/productsApi";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { addToCart, parsePriceString } from "@/lib/cartHelper";
import { Image } from "@/components/Image";
import { SaleBadge } from "@/components/SaleBadge";
import { NewBadge } from "@/components/NewBadge";
import { 
  Star, ChevronRight, ShoppingCart, Heart, Share2, 
  Minus, Plus, BellRing, Truck, Ticket, Award, RefreshCcw, CheckCircle, ShieldCheck,
  Fish, BicepsFlexed, Droplets, Eye, HeartHandshake, X
} from "lucide-react";
import type { Product } from "@/types/store";
import { useWishlist } from "@/src/context/WishlistContext";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getDescriptionHtml(description?: string) {
  const raw = String(description ?? "").trim();
  if (!raw) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw;

  return raw
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("");
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

function isFoodItem(category?: string) {
  if (!category) return false;
  const foodKeywords = ["pate", "thức ăn", "hạt", "sữa", "bánh", "xúc xích", "cỏ", "thưởng", "dinh dưỡng", "food", "kibble", "treat"];
  const catLower = category.toLowerCase();
  return foodKeywords.some(keyword => catLower.includes(keyword));
}

function formatReviewDate(value?: string) {
  if (!value) return "";
  return new Date(value.replace(" ", "T")).toLocaleDateString("vi-VN");
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex text-[#f5b014]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={size} fill={index < Math.round(value) ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWishlist, isFavorite } = useWishlist();
  const [product, setProduct] = useState<Product>(EMPTY_PRODUCT);
  
  const isFav = isFavorite(product.id) || (product.backendId ? isFavorite(product.backendId) : false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);
  
  if (!product) {
    return <div className="py-20 text-center font-bold text-xl">Không tìm thấy sản phẩm</div>;
  }
  
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);

  // Real variants from product data
  const productVariants = product.variants ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const selectedVariant = productVariants.find(v => v.id === selectedVariantId) ?? null;

  const [crossSellProducts, setCrossSellProducts] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [reviewEligibility, setReviewEligibility] = useState<ProductReviewEligibility | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "images" | "verified">("all");
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const isFood = isFoodItem(product.category);
  const tabList = isFood 
    ? [
        { key: "description", label: "Mô tả" },
        { key: "ingredients", label: "Thành phần" },
        { key: "guide", label: "Hướng dẫn cho ăn" },
        { key: "reviews", label: "Đánh giá" }
      ]
    : [
        { key: "description", label: "Mô tả" },
        { key: "reviews", label: "Đánh giá" }
      ];
  
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

  const loadReviews = () => {
    if (!product.backendId) return;
    setIsLoadingReviews(true);
    const params = {
      limit: 20,
      rating: reviewFilter === "5" ? 5 : undefined,
      hasImages: reviewFilter === "images" ? true : undefined,
      verifiedOnly: reviewFilter === "verified" ? true : undefined,
    };

    Promise.all([
      getProductReviews(product.backendId, params),
      getProductReviewEligibility(product.backendId).catch(() => null),
    ])
      .then(([reviewRes, eligibilityRes]) => {
        setReviews(reviewRes.data.items);
        setReviewSummary(reviewRes.data.summary);
        if (eligibilityRes?.data) {
          setReviewEligibility(eligibilityRes.data);
        } else {
          setReviewEligibility(null);
        }
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Không tải được đánh giá.");
      })
      .finally(() => setIsLoadingReviews(false));
  };

  useEffect(() => {
    if (!product.backendId) return;
    loadReviews();
  }, [product.backendId, reviewFilter]);

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
      toast.error("Vui lòng chọn phân loại sản phẩm.");
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

    if (goToCart) {
      navigate("/cart");
    } else {
      toast.success("Đã thêm vào giỏ hàng thành công!");
    }
  };

  const openReviewModal = () => {
    if (reviewEligibility?.requiresLogin) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm.");
      navigate("/login");
      return;
    }
    if (!reviewEligibility?.eligible) {
      toast.error(reviewEligibility?.reason || "Chỉ khách đã mua và đơn hàng hoàn tất mới được đánh giá.");
      return;
    }
    setReviewRating(5);
    setReviewContent("");
    setIsReviewModalOpen(true);
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!product.backendId) return;
    if (!reviewEligibility?.eligible) {
      toast.error(reviewEligibility?.reason || "Chưa đủ điều kiện đánh giá.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await createProductReview(product.backendId, {
        rating: reviewRating,
        content: reviewContent.trim(),
        orderItemId: reviewEligibility.orderItemId,
      });
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      setIsReviewModalOpen(false);
      loadReviews();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không gửi được đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const displayedReviewCount = reviewSummary.reviewCount || product.reviews || 0;
  const displayedRating = displayedReviewCount > 0 ? (reviewSummary.averageRating || product.rating || 5) : 5;

  const currentPriceValue = parsePriceString(selectedVariant?.price ?? product.price);
  const oldPriceValueStr = selectedVariant?.oldPrice ?? (product as any).oldPrice;
  const oldPriceValue = oldPriceValueStr ? parsePriceString(oldPriceValueStr) : 0;
  const hasDiscount = oldPriceValue > currentPriceValue;
  const discountPercent = hasDiscount ? Math.round((1 - currentPriceValue / oldPriceValue) * 100) : 0;
  const isNew = (product as any).sold ? (product as any).sold < 500 : true;

  const hasVariants = productVariants.length > 0;
  const isVariantSelected = selectedVariantId !== null;
  const availableStock = 999;
  const isOutOfStock = false;
  const isButtonDisabled = hasVariants && !isVariantSelected;

  const formattedTotalPrice = (currentPriceValue * quantity).toLocaleString("vi-VN") + "đ";
  const formattedOldPrice = oldPriceValue > 0 ? (oldPriceValue * quantity).toLocaleString("vi-VN") + "đ" : null;

  const descriptionHtml = getDescriptionHtml(product.description);

  if (isLoadingProduct) {
    return <div className="py-20 text-center font-bold text-xl">Đang tải sản phẩm...</div>;
  }

  if (detailError || !product.id) {
    return <div className="py-20 text-center font-bold text-xl">{detailError || "Không tìm thấy sản phẩm"}</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-32">
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
                  <Star key={i} size={15} fill={i < Math.floor(displayedRating || 5) ? "currentColor" : "transparent"} color={i < Math.floor(displayedRating || 5) ? "currentColor" : "#d1d5db"} strokeWidth={2.5}/>
                ))}
              </div>
              <span className="font-bold text-[rgb(var(--color-ink))]">{(displayedRating || 5.0).toFixed(1)}</span>
              <span className="text-[#d1d5db]">|</span>
              <span className="font-medium text-[rgb(var(--color-ink-soft))]"><strong className="text-[rgb(var(--color-ink))]">{displayedReviewCount.toLocaleString("vi-VN")}</strong> đánh giá</span>
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
                {(!isVariantSelected) ? (
                  <p className="mt-3 text-sm font-semibold text-amber-600">
                    ⚠️ Vui lòng chọn phân loại sản phẩm.
                  </p>
                ) : null}
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

                <div className="flex flex-1 gap-3">
                  {isOutOfStock ? (
                    <button 
                      disabled 
                      className="flex h-[60px] flex-1 items-center justify-center gap-2.5 rounded-[18px] bg-gray-200 px-6 text-[17px] font-black text-gray-400 cursor-not-allowed border border-gray-300"
                    >
                      Hết hàng
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleAddToCart(false)}
                        disabled={isButtonDisabled}
                        className={`flex h-[60px] flex-1 items-center justify-center gap-2 px-3 text-[15px] font-black py-4 transition ${
                          isButtonDisabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none"
                            : "bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))] shadow-lg hover:bg-[rgb(var(--color-primary-muted))] hover:shadow-xl"
                        }`}
                      >
                        <ShoppingCart size={20} strokeWidth={2.5}/> Thêm vào giỏ 
                      </button>
                      <button 
                        onClick={() => handleAddToCart(true)}
                        disabled={isButtonDisabled}
                        className={`flex h-[60px] flex-1 items-center justify-center gap-2 px-3 text-[15px] font-black text-white py-4 transition ${
                          isButtonDisabled
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 shadow-none"
                            : "bg-[rgb(var(--color-primary))] shadow-lg shadow-[rgb(var(--color-primary))]/30 hover:bg-[rgb(var(--color-primary-dark))] hover:shadow-xl"
                        }`}
                      >
                        Mua ngay
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isFav
                        ? "border-red-500 bg-red-50 text-red-500 shadow-sm"
                        : "border-gray-200 bg-white text-gray-500 hover:border-red-500 hover:text-red-500"
                    }`}
                    aria-label={isFav ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                  >
                    <Heart
                      size={22}
                      className={isFav ? "fill-red-500 text-red-500" : ""}
                    />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-4 text-[12px] font-medium text-[rgb(var(--color-ink-soft))]">
                <span className="flex items-center gap-1"><CheckCircle size={14} className="text-[rgb(var(--color-primary))]"/> Chính hãng</span>
                <span className="text-[#d1d5db]">|</span>
                <span className="flex items-center gap-1"><RefreshCcw size={14} className="text-[rgb(var(--color-primary))]"/> Đổi trả 7 ngày</span>
                <span className="text-[#d1d5db]">|</span>
                <span className="flex items-center gap-1"><Truck size={14} className="text-[rgb(var(--color-primary))]"/> Giao nhanh 2H</span>
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
              {tabList.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <button 
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative whitespace-nowrap pb-3 text-[15px] font-bold transition-colors ${isActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-ink-soft))] hover:text-[rgb(var(--color-ink))]"}`}
                  >
                    {tab.label}
                    {tab.key === "reviews" && ` (${displayedReviewCount})`}
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
                  {descriptionHtml ? (
                    <div
                      className="mb-4 leading-relaxed [&_a]:font-bold [&_a]:text-[rgb(var(--color-primary))] [&_blockquote]:border-l-4 [&_blockquote]:border-[rgb(var(--color-primary))] [&_blockquote]:bg-[rgb(var(--color-primary-soft))] [&_blockquote]:px-4 [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-extrabold [&_img]:my-5 [&_img]:max-h-[420px] [&_img]:rounded-3xl [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(descriptionHtml) }}
                    />
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

                  {isFood && (
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
                  )}
                </div>
              )}

              {activeTab === "ingredients" && (
                <div className="prose prose-sm max-w-none text-[rgb(var(--color-ink))] prose-headings:text-[rgb(var(--color-ink))] prose-a:text-[rgb(var(--color-primary))]">
                  <h3 className="text-xl font-black mb-4">Thành phần & Nguyên liệu</h3>
                  {product.ingredients ? (
                    <div
                      className="mb-4 leading-relaxed [&_a]:font-bold [&_a]:text-[rgb(var(--color-primary))] [&_blockquote]:border-l-4 [&_blockquote]:border-[rgb(var(--color-primary))] [&_blockquote]:bg-[rgb(var(--color-primary-soft))] [&_blockquote]:px-4 [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-extrabold [&_img]:my-5 [&_img]:max-h-[420px] [&_img]:rounded-3xl [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.ingredients) }}
                    />
                  ) : (
                    <p className="leading-relaxed">
                      Sản phẩm <strong>{product.name}</strong> chứa các thành phần tự nhiên chất lượng cao, giàu vitamin và khoáng chất bổ sung cho cơ thể thú cưng. Vui lòng tham khảo chi tiết bảng thành phần chi tiết và tỷ lệ phần trăm được in trực tiếp trên bao bì sản phẩm của thương hiệu {product.brand || "nhà sản xuất"}.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "guide" && (
                <div className="prose prose-sm max-w-none text-[rgb(var(--color-ink))] prose-headings:text-[rgb(var(--color-ink))] prose-a:text-[rgb(var(--color-primary))]">
                  <h3 className="text-xl font-black mb-4">Hướng dẫn cho ăn & Bảo quản</h3>
                  {product.guide ? (
                    <div
                      className="mb-4 leading-relaxed [&_a]:font-bold [&_a]:text-[rgb(var(--color-primary))] [&_blockquote]:border-l-4 [&_blockquote]:border-[rgb(var(--color-primary))] [&_blockquote]:bg-[rgb(var(--color-primary-soft))] [&_blockquote]:px-4 [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-extrabold [&_img]:my-5 [&_img]:max-h-[420px] [&_img]:rounded-3xl [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.guide) }}
                    />
                  ) : (
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Cho ăn trực tiếp hoặc trộn cùng hạt dinh dưỡng để tăng độ hấp dẫn.</li>
                      <li>Khẩu phần ăn cụ thể phụ thuộc vào cân nặng, độ tuổi và thể trạng của thú cưng. Vui lòng xem bảng khuyến nghị in trên bao bì.</li>
                      <li>Luôn chuẩn bị sẵn nước uống sạch cho thú cưng.</li>
                      <li>Bảo quản nơi khô ráo, thoáng mát. Đối với thức ăn ướt, sau khi mở nắp cần bảo quản lạnh và sử dụng hết trong vòng 48 giờ.</li>
                    </ul>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                   <div className="mb-8 flex flex-col md:flex-row gap-8 rounded-[24px] bg-white p-6 shadow-sm border border-[rgb(var(--color-border))]">
                     <div className="flex flex-col items-center justify-center text-center md:w-1/3 md:border-r md:border-[rgb(var(--color-border))]">
                       <div className="text-[48px] font-black text-[rgb(var(--color-ink))] leading-none">{displayedRating.toFixed(1)}<span className="text-xl text-[rgb(var(--color-ink-soft))]">/5</span></div>
                       <div className="my-2"><Stars value={displayedRating} size={22} /></div>
                       <div className="text-sm text-[rgb(var(--color-ink-soft))]">{displayedReviewCount} đánh giá</div>
                       <button
                         onClick={openReviewModal}
                         className="mt-4 rounded-full bg-[rgb(var(--color-primary))] px-6 py-2 text-sm font-bold text-white transition hover:bg-[rgb(var(--color-primary-dark))]"
                       >
                         Viết đánh giá
                       </button>
                       {reviewEligibility && !reviewEligibility.eligible && (
                         <div className="mt-3 max-w-[260px] text-xs font-semibold leading-relaxed text-[rgb(var(--color-ink-soft))]">
                           {reviewEligibility.reason}
                         </div>
                       )}
                     </div>
                     <div className="md:w-2/3 flex flex-wrap gap-2 items-start content-start">
                       {[
                         { key: "all", label: "Tất cả" },
                         { key: "5", label: "5 sao" },
                         { key: "images", label: "Có hình ảnh" },
                         { key: "verified", label: "Đã mua hàng" },
                       ].map((filter) => (
                         <button
                           key={filter.key}
                           onClick={() => setReviewFilter(filter.key as any)}
                           className={`rounded-full px-4 py-1.5 text-[13px] font-bold border transition ${reviewFilter === filter.key ? "bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]" : "bg-white text-[rgb(var(--color-ink-soft))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]"}`}
                         >
                           {filter.label}
                         </button>
                       ))}
                     </div>
                   </div>

                   <div className="space-y-6">
                     {isLoadingReviews ? (
                       <div className="rounded-[20px] border border-[rgb(var(--color-border))] bg-white p-6 text-center text-sm font-bold text-[rgb(var(--color-ink-soft))]">
                         Đang tải đánh giá...
                       </div>
                     ) : reviews.length === 0 ? (
                       <div className="rounded-[20px] border border-[rgb(var(--color-border))] bg-white p-8 text-center">
                         <div className="text-base font-black text-[rgb(var(--color-ink))]">Chưa có đánh giá phù hợp</div>
                         <div className="mt-1 text-sm text-[rgb(var(--color-ink-soft))]">Khách đã mua và có đơn hoàn tất sẽ là người đầu tiên đánh giá sản phẩm này.</div>
                       </div>
                     ) : reviews.map((review) => (
                       <div key={review.id} className="flex gap-4 border-b border-[rgb(var(--color-border))] pb-6">
                         <div className="h-10 w-10 shrink-0 rounded-full bg-[#f3f4f6] flex items-center justify-center font-bold text-[rgb(var(--color-ink-soft))]">{review.customerName.charAt(0)}</div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <div className="font-bold text-[rgb(var(--color-ink))]">{review.customerName}</div>
                             {review.verifiedPurchase && <div className="flex items-center gap-1 text-[11px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded"><CheckCircle size={10}/> Đã mua hàng</div>}
                             <div className="text-xs text-[rgb(var(--color-ink-soft))] ml-auto">{formatReviewDate(review.createdAt)}</div>
                           </div>
                           <div className="mb-2"><Stars value={review.rating} size={12} /></div>
                           <p className="text-sm text-[rgb(var(--color-ink-soft))] mb-3">{review.content}</p>
                           {review.images && review.images.length > 0 && (
                             <div className="flex gap-2">
                               {review.images.map((img: string, idx: number) => (
                                 <div key={idx} className="h-16 w-16 bg-[#f3f4f6] rounded-lg overflow-hidden"><Image src={img} alt="Review" className="w-full h-full object-cover"/></div>
                               ))}
                             </div>
                           )}
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
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">{product.brand || product.name.split(' ')[0] || "Đang cập nhật"}</span>
                   </div>
                   <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Danh mục</span>
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">{product.category || "Đang cập nhật"}</span>
                   </div>
                   {product.productType && (
                     <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                       <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Loại sản phẩm</span>
                       <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">
                         {{
                           "dry_food": "Thức ăn hạt",
                           "wet_food": "Pate / thức ăn ướt",
                           "treat": "Snack / thưởng",
                           "litter": "Cát vệ sinh",
                           "supplement": "Sữa & dinh dưỡng",
                           "accessory": "Phụ kiện",
                           "hygiene": "Chăm sóc / vệ sinh",
                           "other": "Khác"
                         }[product.productType] || product.productType}
                       </span>
                     </div>
                   )}
                   {product.petType && (
                     <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                       <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Đối tượng</span>
                       <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">
                         {{
                           "cat": "Mèo",
                           "dog": "Chó",
                           "both": "Cả chó & mèo",
                           "other": "Khác"
                         }[product.petType] || product.petType}
                       </span>
                     </div>
                   )}
                   <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Xuất xứ</span>
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">Chính hãng</span>
                   </div>
                   <div className="flex border-b border-[rgb(var(--color-surface-soft))] pb-2">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Nguồn hàng</span>
                     <span className="w-2/3 font-bold text-[rgb(var(--color-ink))]">
                       {product.source === "shopee" ? "Shopee" : product.source === "tiktok-shop" ? "TikTok Shop" : "3F Store"}
                     </span>
                   </div>
                   <div className="flex">
                     <span className="w-1/3 text-[rgb(var(--color-ink-soft))]">Tình trạng</span>
                     <span className={`w-2/3 font-bold ${(product.stock ?? 0) > 0 ? "text-forest" : "text-red-500"}`}>
                       {(product.stock ?? 0) > 0 ? "Còn hàng" : "Hết hàng"}
                     </span>
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
                 <div className="mb-2 block">
                   <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-[rgb(var(--color-ink))] transition-colors hover:text-[rgb(var(--color-primary))] min-h-[36px]" title={p.name}>{p.name}</h3>
                 </div>
                 <div className="mt-2 text-sm font-black text-[rgb(var(--color-primary))]">{p.price}</div>
                 <div 
                   onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     window.dispatchEvent(
                       new CustomEvent("open-quick-add", {
                         detail: { productId: p.id, intent: "add-to-cart" },
                       })
                     );
                   }}
                   className="mt-3 w-full text-center rounded-xl bg-[rgb(var(--color-primary-soft))] py-2 text-[12px] font-bold text-[rgb(var(--color-primary))] transition group-hover:bg-[rgb(var(--color-primary))] group-hover:text-white cursor-pointer"
                 >
                   + Thêm nhanh
                 </div>
               </Link>
             ))}
          </div>
        </div>

      </div>

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-[rgb(var(--color-ink))]">Viết đánh giá</h3>
                <p className="mt-1 text-sm font-semibold text-[rgb(var(--color-ink-soft))]">
                  Đánh giá cho đơn {reviewEligibility?.orderCode || "đã hoàn tất"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[rgb(var(--color-surface-soft))] text-[rgb(var(--color-ink-soft))] transition hover:text-[rgb(var(--color-ink))]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitReview} className="space-y-5">
              <div>
                <div className="mb-2 text-sm font-bold text-[rgb(var(--color-ink))]">Chọn số sao</div>
                <div className="flex gap-2 text-[#f5b014]">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        className="rounded-lg p-1 transition hover:scale-110"
                        aria-label={`${value} sao`}
                      >
                        <Star size={30} fill={value <= reviewRating ? "currentColor" : "none"} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[rgb(var(--color-ink))]">Nội dung đánh giá</label>
                <textarea
                  value={reviewContent}
                  onChange={(event) => setReviewContent(event.target.value)}
                  rows={5}
                  minLength={10}
                  required
                  placeholder="Chia sẻ cảm nhận thật về sản phẩm, đóng gói, chất lượng..."
                  className="w-full resize-none rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-soft))] px-4 py-3 text-sm font-semibold text-[rgb(var(--color-ink))] outline-none transition focus:border-[rgb(var(--color-primary))] focus:bg-white"
                />
                <p className="mt-1 text-xs font-semibold text-[rgb(var(--color-ink-soft))]">Tối thiểu 10 ký tự. Đánh giá sẽ hiển thị với nhãn Đã mua hàng.</p>
              </div>

              <div className="rounded-2xl bg-[#f0fdf4] px-4 py-3 text-xs font-bold leading-relaxed text-[#15803d]">
                Hệ thống chỉ cho phép đánh giá khi tài khoản này đã mua sản phẩm và đơn hàng đã hoàn tất.
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 rounded-2xl border border-[rgb(var(--color-border))] bg-white px-5 py-3 text-sm font-black text-[rgb(var(--color-ink-soft))] transition hover:bg-[rgb(var(--color-surface-soft))]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || reviewContent.trim().length < 10}
                  className="flex-1 rounded-2xl bg-[rgb(var(--color-primary))] px-5 py-3 text-sm font-black text-white transition hover:bg-[rgb(var(--color-primary-dark))] disabled:opacity-50"
                >
                  {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}
