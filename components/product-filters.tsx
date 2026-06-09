"use client";

import { AlignJustify, ChevronDown } from "lucide-react";

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

const WEIGHT_LIST = ["Dưới 1kg", "1 - 5kg", "5 - 10kg", "Trên 10kg"];

interface ProductFiltersProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  expandedCats: string[];
  setExpandedCats: React.Dispatch<React.SetStateAction<string[]>>;
  catCounts: Record<string, number>;
  brandCounts: [string, number][];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  tempMaxPrice: number;
  setTempMaxPrice: (price: number) => void;
  handleApplyPrice: () => void;
  selectedWeights: string[];
  toggleWeight: (weight: string) => void;
  weightCounts: Record<string, number>;
  setCurrentPage: (p: number) => void;
  setSelectedBrands: (brands: string[]) => void;
  setSelectedWeights: (weights: string[]) => void;
  searchParams: any;
  setSearchParams: any;
  onClose?: () => void;
}

export function ProductFilters({
  activeCategory,
  setActiveCategory,
  expandedCats,
  setExpandedCats,
  catCounts,
  brandCounts,
  selectedBrands,
  toggleBrand,
  tempMaxPrice,
  setTempMaxPrice,
  handleApplyPrice,
  selectedWeights,
  toggleWeight,
  weightCounts,
  setCurrentPage,
  setSelectedBrands,
  setSelectedWeights,
  searchParams,
  setSearchParams,
  onClose
}: ProductFiltersProps) {
  const formatMoney = (val: number) => val.toLocaleString("vi-VN") + "đ";

  const handleCategoryClick = (nodeName: string, hasSub: boolean, isParentActive: boolean, isExpanded: boolean) => {
    if (hasSub) {
      if (isParentActive && isExpanded) {
        setExpandedCats(prev => prev.filter(c => c !== nodeName));
        return;
      } else if (!isExpanded) {
        setExpandedCats(prev => [...prev, nodeName]);
      }
    }
    
    setActiveCategory(nodeName); 
    setCurrentPage(1); 
    setSelectedBrands([]); 
    setSelectedWeights([]); 
    if (nodeName === "Tất cả sản phẩm") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: nodeName });
    }
    
    if (!hasSub && onClose) {
      onClose(); // auto close on mobile if no nested items
    }
  };

  const handleSubCategoryClick = (sub: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCategory(sub);
    setCurrentPage(1);
    setSelectedBrands([]);
    setSelectedWeights([]);
    setSearchParams({ category: sub });
    if (onClose) onClose();
  };

  const handleApplyFilterMobile = () => {
    handleApplyPrice();
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* DANH MỤC */}
      <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
        <h3 className="mb-4 text-[15px] font-extrabold text-[rgb(var(--color-ink))] flex items-center gap-2">
          <AlignJustify size={18} className="text-[rgb(var(--color-primary))]"/>
          DANH MỤC
        </h3>
        <ul className="space-y-1">
          {CATEGORY_TREE.map((node, idx) => {
            const isParentActive = activeCategory === node.name || !!node.subcategories?.includes(activeCategory);
            const isExpanded = expandedCats.includes(node.name);
            const hasSub = !!node.subcategories?.length;
            
            return (
              <li key={idx} className="flex flex-col">
                <button 
                  onClick={() => handleCategoryClick(node.name, hasSub, isParentActive, isExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isParentActive 
                    ? "bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))]" 
                    : "text-[rgb(var(--color-ink))]/75 hover:bg-[rgb(var(--color-surface-soft))] hover:text-[rgb(var(--color-ink))]"
                }`}>
                  <div className="flex items-center gap-2 text-left">
                    {node.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isParentActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-ink))]/40"}`}>{catCounts[node.name] || 0}</span>
                    {hasSub && (
                      <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </button>
                
                {/* Subcategories */}
                {hasSub && isExpanded && (
                  <ul className="mt-1 ml-3 space-y-1 border-l-2 border-[#F2EFE9] pl-2">
                    {node.subcategories?.map((sub, subIdx) => {
                      const isSubActive = activeCategory === sub;
                      return (
                        <li key={subIdx}>
                          <button
                            onClick={(e) => handleSubCategoryClick(sub, e)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                              isSubActive
                                ? "text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary-soft))]/50"
                                : "text-[rgb(var(--color-ink))]/60 hover:text-[rgb(var(--color-ink))] hover:bg-[rgb(var(--color-surface-soft))]"
                            }`}
                          >
                            <span className="text-left">{sub}</span>
                            <span className={`text-[10px] ${isSubActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-ink))]/30"}`}>{catCounts[sub] || 0}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* THƯƠNG HIỆU */}
      <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
        <h3 className="mb-4 text-[15px] font-extrabold text-[rgb(var(--color-ink))]">
          THƯƠNG HIỆU
        </h3>
        <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
          {brandCounts.map(([brand, count], idx) => {
            if (brand === "Khác" && count === 0) return null;
            return (
              <label key={idx} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${selectedBrands.includes(brand) ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]' : 'border-[#E0E0E0] bg-white group-hover:border-[rgb(var(--color-primary))]'}`}>
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
                  <span className="text-sm font-bold text-[rgb(var(--color-ink))]/80 group-hover:text-[rgb(var(--color-ink))] text-left">{brand}</span>
                </div>
                <span className="text-xs font-medium text-[rgb(var(--color-ink))]/40">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* KHOẢNG GIÁ */}
      <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
        <h3 className="mb-4 text-[15px] font-extrabold text-[rgb(var(--color-ink))]">
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
            className="w-full h-1.5 bg-[rgb(var(--color-border))] rounded-lg appearance-none cursor-pointer accent-[rgb(var(--color-primary))]"
          />
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-[rgb(var(--color-ink))]/80 mb-5">
          <span>0đ</span>
          <span className="text-[rgb(var(--color-primary))]">{formatMoney(tempMaxPrice)}</span>
        </div>
        <button 
          onClick={handleApplyFilterMobile}
          className="w-full rounded-xl bg-[rgb(var(--color-primary))] py-3 text-xs font-black text-white hover:bg-[rgb(var(--color-primary-dark))] transition-colors shadow-md active:scale-95">
          Áp dụng bộ lọc
        </button>
      </div>

      {/* TRỌNG LƯỢNG */}
      <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
        <h3 className="mb-4 text-[15px] font-extrabold text-[rgb(var(--color-ink))]">
          TRỌNG LƯỢNG
        </h3>
        <div className="space-y-3">
          {WEIGHT_LIST.map((weight, idx) => (
            <label key={idx} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${selectedWeights.includes(weight) ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]' : 'border-[#E0E0E0] bg-white group-hover:border-[rgb(var(--color-primary))]'}`}>
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
                <span className="text-sm font-bold text-[rgb(var(--color-ink))]/80 group-hover:text-[rgb(var(--color-ink))] text-left">{weight}</span>
              </div>
              <span className="text-xs font-medium text-[rgb(var(--color-ink))]/40">{weightCounts[weight] || 0}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
