import { useState, useMemo, useEffect } from "react";
import { ChevronDown, Grid, List, Star, PawPrint, Heart, ShoppingCart, AlignJustify } from "lucide-react";
import { allProducts } from "@/data/store";
import type { Product } from "@/types/store";

// Helper for image loading
function Image({ src, alt, fill, className }: { src: string, alt: string, fill?: boolean, className?: string }) {
  return <img src={src} alt={alt} className={`absolute w-full h-full ${className}`} />;
}

// Data extraction helpers
function extractPrice(priceStr: string): number {
  return parseInt(priceStr.replace(/\D/g, "")) || 0;
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

const CATEGORY_LIST = [
  "Tất cả sản phẩm",
  "Thức ăn cho chó",
  "Thức ăn cho mèo",
  "Pate & Snack",
  "Sữa & Dinh dưỡng",
  "Vệ sinh cho thú cưng",
  "Phụ kiện & Đồ chơi"
];

const WEIGHT_LIST = ["Dưới 1kg", "1 - 5kg", "5 - 10kg", "Trên 10kg"];

export function ProductListing() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả sản phẩm");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2000000);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(2000000);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Enhance all products with derived data once
  const enhancedProducts = useMemo(() => {
    return allProducts.map(p => {
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

      return {
        ...p,
        priceVal,
        brand,
        weightKg,
        weightCat,
        displayCategory: cat
      };
    });
  }, []);

  // Compute dynamic counts based ONLY on category filter (so brands/weights show total available in that category)
  const categoryProducts = useMemo(() => {
    return enhancedProducts.filter(p => activeCategory === "Tất cả sản phẩm" || p.displayCategory === activeCategory);
  }, [enhancedProducts, activeCategory]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_LIST.forEach(c => counts[c] = 0);
    counts["Tất cả sản phẩm"] = enhancedProducts.length; // Total count for "Tất cả sản phẩm"
    
    enhancedProducts.forEach(p => {
      if (counts[p.displayCategory] !== undefined) counts[p.displayCategory]++;
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
    return enhancedProducts.filter(p => {
      if (activeCategory !== "Tất cả sản phẩm" && p.displayCategory !== activeCategory) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (selectedWeights.length > 0 && !selectedWeights.includes(p.weightCat)) return false;
      if (p.priceVal > maxPrice) return false;
      return true;
    });
  }, [enhancedProducts, activeCategory, selectedBrands, selectedWeights, maxPrice]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    if (sortBy === "price_asc") arr.sort((a, b) => a.priceVal - b.priceVal);
    else if (sortBy === "price_desc") arr.sort((a, b) => b.priceVal - a.priceVal);
    else arr.sort((a, b) => b.sold - a.sold); // popular
    return arr;
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    <div className="bg-[#FAF9F6] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm font-medium text-[#221A12]/60">
          Trang chủ <span className="mx-2">&gt;</span> <span className="text-[#10854F] font-bold">{activeCategory}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
          
          {/* SIDEBAR */}
          <aside className="hidden lg:flex flex-col gap-8 sticky top-6">
            
            {/* DANH MỤC */}
            <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
              <h3 className="mb-4 text-[15px] font-extrabold text-[#221A12] flex items-center gap-2">
                <AlignJustify size={18} className="text-[#10854F]"/>
                DANH MỤC
              </h3>
              <ul className="space-y-1">
                {CATEGORY_LIST.map((cat, idx) => {
                  const isActive = activeCategory === cat;
                  return (
                    <li key={idx}>
                      <button 
                        onClick={() => { setActiveCategory(cat); setCurrentPage(1); setSelectedBrands([]); setSelectedWeights([]); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isActive 
                          ? "bg-[#EAF7EC] text-[#10854F]" 
                          : "text-[#221A12]/75 hover:bg-[#F9F9F9] hover:text-[#221A12]"
                      }`}>
                        {cat}
                        <span className={`text-xs ${isActive ? "text-[#10854F]" : "text-[#221A12]/40"}`}>{catCounts[cat] || 0}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* THƯƠNG HIỆU */}
            <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
              <h3 className="mb-4 text-[15px] font-extrabold text-[#221A12]">
                THƯƠNG HIỆU
              </h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                {brandCounts.map(([brand, count], idx) => {
                  if (brand === "Khác" && count === 0) return null;
                  return (
                    <label key={idx} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className={`relative flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedBrands.includes(brand) ? 'border-[#10854F] bg-[#10854F]' : 'border-[#E0E0E0] bg-white group-hover:border-[#10854F]'}`}>
                          <input 
                            type="checkbox" 
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="peer absolute h-full w-full cursor-pointer opacity-0" 
                          />
                          <svg className={`pointer-events-none w-3 h-3 text-white ${selectedBrands.includes(brand) ? 'block' : 'hidden'}`} viewBox="0 0 14 10" fill="none">
                            <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-[#221A12]/80 group-hover:text-[#221A12]">{brand}</span>
                      </div>
                      <span className="text-xs font-medium text-[#221A12]/40">{count}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* KHOẢNG GIÁ */}
            <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
              <h3 className="mb-4 text-[15px] font-extrabold text-[#221A12]">
                KHOẢNG GIÁ
              </h3>
              <div className="px-1 pt-2 pb-4">
                <input 
                  type="range" 
                  min="0" 
                  max="2000000" 
                  step="50000"
                  value={tempMaxPrice} 
                  onChange={(e) => setTempMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#EAEAEA] rounded-lg appearance-none cursor-pointer accent-[#10854F]"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#221A12]/80 mb-5">
                <span>0đ</span>
                <span className="text-[#10854F]">{formatMoney(tempMaxPrice)}</span>
              </div>
              <button 
                onClick={handleApplyPrice}
                className="w-full rounded-xl bg-[#10854F] py-3 text-xs font-black text-white hover:bg-[#0D7344] transition-colors shadow-md active:scale-95">
                Áp dụng
              </button>
            </div>

            {/* TRỌNG LƯỢNG */}
            <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
              <h3 className="mb-4 text-[15px] font-extrabold text-[#221A12]">
                TRỌNG LƯỢNG
              </h3>
              <div className="space-y-3">
                {WEIGHT_LIST.map((weight, idx) => (
                  <label key={idx} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`relative flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedWeights.includes(weight) ? 'border-[#10854F] bg-[#10854F]' : 'border-[#E0E0E0] bg-white group-hover:border-[#10854F]'}`}>
                        <input 
                          type="checkbox" 
                          checked={selectedWeights.includes(weight)}
                          onChange={() => toggleWeight(weight)}
                          className="peer absolute h-full w-full cursor-pointer opacity-0" 
                        />
                        <svg className={`pointer-events-none w-3 h-3 text-white ${selectedWeights.includes(weight) ? 'block' : 'hidden'}`} viewBox="0 0 14 10" fill="none">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-[#221A12]/80 group-hover:text-[#221A12]">{weight}</span>
                    </div>
                    <span className="text-xs font-medium text-[#221A12]/40">{weightCounts[weight] || 0}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* MAIN CONTENT */}
          <div className="flex flex-col">
            
            {/* Header Area */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EBEBEB] pb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <PawPrint size={28} className="text-[#10854F]" strokeWidth={2.5} />
                  <h1 className="text-[2rem] font-extrabold uppercase text-[#221A12] tracking-tight">{activeCategory}</h1>
                </div>
                <p className="text-sm font-medium text-[#221A12]/60 md:ml-10">
                  Hiển thị {filteredProducts.length} sản phẩm phù hợp cho bé cưng của bạn
                </p>
              </div>

              <div className="flex items-center gap-4 self-start md:self-auto">
                <div className="flex items-center gap-2 text-sm font-bold text-[#221A12]/75">
                  Sắp xếp:
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                      className="appearance-none bg-[#F9F9F9] border border-[#EBEBEB] rounded-lg py-2 pl-3 pr-8 font-bold text-[#221A12] cursor-pointer outline-none focus:border-[#10854F]"
                    >
                      <option value="popular">Phổ biến nhất</option>
                      <option value="price_asc">Giá từ thấp đến cao</option>
                      <option value="price_desc">Giá từ cao đến thấp</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#221A12]/50 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#F9F9F9] border border-[#EBEBEB] rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-[#10854F]" : "text-[#221A12]/40 hover:text-[#221A12]"}`}
                  >
                    <Grid size={18} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-[#10854F]" : "text-[#221A12]/40 hover:text-[#221A12]"}`}
                  >
                    <List size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {currentProducts.length > 0 ? currentProducts.map((product, idx) => {
                const hasDiscount = !!product.oldPrice;
                // Compute random "Mới" based on ID or index
                const isNew = product.sold < 50 && product.rating > 4.5;
                
                return (
                  <article key={product.id || idx} className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#EBEBEB] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(16,133,79,0.08)]">
                    
                    {/* Top Badges */}
                    <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                      {hasDiscount && (
                        <div className="flex items-center justify-center rounded-full bg-[#EF4444] px-2.5 py-1">
                          <span className="text-[10px] font-black text-white">
                            -{Math.round((1 - product.priceVal / extractPrice(product.oldPrice!)) * 100)}%
                          </span>
                        </div>
                      )}
                      {isNew && (
                        <div className="flex items-center justify-center rounded-full bg-[#10854F] px-2.5 py-1">
                          <span className="text-[10px] font-black text-white">Mới</span>
                        </div>
                      )}
                    </div>

                    {/* Heart Icon */}
                    <button className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm border border-[#F5F5F5] transition-colors hover:text-[#EF4444]">
                      <Heart size={16} className="text-[#221A12]/30 transition-colors hover:fill-[#EF4444] hover:text-[#EF4444]" />
                    </button>

                    <div>
                      {/* Image */}
                      <div className="relative mb-4 aspect-square w-full overflow-hidden p-2">
                        <Image
                          src={product.image}
                          alt={product.name}
                          className="object-contain transition duration-500 group-hover:scale-[1.08]"
                        />
                      </div>

                      {/* Info */}
                      <div className="space-y-1.5">
                        <h3 className="text-[13px] font-extrabold leading-tight text-[#221A12] line-clamp-2 min-h-[36px]" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-[11px] font-bold text-[#221A12]/40">{product.weightKg ? `${product.weightKg}kg` : "Liên hệ"}</p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 text-[#F5B014]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={11} fill={i < Math.round(product.rating) ? "currentColor" : "none"} strokeWidth={2.5} />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-[#221A12]/40">({product.reviews || 88})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-2 pt-1 pb-4">
                          <span className="text-base font-black text-[#EF4444]">{product.price}</span>
                          {product.oldPrice && (
                            <span className="text-[11px] font-bold text-[#221A12]/30 line-through mb-0.5">
                              {product.oldPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to cart button */}
                    <button className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#EAF7EC] py-3 text-xs font-black text-[#10854F] transition-colors hover:bg-[#10854F] hover:text-white group-hover:bg-[#10854F] group-hover:text-white">
                      <ShoppingCart size={15} strokeWidth={2.5} />
                      Thêm vào giỏ
                    </button>
                  </article>
                );
              }) : (
                <div className="col-span-full py-12 text-center text-sm font-bold text-[#221A12]/50">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] text-[#221A12]/40 transition hover:border-[#10854F] hover:text-[#10854F] disabled:opacity-50 disabled:pointer-events-none">
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
                        className={`flex h-9 w-9 items-center justify-center rounded-full font-bold transition-colors ${
                          isActive 
                            ? "bg-[#10854F] text-white shadow-sm border-none" 
                            : "border border-[#EAEAEA] text-[#221A12]/70 hover:border-[#10854F] hover:text-[#10854F]"
                        }`}>
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="flex h-9 w-9 items-center justify-center text-[#221A12]/40">...</span>
                  )}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] text-[#221A12]/40 transition hover:border-[#10854F] hover:text-[#10854F] disabled:opacity-50 disabled:pointer-events-none">
                    &gt;
                  </button>
                </nav>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
