import { motion } from "framer-motion";
import { Phone, Mail, MapPin, ShoppingBag } from "lucide-react";

const CARDS = [
  {
    title: "Hotline đặt hàng & hỗ trợ",
    value: "0879997474",
    linkText: "Gọi ngay",
    url: "tel:0879997474",
    icon: Phone,
    color: "bg-forest-soft text-forest border-forest/10 hover:bg-forest hover:text-white",
  },
  {
    title: "Email liên hệ & hợp tác",
    value: "3fstorevietnam@gmail.com",
    linkText: "Gửi email",
    url: "mailto:3fstorevietnam@gmail.com",
    icon: Mail,
    color: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white",
  },
  {
    title: "Địa chỉ cửa hàng TP.HCM",
    value: "16 Đường số 12, P. An Khánh, TP Thủ Đức",
    linkText: "Xem bản đồ",
    url: "#store-map-section",
    icon: MapPin,
    isScroll: true,
    color: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white",
  },
  {
    title: "Gian hàng chính hãng Shopee",
    value: "3F Store Việt Nam",
    linkText: "Mua trên Shopee",
    url: "https://shopee.vn/3fstorevietnam",
    icon: ShoppingBag,
    isExternal: true,
    color: "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white",
  },
];

export function ContactQuickCards() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.getElementById(href.substring(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="flex flex-col p-6 rounded-3xl bg-cream-soft/30 border border-forest/5 shadow-soft hover:shadow-lift transition duration-300"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white border border-forest/5 text-forest shadow-sm mb-5 shrink-0">
                  <IconComponent size={22} />
                </div>
                
                <h3 className="font-extrabold text-base text-ink mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-6 font-semibold flex-1">
                  {card.value}
                </p>

                {card.isExternal ? (
                  <a
                    href={card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-full items-center justify-center rounded-xl py-3 text-xs font-black transition border ${card.color}`}
                  >
                    {card.linkText}
                  </a>
                ) : (
                  <a
                    href={card.url}
                    onClick={(e) => card.isScroll && handleScroll(e, card.url)}
                    className={`inline-flex w-full items-center justify-center rounded-xl py-3 text-xs font-black transition border ${card.color}`}
                  >
                    {card.linkText}
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
