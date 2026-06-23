import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, PawPrint, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductFilters } from "./product-filters";
import { getProducts, getProductFilters, type ProductSort, type ProductFiltersData } from "@/src/api/productsApi";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/store";

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
    if (queryParam) {
      return `Kết quả tìm kiếm cho "${queryParam}"`;
    }
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
  }, [searchParams, queryParam, filtersData]);

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
          <aside className="hidden lg:block sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pr-2 pb-2">
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
              ) : apiProducts.length > 0 ? apiProducts.map((product, idx) => (
                <ProductCard key={product.id || idx} product={product} index={idx} />
              )) : (
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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute top-0 bottom-0 left-0 w-[85vw] max-w-[360px] bg-[rgb(var(--color-surface))] shadow-2xl flex flex-col border-r border-forest/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[rgb(var(--color-border))] p-4 shrink-0">
                <h3 className="text-lg font-black text-[rgb(var(--color-ink))] flex items-center gap-2">
                  <Filter size={18} className="text-[rgb(var(--color-primary))]" />
                  Bộ lọc sản phẩm
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-black/5 text-[rgb(var(--color-ink))] hover:bg-black/10 active:scale-95"
                  aria-label="Đóng bộ lọc"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
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
