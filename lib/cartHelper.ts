export interface CartItem {
  id: string;
  productId?: string;
  variantId?: string;
  sku?: string;
  name: string;
  image: string;
  price: number; // numeric value, e.g. 23000
  originalPrice?: number; // optional, e.g. 29000
  quantity: number;
  variant: string; // chosen flavor
  variantName?: string;
}

const STORAGE_KEY = "3f_cart_items";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load cart", e);
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    // Dispatch custom event to notify other components (e.g. Header)
    window.dispatchEvent(new Event("cart-updated"));
  } catch (e) {
    console.error("Failed to save cart", e);
  }
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity: number): void {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id && i.variant === item.variant);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }

  saveCart(cart);
}

export function updateQuantity(id: string, variant: string, quantity: number): void {
  const cart = getCart();
  const index = cart.findIndex(i => i.id === id && i.variant === variant);

  if (index > -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    saveCart(cart);
  }
}

export function removeFromCart(id: string, variant: string): void {
  const cart = getCart();
  const filtered = cart.filter(i => !(i.id === id && i.variant === variant));
  saveCart(filtered);
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Convert format "23.000đ" or "23.000" to number 23000
export function parsePriceString(priceStr: string | undefined | null): number {
  if (!priceStr) return 0;
  const clean = priceStr.replace(/[^0-9]/g, "");
  return parseInt(clean, 10) || 0;
}

// Convert number 23000 to "23.000đ"
export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}
