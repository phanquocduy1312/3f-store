import { AlertTriangle, CheckCircle2, CircleDashed, Copy, SearchX, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShopeeVerificationStatus, ShopeeApiCheckStatus } from "@/types/shopee";

const verificationStatusConfig = {
  not_checked: {
    label: "Chưa đối chiếu",
    icon: CircleDashed,
    className: "text-slate-400"
  },
  valid: {
    label: "API hợp lệ",
    icon: CheckCircle2,
    className: "text-[#16A34A]"
  },
  manual_review: {
    label: "Cần kiểm tra",
    icon: ShieldAlert,
    className: "text-[#F59E0B]"
  },
  mismatch: {
    label: "Lệch tổng tiền",
    icon: AlertTriangle,
    className: "text-[#F59E0B]"
  },
  not_found: {
    label: "Không tìm thấy",
    icon: SearchX,
    className: "text-[#EF3340]"
  },
  duplicate: {
    label: "Trùng mã",
    icon: Copy,
    className: "text-slate-500"
  },
  invalid_order_status: {
    label: "Đơn chưa đủ điều kiện",
    icon: ShieldAlert,
    className: "text-[#EF3340]"
  }
};

interface ShopeeApiBadgeProps {
  status: ShopeeVerificationStatus | ShopeeApiCheckStatus;
  className?: string;
  compact?: boolean;
}

export function ShopeeApiBadge({ status, className, compact = false }: ShopeeApiBadgeProps) {
  const config = verificationStatusConfig[status as keyof typeof verificationStatusConfig] || verificationStatusConfig.not_checked;
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap text-[12px] font-semibold", compact ? "gap-1.5" : "", className)}>
      <Icon className={cn("h-4 w-4", config.className)} />
      <span className="text-[#0B1F3A]">{config.label}</span>
    </span>
  );
}
