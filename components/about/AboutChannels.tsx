import { motion } from "framer-motion";
import { Globe, ShoppingBag, MessageSquare, MapPin } from "lucide-react";

const CHANNELS = [
  {
    title: "Website 3F Store",
    desc: "Môi trường mua sắm trực tuyến thân thiện, thanh toán nhanh chóng, hỗ trợ tích lũy điểm thưởng thành viên.",
    linkText: "Mua sắm ngay",
    url: "/products",
    isExternal: false,
    icon: Globe,
    color: "bg-forest text-white border-forest hover:bg-forest-dark",
    bgColor: "bg-forest-soft/40",
  },
  {
    title: "Gian hàng Shopee",
    desc: "Mua sắm qua sàn thương mại điện tử uy tín, săn voucher giảm giá sâu và chính sách Freeship Extra tiện lợi.",
    linkText: "Ghé Shopee",
    url: "https://shopee.vn/3fstorevietnam",
    isExternal: true,
    icon: ShoppingBag,
    color: "bg-[#EE4D2D] text-white border-[#EE4D2D] hover:bg-[#D13C1F]",
    bgColor: "bg-[#EE4D2D]/5",
  },
  {
    title: "Tư vấn Zalo trực tiếp",
    desc: "Kênh giao tiếp nhanh chóng nhất để nhận tư vấn dinh dưỡng trực tiếp và đặt hàng nhanh không cần tài khoản.",
    linkText: "Nhắn tin Zalo",
    url: "https://zalo.me/0879997474",
    isExternal: true,
    icon: MessageSquare,
    color: "bg-[#0068FF] text-white border-[#0068FF] hover:bg-[#0057D6]",
    bgColor: "bg-[#0068FF]/5",
  },
  {
    title: "Cửa hàng tại TP.HCM",
    desc: "Ghé thăm không gian cửa hàng của chúng tôi để mua sắm trực tiếp và nhận tư vấn cặn kẽ từ nhân viên cửa hàng.",
    linkText: "Xem bản đồ",
    url: "#store-info",
    isExternal: false,
    isScroll: true,
    icon: MapPin,
    color: "bg-ink text-white border-ink hover:bg-ink-soft",
    bgColor: "bg-ink/5",
  },
];

export function AboutChannels() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (targetId.startsWith("#")) {
      e.preventDefault();
      const target = document.getElementById(targetId.substring(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Mua sắm tiện lợi qua đa kênh
          </h2>
          <p className="mt-4 text-base text-ink-soft leading-relaxed">
            Chọn kênh mua sắm ưa thích của bạn để nhận dịch vụ giao hàng nhanh và sự hỗ trợ tận tâm nhất từ 3F Store.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`flex flex-col p-6 rounded-2xl border border-forest/5 shadow-soft hover:shadow-lift transition duration-300 ${item.bgColor}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-forest shadow-sm border border-forest/5">
                    <IconComponent size={20} className={item.isExternal && item.title.includes("Shopee") ? "text-[#EE4D2D]" : item.title.includes("Zalo") ? "text-[#0068FF]" : "text-forest"} />
                  </div>
                </div>
                <h3 className="font-extrabold text-lg text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-6 flex-1">
                  {item.desc}
                </p>
                {item.isExternal ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-black transition border ${item.color}`}
                  >
                    {item.linkText}
                  </a>
                ) : (
                  <a
                    href={item.url}
                    onClick={(e) => item.isScroll && handleScroll(e, item.url)}
                    className={`inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-black transition border ${item.color}`}
                  >
                    {item.linkText}
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
