"use client";

import { cn } from "@/lib/utils";

type MotionSectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function MotionSection({ children, className, id }: MotionSectionProps) {
  return (
    <div
      id={id}
      className={cn(
        "relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20",
        className,
      )}
    >
      {children}
    </div>
  );
}

type MotionItemProps = React.ComponentProps<"div">;

export function MotionItem({ children, className, ...props }: MotionItemProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export const motionItemProps = {};
