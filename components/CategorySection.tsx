"use client";

import { Image } from "@/components/Image";
import { 
  Dog, 
  Cat, 
  Gem, 
  Plus, 
  Wrench, 
  Percent, 
  PawPrint, 
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones
} from "lucide-react";
import { MotionItem, motionItemProps, MotionSection } from "@/components/MotionSection";

const categories = [
  {
    title: "Thức ăn cho chó",
    image: "/assets/images/dog-food.png",
  },
  {
    title: "Thức ăn cho mèo",
    image: "/assets/images/cat-food.png",
  },
  {
    title: "Phụ kiện thú cưng",
    image: "/assets/images/accessories.png",
  },
  {
    title: "Chăm sóc sức khỏe",
    image: "/assets/images/health-care.png",
  },
  {
    title: "Vệ sinh thú cưng",
    image: "/assets/images/hygiene.png",
  },
  {
    title: "On Sale",
    image: "/assets/images/onsale.png",
  },
];

// Custom configurations for the 6 cards matching Image 2 exactly
const cardConfig = {
  "Thức ăn cho chó": {
    Icon: Dog,
    description: "Dinh dưỡng chất lượng cho bé cún khỏe mạnh",
    iconBg: "bg-[#E58F89]",
    gradient: "from-[#FFF5F4] to-[#FCDEDC]",
    border: "border-[#FBE3E1]",
    btnTheme: "bg-[#E58F89]",
  },
  "Thức ăn cho mèo": {
    Icon: Cat,
    description: "Công thức dinh dưỡng cho mèo cưng",
    iconBg: "bg-[#96C289]",
    gradient: "from-[#F5FAF3] to-[#DCECD7]",
    border: "border-[#E9F3E6]",
    btnTheme: "bg-[#96C289]",
  },
  "Phụ kiện thú cưng": {
    Icon: Gem,
    description: "Vòng cổ, dây dắt, đồ chơi và nhiều hơn nữa",
    iconBg: "bg-[#F0C353]",
    gradient: "from-[#FFFDF0] to-[#FBE9B9]",
    border: "border-[#FDF3D5]",
    btnTheme: "bg-[#F0C353]",
  },
  "Chăm sóc sức khỏe": {
    Icon: Plus,
    description: "Sản phẩm chăm sóc và bảo vệ thú cưng",
    iconBg: "bg-[#6FA4D8]",
    gradient: "from-[#F4F9FD] to-[#D8E8F6]",
    border: "border-[#E9F2FA]",
    btnTheme: "bg-[#6FA4D8]",
  },
  "Vệ sinh thú cưng": {
    Icon: Wrench,
    description: "Tắm gội, vệ sinh thơm tho, sạch sẽ",
    iconBg: "bg-[#B393E2]",
    gradient: "from-[#FAF4FF] to-[#EBDCF9]",
    border: "border-[#F4E9FC]",
    btnTheme: "bg-[#B393E2]",
  },
  "On Sale": {
    Icon: Percent,
    description: "Ưu đãi hấp dẫn không thể bỏ lỡ",
    iconBg: "bg-[#EAA363]",
    gradient: "from-[#FFF8F0] to-[#F7E6D4]",
    border: "border-[#FDF0E1]",
    btnTheme: "bg-[#EAA363]",
  },
};



export function CategorySection() {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F5]">
      {/* Background Watermark Paw */}
      <div className="absolute right-[4%] top-[10%] opacity-[0.03] text-forest pointer-events-none hidden lg:block">
        <PawPrint size={220} className="fill-current" />
      </div>

      <MotionSection className="relative !pb-4 lg:!pb-8">
        {/* Header Section */}
        <div className="relative z-10 mb-12">
          <MotionItem {...motionItemProps} className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#10854F]">
              <PawPrint size={14} className="fill-current" />
              Danh mục nổi bật
            </div>
            <h2 className="mb-4 text-4xl font-black leading-[1.15] tracking-tight text-[#221A12] sm:text-5xl lg:text-[3.25rem]">
              Khám phá thế giới<br />dành cho thú cưng
            </h2>
            <p className="text-[0.95rem] leading-relaxed text-[#221A12]/75">
              Tất cả những gì thú cưng cần, từ dinh dưỡng, chăm sóc<br className="hidden md:block" /> đến phụ kiện & ưu đãi hấp dẫn.
            </p>
          </MotionItem>
        </div>

        {/* Container for cards and background image */}
        <div className="relative mt-16">
          {/* Dog and Cat Image - Popping from behind Card 4 & 5 */}
          <div className="absolute right-[2%] -top-[205px] z-0 hidden xl:block pointer-events-none">
            <MotionItem {...motionItemProps}>
              <Image
                src="/assets/images/dogandcat.webp"
                alt="Chó và mèo dễ thương"
                width={420}
                height={320}
                className="h-auto w-[420px] object-contain"
                priority
              />
            </MotionItem>
          </div>

          {/* Category Grid - Responsive: 1 on mobile, 2 on sm, 3 on lg, 6 on xl */}
          <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => {
            const config = cardConfig[category.title as keyof typeof cardConfig] || cardConfig["Thức ăn cho chó"];
            const IconComponent = config.Icon;
            
            return (
              <MotionItem
                {...motionItemProps}
                key={category.title}
                className={`group relative flex flex-col rounded-[2.25rem] border ${config.border} bg-gradient-to-b ${config.gradient} p-6 pb-7 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]`}
              >
                {/* Centered Circle Icon - White icon inside colored bg */}
                <div className={`mx-auto mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.iconBg} text-white shadow-sm transition duration-300 group-hover:scale-105`}>
                  <IconComponent size={22} strokeWidth={2.5} />
                </div>

                {/* Card Title */}
                <h3 className="mb-2 text-[1.1rem] font-black leading-tight text-[#221A12]">
                  {category.title}
                </h3>

                {/* Card Description */}
                <p className="mb-5 text-[0.8rem] leading-relaxed text-[#221A12]/75 min-h-[38px] flex items-center justify-center px-1">
                  {config.description}
                </p>

                {/* Product Image */}
                <div className="relative flex h-[140px] items-center justify-center mb-6">
                  <Image
                    src={category.image}
                    alt={category.title}
                    width={150}
                    height={140}
                    className="h-auto w-[150px] object-contain transition duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Pill CTA Button */}
                <button 
                  className="mt-auto mx-auto inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-xs font-black text-[#221A12] shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition duration-300 hover:scale-105 hover:bg-gray-50 active:scale-95"
                  aria-label={`Khám phá ${category.title}`}
                >
                  <span>Khám phá</span>
                  <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${config.btnTheme} text-white`}>
                    <ChevronRight size={10} strokeWidth={4} />
                  </span>
                </button>
              </MotionItem>
            );
          })}
        </div>
      </div>


      </MotionSection>
    </section>
  );
}
