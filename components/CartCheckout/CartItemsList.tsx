import { Trash2, Minus, Plus } from "lucide-react";
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
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={`${item.id}-${item.variant}`}
          className="flex gap-4 rounded-2xl border border-forest/10 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          {/* Product Image */}
          <div className="h-20 w-20 shrink-0 rounded-xl bg-cream/30 p-1">
            <Image
              src={item.image}
              alt={item.name}
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-ink line-clamp-1">{item.name}</h4>
                <p className="mt-1 text-[11px] font-bold text-forest">Hương vị: {item.variant}</p>
              </div>
              <button
                onClick={() => onRemove(item.id, item.variant)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Xóa sản phẩm"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between">
              {/* Quantity Selector */}
              <div className="flex h-8 w-24 items-center justify-between rounded-lg border border-forest/15 bg-white p-1">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.variant, item.quantity - 1)}
                  className="grid h-6 w-6 place-items-center rounded bg-cream/30 text-ink/80 hover:bg-forest/10 transition"
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>
                <span className="text-xs font-bold text-ink">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.variant, item.quantity + 1)}
                  className="grid h-6 w-6 place-items-center rounded bg-cream/30 text-ink/80 hover:bg-forest/10 transition"
                >
                  <Plus size={12} strokeWidth={2.5} />
                </button>
              </div>

              {/* Price Details */}
              <div className="text-right">
                <span className="text-sm font-black text-forest">{formatPrice(item.price)}</span>
                {item.originalPrice && (
                  <span className="ml-2 text-[11px] text-gray-400 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
