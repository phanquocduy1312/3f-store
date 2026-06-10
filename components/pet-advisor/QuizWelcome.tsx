import { motion } from "framer-motion";
import { Check, ChevronRight, PawPrint } from "lucide-react";

interface QuizWelcomeProps {
  onStart: () => void;
}

export function QuizWelcome({ onStart }: QuizWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full justify-center text-left"
    >
      <div className="mb-6">
        <h3 className="text-forest font-black text-[24px] md:text-[30px] leading-[1.3] mb-3">
          <span className="inline-flex items-center gap-2">
            <PawPrint size={28} className="fill-forest text-forest shrink-0" />
            <span>TÌM THỨC ĂN</span>
          </span>
          <br />
          PHÙ HỢP CHO BÉ
        </h3>
        <p className="text-ink font-medium text-[16px] md:text-[18px]">
          Chỉ mất{" "}
          <span className="text-forest font-bold border-b-[2.5px] border-forest pb-0.5">
            30 giây
          </span>
        </p>
      </div>

      {/* Checklist */}
      <ul className="space-y-3.5 mb-8">
        {[
          { text: "Gợi ý sản phẩm phù hợp", id: "suggest" },
          {
            text: (
              <>
                Voucher <span className="font-extrabold text-[#ED4546]">30.000đ</span>
              </>
            ),
            id: "voucher",
          },
          { text: "Checklist chăm sóc miễn phí", id: "checklist" },
        ].map((item) => (
          <li
            key={item.id}
            className="flex items-center text-ink-soft font-medium text-[15px] md:text-[16px]"
          >
            <div className="flex items-center justify-center w-[20px] h-[20px] rounded bg-[#4CAF50] text-white mr-3 shrink-0">
              <Check size={14} className="stroke-[3]" />
            </div>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-[200px] bg-forest hover:bg-forest-dark text-white font-bold py-3.5 px-5 rounded-2xl flex items-center justify-between shadow-lg shadow-forest/15 transition-all duration-300"
      >
        <span className="ml-2 text-[16px] md:text-[18px]">Bắt đầu</span>
        <div className="w-7 h-7 rounded-full bg-white text-forest flex items-center justify-center shrink-0">
          <ChevronRight size={18} strokeWidth={3} />
        </div>
      </button>
    </motion.div>
  );
}
