import React, { useState, useEffect } from "react";
import { getProducts } from "@/src/api/productsApi";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/store";
import { ShoppingBag } from "lucide-react";

interface BlogRelatedProductsProps {
  keywords?: string | null;
  postTitle: string;
}

export function BlogRelatedProducts({ keywords, postTitle }: BlogRelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        // Derive best query term from seo keywords or title
        let q = "";
        if (keywords) {
          q = keywords.split(",")[0]?.trim() || "";
        }
        if (!q) {
          // Guess based on title
          const titleLower = postTitle.toLowerCase();
          if (titleLower.includes("cho") || titleLower.includes("cún")) q = "chó";
          else if (titleLower.includes("meo") || titleLower.includes("miu")) q = "mèo";
          else if (titleLower.includes("pate")) q = "pate";
          else if (titleLower.includes("cat")) q = "cát";
          else q = "thức ăn";
        }

        const res = await getProducts({ q, limit: 4 });
        if (res.items && res.items.length > 0) {
          setProducts(res.items);
        } else {
          // Fallback to general featured products if no match
          const fallbackRes = await getProducts({ limit: 4 });
          setProducts(fallbackRes.items || []);
        }
      } catch (err) {
        console.error("Error loading related products for blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [keywords, postTitle]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-forest/8 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-black text-ink border-b border-forest/10 pb-4">
          <ShoppingBag size={18} className="text-forest" /> Sản phẩm gợi ý
        </h3>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-48 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="rounded-3xl border border-forest/8 bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-base font-black text-ink border-b border-forest/10 pb-4">
        <ShoppingBag size={18} className="text-forest" /> Sản phẩm gợi ý
      </h3>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product, idx) => (
          <ProductCard key={product.id} product={product} index={idx} showBuyNow={true} />
        ))}
      </div>
    </div>
  );
}
