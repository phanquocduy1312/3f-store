import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Mascot } from "./Mascot";

export function AiLoading() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Đang phân tích độ tuổi...",
    "Kiểm tra đặc điểm giống loài...",
    "Đánh giá nhu cầu sức khỏe...",
    "Xem xét ngân sách & thói quen ăn...",
    "Thiết lập chế độ dinh dưỡng tối ưu...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center py-6 px-4">
      {/* Animated Mascot in Thinking mode */}
      <Mascot thinking={true} className="mb-6 h-[160px]" />

      <h4 className="text-[18px] font-black text-ink mb-4 flex items-center justify-center gap-2">
        <Loader2 className="animate-spin text-forest" size={20} />
        <span>Chuyên gia 3F đang phân tích hồ sơ...</span>
      </h4>

      {/* Checklist progress tracker */}
      <div className="w-full max-w-[280px] mx-auto text-left space-y-2 bg-cream-soft/40 p-4 rounded-2xl border border-gray-100">
        {steps.map((step, idx) => {
          const isDone = idx < activeStep;
          const isActive = idx === activeStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-[13px] transition-all duration-300 ${isDone
                  ? "text-forest font-bold"
                  : isActive
                    ? "text-ink font-bold"
                    : "text-gray-300"
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${isDone
                    ? "bg-forest border-forest text-white"
                    : isActive
                      ? "border-forest text-forest animate-pulse"
                      : "border-gray-200 bg-white"
                  }`}
              >
                {isDone && <Check size={10} className="stroke-[3]" />}
              </div>
              <span className={isActive ? "translate-x-1 transition-transform" : ""}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
