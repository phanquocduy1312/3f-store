"use client";

import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingCart, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProductDetail } from "@/src/api/productsApi";
import { addToCart, parsePriceString } from "@/lib/cartHelper";
import { useNavigate } from "react-router-dom";
import type { Product, ProductVariant } from "@/types/store";
import { toast } from "sonner";

interface QuickAddEventDetail {
  productId: string;
  intent: "add-to-cart" | "buy-now";
}

export function QuickAddToCartModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [intent, setIntent] = useState<"add-to-cart" | "buy-now">("add-to-cart");
  const [error, setError] = useState<string | null>(null);

  // Selection states
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");

  // Listen for the custom event to open the modal
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<QuickAddEventDetail>;
      const { productId, intent: curIntent } = customEvent.detail;

      setIsOpen(true);
      setIsLoading(true);
      setError(null);
      setProduct(null);
      setSelectedOptions({});
      setQuantity(1);
      setIntent(curIntent);

      getProductDetail(productId)
        .then((res) => {
          setProduct(res.item);
          setActiveImage(res.item.image);
          // If only one variant, auto select it or preset choices if possible
          if (res.item.variants && res.item.variants.length === 1) {
            const single = res.item.variants[0];
            const preset: Record<string, string> = {};
            if (single.option1Name && single.option1Value) preset[single.option1Name] = single.option1Value;
            if (single.option2Name && single.option2Value) preset[single.option2Name] = single.option2Value;
            if (single.option3Name && single.option3Value) preset[single.option3Name] = single.option3Value;
            setSelectedOptions(preset);
            if (single.image) setActiveImage(single.image);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Không thể tải thông tin sản phẩm.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    window.addEventListener("open-quick-add" as any, handleOpen);
    return () => {
      window.removeEventListener("open-quick-add" as any, handleOpen);
    };
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const variants = product?.variants ?? [];
  const options = product?.options ?? [];
  const hasVariants = variants.length > 0;

  // Resolve matching variant
  const getSelectedVariant = (): ProductVariant | null => {
    if (!hasVariants) return null;
    if (Object.keys(selectedOptions).length < options.length) return null;

    return (
      variants.find((v) => {
        if (options[0]) {
          const val = selectedOptions[options[0].name];
          if (v.option1Value !== val) return false;
        }
        if (options[1]) {
          const val = selectedOptions[options[1].name];
          if (v.option2Value !== val) return false;
        }
        if (options[2]) {
          const val = selectedOptions[options[2].name];
          if (v.option3Value !== val) return false;
        }
        return true;
      }) ?? null
    );
  };

  const selectedVariant = getSelectedVariant();
  const isVariantSelected = !hasVariants || selectedVariant !== null;

  // Pricing & Info updates based on selection
  const currentPrice = selectedVariant?.price ?? product?.price ?? "0đ";
  const originalPrice = selectedVariant?.oldPrice ?? product?.oldPrice ?? null;
  const currentPriceVal = parsePriceString(currentPrice);
  const originalPriceVal = originalPrice ? parsePriceString(originalPrice) : 0;
  const hasDiscount = originalPriceVal > currentPriceVal;
  const discountPercent = hasDiscount ? Math.round((1 - currentPriceVal / originalPriceVal) * 100) : 0;

  const currentSku = selectedVariant?.sku ?? "";
  const availableStock = hasVariants
    ? (selectedVariant ? (selectedVariant.stock ?? 0) : 0)
    : (product?.stock ?? 0);

  const isOutOfStock = isVariantSelected && availableStock <= 0;

  // Determine if option value is disabled (dependency-aware)
  const isOptionValueDisabled = (groupName: string, value: string) => {
    if (!product || !variants) return false;

    const testSelection = { ...selectedOptions, [groupName]: value };

    // Find if any variant matching test selection has stock > 0
    const hasMatchingWithStock = variants.some((v) => {
      if (options[0]) {
        const sel = testSelection[options[0].name];
        if (sel && v.option1Value !== sel) return false;
      }
      if (options[1]) {
        const sel = testSelection[options[1].name];
        if (sel && v.option2Value !== sel) return false;
      }
      if (options[2]) {
        const sel = testSelection[options[2].name];
        if (sel && v.option3Value !== sel) return false;
      }
      return (v.stock ?? 0) > 0;
    });

    return !hasMatchingWithStock;
  };

  // Option selection handler
  const handleSelectOption = (groupName: string, value: string) => {
    const nextSelection = { ...selectedOptions, [groupName]: value };
    setSelectedOptions(nextSelection);

    // Resolve variant-specific image if matching variant or subset variant has one
    const matched = variants.find((v) => {
      if (groupName === options[0]?.name && v.option1Value !== value) return false;
      if (groupName === options[1]?.name && v.option2Value !== value) return false;
      if (groupName === options[2]?.name && v.option3Value !== value) return false;
      return true;
    });
    if (matched?.image) {
      setActiveImage(matched.image);
    }
  };

  // Cart confirmation / checkout navigation
  const handleConfirm = () => {
    if (!product) return;
    if (hasVariants && !selectedVariant) return;
    if (isOutOfStock) return;

    const variantPrice = selectedVariant?.price ?? product.price;
    const variantOldPrice = selectedVariant?.oldPrice ?? product.oldPrice;

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
      variant: selectedVariant?.label ?? "Mặc định",
    }, quantity);

    if (intent === "buy-now") {
      handleClose();
      navigate("/cart"); // Go to cart checkout page
    } else {
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
        {/* Clickable Overlay */}
        <div className="absolute inset-0" onClick={handleClose} />

        {/* Modal Sheet container */}
        <motion.div
          initial={{ y: "100%", opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 260 }}
          className="relative z-10 flex w-full max-h-[90vh] flex-col rounded-t-[24px] bg-white p-6 shadow-2xl overflow-y-auto sm:max-w-lg sm:rounded-[24px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <h2 className="text-lg font-black text-ink">
              {intent === "add-to-cart" ? "Thêm vào giỏ hàng" : "Mua ngay"}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full bg-gray-50 p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-ink"
              aria-label="Đóng"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Loading View */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-ink-soft">Đang tải thông tin sản phẩm...</p>
            </div>
          )}

          {/* Error View */}
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
              <AlertTriangle className="mx-auto mb-2 text-red-500" size={24} />
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button
                onClick={handleClose}
                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Form Content */}
          {!isLoading && !error && product && (
            <div className="flex flex-col gap-5">
              {/* Product Summary Row */}
              <div className="flex gap-4">
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-2">
                  <img src={activeImage} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex flex-col justify-between">
                  <h3 className="line-clamp-2 text-sm font-extrabold text-ink leading-tight" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[1.2rem] font-black text-forest">{currentPrice}</span>
                    {originalPrice && (
                      <span className="text-xs text-ink/35 line-through">{originalPrice}</span>
                    )}
                    {hasDiscount && (
                      <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-black text-red-500">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-col gap-0.5 text-xs font-medium text-ink-soft">
                    {currentSku && <span>SKU: {currentSku}</span>}
                    {isVariantSelected ? (
                      <span>
                        Tồn kho:{" "}
                        <strong className={availableStock > 0 ? "text-ink" : "text-red-500"}>
                          {availableStock}
                        </strong>{" "}
                        sản phẩm
                      </span>
                    ) : (
                      <span className="text-amber-600">Vui lòng chọn phân loại để xem tồn kho</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Variant Selections */}
              {options.length > 0 && (
                <div className="flex flex-col gap-4 border-t border-gray-50 pt-4">
                  {options.map((group) => {
                    const selectedVal = selectedOptions[group.name];
                    return (
                      <div key={group.name} className="flex flex-col gap-2">
                        <span className="text-xs font-black text-ink/75 uppercase tracking-wider">
                          {group.name}: <span className="text-forest normal-case font-bold">{selectedVal ?? ""}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {group.values.map((val) => {
                            const isSelected = selectedVal === val;
                            const isDisabled = isOptionValueDisabled(group.name, val);
                            return (
                              <button
                                key={val}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => handleSelectOption(group.name, val)}
                                className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                                  isSelected
                                    ? "border-forest bg-forest/5 text-forest shadow-sm"
                                    : isDisabled
                                    ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50"
                                    : "border-gray-200 bg-white text-ink hover:border-forest/40 hover:bg-gray-50"
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity Adjuster */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <span className="text-sm font-black text-ink">Số lượng mua</span>
                <div className="flex h-10 w-32 items-center justify-between rounded-xl border border-gray-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={!isVariantSelected || isOutOfStock}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-gray-50 text-gray-400 transition hover:bg-gray-100 hover:text-ink disabled:opacity-50"
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="text-sm font-extrabold text-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    disabled={!isVariantSelected || isOutOfStock || quantity >= availableStock}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-gray-50 text-gray-400 transition hover:bg-gray-100 hover:text-ink disabled:opacity-50"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-2 flex flex-col gap-2">
                {!isVariantSelected && (
                  <p className="text-center text-xs font-bold text-amber-600">
                    ⚠️ Vui lòng chọn đầy đủ phân loại sản phẩm.
                  </p>
                )}
                {isVariantSelected && isOutOfStock && (
                  <p className="text-center text-xs font-bold text-red-500">
                    ❌ Phân loại này đã hết hàng hoặc không đủ tồn kho.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!isVariantSelected || isOutOfStock}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest py-4 font-black text-white shadow-lg shadow-forest/20 transition-all hover:bg-forest/90 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:pointer-events-none"
                >
                  {intent === "add-to-cart" ? (
                    <>
                      <ShoppingCart size={18} strokeWidth={2.5} />
                      <span>Thêm vào giỏ hàng</span>
                    </>
                  ) : (
                    <span>Mua ngay</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
