"use client";

import { Link } from "react-router-dom";
import { Image } from "@/components/Image";
import { 
  Truck, Clock, Gift, Star, BadgePercent, Bot, MessageCircle,
  Users, ShoppingBag, ShieldCheck, Award, ChevronRight, PawPrint, Heart
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Truck,
    badge: Clock,
    badgeColor: "bg-blue-500",
    badgeIconColor: "text-white",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    title: "Giao nhanh HCM",
    desc: "Nhận hàng nhanh trong ngày hoặc 2-24h nội thành."
  },
  {
    icon: Gift,
    badge: Star,
    badgeColor: "bg-amber-500",
    badgeIconColor: "text-white",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    title: "Tích điểm đổi quà",
    desc: "Mua càng nhiều, tích điểm càng nhanh, đổi quà hấp dẫn."
  },
  {
    icon: BadgePercent,
    badge: Star,
    badgeColor: "bg-emerald-500",
    badgeIconColor: "text-white",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
    title: "Giá tốt hơn sàn",
    desc: "Ưu đãi riêng cho khách website, tiết kiệm 5-15%."
  },
  {
    icon: Bot,
    badge: MessageCircle,
    badgeColor: "bg-purple-500",
    badgeIconColor: "text-white",
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50",
    title: "Tư vấn bởi AI",
    desc: "AI gợi ý đúng sản phẩm theo giống, tuổi, nhu cầu và ngân sách của bé."
  }
];

const stats = [
  {
    icon: Users,
    value: "24.000+",
    label: "Khách hàng",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50"
  },
  {
    icon: ShoppingBag,
    value: "50.000+",
    label: "Đơn hàng",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50"
  },
  {
    icon: ShieldCheck,
    value: "5 năm",
    label: "hoạt động",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50"
  },
  {
    icon: Award,
    value: "50+",
    label: "Thương hiệu",
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50"
  }
];

export function WhyChooseUsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F2F7FF] via-[#FAFCFF] to-[#F5F9FF] pb-16 pt-8 sm:pb-24 sm:pt-12">
      {/* Decorative background elements */}
      <div className="absolute left-[10%] top-20 text-forest/10">
        <PawPrint size={100} className="rotate-[-20deg]" />
      </div>
      <div className="absolute left-[20%] bottom-20 text-forest/10">
        <PawPrint size={60} className="rotate-[15deg]" />
      </div>
      <div className="absolute right-[10%] bottom-32 h-32 w-32 rounded-full bg-forest/5 blur-3xl" />
      <div className="absolute left-[-5%] top-[40%] h-64 w-64 rounded-full bg-forest/5 blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        
        {/* Header & Image Wrapper */}
        <div className="relative mb-16 flex flex-col items-center">
          
          {/* Header */}
          <div className="relative z-10 text-center">
            <h2 className="text-[2rem] font-extrabold tracking-tight text-ink sm:text-[2.5rem] lg:text-[3rem]">
              Vì sao chọn <span className="text-forest">3F Store?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] font-medium leading-relaxed text-ink-soft sm:text-base">
              Không chỉ bán sản phẩm, 3F còn giúp Boss & Sen<br className="hidden sm:block" />
              mua đúng, nhanh hơn và tiết kiệm hơn.
            </p>
            <div className="mt-5 flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-forest/20"></div>
              <PawPrint size={16} className="text-forest/60" />
              <div className="h-[1px] w-12 bg-forest/20"></div>
            </div>
          </div>

          {/* Cat & Dog Image - Absolute positioned on large screens */}
          <div className="absolute -top-14 right-0 z-0 hidden lg:block w-[320px] xl:w-[360px] translate-x-4 xl:translate-x-8">
            <Image 
              src="/assets/images/dog_and_cat.png" 
              alt="Cat and Dog" 
              width={450} 
              height={450}
              className="h-auto w-full object-contain"
              priority
            />
          
          </div>
        </div>

        {/* Features Cards */}
        <div className="relative z-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const Badge = feature.badge;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative flex flex-col items-center rounded-[1.5rem] bg-white p-8 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(19,72,111,0.12)] border border-white hover:border-forest/10"
              >
                <div className={`relative mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${feature.iconBg} ${feature.iconColor}`}>
                  <Icon size={36} strokeWidth={1.5} />
                  <div className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white ${feature.badgeColor} ${feature.badgeIconColor} shadow-sm`}>
                    <Badge size={13} strokeWidth={2.5} />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-ink">{feature.title}</h3>
                <p className="text-[13px] font-medium leading-relaxed text-ink/70">{feature.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="relative z-20 mt-8 overflow-hidden rounded-[1.5rem] bg-white px-6 py-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] sm:rounded-[2rem] lg:px-10 border border-white"
        >
          <div className="grid grid-cols-2 gap-y-6 gap-x-2 sm:gap-x-4 md:grid-cols-4 md:gap-y-0 md:gap-x-0 md:divide-x divide-[#F1F5F9]">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`flex items-center justify-start sm:justify-center md:justify-start gap-3 sm:gap-4 ${idx !== 0 ? 'md:pl-8' : ''}`}>
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full ${stat.iconBg} ${stat.iconColor}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <div className={`text-[1.1rem] sm:text-[22px] font-black leading-tight ${stat.iconColor}`}>{stat.value}</div>
                    <div className="text-xs sm:text-[13px] font-semibold text-ink-soft">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="relative z-20 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
        >
          <Link 
            to="/ai-chat" 
            className="group flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-full bg-forest px-8 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(19,72,111,0.25)] transition-all hover:bg-forest-dark hover:shadow-[0_12px_25px_rgba(19,72,111,0.35)] active:scale-95 sm:w-auto"
          >
            <Bot size={18} />
            Hỏi AI tư vấn ngay
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            to="/club" 
            className="group flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-forest/20 bg-white px-8 text-[15px] font-bold text-forest shadow-sm transition-all hover:border-forest/40 hover:bg-forest/5 active:scale-95 sm:w-auto"
          >
            <Gift size={18} />
            Tham gia 3F Club
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
