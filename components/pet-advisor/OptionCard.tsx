import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface OptionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  isMulti?: boolean;
}

export function OptionCard({ label, selected, onClick, isMulti }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between group ${
        selected
          ? "border-forest bg-forest-soft/30 text-forest font-bold shadow-md shadow-forest/5"
          : "border-gray-200 hover:border-forest-muted bg-white text-ink hover:bg-cream-soft/20"
      }`}
    >
      <span className="text-[15px] md:text-[16px] pr-4">{label}</span>
      
      {/* Selected Indicator */}
      <div
        className={`w-6 h-6 ${isMulti ? 'rounded-[6px]' : 'rounded-full'} border-2 flex items-center justify-center shrink-0 transition-all ${
          selected
            ? "border-forest bg-forest text-white"
            : "border-gray-300 group-hover:border-forest-muted bg-white"
        }`}
      >
        {selected && <Check size={14} className="stroke-[3]" />}
      </div>
    </motion.button>
  );
}
