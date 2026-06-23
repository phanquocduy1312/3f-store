import { motion } from "framer-motion";
import { Bone, Fish, UtensilsCrossed, Award, Layers, Compass, HeartPulse, Scissors } from "lucide-react";

const CATEGORIES = [
  {
    title: "Thức ăn cho chó",
    description: "Các dòng hạt, sấy khô dinh dưỡng dồi dào, phù hợp cho từng giống chó nhỏ đến lớn.",
    icon: Bone,
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    title: "Thức ăn cho mèo",
    description: "Hạt dinh dưỡng chuyên sâu giúp mượt lông, tiêu búi lông và chăm sóc đường tiết niệu.",
    icon: Fish,
    color: "bg-sky-50 text-sky-600 border-sky-100",
  },
  {
    title: "Pate & Thức ăn ướt",
    description: "Thơm ngon, mọng nước, bổ sung nước hiệu quả giúp phòng ngừa các bệnh về thận ở chó mèo.",
    icon: UtensilsCrossed,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    title: "Snack & Bánh thưởng",
    description: "Súp thưởng, bánh quy và thịt sấy giúp gắn kết tình cảm ba mẹ và huấn luyện bé dễ dàng.",
    icon: Award,
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    title: "Cát vệ sinh",
    description: "Cát đất sét, cát đậu nành hữu cơ thấm hút cực tốt, vón nhanh và khử mùi hiệu quả.",
    icon: Layers,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    title: "Phụ kiện thú cưng",
    description: "Vòng cổ, dây dắt, bát ăn, đồ chơi tương tác và ổ nằm ấm áp cho boss thoải mái vui chơi.",
    icon: Compass,
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    title: "Chăm sóc sức khỏe",
    description: "Men tiêu hóa, dầu cá, vitamin bổ trợ xương khớp và các sản phẩm hỗ trợ tăng đề kháng.",
    icon: HeartPulse,
    color: "bg-red-50 text-red-600 border-red-100",
  },
  {
    title: "Vệ sinh & Làm đẹp",
    description: "Sữa tắm dưỡng lông mượt mà, nước hoa tai, xịt khử mùi và dụng cụ chải lông chuyên dụng.",
    icon: Scissors,
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
];

export function AboutCategories() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="bg-cream-soft py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Chúng tôi bán gì tại 3F Store?
          </h2>
          <p className="mt-4 text-base text-ink-soft leading-relaxed">
            Danh mục sản phẩm đa dạng, đáp ứng trọn vẹn nhu cầu sinh hoạt, dinh dưỡng và chăm sóc sức khỏe hàng ngày cho chó mèo của bạn.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CATEGORIES.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="flex flex-col p-6 rounded-2xl bg-white border border-forest/5 shadow-soft hover:shadow-lift hover:-translate-y-1 duration-300 transition-all group"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-xl border ${cat.color} shrink-0 mb-4 transition-transform group-hover:scale-110`}>
                  <IconComponent size={22} />
                </div>
                <h3 className="font-extrabold text-lg text-ink mb-2">
                  {cat.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed flex-1">
                  {cat.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
