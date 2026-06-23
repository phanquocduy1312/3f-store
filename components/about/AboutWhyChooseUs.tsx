import { motion } from "framer-motion";
import { ShieldCheck, MessageSquare, Truck, CheckCircle2, HelpCircle, Thermometer } from "lucide-react";

const BENEFITS = [
  {
    title: "100% Hàng chính hãng",
    description: "Chúng tôi cam kết toàn bộ sản phẩm đều chính hãng, có nguồn gốc xuất xứ rõ ràng và giấy tờ kiểm định đầy đủ.",
    icon: ShieldCheck,
    color: "text-forest bg-forest-soft",
  },
  {
    title: "Tư vấn theo thể trạng",
    description: "Nhân viên giàu kinh nghiệm hỗ trợ tư vấn chọn sản phẩm phù hợp nhất với giống, độ tuổi, cân nặng và thể trạng của bé.",
    icon: MessageSquare,
    color: "text-honey bg-honey-soft",
  },
  {
    title: "Đóng gói kỹ, giao nhanh",
    description: "Quy trình đóng gói 3 lớp chống va đập, bảo vệ sản phẩm nguyên vẹn cùng dịch vụ giao hàng hỏa tốc nội thành.",
    icon: Truck,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "Sản phẩm cực đa dạng",
    description: "Hơn 1000 mã hàng từ thức ăn hạt, pate, súp thưởng đến phụ kiện, sữa tắm đáp ứng mọi nhu cầu sinh hoạt hàng ngày.",
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "Bảo quản chuẩn nhiệt độ",
    description: "Sản phẩm được lưu trữ trong kho sạch sẽ, thoáng mát, kiểm soát độ ẩm chặt chẽ để giữ nguyên hương vị và dinh dưỡng.",
    icon: Thermometer,
    color: "text-amber-600 bg-amber-50",
  },
  {
    title: "Hỗ trợ chu đáo sau bán",
    description: "Chính sách đổi trả linh hoạt, hỗ trợ đổi vị hạt nếu bé không hợp tác ăn, sẵn sàng lắng nghe mọi góp ý từ ba mẹ.",
    icon: HelpCircle,
    color: "text-indigo-600 bg-indigo-50",
  },
];

export function AboutWhyChooseUs() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Side Info */}
          <div className="lg:col-span-1 flex flex-col justify-center">
            <span className="text-sm font-bold tracking-wider text-forest uppercase">
              ❤️ Sự cam kết của chúng tôi
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Vì sao bạn có thể hoàn toàn tin tưởng 3F Store?
            </h2>
            <p className="mt-5 text-base text-ink-soft leading-relaxed">
              Mỗi sản phẩm gửi đi không chỉ là hàng hóa, mà là tình thương yêu và sự cam kết về chất lượng cao nhất dành cho các bé yêu của bạn.
            </p>
            <div className="mt-8 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-soft border-4 border-cream bg-cream hidden lg:block">
              <img
                src="/images/about/about-delivery.png"
                alt="Đóng gói và giao hàng 3F Store"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Grid benefits */}
          <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
            {BENEFITS.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="flex gap-4 p-6 rounded-2xl border border-forest/5 hover:border-forest/10 hover:bg-cream-soft/30 transition duration-300"
                >
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${item.color}`}>
                    <IconComponent size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-ink">
                      {item.title}
                    </h3>
                    <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
