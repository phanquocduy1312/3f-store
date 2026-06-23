import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    question: "3F Store có tư vấn chọn thức ăn theo từng bé không?",
    answer: "Có. Bạn có thể gửi thông tin về độ tuổi, cân nặng, giống, thói quen ăn uống và nhu cầu đặc biệt của bé để đội ngũ 3F Store tư vấn loại thức ăn phù hợp nhất.",
  },
  {
    question: "Có thể mua hàng qua Shopee không?",
    answer: "Có. Bạn có thể mua qua gian hàng chính hãng 3F Store Việt Nam trên Shopee hoặc đặt trực tiếp trên website này để nhận điểm thưởng thành viên 3F Club.",
  },
  {
    question: "Tôi cần hỗ trợ đơn hàng thì liên hệ đâu?",
    answer: "Bạn có thể gọi trực tiếp hotline 0879997474 hoặc gửi form liên hệ ở trang này kèm theo số điện thoại và thông tin đơn hàng cần tra cứu.",
  },
  {
    question: "3F Store có hỗ trợ đổi trả không?",
    answer: "3F Store hỗ trợ đổi trả hàng theo đúng chính sách kiểm hàng và tình trạng thực tế của sản phẩm khi giao nhận. Vui lòng liên hệ hotline để được kiểm tra chi tiết.",
  },
  {
    question: "3F Store có thay thế bác sĩ thú y không?",
    answer: "Không. 3F Store hỗ trợ tư vấn các sản phẩm chăm sóc và dinh dưỡng cơ bản cho chó mèo. Với các vấn đề sức khỏe hoặc bệnh lý đặc biệt, bạn nên đưa bé đến tham khảo ý kiến bác sĩ thú y chuyên khoa.",
  },
];

export function ContactFaq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-sm font-bold tracking-wider text-forest uppercase inline-flex items-center gap-1">
            💬 Hỏi đáp nhanh
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Những câu hỏi thường gặp
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-forest/10 bg-cream-soft/20 transition-colors duration-200"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-ink outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2.5 text-[0.92rem] leading-relaxed">
                    <HelpCircle size={18} className="text-forest shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-forest/50 shrink-0 transition-transform duration-300 ${
                      isOpen ? "-rotate-180 text-forest" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="border-t border-forest/5 p-5 text-xs text-ink-soft leading-relaxed font-semibold bg-white/70">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
