import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BadgeDollarSign,
  ChevronLeft,
  ClipboardList,
  HeartPulse,
  Loader2,
  Mail,
  PawPrint,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminPetAdvisorConsultationDetail } from "@/src/api/adminPetAdvisorApi";
import { ConsultationRecord, AdvisorAnswer, getMeta, formatDate, formatMoney, listText } from "@/src/utils/pet-advisor-helpers";
import { SummaryCard, DetailPanel, InfoRow } from "@/src/components/admin/pet-advisor-cards";

export default function AdminPetAdvisorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<ConsultationRecord | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getAdminPetAdvisorConsultationDetail(Number(id));
        setRecord(data);
      } catch (e: any) {
        toast.error(e.message || "Lỗi khi tải chi tiết tư vấn AI");
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const meta = record ? getMeta(record) : null;

  return (
    <div className="relative min-h-screen bg-[#F6FAFF] font-sans">
      <AdminSidebar activeMenu="AI Pet Advisor" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />
      {!sidebarCollapsed && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      <div className={`flex min-h-screen min-w-0 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} showDateFilter={false} />

        <main className="flex-1 space-y-5 p-4 sm:p-6">
          {/* Back Action Bar */}
          <div className="flex items-center justify-between rounded-3xl border border-[#DCEBFF] bg-white p-5 shadow-sm">
            <button
              onClick={() => navigate("/admin/pet-advisor")}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCEBFF] bg-white px-4 text-sm font-black text-[#0B1F3A] hover:bg-[#F6FAFF] transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại danh sách
            </button>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-xs font-black text-[#0057E7]">
                ID Lượt tư vấn: #{id}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-[#DCEBFF] bg-white p-8 text-slate-500">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#0057E7]" />
              Đang tải thông tin tư vấn...
            </div>
          ) : !record || !meta ? (
            <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/50 p-12 text-center text-sm font-semibold text-red-600">
              Không tìm thấy thông tin tư vấn hoặc không tồn tại.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Consultation Summary */}
              <section className="rounded-3xl border border-[#DCEBFF] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-black text-[#0B1F3A]">Tư vấn cho bé {meta.petName}</h1>
                      {record.deleted_at && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-black uppercase text-red-600 border border-red-100">
                          Khách đã xoá khỏi tài khoản
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-slate-500">
                      Khách hàng: {meta.customerName} · {meta.customerPhone} · Ngày tư vấn: {formatDate(record.created_at)}
                    </p>
                  </div>
                  {record.customer_id && (
                    <button
                      onClick={() => navigate(`/admin/customers/${record.customer_id}`)}
                      className="h-11 shrink-0 rounded-xl bg-[#0057E7] px-6 text-sm font-black text-white transition hover:bg-[#0048C4] shadow-sm shadow-blue-100"
                    >
                      Xem khách hàng
                    </button>
                  )}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <SummaryCard icon={<PawPrint className="h-4 w-4 text-[#0057E7]" />} label="Thú cưng" value={`${meta.petType} · ${meta.breed}`} />
                  <SummaryCard icon={<HeartPulse className="h-4 w-4 text-red-500" />} label="Vấn đề chính" value={meta.problem} />
                  <SummaryCard icon={<BadgeDollarSign className="h-4 w-4 text-green-600" />} label="Ngân sách hàng tháng" value={`${formatMoney(meta.monthlyBudget)} · ${meta.budgetSegment}`} />
                </div>
              </section>

              {/* Grid 2 Columns */}
              <div className="grid gap-5 xl:grid-cols-2">
                {/* Column Left */}
                <div className="space-y-5">
                  <DetailPanel title="Nhu cầu & ngân sách khách nhập" icon={<ClipboardList className="h-4 w-4 text-[#0057E7]" />}>
                    <InfoRow label="Vấn đề khách mô tả" value={meta.problem} multiline />
                    <InfoRow label="Nhu cầu khách chọn" value={listText(meta.selectedNeeds)} />
                    <InfoRow label="Nhu cầu AI nhận diện" value={listText(meta.detectedNeeds)} />
                    <InfoRow label="Thức ăn hiện tại" value={meta.currentFood} />
                    <InfoRow label="Mỗi lần mua" value={meta.purchaseAmount} />
                    <InfoRow label="Dùng trong bao lâu" value={meta.usageDuration} />
                    <InfoRow label="Ngân sách tháng ước tính" value={formatMoney(meta.monthlyBudget)} />
                    <InfoRow label="Phân khúc ngân sách" value={meta.budgetSegment} />
                  </DetailPanel>

                  <DetailPanel title="Hồ sơ thú cưng khách nhập" icon={<PawPrint className="h-4 w-4 text-[#0057E7]" />}>
                    <InfoRow label="Tên bé" value={meta.petName} />
                    <InfoRow label="Loài" value={meta.petType} />
                    <InfoRow label="Giống" value={meta.breed} />
                    <InfoRow label="Tuổi" value={meta.age} />
                    <InfoRow label="Cân nặng" value={meta.weight} />
                    <InfoRow label="Loại lông" value={meta.coatType} />
                    <InfoRow label="Số lượng thú cưng nuôi" value={meta.petCount} />
                    <InfoRow label="Tình trạng triệt sản" value={meta.neutered} />
                    <InfoRow label="Dị ứng / Lưu ý đặc biệt" value={meta.allergies} multiline />
                  </DetailPanel>
                </div>

                {/* Column Right */}
                <div className="space-y-5">
                  <DetailPanel title="Thông tin khách hàng" icon={<UserRound className="h-4 w-4 text-[#0057E7]" />}>
                    <InfoRow label="Họ tên khách hàng" value={meta.customerName} />
                    <InfoRow label="Số điện thoại" value={meta.customerPhone} icon={<Phone className="h-3.5 w-3.5" />} />
                    <InfoRow label="Địa chỉ Email" value={meta.customerEmail} icon={<Mail className="h-3.5 w-3.5" />} multiline />
                    <InfoRow label="Trạng thái tài khoản" value={record.customer_status || "Chưa rõ"} />
                  </DetailPanel>

                  <DetailPanel title="Kết luận AI cho sale" icon={<Sparkles className="h-4 w-4 text-[#0057E7]" />}>
                    <InfoRow label="Tóm tắt tình trạng (AI Summary)" value={meta.summary} multiline />
                    <InfoRow label="Lời khuyên dinh dưỡng (AI Advice)" value={meta.advice} multiline />
                    {meta.warning && (
                      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700 sm:col-span-2">
                        <div className="mb-1 flex items-center gap-2 font-black text-red-800">
                          <AlertTriangle className="h-4 w-4" />
                          Cảnh báo sức khỏe khẩn cấp
                        </div>
                        {meta.warning}
                      </div>
                    )}
                  </DetailPanel>
                </div>
              </div>

              {/* Quiz answers full log */}
              {meta.answers.length > 0 && (
                <DetailPanel title="Tất cả câu trả lời trong quiz tư vấn" icon={<ClipboardList className="h-4 w-4 text-[#0057E7]" />}>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {meta.answers.map((answer, index) => (
                      <InfoRow
                        key={`${answer.id || index}`}
                        label={answer.question || answer.id || "Câu hỏi"}
                        value={answer.label || answer.value || "Chưa cập nhật"}
                      />
                    ))}
                  </div>
                </DetailPanel>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
