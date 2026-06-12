import { CheckCircle2, CircleDollarSign, Clock3, ListChecks, ShieldAlert, Info } from "lucide-react";
import { formatNumber } from "@/lib/shopee-requests";

type ShopeeStatsProps = {
  stats: {
    totalRequests: { current: number; previous: number };
    pendingRequests: { current: number; previous: number };
    validApiRequests: { current: number; previous: number };
    manualReviewRequests: { current: number; previous: number };
    approvedRequests: { current: number; previous: number };
    totalApprovedPoints: { current: number; previous: number };
  };
  range: {
    comparisonLabel: string;
    showComparison: boolean;
  };
};

const statCards = [
  {
    key: "totalRequests",
    title: "Tổng yêu cầu",
    description: "Đếm tất cả yêu cầu tích điểm Shopee được khách gửi trong khoảng thời gian đang chọn. Dữ liệu lấy theo createdAt.",
    icon: ListChecks,
    iconClass: "text-[#0057E7] bg-[#EEF6FF]",
  },
  {
    key: "pendingRequests",
    title: "Đang chờ duyệt",
    description: "Đếm yêu cầu có status pending trong khoảng thời gian đang chọn. Dữ liệu lấy theo createdAt.",
    icon: Clock3,
    iconClass: "text-[#F59E0B] bg-orange-50",
  },
  {
    key: "validApiRequests",
    title: "API hợp lệ",
    description: "Đếm yêu cầu có kết quả đối chiếu API hợp lệ trong khoảng thời gian đang chọn.",
    icon: CheckCircle2,
    iconClass: "text-[#16A34A] bg-green-50",
  },
  {
    key: "manualReviewRequests",
    title: "Cần kiểm tra",
    description: "Đếm yêu cầu có lỗi hoặc cần admin xem lại như lệch tổng tiền, không tìm thấy API, trùng mã hoặc đơn chưa hoàn tất.",
    icon: ShieldAlert,
    iconClass: "text-[#EF3340] bg-red-50",
  },
  {
    key: "approvedRequests",
    title: "Đã duyệt",
    description: "Đếm yêu cầu đã được duyệt trong khoảng thời gian đang chọn. Dữ liệu lấy theo approvedAt.",
    icon: CheckCircle2,
    iconClass: "text-[#16A34A] bg-green-50",
  },
  {
    key: "totalApprovedPoints",
    title: "Điểm đã cộng",
    description: "Tổng điểm đã cộng từ các yêu cầu đã duyệt trong khoảng thời gian đang chọn. Dữ liệu lấy theo approvedAt.",
    icon: CircleDollarSign,
    iconClass: "text-[#0057E7] bg-[#EEF6FF]",
  },
] as const;

function calculatePercentChange(current: number, previous: number) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0 && current > 0) return null;
  return ((current - previous) / previous) * 100;
}

export function ShopeeStats({ stats, range }: ShopeeStatsProps) {
  if (!stats || !range) return null;
  return (
    <section className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        const statData = stats[card.key];
        const currentValue = statData.current;
        const previousValue = statData.previous;
        const percent = calculatePercentChange(currentValue, previousValue);

        return (
          <article
            key={card.key}
            className="flex min-h-[104px] items-start gap-3 rounded-[22px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.05)] relative"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.iconClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1">
                <p className="text-[12px] font-bold text-[#64748B] leading-tight">{card.title}</p>
                <button className="relative group h-4 w-4 rounded-full text-[#94A3B8] hover:text-[#0057E7] flex items-center justify-center shrink-0">
                  <Info className="h-3.5 w-3.5" />
                  <div className="hidden group-hover:block absolute right-0 top-5 z-20 w-[240px] rounded-xl border border-[#DCEBFF] bg-white p-3 text-xs leading-relaxed text-[#0B1F3A] shadow-[0_12px_32px_rgba(6,43,95,0.16)] text-left font-normal">
                    {card.description}
                  </div>
                </button>
              </div>
              <p className="mt-1 text-[22px] font-black leading-none text-[#0B1F3A]">{formatNumber(currentValue)}</p>
              
              <div className="mt-1.5 flex flex-wrap items-center gap-x-1 text-[10px] font-semibold leading-tight">
                {!range.showComparison ? (
                  <span className="text-[#64748B]">{range.comparisonLabel}</span>
                ) : percent !== null ? (
                  <>
                    <span className={percent >= 0 ? "text-green-600" : "text-red-600"}>
                      {percent >= 0 ? "▲" : "▼"} {Math.abs(percent).toFixed(1)}%
                    </span>
                    <span className="text-[#64748B]">{range.comparisonLabel}</span>
                  </>
                ) : (
                  <span className="text-[#64748B]">Chưa có dữ liệu so sánh</span>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
