import { motion, AnimatePresence } from "framer-motion";
import { PawPrint } from "lucide-react";

interface FloatingPetButtonProps {
  visible: boolean;
  onClick: () => void;
}

export function FloatingPetButton({ visible, onClick }: FloatingPetButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={onClick}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 bg-forest hover:bg-forest-dark text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 group transition-colors duration-300"
          title="Tư vấn thức ăn AI"
        >
          {/* Pulsating background ring */}
          <span className="absolute inset-0 rounded-full border-2 border-forest animate-ping opacity-75 scale-100 group-hover:scale-110 pointer-events-none" />

          {/* Icon */}
          <PawPrint size={22} className="fill-white text-white rotate-[15deg] group-hover:rotate-[30deg] transition-transform duration-300" />
          
          {/* Slide-out text on hover on desktop */}
          <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 ease-out whitespace-nowrap text-[13px] font-extrabold text-white">
            Tư vấn dinh dưỡng AI
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
