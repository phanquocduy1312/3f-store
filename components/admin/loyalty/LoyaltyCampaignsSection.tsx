import { useEffect, useState } from "react";
import { CalendarClock, Loader2, Plus, Save } from "lucide-react";
import {
  getLoyaltyCampaigns,
  previewLoyaltyPoints,
  saveLoyaltyCampaign,
  setLoyaltyCampaignActive,
  type LoyaltyCampaign,
} from "@/src/services/loyaltyProductionApi";
import { useToast } from "@/components/ui/toast-notification";

export function LoyaltyCampaignsSection() {
  const [campaigns, setCampaigns] = useState<LoyaltyCampaign[]>([]);
  const [editing, setEditing] = useState<LoyaltyCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", multiplier: 2, startAt: "", endAt: "", isActive: 1 });
  const [preview, setPreview] = useState({ amount: 0, customerId: "" });
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setIsLoading(true);
    try {
      setCampaigns((await getLoyaltyCampaigns()).data || []);
    } catch (err: any) {
      toast.error(err.message || "Không tải được chiến dịch.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (campaign?: LoyaltyCampaign) => {
    setEditing(campaign || null);
    setForm(campaign ? {
      name: campaign.name,
      description: campaign.description || "",
      multiplier: Number(campaign.multiplier),
      startAt: campaign.start_at ? campaign.start_at.substring(0, 16).replace(" ", "T") : "",
      endAt: campaign.end_at ? campaign.end_at.substring(0, 16).replace(" ", "T") : "",
      isActive: Number(campaign.is_active),
    } : { name: "", description: "", multiplier: 2, startAt: "", endAt: "", isActive: 1 });
    setIsModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.warning("Nhập tên chiến dịch.");
    try {
      await saveLoyaltyCampaign({
        id: editing?.id,
        name: form.name,
        description: form.description,
        multiplier: form.multiplier,
        startAt: form.startAt ? form.startAt.replace("T", " ") + ":00" : null,
        endAt: form.endAt ? form.endAt.replace("T", " ") + ":00" : null,
        isActive: form.isActive,
      });
      toast.success("Đã lưu chiến dịch.");
      setIsModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Không lưu được chiến dịch.");
    }
  };

  const runPreview = async () => {
    const res = await previewLoyaltyPoints(preview);
    setPreviewResult(res.data);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-[#DCEBFF] bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[16px] font-black text-[#0B1F3A]">Chiến dịch bonus</h2>
            <p className="mt-1 text-[13px] font-semibold text-[#64748B]">Cấu hình các đợt nhân điểm như sinh nhật, Black Friday hoặc khuyến mãi theo mùa.</p>
          </div>
          <button onClick={() => openModal()} className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#0057E7] px-4 text-[13px] font-bold text-white"><Plus className="h-4 w-4" />Thêm chiến dịch</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[#DCEBFF] bg-white">
        {isLoading ? (
          <div className="p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-[#0057E7]" /></div>
        ) : campaigns.length === 0 ? (
          <EmptyState onAction={() => openModal()} />
        ) : (
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-[#F8FBFF] text-[11px] uppercase text-[#64748B]">
              <tr><th className="px-5 py-3">Tên</th><th className="px-4 py-3">Hệ số nhân</th><th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr>
            </thead>
            <tbody className="divide-y divide-[#EEF6FF]">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-5 py-3"><div className="font-black">{campaign.name}</div><div className="text-[12px] text-[#64748B]">{campaign.description || "-"}</div></td>
                  <td className="px-4 py-3 font-black text-[#0057E7]">x{Number(campaign.multiplier).toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#64748B]">{campaign.start_at || "Không giới hạn"}<br />{campaign.end_at || ""}</td>
                  <td className="px-4 py-3">{campaign.is_active ? "Đang bật" : "Đã tắt"}</td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button onClick={() => openModal(campaign)} className="font-bold text-[#0057E7]">Sửa</button>
                    <button onClick={async () => { await setLoyaltyCampaignActive(campaign.id, campaign.is_active ? 0 : 1); load(); }} className="font-bold text-slate-500">{campaign.is_active ? "Tắt" : "Bật"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-[20px] border border-[#DCEBFF] bg-white p-4">
        <h3 className="font-black text-[#0B1F3A]">Tính thử điểm sau bonus</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-[180px_220px_auto]">
          <input type="number" value={preview.amount || ""} onChange={(e) => setPreview({ ...preview, amount: Number(e.target.value) })} placeholder="Giá trị đơn" className="rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold" />
          <input value={preview.customerId} onChange={(e) => setPreview({ ...preview, customerId: e.target.value })} placeholder="SĐT khách" className="rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold" />
          <button onClick={runPreview} className="rounded-2xl bg-[#0057E7] px-4 py-2.5 text-[13px] font-bold text-white">Tính điểm</button>
        </div>
        {previewResult && <div className="mt-3 text-[13px] font-bold text-[#0B1F3A]">Điểm gốc {previewResult.basePoints} → Điểm cuối {previewResult.finalPoints} điểm</div>}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-[0_16px_48px_rgba(6,43,95,0.18)]">
            <h3 className="text-[18px] font-black text-[#0B1F3A]">{editing ? "Sửa chiến dịch" : "Thêm chiến dịch"}</h3>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên chiến dịch" className="w-full rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả" rows={3} className="w-full rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold" />
              <input type="number" step="0.1" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: Number(e.target.value) })} placeholder="Hệ số nhân" className="w-full rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold" />
              <input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className="w-full rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold" />
              <input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className="w-full rounded-2xl border border-[#DCEBFF] px-4 py-2.5 text-[13px] font-bold" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="h-10 rounded-2xl border border-[#DCEBFF] px-4 text-[13px] font-bold text-[#64748B]">Hủy</button>
              <button onClick={save} className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#0057E7] px-4 text-[13px] font-bold text-white"><Save className="h-4 w-4" />Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#0057E7]"><CalendarClock className="h-6 w-6" /></div>
      <h3 className="mt-4 text-[18px] font-black text-[#0B1F3A]">Chưa có chiến dịch bonus</h3>
      <p className="mx-auto mt-2 max-w-xl text-[14px] font-semibold text-[#64748B]">Tạo các chiến dịch như sinh nhật, Black Friday để nhân điểm trong thời gian khuyến mãi.</p>
      <button onClick={onAction} className="mt-5 rounded-2xl bg-[#0057E7] px-5 py-2.5 text-[13px] font-bold text-white">Tạo chiến dịch đầu tiên</button>
    </div>
  );
}
