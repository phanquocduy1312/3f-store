import { motion } from "framer-motion";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export function ContactCTA() {
  const handleScrollToForm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const target = document.getElementById("contact-form-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-forest py-16 text-center text-white">
      {/* Decorative background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(237,69,70,0.12),transparent_35%)]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-3xl">🐾</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Cần chọn sản phẩm phù hợp cho bé?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 leading-relaxed">
            Dù là thức ăn dinh dưỡng, cát vệ sinh hay phụ kiện đồ chơi, 3F Store luôn sẵn sàng lắng nghe mọi mong muốn của ba mẹ nuôi thú cưng.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleScrollToForm}
              className="inline-flex items-center gap-2 rounded-2xl bg-honey px-8 py-4 font-black text-white shadow-soft transition hover:bg-honey-dark hover:shadow-lift active:scale-95 duration-200"
            >
              <MessageCircle size={18} />
              Nhắn tư vấn ngay
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-black text-white hover:bg-white/20 active:scale-95 duration-200"
            >
              <ShoppingBag size={18} />
              Xem sản phẩm
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
