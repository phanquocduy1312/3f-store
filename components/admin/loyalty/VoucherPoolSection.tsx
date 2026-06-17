import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FileText, Loader2, Ticket, Upload } from "lucide-react";
import { getAdminLoyaltyRewards, type LoyaltyReward } from "@/src/services/loyaltyRewardsApi";
import { getVoucherPool, importVoucherPool, type VoucherPoolItem } from "@/src/services/loyaltyProductionApi";
import { useToast } from "@/components/ui/toast-notification";

export function VoucherPoolSection() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [items, setItems] = useState<VoucherPoolItem[]>([]);
  const [rewardId, setRewardId] = useState("");
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [singleCode, setSingleCode] = useState("");
  const [voucherValue, setVoucherValue] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setIsLoading(true);
    try {
      const [rewardRes, poolRes] = await Promise.all([
        getAdminLoyaltyRewards({ type: "voucher" }),
        getVoucherPool({ rewardId: rewardId || undefined, status: status || undefined }),
      ]);
      setRewards(rewardRes.data || []);
      setItems(poolRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Không tải được kho mã voucher.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [rewardId, status]);

  const stats = useMemo(() => {
    const source = items;
    return {
      total: source.length,
      available: source.filter((i) => i.status === "available").length,
      assigned: source.filter((i) => i.status === "assigned").length,
      used: source.filter((i) => i.status === "used").length,
      expired: source.filter((i) => i.status === "expired").length,
    };
  }, [items]);

  const handleCsv = async (file: File) => {
    setText(await file.text());
  };

  const selectedRewardId = Number(rewardId || rewards[0]?.id || 0);

  const importCodes = async (payloadText: string) => {
    if (!selectedRewardId) return toast.warning("Chọn quà voucher trước khi thêm mã.");
    if (!payloadText.trim()) return toast.warning("Nhập mã voucher trước khi thêm.");
    try {
      const res = await importVoucherPool({ rewardId: selectedRewardId, text: payloadText, voucherValue });
      toast.success(`Đã thêm ${res.data.created} mã, bỏ qua ${res.data.skipped} mã trùng.`);
      setText("");
      setSingleCode("");
      load();
    } catch (err: any) {
      toast.error(err.message || "Import voucher thất bại.");
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-[#DCEBFF] bg-white p-5 shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
        <div className="grid gap-4 lg:grid-cols-3">
          <Step title="Bước 1" desc="Chọn quà voucher">
            <select value={rewardId} onChange={(e) => setRewardId(e.target.value)} className="mt-3 w-full rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold">
              <option value="">Chọn quà voucher</option>
              {rewards.map((reward) => <option key={reward.id} value={reward.id}>{reward.name}</option>)}
            </select>
          </Step>

          <Step title="Bước 2" desc="Nhập giá trị voucher nếu cần">
            <input type="number" min="0" value={voucherValue} onChange={(e) => setVoucherValue(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Ví dụ: 50000" className="mt-3 w-full rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold" />
          </Step>

          <Step title="Bước 3" desc="Thêm mã voucher">
            <div className="mt-3 flex gap-2">
              <input value={singleCode} onChange={(e) => setSingleCode(e.target.value)} placeholder="WELCOME50" className="min-w-0 flex-1 rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold" />
              <button type="button" onClick={() => importCodes(singleCode)} className="rounded-2xl bg-[#0057E7] px-4 text-[13px] font-bold text-white">Thêm 1 mã</button>
            </div>
          </Step>
        </div>

        <div className="mt-5 rounded-2xl border border-[#DCEBFF] bg-[#F8FBFF] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-black text-[#0B1F3A]">Dán nhiều mã voucher</h3>
              <p className="mt-1 text-[13px] font-semibold text-[#64748B]">Mỗi dòng là một mã voucher. Ví dụ: WELCOME50</p>
            </div>
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-[13px] font-bold text-[#0057E7]">
              <Upload className="h-4 w-4" />
              Upload CSV
              <input type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])} />
            </label>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={"WELCOME50\nWELCOME51\nWELCOME52"} className="mt-4 w-full rounded-2xl border border-[#DCEBFF] bg-white px-4 py-3 text-[13px] font-bold outline-none focus:border-[#0057E7]" />
          <button type="button" onClick={() => importCodes(text)} className="mt-3 h-10 rounded-2xl bg-[#0057E7] px-5 text-[13px] font-bold text-white">Import danh sách mã</button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Tổng mã" value={stats.total} />
        <Stat label="Có thể cấp" value={stats.available} />
        <Stat label="Đã cấp" value={stats.assigned} />
        <Stat label="Đã dùng" value={stats.used} />
        <Stat label="Hết hạn" value={stats.expired} />
      </div>

      <div className="flex justify-end">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-[#DCEBFF] bg-white px-4 py-2.5 text-[13px] font-bold">
          <option value="">Tất cả trạng thái</option>
          <option value="available">Có thể cấp</option>
          <option value="assigned">Đã cấp</option>
          <option value="used">Đã dùng</option>
          <option value="expired">Hết hạn</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
        <table className="w-full min-w-[980px] text-left text-[13px]">
          <thead className="bg-[#F8FBFF] text-[11px] uppercase text-[#64748B]">
            <tr>
              <th className="px-5 py-3">Quà đổi điểm</th>
              <th className="px-4 py-3">Mã voucher</th>
              <th className="px-4 py-3">Giá trị</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Khách được cấp</th>
              <th className="px-4 py-3">Redemption</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF6FF]">
            {isLoading ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-[#0057E7]" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8}><EmptyState /></td></tr>
            ) : items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3 font-bold">{item.reward_name}</td>
                <td className="px-4 py-3 font-black text-[#0057E7]">{item.voucher_code}</td>
                <td className="px-4 py-3">{item.voucher_value?.toLocaleString("vi-VN") || "-"}</td>
                <td className="px-4 py-3">{statusLabel(item.status)}</td>
                <td className="px-4 py-3">{item.assigned_customer_id || "-"}</td>
                <td className="px-4 py-3">{item.assigned_redemption_id ? `#${item.assigned_redemption_id}` : "-"}</td>
                <td className="px-4 py-3">{item.created_at}</td>
                <td className="px-5 py-3 text-right text-[12px] font-bold text-[#94A3B8]">Theo dõi</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Step({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-[#DCEBFF] bg-white p-4"><div className="text-[11px] font-black uppercase text-[#0057E7]">{title}</div><div className="mt-1 text-[14px] font-black text-[#0B1F3A]">{desc}</div>{children}</div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4"><div className="text-[12px] font-bold text-[#64748B]">{label}</div><div className="mt-1 text-[22px] font-black text-[#0B1F3A]">{value.toLocaleString("vi-VN")}</div></div>;
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#0057E7]"><Ticket className="h-6 w-6" /></div>
      <h3 className="mt-4 text-[18px] font-black text-[#0B1F3A]">Chưa có mã voucher</h3>
      <p className="mx-auto mt-2 max-w-xl text-[14px] font-semibold text-[#64748B]">Chọn một quà voucher, dán danh sách mã hoặc upload CSV để bắt đầu cấp mã thật cho khách.</p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#F8FBFF] px-4 py-2 text-[13px] font-bold text-[#64748B]"><FileText className="h-4 w-4" />Mỗi dòng là một mã voucher</div>
    </div>
  );
}

function statusLabel(status: VoucherPoolItem["status"]) {
  const labels = {
    available: "Có thể cấp",
    assigned: "Đã cấp",
    used: "Đã dùng",
    expired: "Hết hạn",
  };
  return labels[status] || status;
}
