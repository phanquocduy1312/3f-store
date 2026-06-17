import { useEffect, useState } from "react";
import { BarChart3, Loader2, RefreshCcw } from "lucide-react";
import { getLoyaltyAnalytics } from "@/src/services/loyaltyProductionApi";

type AnalyticsState = "idle" | "loading" | "ready" | "empty" | "error";

export function LoyaltyAnalyticsSection() {
  const [data, setData] = useState<any>(null);
  const [state, setState] = useState<AnalyticsState>("idle");
  const [error, setError] = useState("");

  const load = async () => {
    setState("loading");
    setError("");
    try {
      const res = await getLoyaltyAnalytics();
      const nextData = res.data || null;
      const hasUsefulData =
        Number(nextData?.totalIssuedPoints || 0) > 0 ||
        Number(nextData?.totalUsedPoints || 0) > 0 ||
        Number(nextData?.totalRedemptions || 0) > 0 ||
        (nextData?.timeline || []).length > 0;

      setData(nextData);
      setState(hasUsefulData ? "ready" : "empty");
    } catch (err: any) {
      setError(err.message || "Không tải được dữ liệu. Bấm thử lại.");
      setState("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (state === "loading") {
    return (
      <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-10 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#0057E7]" />
        <p className="mt-3 text-[13px] font-bold text-[#64748B]">Đang tải phân tích loyalty...</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <EmptyAnalytics
        title="Không tải được dữ liệu. Bấm thử lại."
        description={error}
        actionLabel="Thử lại"
        onAction={load}
      />
    );
  }

  if (state === "empty" || !data) {
    return (
      <EmptyAnalytics
        title="Chưa có đủ dữ liệu để phân tích loyalty."
        description="Khi hệ thống bắt đầu phát hành điểm, đổi quà và cấp voucher, báo cáo phân tích sẽ hiển thị tại đây."
        actionLabel="Tải lại"
        onAction={load}
      />
    );
  }

  const cards = [
    ["Tổng điểm đã phát hành", data.totalIssuedPoints],
    ["Tổng điểm đã sử dụng", data.totalUsedPoints],
    ["Tỷ lệ đổi quà", `${data.redemptionRate}%`],
    ["Tỷ lệ khách quay lại", `${data.returnRate}%`],
    ["Tổng lượt đổi quà", data.totalRedemptions],
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[20px] border border-[#DCEBFF] bg-white p-5">
            <div className="text-[12px] font-bold text-[#64748B]">{label}</div>
            <div className="mt-2 text-[24px] font-black text-[#0B1F3A]">{String(value ?? 0).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <List title="Top khách hàng" items={data.topCustomers} primary="customer_phone" secondary="points" />
        <List title="Top quà đổi" items={data.topRewards} primary="name" secondary="total" />
        <List title="Top voucher đã cấp" items={data.topVouchers} primary="voucher_code" secondary="total" />
      </div>

      <section className="rounded-[20px] border border-[#DCEBFF] bg-white p-5">
        <h3 className="font-black text-[#0B1F3A]">Biểu đồ theo ngày</h3>
        <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-2">
          {(data.timeline || []).map((row: any) => {
            const max = Math.max(Number(row.issued), Number(row.used), 1);
            return (
              <div key={row.date} className="grid grid-cols-[100px_1fr_80px] items-center gap-3 text-[12px] font-bold">
                <span className="text-[#64748B]">{row.date}</span>
                <div className="h-3 rounded-full bg-[#EEF6FF]">
                  <div className="h-3 rounded-full bg-[#0057E7]" style={{ width: `${(Number(row.issued) / max) * 100}%` }} />
                </div>
                <span>{Number(row.issued).toLocaleString("vi-VN")} điểm</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function EmptyAnalytics({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <section className="rounded-[24px] border border-[#DCEBFF] bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#0057E7]">
        <BarChart3 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-[18px] font-black text-[#0B1F3A]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-[14px] font-semibold text-[#64748B]">{description}</p>
      <button onClick={onAction} className="mt-5 inline-flex h-10 items-center gap-2 rounded-2xl bg-[#0057E7] px-4 text-[13px] font-bold text-white">
        <RefreshCcw className="h-4 w-4" />
        {actionLabel}
      </button>
    </section>
  );
}

function List({ title, items, primary, secondary }: { title: string; items: any[]; primary: string; secondary: string }) {
  return (
    <section className="rounded-[20px] border border-[#DCEBFF] bg-white p-5">
      <h3 className="font-black text-[#0B1F3A]">{title}</h3>
      <div className="mt-4 space-y-3">
        {(items || []).length === 0 ? (
          <p className="text-[13px] font-semibold text-[#94A3B8]">Chưa có dữ liệu.</p>
        ) : (items || []).map((item, idx) => (
          <div key={`${item[primary]}-${idx}`} className="flex items-center justify-between border-b border-[#EEF6FF] pb-2 text-[13px]">
            <span className="font-bold">{item[primary] || "-"}</span>
            <span className="font-black text-[#0057E7]">{Number(item[secondary] || 0).toLocaleString("vi-VN")}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
