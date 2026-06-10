import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";

interface MascotProps {
  thinking?: boolean;
  className?: string;
}

export function Mascot({ thinking = false, className = "" }: MascotProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Background soft glow when thinking */}
      {thinking && (
        <div className="absolute inset-0 bg-forest-soft/40 rounded-full blur-3xl animate-ping opacity-60 scale-75" />
      )}

      {/* Main Mascot Image */}
      <motion.img
        src="/assets/images/dog_cat_heart_rbg.png"
        alt="3F Mascot Dog and Cat"
        className={`w-auto object-contain max-h-[200px] md:max-h-[300px] z-10 ${
          thinking ? "pet-pulse-soft" : "pet-float-slow"
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Floating loading bubbles/paws when thinking */}
      {thinking && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <motion.div
            className="absolute top-4 left-1/4 text-forest bg-white p-2 rounded-full shadow-lg"
            animate={{ y: [-10, -30], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          >
            <PawPrint size={16} className="fill-forest text-forest" />
          </motion.div>
          
          <motion.div
            className="absolute top-10 right-1/4 text-[#ED4546] bg-white p-2 rounded-full shadow-lg"
            animate={{ y: [-5, -25], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
          >
            <PawPrint size={14} className="fill-[#ED4546] text-[#ED4546]" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-1/3 text-honey bg-white p-1.5 rounded-full shadow-lg"
            animate={{ y: [0, -15], opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 }}
          >
            <PawPrint size={12} className="fill-honey text-honey" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
