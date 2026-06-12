import { cn } from "@/lib/utils";
import type { ShopeeProcessingStatus, ShopeePointStatus } from "@/types/shopee";

const processingStatusConfig = {
  pending: {
    label: "Chờ xử lý",
    className: "bg-orange-50 text-orange-600 border-orange-200"
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-blue-50 text-blue-600 border-blue-200"
  },
  rejected: {
    label: "Từ chối",
    className: "bg-red-50 text-red-600 border-red-200"
  }
};

interface ShopeeStatusBadgeProps {
  status: ShopeeProcessingStatus | ShopeePointStatus;
  className?: string;
}

export function ShopeeStatusBadge({ status, className }: ShopeeStatusBadgeProps) {
  const resolvedStatus = (status === "approved" || status === "rejected") ? status : "pending";
  const config = processingStatusConfig[resolvedStatus];

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-bold",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
