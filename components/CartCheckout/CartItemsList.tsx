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
          className="relative flex gap-3 rounded-xl border border-forest/10 bg-white p-2.5 shadow-sm transition hover:shadow-md items-start"
        >
          {/* Delete Button - Top Right */}
          <button
            onClick={() => onRemove(item.id, item.variant)}
            className="absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-colors z-10"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 size={14} />
          </button>

          {/* Product Image */}
          <div className="h-16 w-16 shrink-0 rounded-lg bg-cream/30 p-1">
            <Image
              src={item.image}
              alt={item.name}
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-1 flex-col justify-between min-w-0 pr-4">
            <div>
              <h4 className="text-[11px] sm:text-xs font-black text-ink line-clamp-2 leading-snug">{item.name}</h4>
              <div className="flex items-center gap-1 mt-1 mb-1.5">
                <span className="text-[9px] font-bold text-forest bg-forest/5 px-1.5 py-0.5 rounded">
                  {item.variant}
                </span>
              </div>
            </div>

            {/* Price & Quantity */}
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex flex-col">
                <span className="text-xs sm:text-[13px] font-black text-forest">{formatPrice(item.price)}</span>
                {item.originalPrice && (
                  <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex h-6 sm:h-7 w-20 items-center justify-between rounded-lg border border-forest/20 bg-white px-1">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.variant, item.quantity - 1)}
                  className="grid h-5 w-5 place-items-center rounded bg-cream/40 text-ink/80 hover:bg-forest/10 transition active:scale-95"
                >
                  <Minus size={10} strokeWidth={2.5} />
                </button>
                <span className="text-[10px] sm:text-[11px] font-black text-ink">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.variant, item.quantity + 1)}
                  className="grid h-5 w-5 place-items-center rounded bg-cream/40 text-ink/80 hover:bg-forest/10 transition active:scale-95"
                >
                  <Plus size={10} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
