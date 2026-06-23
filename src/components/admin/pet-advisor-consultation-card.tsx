import { useNavigate } from "react-router-dom";
import { Sparkles, Calendar, Eye } from "lucide-react";
import {
  ConsultationRecord,
  speciesLabel,
  parseAdvice,
  formatDate,
} from "@/src/utils/pet-advisor-helpers";

type Props = {
  record: ConsultationRecord;
};

export function PetAdvisorConsultationCard({ record }: Props) {
  const navigate = useNavigate();
  const parsed = parseAdvice(record.ai_result);
  const inputs = parsed?.advisor_inputs || {};
  const answers = Array.isArray(inputs.answers) ? inputs.answers : [];
  const problem =
    inputs.problem_text ||
    record.health_notes ||
    answers.find((item: any) => item.id === "problem_text")?.label ||
    "Chưa cập nhật";
  const petName =
    record.name ||
    inputs.customer?.petName ||
    inputs.customer?.pet_name ||
    inputs.pet_name ||
    "Thú cưng";
  const customerName =
    record.customer_full_name ||
    record.customer_name ||
    inputs.customer?.name ||
    "Chưa rõ tên";
  const petType =
    speciesLabel[record.species || inputs.active_flow] ||
    record.species ||
    inputs.active_flow ||
    "Chưa rõ";
  const breed =
    record.breed ||
    answers.find((item: any) => item.id === "breed")?.label ||
    "Chưa rõ";

  return (
    <div className="group rounded-2xl border border-[#DCEBFF] bg-white p-5 hover:border-[#9CC8FF] hover:shadow-md transition duration-200 flex flex-col justify-between">
      <div>
        {/* Title & Icons */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF6FF] text-[#0057E7] shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-base font-black text-[#0B1F3A]">Bé {petName}</h4>
            <p className="mt-0.5 truncate text-xs font-bold text-slate-400">
              Loài: {petType} · Giống: {breed}
            </p>
          </div>
          {parsed?.warning && (
            <span className="h-2 w-2 rounded-full bg-[#EF3340] shrink-0 mt-2" title="Có cảnh báo sức khỏe" />
          )}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-[#F1F5F9]" />

        {/* Customer & Issue Info */}
        <div className="space-y-2 text-xs text-slate-500 font-semibold">
          <p className="truncate">
            <strong className="text-[#0B1F3A]">Khách hàng:</strong> {customerName}
          </p>
          <p className="truncate">
            <strong className="text-[#0B1F3A]">SĐT:</strong> {record.customer_phone || inputs.customer?.phone || "Chưa rõ"}
          </p>
          <p className="line-clamp-2 min-h-[32px]">
            <strong className="text-[#0B1F3A]">Vấn đề chính:</strong> {problem}
          </p>
        </div>
      </div>

      {/* Card Footer actions */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(record.created_at)}
        </span>

        <button
          type="button"
          onClick={() => navigate(`/admin/pet-advisor/consultation/${record.id}`)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0057E7] px-3.5 text-xs font-black text-white hover:bg-[#0048C4] transition shadow-sm shadow-blue-50"
        >
          <Eye className="h-3.5 w-3.5" />
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
