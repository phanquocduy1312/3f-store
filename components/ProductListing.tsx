import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, Grid, List, Star, PawPrint, Heart, ShoppingCart, AlignJustify, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductFilters } from "./product-filters";
import { getProducts, type ProductSort } from "@/src/api/productsApi";
import { SaleBadge } from "@/components/SaleBadge";
import { NewBadge } from "@/components/NewBadge";
import type { Product } from "@/types/store";

// Helper for image loading
function Image({ src, alt, fill, className }: { src: string, alt: string, fill?: boolean, className?: string }) {
  return <img src={src} alt={alt} className={`absolute w-full h-full ${className}`} />;
}

// Data extraction helpers
function extractPrice(priceStr: string): number {
  return parseInt(priceStr.replace(/\D/g, "")) || 0;
}

function normalizeTextForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function extractBrand(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("royal canin")) return "Royal Canin";
  if (n.includes("smartheart")) return "SmartHeart";
  if (n.includes("nutrience")) return "Nutrience";
  if (n.includes("ganador")) return "Ganador";
  if (n.includes("maxwell")) return "MaxWell";
  if (n.includes("minino")) return "Minino";
  if (n.includes("whiskas")) return "Whiskas";
  if (n.includes("pedigree")) return "Pedigree";
  if (n.includes("me-o")) return "Me-O";
  if (n.includes("petchoice")) return "PetChoice";
  if (n.includes("refine")) return "Refine";
  if (n.includes("jerhigh")) return "JerHigh";
  return "Khác";
}

function extractWeightKg(name: string): number | null {
  const kgMatch = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (kgMatch) return parseFloat(kgMatch[1]);
  const gMatch = name.match(/(\d+)\s*g/i);
  if (gMatch) return parseFloat(gMatch[1]) / 1000;
  const lMatch = name.match(/(\d+)\s*L/i); // for cat litter
  if (lMatch) return parseFloat(lMatch[1]) * 0.8; // approximate L to Kg for litter
  return null;
}

function getWeightCategory(kg: number | null): string {
  if (kg === null) return "Khác";
  if (kg < 1) return "Dưới 1kg";
  if (kg <= 5) return "1 - 5kg";
  if (kg <= 10) return "5 - 10kg";
  return "Trên 10kg";
}

function deriveDisplayCategory(product: Product) {
  const text = normalizeTextForSearch(`${product.category ?? ""} ${product.name}`);
  let category = "Phá»¥ kiá»‡n & Äá»“ chÆ¡i";

  if (text.includes("cho cho") || text.includes("thuc an kho cho cho")) category = "Thá»©c Äƒn cho chÃ³";
  else if (text.includes("meo")) category = "Thá»©c Äƒn cho mÃ¨o";

  if (text.includes("ve sinh") || text.includes("cat dau") || text.includes("khay") || text.includes("bon ve sinh")) {
    category = "Vá»‡ sinh cho thÃº cÆ°ng";
  } else if (text.includes("pate") || text.includes("snack") || text.includes("sup") || text.includes("soup")) {
    category = "Pate & Snack";
  } else if (text.includes("sua") || text.includes("dinh duong")) {
    category = "Sá»¯a & Dinh dÆ°á»¡ng";
  }

  let subCategory = "";
  if (category === "Thá»©c Äƒn cho chÃ³") {
    if (text.includes("kho") || text.includes("hat")) subCategory = "Thá»©c Äƒn khÃ´ cho chÃ³";
    else if (text.includes("uot") || text.includes("lon") || text.includes("pate")) subCategory = "Thá»©c Äƒn Æ°á»›t cho chÃ³";
  } else if (category === "Thá»©c Äƒn cho mÃ¨o") {
    if (text.includes("kho") || text.includes("hat")) subCategory = "Thá»©c Äƒn khÃ´ dÃ nh cho MÃ¨o";
    else if (text.includes("uot") || text.includes("lon") || text.includes("pate")) subCategory = "Thá»©c Äƒn Æ°á»›t cho MÃ¨o";
  }

  return { category, subCategory };
}

const CATEGORY_TREE = [
  { name: "Tất cả sản phẩm" },
  {
    name: "Thức ăn cho chó",
    subcategories: ["Thức ăn khô cho chó", "Thức ăn ướt cho chó"]
  },
  {
    name: "Thức ăn cho mèo",
    subcategories: ["Thức ăn khô dành cho Mèo", "Thức ăn ướt cho Mèo"]
  },
  { name: "Pate & Snack" },
  { name: "Sữa & Dinh dưỡng" },
  { name: "Vệ sinh cho thú cưng" },
  { name: "Phụ kiện & Đồ chơi" }
];

