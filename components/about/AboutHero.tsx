import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function AboutHero() {
  const handleScrollToInfo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const target = document.getElementById("store-info");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-cream-soft py-16 sm:py-24">
      {/* Background paw print decorative patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="paw-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M12 2C10.9 2 10 2.9 10 4C10 4.3 10.1 4.6 10.2 4.8L9.1 5.9C8.9 5.8 8.6 5.8 8.4 5.8C7.1 5.8 6 6.9 6 8.2C6 9.5 7.1 10.6 8.4 10.6C8.6 10.6 8.9 10.6 9.1 10.5L10.2 11.6C10.1 11.8 10 12.1 10 12.4C10 13.5 10.9 14.4 12 14.4C13.1 14.4 14 13.5 14 12.4C14 12.1 13.9 11.8 13.8 11.6L14.9 10.5C15.1 10.6 15.4 10.6 15.6 10.6C16.9 10.6 18 9.5 18 8.2C18 6.9 16.9 5.8 15.6 5.8C15.4 5.8 15.1 5.8 14.9 5.9L13.8 4.8C13.9 4.6 14 4.3 14 4C14 2.9 13.1 2 12 2Z" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#paw-pattern)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-soft px-4 py-1.5 text-sm font-semibold text-forest">
                👋 Chào mừng bạn đến với 3F Store
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.15]">
                3F Store – Chăm sóc thú cưng từ{" "}
                <span className="text-honey relative inline-block">
                  những điều nhỏ nhất
                </span>
              </h1>
              <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-2xl mx-auto lg:mx-0">
                3F Store cung cấp thức ăn, phụ kiện và sản phẩm chăm sóc chính hãng cho chó mèo, cùng dịch vụ tư vấn phù hợp với thể trạng của từng bé cưng nhà bạn.
              </p>

              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-2xl bg-forest px-8 py-4 font-black text-white shadow-soft transition hover:bg-forest-dark hover:shadow-lift active:scale-95 duration-200"
                >
                  Mua sắm ngay
                  <ArrowRight size={18} />
                </Link>
                <button
                  onClick={handleScrollToInfo}
                  className="inline-flex items-center gap-2 rounded-2xl border border-forest/20 bg-white px-8 py-4 font-black text-forest hover:bg-forest-soft active:scale-95 duration-200"
                >
                  Tư vấn cho thú cưng
                  <MessageCircle size={18} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full max-w-[460px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-lift border-[6px] border-white bg-cream"
            >
              <img
                src="/images/about/about-hero.png"
                alt="Thú cưng hạnh phúc tại 3F Store"
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating Pet Card decoration */}
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 backdrop-blur-md p-4 shadow-glass border border-white/40 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-forest-soft flex items-center justify-center text-forest font-bold shrink-0">
                  🐾
                </div>
                <div>
                  <p className="text-xs font-bold text-ink-soft">Chọn chất lượng</p>
                  <p className="text-sm font-black text-forest">Trọn vẹn tình thương</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
