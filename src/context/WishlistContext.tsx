import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";
import { getWishlistApi, toggleWishlistApi, syncWishlistApi } from "@/src/api/wishlistApi";
import type { Product } from "@/types/store";
import { toast } from "sonner";

interface WishlistContextType {
  wishlist: Product[];
  isLoading: boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  isFavorite: (productId: number | string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  isLoading: true,
  toggleWishlist: async () => {},
  isFavorite: () => false,
});

export function mapWishlistItemToProduct(item: any): Product {
  return {
    id: item.slug || String(item.id),
    backendId: Number(item.id),
    name: item.name,
    price: item.price,
    oldPrice: item.oldPrice || undefined,
    image: item.image || "/assets/images/dog-food.webp",
    rating: Number(item.rating) || 5.0,
    reviews: Number(item.reviews) || 0,
    sold: Number(item.sold) || 0,
    brand: item.brand || undefined,
    productType: item.product_type || undefined,
    petType: item.pet_type || undefined,
  };
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useCustomerAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load and sync wishlist when auth state changes
  useEffect(() => {
    const loadAndSyncWishlist = async () => {
      setIsLoading(true);
      if (isLoggedIn) {
        // Sync guest wishlist items to DB
        const localStr = localStorage.getItem("wishlist_guest_products");
        if (localStr) {
          try {
            const localProducts: Product[] = JSON.parse(localStr);
            if (localProducts.length > 0) {
              const ids = localProducts
                .map((p) => p.backendId || Number(p.id))
                .filter((id): id is number => typeof id === "number" && !isNaN(id) && id > 0);

              if (ids.length > 0) {
                await syncWishlistApi(ids);
              }
            }
          } catch (err) {
            console.error("Failed to sync guest wishlist:", err);
          }
          localStorage.removeItem("wishlist_guest_products");
        }

        // Fetch user's wishlist from database
        try {
          const res = await getWishlistApi();
          if (res.success && res.data) {
            setWishlist(res.data.map(mapWishlistItemToProduct));
          }
        } catch (err) {
          console.error("Failed to fetch wishlist:", err);
        }
      } else {
        // Load guest wishlist items
        const localStr = localStorage.getItem("wishlist_guest_products");
        if (localStr) {
          try {
            setWishlist(JSON.parse(localStr));
          } catch {
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
      }
      setIsLoading(false);
    };

    loadAndSyncWishlist();
  }, [isLoggedIn]);

  const toggleWishlist = async (product: Product) => {
    const productId = product.backendId || Number(product.id) || 0;
    if (!productId) {
      toast.error("Không thể xác định thông tin sản phẩm.");
      return;
    }

    if (isLoggedIn) {
      try {
        const res = await toggleWishlistApi(productId);
        if (res.success) {
          if (res.is_favorite) {
            setWishlist((prev) => {
              if (prev.some((p) => (p.backendId || Number(p.id)) === productId)) return prev;
              return [...prev, product];
            });
            toast.success(`Đã thêm "${product.name}" vào danh sách yêu thích.`);
          } else {
            setWishlist((prev) => prev.filter((p) => (p.backendId || Number(p.id)) !== productId));
            toast.success(`Đã xóa "${product.name}" khỏi danh sách yêu thích.`);
          }
        } else {
          toast.error(res.message || "Không thể cập nhật danh sách yêu thích.");
        }
      } catch (err) {
        toast.error("Lỗi kết nối server.");
      }
    } else {
      // Guest local storage flow
      const localStr = localStorage.getItem("wishlist_guest_products");
      let localProducts: Product[] = [];
      if (localStr) {
        try {
          localProducts = JSON.parse(localStr);
        } catch {
          localProducts = [];
        }
      }

      const exists = localProducts.some((p) => (p.backendId || Number(p.id)) === productId);
      let nextProducts: Product[] = [];
      if (exists) {
        nextProducts = localProducts.filter((p) => (p.backendId || Number(p.id)) !== productId);
        toast.success(`Đã xóa "${product.name}" khỏi danh sách yêu thích.`);
      } else {
        nextProducts = [...localProducts, product];
        toast.success(`Đã thêm "${product.name}" vào danh sách yêu thích.`);
      }

      localStorage.setItem("wishlist_guest_products", JSON.stringify(nextProducts));
      setWishlist(nextProducts);
    }
  };

  const isFavorite = (productId: number | string) => {
    const idVal = Number(productId);
    if (!isNaN(idVal)) {
      return wishlist.some((p) => (p.backendId || Number(p.id)) === idVal);
    }
    return wishlist.some((p) => p.slug === productId || p.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isLoading, toggleWishlist, isFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