const ALL_CATEGORIES = CATEGORY_TREE.flatMap(c => c.subcategories ? [c.name, ...c.subcategories] : [c.name]);

const WEIGHT_LIST = ["Dưới 1kg", "1 - 5kg", "5 - 10kg", "Trên 10kg"];

function getApiCategoryParams(category: string): { petType?: string; productType?: string } {
  const text = normalizeTextForSearch(category);
  const params: { petType?: string; productType?: string } = {};

  if (text.includes("meo")) params.petType = "cat";
  if (text.includes("cho")) params.petType = "dog";
  if (text.includes("kho") || text.includes("hat")) params.productType = "dry_food";
  if (text.includes("uot")) params.productType = "wet_food";
  if (text.includes("pate") || text.includes("snack")) params.productType = "pate_snack";
  if (text.includes("sua") || text.includes("dinh duong")) params.productType = "nutrition";
  if (text.includes("ve sinh")) params.productType = "hygiene";
  if (text.includes("phu kien") || text.includes("do choi")) params.productType = "accessory";

  return params;
}

export function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const queryParam = searchParams.get("q")?.trim() ?? "";

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(
    categoryParam && ALL_CATEGORIES.includes(categoryParam) ? categoryParam : "Tất cả sản phẩm"
  );

  const [expandedCats, setExpandedCats] = useState<string[]>(() => {
    if (!categoryParam) return [];
    const parent = CATEGORY_TREE.find(n => n.name === categoryParam || n.subcategories?.includes(categoryParam));
    return parent ? [parent.name] : [];
  });

  useEffect(() => {
    if (categoryParam && ALL_CATEGORIES.includes(categoryParam)) {
      setActiveCategory(categoryParam);
      const parent = CATEGORY_TREE.find(n => n.name === categoryParam || n.subcategories?.includes(categoryParam));
      if (parent && !expandedCats.includes(parent.name)) {
        setExpandedCats(prev => [...prev, parent.name]);
      }
    } else if (!categoryParam) {
      setActiveCategory("Tất cả sản phẩm");
    }
  }, [categoryParam]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2000000);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(2000000);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiTotalPages, setApiTotalPages] = useState(1);
  const [apiTotal, setApiTotal] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const categoryFilters = activeCategory === "Tất cả sản phẩm" ? {} : getApiCategoryParams(activeCategory);

    setIsLoadingProducts(true);
    setProductError(null);

    getProducts({
      q: queryParam || undefined,
      page: currentPage,
      limit: itemsPerPage,
      sort: sortBy as ProductSort,
      maxPrice,
      ...categoryFilters,
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
        setProductError(error instanceof Error ? error.message : "Khong tai duoc san pham.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingProducts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, currentPage, itemsPerPage, maxPrice, queryParam, sortBy]);

  // Enhance all products with derived data once
  const enhancedProducts = useMemo(() => {
    return apiProducts.map(p => {
      const priceVal = extractPrice(p.price);
      const brand = extractBrand(p.name);
      const weightKg = extractWeightKg(p.name);
      const weightCat = getWeightCategory(weightKg);

      let cat = "Phụ kiện & Đồ chơi";
      const rawCat = p.category?.toLowerCase() || "";
      const rawName = p.name.toLowerCase();

      if (rawCat.includes("chó") || rawName.includes("cho chó")) cat = "Thức ăn cho chó";
      else if (rawCat.includes("mèo") || rawName.includes("cho mèo")) cat = "Thức ăn cho mèo";

      if (rawCat.includes("vệ sinh") || rawName.includes("cát")) cat = "Vệ sinh cho thú cưng";
      else if (rawCat.includes("pate") || rawCat.includes("snack") || rawName.includes("pate") || rawName.includes("snack")) cat = "Pate & Snack";
      else if (rawCat.includes("sữa") || rawName.includes("sữa")) cat = "Sữa & Dinh dưỡng";

      let subCat = "";
      if (cat === "Thức ăn cho chó") {
        if (rawName.includes("khô") || rawName.includes("hạt") || rawCat.includes("khô") || rawCat.includes("hạt")) subCat = "Thức ăn khô cho chó";
        else if (rawName.includes("ướt") || rawName.includes("lon") || rawName.includes("pate") || rawCat.includes("ướt")) subCat = "Thức ăn ướt cho chó";
      } else if (cat === "Thức ăn cho mèo") {
        if (rawName.includes("khô") || rawName.includes("hạt") || rawCat.includes("khô") || rawCat.includes("hạt")) subCat = "Thức ăn khô dành cho Mèo";
        else if (rawName.includes("ướt") || rawName.includes("lon") || rawName.includes("pate") || rawCat.includes("ướt")) subCat = "Thức ăn ướt cho Mèo";
      }

      const derivedCategory = deriveDisplayCategory(p);

      return {
        ...p,
        priceVal,
        brand,
        weightKg,
        weightCat,
        displayCategory: derivedCategory.category,
        displaySubCategory: derivedCategory.subCategory
      };
    });
  }, [apiProducts]);

  // Compute dynamic counts
  const categoryProducts = useMemo(() => {
    return enhancedProducts.filter(p => {
      if (activeCategory === "Tất cả sản phẩm") return true;
      const parentNode = CATEGORY_TREE.find(n => n.name === activeCategory);
      if (parentNode) { // activeCategory is a parent
        return p.displayCategory === activeCategory;
      }
      // activeCategory is a subcategory
      return p.displaySubCategory === activeCategory;
    });
  }, [enhancedProducts, activeCategory]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CATEGORIES.forEach(c => counts[c] = 0);
    counts["Tất cả sản phẩm"] = enhancedProducts.length;

    enhancedProducts.forEach(p => {
      if (counts[p.displayCategory] !== undefined) counts[p.displayCategory]++;
      if (p.displaySubCategory && counts[p.displaySubCategory] !== undefined) counts[p.displaySubCategory]++;
    });
    return counts;
  }, [enhancedProducts]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryProducts.forEach(p => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [categoryProducts]);

  const weightCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    WEIGHT_LIST.forEach(w => counts[w] = 0);
    categoryProducts.forEach(p => {
      if (counts[p.weightCat] !== undefined) counts[p.weightCat]++;
    });
    return counts;
  }, [categoryProducts]);

  // Compute filtered products
  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeTextForSearch(queryParam);
    return enhancedProducts.filter(p => {
      if (activeCategory !== "Tất cả sản phẩm" && p.displayCategory !== activeCategory) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (selectedWeights.length > 0 && !selectedWeights.includes(p.weightCat)) return false;
      if (p.priceVal > maxPrice) return false;
      if (normalizedQuery) {
        const searchHaystack = normalizeTextForSearch(
          [
            p.name,
            p.category ?? "",
            p.brand,
            p.displayCategory,
            p.displaySubCategory,
          ].join(" ")
        );
        if (!searchHaystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [enhancedProducts, activeCategory, selectedBrands, selectedWeights, maxPrice, queryParam]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    if (sortBy === "price_asc") arr.sort((a, b) => a.priceVal - b.priceVal);
    else if (sortBy === "price_desc") arr.sort((a, b) => b.priceVal - a.priceVal);
    else arr.sort((a, b) => b.sold - a.sold); // popular
    return arr;
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = apiTotalPages || 1;
  const currentProducts = sortedProducts;

  // Handlers
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
    setCurrentPage(1);
  };

  const toggleWeight = (weight: string) => {
    setSelectedWeights(prev => prev.includes(weight) ? prev.filter(w => w !== weight) : [...prev, weight]);
    setCurrentPage(1);
  };

  const handleApplyPrice = () => {
    setMaxPrice(tempMaxPrice);
    setCurrentPage(1);
  };

  const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="bg-[rgb(var(--color-surface))] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm font-medium text-[rgb(var(--color-ink-soft))]">
          Trang chủ <span className="mx-2">&gt;</span> <span className="text-[rgb(var(--color-primary))] font-bold">{activeCategory}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">

          {/* SIDEBAR */}
          <aside className="hidden lg:flex flex-col gap-8 sticky top-6">
            <ProductFilters
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              expandedCats={expandedCats}
              setExpandedCats={setExpandedCats}
              catCounts={catCounts}
              brandCounts={brandCounts}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              tempMaxPrice={tempMaxPrice}
              setTempMaxPrice={setTempMaxPrice}
              handleApplyPrice={handleApplyPrice}
              selectedWeights={selectedWeights}
              toggleWeight={toggleWeight}
              weightCounts={weightCounts}
              setCurrentPage={setCurrentPage}
              setSelectedBrands={setSelectedBrands}
              setSelectedWeights={setSelectedWeights}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex flex-col">

            {/* Header Area */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgb(var(--color-border))] pb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <PawPrint size={28} className="text-[rgb(var(--color-primary))]" strokeWidth={2.5} />
                  <h1 className="text-[2rem] font-extrabold uppercase text-[rgb(var(--color-ink))] tracking-tight">{activeCategory}</h1>
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
                      onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                      className="appearance-none bg-[rgb(var(--color-surface-soft))] border border-[rgb(var(--color-border))] rounded-lg py-2 pl-3 pr-8 font-bold text-[rgb(var(--color-ink))] cursor-pointer outline-none focus:border-[rgb(var(--color-primary))]"
                    >
                      <option value="popular">Phổ biến nhất</option>
                      <option value="price_asc">Giá từ thấp đến cao</option>
                      <option value="price_desc">Giá từ cao đến thấp</option>
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
              ) : currentProducts.length > 0 ? currentProducts.map((product, idx) => {
                const hasDiscount = !!product.oldPrice;
                // Compute random "Mới" based on ID or index
                const isNew = product.sold < 50 && product.rating > 4.5;

                return (
                  <article key={product.id || idx} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[24px] border border-[rgb(var(--color-border))] bg-white p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(16,133,79,0.15)] hover:border-[rgb(var(--color-primary))]/30">

                    {/* Animated Gradient Glow Behind Card Content */}
                    <div className="pointer-events-none absolute -inset-10 -z-10 bg-gradient-to-br from-[rgb(var(--color-primary))]/0 via-[rgb(var(--color-primary))]/5 to-[#F59E0B]/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100 blur-2xl" />

                    {/* Sweeping Light Shimmer Effect */}
                    <div className="pointer-events-none absolute inset-0 z-30 -translate-x-[150%] -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-all duration-1000 ease-in-out group-hover:translate-x-[150%] group-hover:opacity-100" />

                    {/* Top Badges */}
                    <div className="absolute left-2 sm:left-3 top-2 sm:top-3 z-10 flex flex-col gap-2 origin-top-left scale-[0.25] sm:scale-[0.28] pointer-events-none">
                      {hasDiscount && (
                        <SaleBadge discount={Math.round((1 - product.priceVal / extractPrice(product.oldPrice!)) * 100)} />
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
                      <Link to={`/product/${product.id || idx}`} className="block relative mb-3 sm:mb-4 aspect-square w-full overflow-hidden rounded-xl sm:rounded-[16px] bg-[rgb(var(--color-surface-soft))] p-2 sm:p-3 transition-colors duration-300 group-hover:bg-[rgb(var(--color-surface-soft))]">
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
                          <Link to={`/product/${product.id || idx}`} className="block">
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
                              {product.rating.toFixed(1)} <span className="mx-1 sm:mx-1.5 text-[rgb(var(--color-ink))]/20">•</span> Đã bán {product.sold > 0 ? Math.floor(product.sold / 1000) || 1 : Math.floor(Math.random() * 90 + 10)}k+
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
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--color-border))] text-[rgb(var(--color-ink))]/40 transition hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] disabled:opacity-50 disabled:pointer-events-none">
                    &lt;
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    // Simple pagination window logic
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
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

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="flex h-9 w-9 items-center justify-center text-[rgb(var(--color-ink))]/40">...</span>
                  )}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
              className="absolute inset-0 bg-ink/40 backdrop-blur-xs"
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
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  expandedCats={expandedCats}
                  setExpandedCats={setExpandedCats}
                  catCounts={catCounts}
                  brandCounts={brandCounts}
                  selectedBrands={selectedBrands}
                  toggleBrand={toggleBrand}
                  tempMaxPrice={tempMaxPrice}
                  setTempMaxPrice={setTempMaxPrice}
                  handleApplyPrice={handleApplyPrice}
                  selectedWeights={selectedWeights}
                  toggleWeight={toggleWeight}
                  weightCounts={weightCounts}
                  setCurrentPage={setCurrentPage}
                  setSelectedBrands={setSelectedBrands}
                  setSelectedWeights={setSelectedWeights}
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
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
