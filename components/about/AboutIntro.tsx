import { motion } from "framer-motion";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";

export function AboutIntro() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Visual Left - Decorative elements and short values */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-soft border-4 border-cream bg-cream">
              <img
                src="/images/about/about-consulting.png"
                alt="Đội ngũ 3F Store tư vấn khách hàng"
                className="h-full w-full object-cover hover:scale-102 transition duration-500"
              />
            </div>
            
            {/* Visual Value Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3.5 p-5 rounded-2xl bg-cream-soft border border-forest/5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-soft text-forest">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm">Tuyển chọn kỹ càng</h4>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                    Sản phẩm từ thương hiệu lớn, có kiểm định an toàn nghiêm ngặt.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 p-5 rounded-2xl bg-cream-soft border border-forest/5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-honey-soft text-honey">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm">Chăm sóc tận tâm</h4>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                    Mỗi bé cưng đều có nhu cầu riêng, chúng tôi ở đây để lắng nghe.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Right - Detailed Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <span className="text-sm font-bold tracking-wider text-forest uppercase inline-flex items-center gap-1.5">
              <Sparkles size={16} className="text-honey" /> Về 3F Store
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Người bạn đồng hành tin cậy của thú cưng
            </h2>
            <div className="mt-6 space-y-5 text-base text-ink-soft leading-relaxed">
              <p>
                <strong>3F Store</strong> là cửa hàng thú cưng chuyên cung cấp thức ăn và sản phẩm chăm sóc cao cấp cho chó mèo tại Việt Nam. Xuất phát từ tình yêu thương to lớn dành cho các bé bốn chân, chúng tôi hiểu rằng mỗi bữa ăn ngon, mỗi món đồ chơi tốt hay hạt cát sạch đều góp phần làm nên cuộc sống vui khỏe cho bé cưng của bạn.
              </p>
              <p>
                Tại 3F Store, chúng tôi không chỉ bán hàng mà còn chọn lọc tỉ mỉ từng mặt hàng từ những thương hiệu uy tín toàn cầu. Chúng tôi luôn ưu tiên các sản phẩm có nguồn gốc xuất xứ rõ ràng, chất lượng ổn định và phù hợp với đặc tính sinh lý của thú cưng nhiệt đới.
              </p>
              <p>
                Trải nghiệm mua sắm tiện lợi, đóng gói cẩn thận, giao hàng hỏa tốc cùng dịch vụ hỗ trợ chu đáo sau bán hàng chính là những giá trị cốt lõi giúp 3F Store chiếm trọn tình cảm của hàng ngàn ba mẹ nuôi thú cưng tại TP.HCM và cả nước.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
