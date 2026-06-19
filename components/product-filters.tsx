"use client";

import { useMemo } from "react";
import { AlignJustify, PawPrint, Tag, ShieldCheck, Heart } from "lucide-react";
import type { ProductFiltersData } from "@/src/api/productsApi";

interface ProductFiltersProps {
  filtersData: ProductFiltersData | null;
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
  tempMinPrice: number;
  setTempMinPrice: (price: number) => void;
  tempMaxPrice: number;
  setTempMaxPrice: (price: number) => void;
  onClose?: () => void;
}

export function ProductFilters({
  filtersData,
  searchParams,
  setSearchParams,
  tempMinPrice,
  setTempMinPrice,
  tempMaxPrice,
  setTempMaxPrice,
  onClose
}: ProductFiltersProps) {
  const formatMoney = (val: number) => val.toLocaleString("vi-VN") + "đ";

  const activeCategory = searchParams.get("category") || "";
  const activePetType = searchParams.get("petType") || "";
  const activeProductType = searchParams.get("productType") || "";
  const activeBrand = searchParams.get("brand") || "";

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.get("category") === slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    params.set("page", "1");
    setSearchParams(params);
    if (onClose) onClose();
  };

  const handlePetTypeClick = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.get("petType") === value) {
      params.delete("petType");
    } else {
      params.set("petType", value);
    }
    params.set("page", "1");
    setSearchParams(params);
    if (onClose) onClose();
  };

  const handleProductTypeClick = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.get("productType") === value) {
      params.delete("productType");
    } else {
      params.set("productType", value);
    }
    params.set("page", "1");
    setSearchParams(params);
    if (onClose) onClose();
  };

  const handleBrandClick = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.get("brand") === value) {
      params.delete("brand");
    } else {
      params.set("brand", value);
    }
    params.set("page", "1");
    setSearchParams(params);
    if (onClose) onClose();
  };

  const handleApplyPrice = () => {
    const params = new URLSearchParams(searchParams);
    params.set("minPrice", String(tempMinPrice));
    params.set("maxPrice", String(tempMaxPrice));
    params.set("page", "1");
    setSearchParams(params);
    if (onClose) onClose();
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    setSearchParams(params);
    if (filtersData) {
      setTempMinPrice(filtersData.priceRange.min);
      setTempMaxPrice(filtersData.priceRange.max);
    }
    if (onClose) onClose();
  };

  const hasActiveFilters = activeCategory || activePetType || activeProductType || activeBrand || searchParams.has("minPrice") || searchParams.has("maxPrice");

  // Default fallbacks while loading
  const categories = filtersData?.categories || [];
  const petTypes = filtersData?.petTypes || [
    { value: "cat", label: "Cho mèo", count: 0 },
    { value: "dog", label: "Cho chó", count: 0 },
    { value: "both", label: "Chó & mèo", count: 0 }
  ];
  const productTypes = filtersData?.productTypes || [];
  const brands = filtersData?.brands || [];
  const minLimit = filtersData?.priceRange.min ?? 0;
  const maxLimit = filtersData?.priceRange.max ?? 2000000;

  // Build category tree
  const categoryTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];
    
    categories.forEach((c) => {
      map.set(c.id, { ...c, children: [] });
    });
    
    categories.forEach((c) => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).children.push(map.get(c.id));
      } else {
        roots.push(map.get(c.id));
      }
    });
    
    return roots;
  }, [categories]);

  const renderCategoryNode = (node: any, level = 0) => {
    const isActive = activeCategory === node.slug;
    return (
      <li key={node.id} className="w-full">
        <button
          onClick={() => handleCategoryClick(node.slug)}
          style={{ paddingLeft: `${0.75 + level * 1}rem` }}
          className={`w-full flex items-center justify-between py-2.5 pr-3 rounded-xl text-sm font-bold transition-all ${
            isActive
              ? "bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))]"
              : "text-[rgb(var(--color-ink))]/75 hover:bg-[rgb(var(--color-surface-soft))] hover:text-[rgb(var(--color-ink))]"
          }`}
        >
          <span className="text-left flex-1">{node.name}</span>
          <span className={`text-xs ml-2 ${isActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-ink))]/40"}`}>
            {node.count}
          </span>
        </button>
        {node.children && node.children.length > 0 && (
          <ul className="mt-1 space-y-1 relative before:absolute before:left-[1.2rem] before:top-0 before:bottom-0 before:w-px before:bg-forest/10">
            {node.children.map((child: any) => renderCategoryNode(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  const activeFiltersCount = 
    (activeCategory ? 1 : 0) +
    (activePetType ? 1 : 0) +
    (activeProductType ? 1 : 0) +
    (activeBrand ? 1 : 0) +
    (searchParams.has("minPrice") || searchParams.has("maxPrice") ? 1 : 0);

  return (
    <div className="flex flex-col relative h-full">
      <div className="flex-1 flex flex-col gap-6">
        {/* ĐỐI TƯỢNG (PET TYPE) */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
          <h3 className="mb-4 text-[14px] font-black text-[rgb(var(--color-ink))] flex items-center gap-2">
            <PawPrint size={18} className="text-[rgb(var(--color-primary))]" />
            ĐỐI TƯỢNG
          </h3>
          <ul className="space-y-1">
            {petTypes.map((item, idx) => {
              const isActive = activePetType === item.value;
              return (
                <li key={idx}>
                  <button
                    onClick={() => handlePetTypeClick(item.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))]"
                        : "text-[rgb(var(--color-ink))]/75 hover:bg-[rgb(var(--color-surface-soft))] hover:text-[rgb(var(--color-ink))]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-xs ${isActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-ink))]/40"}`}>
                      {item.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* DANH MỤC */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
          <h3 className="mb-4 text-[14px] font-black text-[rgb(var(--color-ink))] flex items-center gap-2">
            <AlignJustify size={18} className="text-[rgb(var(--color-primary))]" />
            DANH MỤC SẢN PHẨM
          </h3>
          <ul className="space-y-1">
            {categoryTree.map((item) => renderCategoryNode(item))}
          </ul>
        </div>


        {/* THƯƠNG HIỆU */}
        {brands.length > 0 && (
          <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
            <h3 className="mb-4 text-[14px] font-black text-[rgb(var(--color-ink))] flex items-center gap-2">
              <ShieldCheck size={18} className="text-[rgb(var(--color-primary))]" />
              THƯƠNG HIỆU
            </h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
              {brands.map((item, idx) => {
                const isActive = activeBrand === item.value;
                return (
                  <label key={idx} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${isActive ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]' : 'border-[#E0E0E0] bg-white group-hover:border-[rgb(var(--color-primary))]'}`}>
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => handleBrandClick(item.value)}
                          className="peer absolute h-full w-full cursor-pointer opacity-0"
                        />
                        <svg className={`pointer-events-none w-3 h-3 text-white ${isActive ? 'block' : 'hidden'}`} viewBox="0 0 14 10" fill="none">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-[rgb(var(--color-ink))]/80 group-hover:text-[rgb(var(--color-ink))] text-left">{item.label}</span>
                    </div>
                    <span className="text-xs font-medium text-[rgb(var(--color-ink))]/40">{item.count}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* KHOẢNG GIÁ */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
          <h3 className="mb-4 text-[14px] font-black text-[rgb(var(--color-ink))]">
            KHOẢNG GIÁ
          </h3>
          <div className="px-1 pt-2 pb-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-[rgb(var(--color-ink-soft))] mb-1 block">Giá tối đa:</label>
              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                step="10000"
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[rgb(var(--color-border))] rounded-lg appearance-none cursor-pointer accent-[rgb(var(--color-primary))]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-[rgb(var(--color-ink))]/80">
            <span>{formatMoney(minLimit)}</span>
            <span className="text-[rgb(var(--color-primary))]">{formatMoney(tempMaxPrice)}</span>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTIONS */}
      <div className="sticky bottom-0 left-0 right-0 bg-[rgb(var(--color-surface))] border-t border-[#F2EFE9] pt-4 pb-2 z-20 mt-6 shadow-[0_-8px_15px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-sm font-bold text-[rgb(var(--color-ink))]">
            Đã chọn: <span className="text-[rgb(var(--color-primary))]">{activeFiltersCount}</span>
          </span>
          <button
            onClick={handleClearFilters}
            className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            disabled={!hasActiveFilters}
          >
            Xóa bộ lọc
          </button>
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full rounded-xl bg-[rgb(var(--color-primary))] py-3 text-sm font-black text-white hover:bg-[rgb(var(--color-primary-dark))] transition-colors shadow-md active:scale-95"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}
