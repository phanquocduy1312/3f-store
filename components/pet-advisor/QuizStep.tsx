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
      if (stepConfig.type === "textarea") {
        setCustomText(typeof savedAnswer.value === "string" ? savedAnswer.value : "");
      } else {
        if (Array.isArray(savedAnswer.value)) {
          setSelectedValues(savedAnswer.value);
        } else {
          setSelectedValues(savedAnswer.value ? [savedAnswer.value] : []);
        }
        setCustomText(savedAnswer.customText || "");
      }
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
    if (stepConfig.type === "textarea") {
      if (!customText.trim()) return;
      onNext(customText.trim(), "");
    } else {
      if (selectedValues.length === 0) return;
      const valueToSubmit = isMulti ? selectedValues : selectedValues[0];
      onNext(valueToSubmit, showCustomInput ? customText : "");
    }
  };

  const isNextDisabled = stepConfig.type === "textarea"
    ? !customText.trim()
    : (selectedValues.length === 0 || (showCustomInput && !customText.trim()));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full justify-between"
    >
      <div className="space-y-5">
        <div>
          <h4 className="text-[18px] md:text-[20px] font-black text-ink leading-snug text-center md:text-left">
            {stepConfig.question}
          </h4>
          {stepConfig.description && (
            <p className="text-[13px] text-ink-soft mt-1 leading-normal text-center md:text-left">
              {stepConfig.description}
            </p>
          )}
          {isMulti && <span className="block text-[13px] text-ink-soft font-normal mt-1">(Có thể chọn nhiều)</span>}
        </div>

        {/* Conditional rendering of Options list OR Textarea */}
        {stepConfig.type === "textarea" ? (
          <div className="space-y-3">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={stepConfig.placeholder || "Nhập thông tin tại đây..."}
              className="w-full min-h-[120px] border-2 border-gray-200 focus:border-forest outline-none rounded-2xl px-4 py-3 text-[14px] transition-all bg-cream-soft/10 text-ink resize-none"
              autoFocus
            />
            {stepConfig.quickOptions && stepConfig.quickOptions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Gợi ý nhanh:</span>
                <div className="flex flex-wrap gap-2">
                  {stepConfig.quickOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setCustomText((prev) => {
                          const trimmed = prev.trim();
                          if (!trimmed) return opt;
                          if (trimmed.toLowerCase().includes(opt.toLowerCase())) return prev;
                          return `${trimmed}, ${opt}`;
                        });
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white hover:bg-forest-soft/10 hover:border-forest text-ink-soft cursor-pointer transition-all active:scale-95 animate-fade-in"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
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
        )}

        {/* Conditional Custom Text Input */}
        {stepConfig.type !== "textarea" && showCustomInput && (
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

        <button
          type="button"
          disabled={isNextDisabled}
          onClick={handleNextClick}
          className={`flex items-center gap-1 px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all ${
            !isNextDisabled
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
