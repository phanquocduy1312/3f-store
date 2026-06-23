import { useWishlist } from "@/src/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function WishlistPage() {
  const { wishlist, isLoading } = useWishlist();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-cream/10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-ink/70">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/20 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs */}
        <nav className="mb-4 text-xs font-semibold text-ink/40">
          <Link to="/" className="hover:text-forest transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-ink/80">Sản phẩm yêu thích</span>
        </nav>

        {/* Page Title & Count */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-forest/10 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Sản phẩm yêu thích
            </h1>
            <p className="text-sm font-medium text-ink/50 mt-1">
              Quản lý các sản phẩm bạn đã lưu và quan tâm
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 self-start sm:self-center">
            <Heart size={16} className="text-forest fill-forest" />
            <span className="text-xs font-black text-forest">
              {wishlist.length} sản phẩm
            </span>
          </div>
        </div>

        {wishlist.length === 0 ? (
          /* Empty Wishlist State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-[2rem] border border-forest/10 bg-white p-12 text-center shadow-sm max-w-xl mx-auto"
          >
            <div className="relative mb-6">
              <div className="absolute -inset-1 rounded-full bg-forest/5 blur-lg" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-forest/10 text-forest">
                <Heart size={40} className="stroke-[1.5]" />
              </div>
            </div>

            <h2 className="text-xl font-black text-ink">
              Danh sách yêu thích trống
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-ink/50 max-w-sm">
              Bạn chưa thêm sản phẩm nào vào mục yêu thích. Hãy khám phá và lưu lại những sản phẩm ưng ý nhất!
            </p>

            <Link
              to="/products"
              className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-forest px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-forest/20 transition-all hover:bg-forest/90 active:scale-95"
            >
              <ShoppingBag size={16} />
              <span>Khám phá sản phẩm ngay</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
