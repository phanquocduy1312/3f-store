"use client";

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

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER WITH CLEAR BUTTON */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-[rgb(var(--color-ink))] flex items-center gap-2">
          Bộ lọc tìm kiếm
        </h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

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
          {categories.map((item, idx) => {
            const isActive = activeCategory === item.slug;
            return (
              <li key={idx}>
                <button
                  onClick={() => handleCategoryClick(item.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))]"
                      : "text-[rgb(var(--color-ink))]/75 hover:bg-[rgb(var(--color-surface-soft))] hover:text-[rgb(var(--color-ink))]"
                  }`}
                >
                  <span className="text-left">{item.name}</span>
                  <span className={`text-xs ${isActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-ink))]/40"}`}>
                    {item.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* PHÂN LOẠI SẢN PHẨM (PRODUCT TYPE) */}
      {productTypes.length > 0 && (
        <div className="rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F2EFE9]">
          <h3 className="mb-4 text-[14px] font-black text-[rgb(var(--color-ink))] flex items-center gap-2">
            <Tag size={18} className="text-[rgb(var(--color-primary))]" />
            LOẠI SẢN PHẨM
          </h3>
          <ul className="space-y-1">
            {productTypes.map((item, idx) => {
              const isActive = activeProductType === item.value;
              return (
                <li key={idx}>
                  <button
                    onClick={() => handleProductTypeClick(item.value)}
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
      )}

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
        <div className="flex items-center justify-between text-xs font-bold text-[rgb(var(--color-ink))]/80 mb-5">
          <span>{formatMoney(minLimit)}</span>
          <span className="text-[rgb(var(--color-primary))]">{formatMoney(tempMaxPrice)}</span>
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full rounded-xl bg-[rgb(var(--color-primary))] py-3 text-xs font-black text-white hover:bg-[rgb(var(--color-primary-dark))] transition-colors shadow-md active:scale-95"
        >
          Áp dụng khoảng giá
        </button>
      </div>
    </div>
  );
}
