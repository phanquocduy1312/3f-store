import { cn } from "@/lib/utils";

export type ShopeeTabKey =
  | "all"
  | "pending"
  | "valid"
  | "manual_review"
  | "approved"
  | "rejected"
  | "duplicate"
  | "not_found";

const tabLabels: Record<ShopeeTabKey, string> = {
  all: "Tất cả",
  pending: "Chờ xử lý",
  valid: "API hợp lệ",
  manual_review: "Cần kiểm tra",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  duplicate: "Trùng mã",
  not_found: "Không tìm thấy",
};

interface ShopeeTabsProps {
  activeTab: ShopeeTabKey;
  counts: Record<ShopeeTabKey, number>;
  onChange: (tab: ShopeeTabKey) => void;
}

const tabs = Object.keys(tabLabels) as ShopeeTabKey[];

export function ShopeeTabs({ activeTab, counts, onChange }: ShopeeTabsProps) {
  return (
    <div className="min-w-0 overflow-x-auto pb-1">
      <div className="flex w-max gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-[12px] font-bold transition",
              isActive
                ? "border-[#BFD7FF] bg-[#EEF6FF] text-[#0057E7]"
                : "border-[#DCEBFF] bg-white text-[#64748B] hover:bg-[#F6FAFF]",
            )}
          >
            <span>{tabLabels[tab]}</span>
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", isActive ? "bg-white text-[#0057E7]" : "bg-[#F1F5F9] text-[#64748B]")}>
              {counts[tab]}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
