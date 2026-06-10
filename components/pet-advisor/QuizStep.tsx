import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuizStepConfig } from "./quizConfig";
import { OptionCard } from "./OptionCard";

interface QuizStepProps {
  stepConfig: QuizStepConfig;
  savedAnswer?: { value: string | string[]; customText?: string };
  onBack: () => void;
  onNext: (value: string | string[], customText?: string) => void;
}

export function QuizStep({ stepConfig, savedAnswer, onBack, onNext }: QuizStepProps) {
  const isMulti = stepConfig.type === "multi_choice";
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [customText, setCustomText] = useState<string>("");

  // Populate saved answers if they exist
  useEffect(() => {
    if (savedAnswer) {
      if (Array.isArray(savedAnswer.value)) {
        setSelectedValues(savedAnswer.value);
      } else {
        setSelectedValues(savedAnswer.value ? [savedAnswer.value] : []);
      }
      setCustomText(savedAnswer.customText || "");
    } else {
      setSelectedValues([]);
      setCustomText("");
    }
  }, [stepConfig, savedAnswer]);

  const showCustomInput = selectedValues.includes(stepConfig.customInputTrigger || "");

  const handleOptionSelect = (val: string) => {
    if (isMulti) {
      setSelectedValues((prev) => {
        if (prev.includes(val)) {
          return prev.filter((v) => v !== val);
        }
        return [...prev, val];
      });
    } else {
      setSelectedValues([val]);
      
      // Auto-advance if not triggering a custom input text field
      if (val !== stepConfig.customInputTrigger) {
        const timer = setTimeout(() => {
          onNext(val, "");
        }, 250);
        return () => clearTimeout(timer);
      }
    }
  };

  const handleNextClick = () => {
    if (selectedValues.length === 0) return;
    const valueToSubmit = isMulti ? selectedValues : selectedValues[0];
    onNext(valueToSubmit, showCustomInput ? customText : "");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full justify-between"
    >
      <div className="space-y-5">
        <h4 className="text-[18px] md:text-[20px] font-black text-ink leading-snug text-center md:text-left">
          {stepConfig.question}
          {isMulti && <span className="block text-[13px] text-ink-soft font-normal mt-1">(Có thể chọn nhiều)</span>}
        </h4>

        {/* Options list */}
        <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {stepConfig.options?.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              selected={selectedValues.includes(opt.value)}
              onClick={() => handleOptionSelect(opt.value)}
              isMulti={isMulti}
            />
          ))}
        </div>

        {/* Conditional Custom Text Input */}
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={stepConfig.customInputPlaceholder || "Nhập thông tin chi tiết..."}
              className="w-full border-2 border-gray-200 focus:border-forest outline-none rounded-xl px-4 py-3 text-[14px] transition-all bg-cream-soft/10 text-ink"
              autoFocus
            />
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-ink-soft hover:text-ink font-bold text-[14px] transition-colors py-2"
        >
          <ChevronLeft size={16} />
          <span>Quay lại</span>
        </button>

        {/* Only show/enable "Next" if option is chosen */}
        <button
          type="button"
          disabled={selectedValues.length === 0 || (showCustomInput && !customText.trim())}
          onClick={handleNextClick}
          className={`flex items-center gap-1 px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all ${
            selectedValues.length > 0 && (!showCustomInput || customText.trim())
              ? "bg-forest text-white hover:bg-forest-dark cursor-pointer shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <span>Tiếp tục</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
