import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Star, Percent, Sparkles } from "lucide-react";
import { searchProducts } from "@/src/api/productsApi";
import type { ApiProduct } from "@/src/api/productsApi";
import { buildImageUrl } from "@/src/config/api";

interface ProductSearchBoxProps {
  placeholder?: string;
  className?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function highlightMatch(name: string, query: string) {
  if (!query.trim()) return <span>{name}</span>;
  const regex = new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi");
  const parts = name.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-forest font-bold p-0 rounded-xs">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function ProductSearchBox({ placeholder = "Tìm kiếm sản phẩm cho boss...", className = "" }: ProductSearchBoxProps) {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(qParam);
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Sync with URL query param q
  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    const controller = new AbortController();

    const fetchResults = async () => {
      try {
        const response = await searchProducts(trimmed, 8, controller.signal);
        setResults(response.data?.items || []);
        setIsOpen(true);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search failed:", err);
          setError(true);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/products?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/products");
    }
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleItemClick = (product: ApiProduct) => {
    const detailPath = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
    navigate(detailPath);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleItemClick(results[selectedIndex]);
      } else {
        handleSearchSubmit();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="flex h-11 sm:h-12 w-full items-center rounded-full border border-forest/20 bg-white shadow-[0_2px_8px_rgba(34,52,39,0.06)] transition focus-within:border-forest/40 focus-within:shadow-[0_4px_12px_rgba(34,52,39,0.1)]">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-full flex-1 bg-transparent px-4 sm:px-6 text-xs sm:text-[0.95rem] font-medium text-ink outline-none placeholder:text-ink/40"
          />
          <button
            type="submit"
            className="mr-1.5 sm:mr-2 inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-forest text-white transition hover:scale-105 hover:bg-forest/90 active:scale-95"
            aria-label="Tìm kiếm"
          >
            <Search size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </form>

      {/* Suggestion Dropdown */}
      {isOpen && (query.trim().length >= 2 || loading || error) && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-[420px] overflow-y-auto rounded-[18px] border border-[#E5EEF7] bg-white p-2 shadow-[0_12px_32px_rgba(34,52,39,0.12)]">
          {loading && (
            <div className="flex items-center justify-center py-6 text-xs font-bold text-ink/50">
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-forest border-t-transparent"></span>
              Đang tìm sản phẩm...
            </div>
          )}

          {error && (
            <div className="py-4 text-center text-xs font-bold text-red-500">
              Không thể tìm kiếm sản phẩm. Vui lòng thử lại.
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-bold text-ink/60">Không tìm thấy sản phẩm</p>
              <p className="text-[10px] text-ink/40 mt-1">
                Thử tìm bằng từ khóa khác như <span className="font-bold text-forest">pate</span>, <span className="font-bold text-forest">nekko</span>, <span className="font-bold text-forest">hạt mèo</span>...
              </p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="space-y-0.5">
              {results.map((product, index) => {
                const isSelected = index === selectedIndex;
                const hasDiscount = product.minPrice < product.maxPrice || product.oldPrice;
                const isOutOfStock = product.totalStock <= 0;

                const imageSrc = buildImageUrl(product.mainImageUrl || undefined) || "/assets/images/dog-food.webp";

                const priceText = product.minPrice === product.maxPrice 
                  ? formatCurrency(product.minPrice)
                  : `${formatCurrency(product.minPrice)} - ${formatCurrency(product.maxPrice)}`;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleItemClick(product)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors ${
                      isSelected ? "bg-forest/5" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-forest/10 bg-gray-50 p-1">
                      <img src={imageSrc} alt={product.name} className="h-full w-full object-contain" />
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-[8px] font-black text-white rounded-lg">
                          Hết hàng
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-extrabold uppercase text-forest tracking-wider">
                        {product.brand || "Khác"}
                      </p>
                      <h4 className="text-xs font-bold text-ink line-clamp-1 mt-0.5 leading-snug">
                        {highlightMatch(product.name, query)}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black text-forest">{priceText}</span>
                        {product.variantCount > 1 && (
                          <span className="rounded-md bg-forest/10 px-1.5 py-0.5 text-[8px] font-black text-forest">
                            Có phân loại ({product.variantCount})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="shrink-0 text-right text-[10px] text-ink/50 font-bold hidden sm:block">
                      <div className="flex items-center justify-end gap-0.5 text-yellow-500">
                        <Star size={10} fill="currentColor" />
                        <span>{product.ratingAverage.toFixed(1)}</span>
                      </div>
                      <div className="mt-0.5">Đã bán {product.soldCount}</div>
                    </div>
                  </div>
                );
              })}

              <hr className="border-gray-100 my-1.5" />
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="flex w-full items-center justify-center gap-1 rounded-xl py-2 text-center text-xs font-black text-forest hover:bg-forest/5 transition-colors"
              >
                <Sparkles size={12} className="text-forest animate-pulse" />
                Xem tất cả kết quả cho "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
