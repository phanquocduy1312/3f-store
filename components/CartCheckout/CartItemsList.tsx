import { Trash2, Minus, Plus, Star } from "lucide-react";
import type { CartItem } from "@/lib/cartHelper";
import { formatPrice } from "@/lib/cartHelper";
import { Image } from "@/components/Image";

interface CartItemsListProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, variant: string, q: number) => void;
  onRemove: (id: string, variant: string) => void;
}

export function CartItemsList({ items, onUpdateQuantity, onRemove }: CartItemsListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={`${item.id}-${item.variant}`}
          className="relative flex flex-col sm:flex-row gap-3 rounded-2xl border border-forest/10 bg-white p-3 shadow-sm transition hover:shadow-md"
        >
          {/* Delete Button - Top Right */}
          <button
            onClick={() => onRemove(item.id, item.variant)}
            className="absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-colors z-10"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 size={15} className="sm:hidden" />
            <Trash2 size={16} className="hidden sm:block" />
          </button>

          {/* Mobile/Tablet: Horizontal Layout */}
          <div className="flex gap-3">
            {/* Product Image */}
            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl bg-cream/30 p-1.5">
              <Image
                src={item.image}
                alt={item.name}
                className="h-full w-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-1 flex-col pr-6 min-w-0">
              {/* Top Section: Name, Variant, Rating */}
              <div>
                <h4 className="text-xs sm:text-sm font-black text-ink line-clamp-2 mb-1">{item.name}</h4>
                
                {/* Variant */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] sm:text-[10px] text-gray-500">Phân loại:</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-forest bg-forest/5 px-1.5 py-0.5 rounded">
                    {item.variant}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-1.5">
                  <Star size={11} className="fill-yellow-400 text-yellow-400 sm:w-[12px] sm:h-[12px]" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-700">4.8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Price and Quantity - Full Width on Mobile */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t sm:border-t-0 sm:pt-0 sm:flex-col sm:justify-between sm:items-end sm:w-auto">
            {/* Price */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-black text-forest">{formatPrice(item.price)}</span>
                {item.originalPrice && (
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
              </div>
              {item.originalPrice && (
                <span className="text-[9px] sm:text-[10px] font-bold text-red-500">
                  -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex h-8 sm:h-9 w-24 sm:w-28 items-center justify-between rounded-lg border-2 border-forest/20 bg-white px-1">
              <button
                onClick={() => onUpdateQuantity(item.id, item.variant, item.quantity - 1)}
                className="grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-lg bg-cream/40 text-ink/80 hover:bg-forest/10 transition active:scale-95"
              >
                <Minus size={12} strokeWidth={2.5} className="sm:w-[13px] sm:h-[13px]" />
              </button>
              <span className="text-[11px] sm:text-xs font-black text-ink">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.variant, item.quantity + 1)}
                className="grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-lg bg-cream/40 text-ink/80 hover:bg-forest/10 transition active:scale-95"
              >
                <Plus size={12} strokeWidth={2.5} className="sm:w-[13px] sm:h-[13px]" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
