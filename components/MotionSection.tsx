"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { softReveal, staggerContainer } from "@/lib/animations";

type MotionSectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function MotionSection({ children, className, id }: MotionSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      variants={reduceMotion ? undefined : staggerContainer}
      initial={reduceMotion ? undefined : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.18 }}
      className={cn(
        "relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

type MotionItemProps = HTMLMotionProps<"div">;

export function MotionItem({ children, className, ...props }: MotionItemProps) {
  return (
    <motion.div className={className} variants={softReveal} {...props}>
      {children}
    </motion.div>
  );
}

export const motionItemProps = {};
