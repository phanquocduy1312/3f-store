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

export function isSameCartItem(
  a: CartItem | Omit<CartItem, "quantity">,
  b: CartItem | Omit<CartItem, "quantity">
): boolean {
  // 1. Check if both have product ID
  if (a.productId && b.productId) {
    const sameProduct = String(a.productId).trim() === String(b.productId).trim();
    if (!sameProduct) return false;

    // Check variant ID if both have them
    if (a.variantId && b.variantId) {
      return String(a.variantId).trim() === String(b.variantId).trim();
    }

    // Check variant text
    const variantA = String(a.variant || "").trim().toLowerCase();
    const variantB = String(b.variant || "").trim().toLowerCase();
    return variantA === variantB;
  }

  // 2. Fallback to matching item ID and variant
  const idA = String(a.id).trim().toLowerCase();
  const idB = String(b.id).trim().toLowerCase();

  const sameId = !!(
    idA === idB ||
    (a.productId && idB.startsWith(String(a.productId) + "-")) ||
    (b.productId && idA.startsWith(String(b.productId) + "-"))
  );

  const variantA = String(a.variant || "").trim().toLowerCase();
  const variantB = String(b.variant || "").trim().toLowerCase();
  return sameId && variantA === variantB;
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity: number): void {
  const cart = getCart();
  const existing = cart.find(i => isSameCartItem(i, item));

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }

  saveCart(cart);
}

export function updateQuantity(id: string, variant: string, quantity: number): void {
  const cart = getCart();
  // Find index using a robust match logic equivalent
  const index = cart.findIndex(i => 
    isSameCartItem(i, { id, variant, name: "", image: "", price: 0 })
  );

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
  const filtered = cart.filter(i => 
    !isSameCartItem(i, { id, variant, name: "", image: "", price: 0 })
  );
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

// Convert format "23.000đ" or "23.000" to number 23000 (handles ranges by taking first price)
export function parsePriceString(priceStr: string | undefined | null): number {
  if (!priceStr) return 0;
  const cleanPrice = priceStr.split("-")[0].trim();
  const clean = cleanPrice.replace(/[^0-9]/g, "");
  return parseInt(clean, 10) || 0;
}

// Convert number 23000 to "23.000đ"
export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}
