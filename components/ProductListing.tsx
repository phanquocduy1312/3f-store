import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, Star, PawPrint, Heart, ShoppingCart, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductFilters } from "./product-filters";
import { getProducts, getProductFilters, type ProductSort, type ProductFiltersData } from "@/src/api/productsApi";
import { SaleBadge } from "@/components/SaleBadge";
import { NewBadge } from "@/components/NewBadge";
import type { Product } from "@/types/store";
import { addToCart, parsePriceString } from "@/lib/cartHelper";
import { toast } from "sonner";

// Helper for image loading
function Image({ src, alt, className }: { src: string, alt: string, className?: string }) {
  return <img src={src} alt={alt} className={`absolute w-full h-full ${className}`} />;
}

// Data extraction helper
function extractPrice(priceStr: string): number {
  return parseInt(priceStr.replace(/\D/g, "")) || 0;
}

export function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q")?.trim() ?? "";

  const [viewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiTotalPages, setApiTotalPages] = useState(1);
  const [apiTotal, setApiTotal] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const [filtersData, setFiltersData] = useState<ProductFiltersData | null>(null);
  const [tempMinPrice, setTempMinPrice] = useState<number>(0);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(2000000);

  const itemsPerPage = 12;

  // Load filter metadata once
  useEffect(() => {
    getProductFilters()
      .then((res) => {
        if (res.success) {
          setFiltersData(res.data);
          const maxPriceParam = searchParams.get("maxPrice");
          if (!maxPriceParam) {
            setTempMaxPrice(res.data.priceRange.max);
          } else {
            setTempMaxPrice(parseInt(maxPriceParam, 10));
          }
          const minPriceParam = searchParams.get("minPrice");
          if (!minPriceParam) {
            setTempMinPrice(res.data.priceRange.min);
          } else {
            setTempMinPrice(parseInt(minPriceParam, 10));
          }
        }
      })
      .catch((err) => console.error("Error loading filters", err));
  }, []);

  // Update temp price range states if URL updates externally
  useEffect(() => {
    if (filtersData) {
      const maxPriceParam = searchParams.get("maxPrice");
      if (maxPriceParam) {
        setTempMaxPrice(parseInt(maxPriceParam, 10));
      } else {
        setTempMaxPrice(filtersData.priceRange.max);
      }
      const minPriceParam = searchParams.get("minPrice");
      if (minPriceParam) {
        setTempMinPrice(parseInt(minPriceParam, 10));
      } else {
        setTempMinPrice(filtersData.priceRange.min);
      }
    }
  }, [searchParams, filtersData]);

  // Fetch products based on query params
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProducts(true);
    setProductError(null);

    const categoryParam = searchParams.get("category") || "";
    const petTypeParam = searchParams.get("petType") || "";
    const productTypeParam = searchParams.get("productType") || "";
    const brandParam = searchParams.get("brand") || "";
    const minPriceParam = searchParams.get("minPrice") || "";
    const maxPriceParam = searchParams.get("maxPrice") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const sortParam = (searchParams.get("sort") || "popular") as ProductSort;

    getProducts({
      q: queryParam || undefined,
      page: pageParam,
      limit: itemsPerPage,
      sort: sortParam,
      categorySlug: categoryParam || undefined,
      petType: petTypeParam || undefined,
      productType: productTypeParam || undefined,
      brand: brandParam || undefined,
      minPrice: minPriceParam ? parseFloat(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
    })
      .then((result) => {
        if (!isMounted) return;
        setApiProducts(result.items);
        setApiTotalPages(result.pagination.totalPages || 1);
        setApiTotal(result.pagination.total || result.items.length);
      })
      .catch((error) => {
        if (!isMounted) return;
        setApiProducts([]);
        setApiTotalPages(1);
        setApiTotal(0);
        setProductError(error instanceof Error ? error.message : "Không tải được sản phẩm.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingProducts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams, queryParam]);

  // Derive active title based on searchParams
  const activeTitleName = useMemo(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const match = filtersData?.categories.find(c => c.slug === categoryParam);
      if (match) return match.name;
    }
    const petTypeParam = searchParams.get("petType");
    if (petTypeParam) {
      if (petTypeParam === "cat") return "Sản phẩm cho Mèo";
      if (petTypeParam === "dog") return "Sản phẩm cho Chó";
      if (petTypeParam === "both") return "Sản phẩm cho Chó & Mèo";
    }
    const productTypeParam = searchParams.get("productType");
    if (productTypeParam) {
      const ptMatch = filtersData?.productTypes.find(p => p.value === productTypeParam);
      if (ptMatch) return ptMatch.label;
    }
    const brandParam = searchParams.get("brand");
    if (brandParam) {
      return `Thương hiệu: ${brandParam}`;
    }
    return "Tất cả sản phẩm";
  }, [searchParams, filtersData]);

  const sortBy = searchParams.get("sort") || "popular";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

  const handleApplyPrice = () => {
    const params = new URLSearchParams(searchParams);
    params.set("minPrice", String(tempMinPrice));
    params.set("maxPrice", String(tempMaxPrice));
    params.set("page", "1");
    setSearchParams(params);
  };

  return (
    <div className="bg-[rgb(var(--color-surface))] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm font-medium text-[rgb(var(--color-ink-soft))]">
          Trang chủ <span className="mx-2">&gt;</span> <span className="text-[rgb(var(--color-primary))] font-bold">{activeTitleName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">

          {/* SIDEBAR */}
          <aside className="hidden lg:flex flex-col gap-8 sticky top-6">
            <ProductFilters
              filtersData={filtersData}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              tempMinPrice={tempMinPrice}
              setTempMinPrice={setTempMinPrice}
              tempMaxPrice={tempMaxPrice}
              setTempMaxPrice={setTempMaxPrice}
            />
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex flex-col">

            {/* Header Area */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgb(var(--color-border))] pb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <PawPrint size={28} className="text-[rgb(var(--color-primary))]" strokeWidth={2.5} />
                  <h1 className="text-[2rem] font-extrabold uppercase text-[rgb(var(--color-ink))] tracking-tight">{activeTitleName}</h1>
                </div>
                <p className="text-sm font-medium text-[rgb(var(--color-ink-soft))] md:ml-10">
                  Hiển thị {apiTotal} sản phẩm phù hợp cho bé cưng của bạn
                </p>
              </div>

              <div className="flex items-center gap-4 self-start md:self-auto">
                {/* Mobile Filter Toggle Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="flex lg:hidden items-center gap-2 rounded-xl border border-[rgb(var(--color-border))] bg-white px-4 py-2 text-sm font-bold text-[rgb(var(--color-ink))] shadow-sm transition hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] active:scale-95"
                >
                  <Filter size={16} strokeWidth={2.5} className="text-[rgb(var(--color-primary))]" />
                  Lọc
                </button>
                <div className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--color-ink-soft))]">
                  Sắp xếp:
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        const params = new URLSearchParams(searchParams);
                        params.set("sort", e.target.value);
                        params.set("page", "1");
                        setSearchParams(params);
                      }}
                      className="appearance-none bg-[rgb(var(--color-surface-soft))] border border-[rgb(var(--color-border))] rounded-lg py-2 pl-3 pr-8 font-bold text-[rgb(var(--color-ink))] cursor-pointer outline-none focus:border-[rgb(var(--color-primary))]"
                    >
                      <option value="popular">Phổ biến nhất</option>
                      <option value="price_asc">Giá từ thấp đến cao</option>
                      <option value="price_desc">Giá từ cao đến thấp</option>
                      <option value="newest">Mới nhất</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-ink-soft))] pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            {/* Product Grid */}
            <div className={`grid gap-3 sm:gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {isLoadingProducts ? (
                <div className="col-span-full py-12 text-center text-sm font-bold text-[rgb(var(--color-ink))]/50">
                  Đang tải sản phẩm...
                </div>
              ) : productError ? (
                <div className="col-span-full rounded-2xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm font-bold text-red-700">
                  {productError}
                </div>
              ) : apiProducts.length > 0 ? apiProducts.map((product, idx) => {
                const hasDiscount = !!product.oldPrice;
                const isNew = product.sold < 50 && product.rating > 4.5;
                const linkId = product.slug || product.id;

                return (
                  <article key={product.id || idx} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[24px] border border-[rgb(var(--color-border))] bg-white p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(16,133,79,0.15)] hover:border-[rgb(var(--color-primary))]/30">

                    {/* Animated Gradient Glow Behind Card Content */}
                    <div className="pointer-events-none absolute -inset-10 -z-10 bg-gradient-to-br from-[rgb(var(--color-primary))]/0 via-[rgb(var(--color-primary))]/5 to-[#F59E0B]/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100 blur-2xl" />

                    {/* Sweeping Light Shimmer Effect */}
                    <div className="pointer-events-none absolute inset-0 z-30 -translate-x-[150%] -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-all duration-1000 ease-in-out group-hover:translate-x-[150%] group-hover:opacity-100" />

                    {/* Top Badges */}
                    <div className="absolute left-2 sm:left-3 top-2 sm:top-3 z-10 flex flex-col gap-2 origin-top-left scale-[0.25] sm:scale-[0.28] pointer-events-none">
                      {hasDiscount && product.oldPrice && (
                        <SaleBadge discount={Math.round((1 - extractPrice(product.price) / extractPrice(product.oldPrice)) * 100)} />
                      )}
                      {isNew && (
                        <NewBadge />
                      )}
                    </div>

                    {/* Heart Icon */}
                    <button className="absolute right-2 sm:right-3 top-2 sm:top-3 z-10 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-white shadow-sm border border-[#F5F5F5] transition-colors hover:text-[#EF4444]">
                      <Heart size={14} className="sm:w-4 sm:h-4 text-[rgb(var(--color-ink))]/30 transition-colors hover:fill-[#EF4444] hover:text-[#EF4444]" />
                    </button>

                    <div className="flex flex-col h-full">
                      {/* Image */}
                      <Link to={`/product/${linkId}`} className="block relative mb-3 sm:mb-4 aspect-square w-full overflow-hidden rounded-xl sm:rounded-[16px] bg-[rgb(var(--color-surface-soft))] p-2 sm:p-3 transition-colors duration-300 group-hover:bg-[rgb(var(--color-surface-soft))]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          className="object-contain transition duration-500 group-hover:scale-[1.12] mix-blend-multiply"
                        />
                      </Link>

                      {/* Info */}
                      <div className="space-y-0.5 sm:space-y-1.5 flex flex-col justify-between flex-1 min-w-0 overflow-hidden">
                        <div className="min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-black uppercase text-[rgb(var(--color-primary))] tracking-wider mb-0.5 sm:mb-1 truncate">{product.brand?.toUpperCase() || "KHÁC"}</p>
                          <Link to={`/product/${linkId}`} className="block">
                            <h3 className="text-[11px] sm:text-[13px] font-extrabold leading-tight sm:leading-[18px] text-[rgb(var(--color-ink))] line-clamp-2 min-h-[29px] sm:min-h-[36px] hover:text-[rgb(var(--color-primary))] transition-colors break-words" title={product.name}>
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        <div className="mt-1.5 sm:mt-2 min-w-0">
                          {/* Rating and Sold */}
                          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-0.5 text-[#F59E0B] shrink-0">
                              <Star size={11} fill="currentColor" strokeWidth={2.5} className="sm:w-3 sm:h-3" />
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-bold text-[rgb(var(--color-ink))]/60 truncate flex-1 min-w-0">
                              {product.rating.toFixed(1)} <span className="mx-1 sm:mx-1.5 text-[rgb(var(--color-ink))]/20">•</span> Đã bán {product.sold > 0 ? (product.sold >= 1000 ? (Math.floor(product.sold / 100) / 10) + 'k' : product.sold) : 0}
                            </span>
                          </div>

                          {/* Price & Cart row */}
                          <div className="flex items-end justify-between border-t border-[#F2EFE9] pt-2 sm:pt-3 mt-1 min-w-0 gap-2">
                            <div className="flex flex-col gap-0 sm:gap-0.5 min-w-0 flex-1 overflow-hidden">
                              {product.oldPrice && (
                                <div className="text-[10px] sm:text-[11px] font-bold text-[rgb(var(--color-ink))]/30 line-through truncate">
                                  {product.oldPrice}
                                </div>
                              )}
                              <div className="flex items-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
                                <span className="text-sm sm:text-[1.1rem] font-black text-[rgb(var(--color-primary))] truncate">{product.price}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const hasVariants = product.variants && product.variants.length > 1;
                                if (hasVariants) {
                                  window.dispatchEvent(
                                    new CustomEvent("open-quick-add", {
                                      detail: { productId: product.id, intent: "add-to-cart" },
                                    })
                                  );
                                } else {
                                  const defVar = product.variants?.[0];
                                  addToCart({
                                    id: defVar?.id ?? product.id,
                                    productId: String(product.backendId ?? product.sourceProductId ?? product.id),
                                    variantId: defVar?.id,
                                    sku: defVar?.sku,
                                    name: product.name,
                                    image: defVar?.image ?? product.image,
                                    price: parsePriceString(defVar?.price ?? product.price),
                                    originalPrice: (defVar?.oldPrice ?? product.oldPrice) ? parsePriceString(defVar?.oldPrice ?? product.oldPrice) : undefined,
                                    variantName: defVar?.label,
                                    variant: defVar?.label ?? "Mặc định",
                                  }, 1);

                                  toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
                                }
                              }}
                              title="Thêm vào giỏ"
                              className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))] shadow-sm transition-all hover:scale-105 hover:bg-[rgb(var(--color-primary))] hover:text-white active:scale-95"
                            >
                              <ShoppingCart size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }) : (
                <div className="col-span-full py-12 text-center text-sm font-bold text-[rgb(var(--color-ink))]/50">
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                </div>
              )}
            </div>

            {/* Pagination */}
            {apiTotalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--color-border))] text-[rgb(var(--color-ink))]/40 transition hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] disabled:opacity-50 disabled:pointer-events-none">
                    &lt;
                  </button>

                  {Array.from({ length: Math.min(5, apiTotalPages) }).map((_, i) => {
                    let pageNum = i + 1;
                    if (apiTotalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > apiTotalPages) pageNum = apiTotalPages - (4 - i);
                    }

                    const isActive = currentPage === pageNum;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full font-bold transition-colors ${isActive
                            ? "bg-[rgb(var(--color-primary))] text-white shadow-sm border-none"
                            : "border border-[rgb(var(--color-border))] text-[rgb(var(--color-ink))]/70 hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]"
                          }`}>
                        {pageNum}
                      </button>
                    )
                  })}

                  {apiTotalPages > 5 && currentPage < apiTotalPages - 2 && (
                    <span className="flex h-9 w-9 items-center justify-center text-[rgb(var(--color-ink))]/40">...</span>
                  )}

                  <button
                    disabled={currentPage === apiTotalPages}
                    onClick={() => setCurrentPage(Math.min(apiTotalPages, currentPage + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--color-border))] text-[rgb(var(--color-ink))]/40 transition hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] disabled:opacity-50 disabled:pointer-events-none">
                    &gt;
                  </button>
                </nav>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[2.5rem] bg-[rgb(var(--color-surface))] p-6 shadow-2xl flex flex-col border-t border-forest/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[rgb(var(--color-border))] pb-4 mb-4">
                <h3 className="text-lg font-black text-[rgb(var(--color-ink))] flex items-center gap-2">
                  <Filter size={18} className="text-[rgb(var(--color-primary))]" />
                  Bộ lọc sản phẩm
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-black/5 text-ink hover:bg-black/10 active:scale-95"
                  aria-label="Đóng bộ lọc"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto pr-1 pb-6 scrollbar-hide">
                <ProductFilters
                  filtersData={filtersData}
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  tempMinPrice={tempMinPrice}
                  setTempMinPrice={setTempMinPrice}
                  tempMaxPrice={tempMaxPrice}
                  setTempMaxPrice={setTempMaxPrice}
                  onClose={() => setIsMobileFilterOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
