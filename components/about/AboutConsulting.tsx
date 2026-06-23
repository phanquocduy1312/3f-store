import { motion } from "framer-motion";
import { MessageSquare, Heart, Sparkles, CheckCircle2 } from "lucide-react";

const CONSULT_CRITERIA = [
  { label: "Độ tuổi", desc: "Hạt mềm dễ nhai cho mèo con, hạt bổ sung xương khớp cho chó mèo lớn tuổi." },
  { label: "Giống chó / mèo", desc: "Hạt hạt thiết kế riêng cho mặt tịt như Pug/Persian, hạt hỗ trợ lông cho Poodle." },
  { label: "Cân nặng & Thể trạng", desc: "Điều chỉnh lượng thức ăn cho bé thừa cân hoặc bổ sung dinh dưỡng cho bé gầy yếu." },
  { label: "Thói quen ăn uống", desc: "Kết hợp hạt khô và pate cho bé lười uống nước, chọn vị hạt phù hợp cho bé kén ăn." },
  { label: "Mức ngân sách", desc: "Thiết kế thực đơn dinh dưỡng tối ưu và đa dạng sự lựa chọn tùy thuộc vào túi tiền của bạn." },
];

export function AboutConsulting() {
  return (
    <section className="bg-cream-soft py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Text Content Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-bold tracking-wider text-forest uppercase inline-flex items-center gap-1.5">
              <Sparkles size={16} className="text-honey" /> Tư vấn dinh dưỡng cá nhân
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Chọn sản phẩm hoàn hảo cho từng bé cưng
            </h2>
            <p className="mt-5 text-base text-ink-soft leading-relaxed">
              Chúng tôi hiểu rằng không có một loại thức ăn nào là hoàn hảo cho tất cả. Mỗi bé cưng là một cá thể độc nhất với cơ địa và thói quen sinh hoạt khác nhau. Đó là lý do 3F Store luôn đồng hành cùng ba mẹ để chọn sản phẩm tối ưu nhất dựa trên:
            </p>

            {/* Criteria list */}
            <div className="mt-8 space-y-4">
              {CONSULT_CRITERIA.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 size={18} className="text-forest shrink-0 mt-1" />
                  <div>
                    <h4 className="font-extrabold text-sm text-ink">{item.label}</h4>
                    <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vet Disclaimer Box */}
            <div className="mt-10 p-5 rounded-2xl bg-amber-50 border border-amber-200/50 flex gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 font-bold">
                🩺
              </div>
              <div className="text-xs text-amber-800 leading-relaxed font-medium">
                <p className="font-bold text-amber-900 mb-1">Khuyến nghị sức khỏe đặc biệt</p>
                Với các vấn đề sức khỏe đặc biệt như bệnh lý gan, thận hoặc dị ứng nặng, 3F Store luôn khuyến khích ba mẹ tham khảo thêm ý kiến tư vấn từ bác sĩ thú y để có chẩn đoán y khoa chính xác nhất.
              </div>
            </div>
          </motion.div>

          {/* Right Visual Image and CTA card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative flex flex-col items-center"
          >
            <div className="relative aspect-[4/3] w-full max-w-[480px] rounded-3xl overflow-hidden shadow-soft border-4 border-white bg-cream">
              <img
                src="/images/about/about-products.png"
                alt="Các loại hạt và pate đầy đủ dinh dưỡng"
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Callout card */}
            <div className="-mt-12 relative w-[90%] max-w-[400px] rounded-2xl bg-white p-6 shadow-lift border border-forest/5 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-forest-soft text-forest mb-3">
                <MessageSquare size={18} />
              </div>
              <h3 className="font-extrabold text-base text-ink">Bạn cần tìm sản phẩm phù hợp cho bé?</h3>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                Đội ngũ chăm sóc khách hàng 3F Store luôn sẵn sàng lắng nghe và hỗ trợ tư vấn hoàn toàn miễn phí.
              </p>
              <a
                href="https://zalo.me/0879997474"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-forest py-2.5 text-sm font-black text-white hover:bg-forest-dark transition"
              >
                Nhắn tư vấn qua Zalo
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
