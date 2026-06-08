"use client";

import { Image } from "@/components/Image";
import { Link } from "react-router-dom";
import {
  Cat,
  ChevronRight,
  Dog,
  Gem,
  Headphones,
  PawPrint,
  Percent,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";

const categories = [
  {
    title: "Thức ăn cho chó",
    image: "/assets/images/dog-food.webp",
  },
  {
    title: "Thức ăn cho mèo",
    image: "/assets/images/cat-food.webp",
  },
  {
    title: "Phụ kiện thú cưng",
    image: "/assets/images/accessories.webp",
  },
  {
    title: "Chăm sóc sức khỏe",
    image: "/assets/images/health-care.webp",
  },
  {
    title: "Vệ sinh thú cưng",
    image: "/assets/images/hygiene.webp",
  },
  {
    title: "On Sale",
    image: "/assets/images/onsale.webp",
  },
];

const cardConfig = {
  "Thức ăn cho chó": {
    Icon: Dog,
    description: "Dinh dưỡng chất lượng cho bé cún khỏe mạnh",
    iconBg: "bg-[#E58F89]",
    gradient: "from-[#FFF6F4] via-[#FFF3F1] to-[#FDE3E0]",
    border: "border-[#F8DFDB]",
    btnTheme: "bg-[#E58F89]",
  },
  "Thức ăn cho mèo": {
    Icon: Cat,
    description: "Công thức dinh dưỡng cân bằng cho mèo cưng",
    iconBg: "bg-[#96C289]",
    gradient: "from-[#F6FBF4] via-[#F0F8EC] to-[#DCECD7]",
    border: "border-[#E5F0E2]",
    btnTheme: "bg-[#96C289]",
  },
  "Phụ kiện thú cưng": {
    Icon: Gem,
    description: "Vòng cổ, dây dắt, đồ chơi và nhiều hơn nữa",
    iconBg: "bg-[#F0C353]",
    gradient: "from-[#FFFDF3] via-[#FFF8DE] to-[#FBE9B9]",
    border: "border-[#F8EFCF]",
    btnTheme: "bg-[#F0C353]",
  },
  "Chăm sóc sức khỏe": {
    Icon: Plus,
    description: "Sản phẩm chăm sóc và bảo vệ thú cưng mỗi ngày",
    iconBg: "bg-[#6FA4D8]",
    gradient: "from-[#F5FAFE] via-[#EEF5FC] to-[#D8E8F6]",
    border: "border-[#E3EDF8]",
    btnTheme: "bg-[#6FA4D8]",
  },
  "Vệ sinh thú cưng": {
    Icon: Wrench,
    description: "Tắm gội, vệ sinh thơm tho, sạch sẽ",
    iconBg: "bg-[#B393E2]",
    gradient: "from-[#FBF7FF] via-[#F5EEFC] to-[#EBDCF9]",
    border: "border-[#EDE0FA]",
    btnTheme: "bg-[#B393E2]",
  },
  "On Sale": {
    Icon: Percent,
    description: "Ưu đãi hấp dẫn không thể bỏ lỡ",
    iconBg: "bg-[#EAA363]",
    gradient: "from-[#FFF9F2] via-[#FFF1E2] to-[#F7E6D4]",
    border: "border-[#F7E7D7]",
    btnTheme: "bg-[#EAA363]",
  },
};

const trustItems = [
  { icon: ShieldCheck, label: "Chính hãng rõ nguồn gốc" },
  { icon: Truck, label: "Giao nhanh toàn quốc" },
  { icon: Headphones, label: "Tư vấn tận tâm" },
];

export function CategorySection() {
  return (
    <section className="relative overflow-hidden bg-cream/30">
      <div className="pointer-events-none absolute right-[4%] top-[10%] hidden text-forest opacity-[0.02] lg:block">
        <PawPrint size={220} className="fill-current" />
      </div>

      <MotionSection className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 !pb-10 pt-8 lg:pt-12">
        <div className="relative z-10 mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <MotionItem {...motionItemProps} className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-forest">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest/10">
                <PawPrint size={12} className="fill-current" />
              </span>
              Danh mục nổi bật
            </div>
            <h2 className="mb-4 text-4xl font-black leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
              Khám phá thế giới
              <br />
              dành cho thú cưng
            </h2>
            <p className="max-w-[640px] text-base leading-relaxed text-ink/70">
              Tất cả những gì thú cưng cần, từ dinh dưỡng, chăm sóc đến phụ kiện và ưu đãi được sắp xếp rõ ràng để bạn mua sắm nhanh hơn.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {trustItems.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-glass-sm transition-transform hover:-translate-y-1"
                >
                  <item.icon size={18} className="text-forest" />
                  {item.label}
                </div>
              ))}
            </div>
          </MotionItem>
        </div>

        <div className="relative mt-16">
          <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {categories.map((category) => {
              const config = cardConfig[category.title as keyof typeof cardConfig] || cardConfig["Thức ăn cho chó"];
              const IconComponent = config.Icon;

              return (
                <MotionItem
                  {...motionItemProps}
                  key={category.title}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="group relative flex flex-col rounded-[2rem] border border-white/60 bg-white/70 p-6 text-center shadow-glass-sm backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-glass"
                >
                  {/* Accent glow on hover */}
                  <div className={`absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-10 bg-gradient-to-b ${config.gradient}`} />

                  <div
                    className={`mx-auto mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${config.iconBg} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <IconComponent size={24} strokeWidth={2.5} />
                  </div>

                  <h3 className="mb-2 text-lg font-bold leading-tight text-ink">{category.title}</h3>

                  <p className="mb-6 flex min-h-[40px] items-center justify-center px-1 text-sm leading-relaxed text-ink/60">
                    {config.description}
                  </p>

                  <div className="relative mb-6 flex h-[130px] items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-b-[2rem]" />
                    <Image
                      src={category.image}
                      alt={category.title}
                      width={140}
                      height={130}
                      className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <Link
                    to={`/products?category=${category.title === "On Sale" ? "Tất cả sản phẩm" : category.title}`}
                    className="mt-auto mx-auto inline-flex items-center gap-2 rounded-full border border-forest/10 bg-forest/5 px-6 py-2.5 text-sm font-bold text-forest transition-all duration-300 group-hover:bg-forest group-hover:text-white"
                    aria-label={`Khám phá ${category.title}`}
                  >
                    Khám phá
                    <ChevronRight size={16} strokeWidth={2.5} className=" transition-transform group-hover:translate-x-1" />
                  </Link>
                </MotionItem>
              );
            })}
          </div>
        </div>
      </MotionSection>
    </section>
  );
}
