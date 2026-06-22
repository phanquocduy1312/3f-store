import { Sparkles, X } from "lucide-react";
import { type PetData } from "@/src/api/customerPetsApi";

interface PetAdviceModalProps {
  pet: PetData | null;
  onClose: () => void;
}

export function PetAdviceModal({ pet, onClose }: PetAdviceModalProps) {
  if (!pet) return null;

  let parsed: any = null;
  try {
    parsed = JSON.parse(pet.aiResult || "");
  } catch (e) {}
  if (!parsed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F3A]/45 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0B1F3A]">Tư vấn AI cho bé {pet.name}</h3>
            <p className="text-xs font-semibold text-slate-500">Được đề xuất bởi 3F AI Pet Advisor</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <h4 className="text-xs font-black text-[#0B1F3A] uppercase tracking-wider mb-2.5">
            Thông tin đầu vào của bé
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs font-semibold text-slate-600">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Loài</span>
              <span className="text-slate-800 capitalize">{pet.species === "cat" ? "Mèo" : pet.species === "dog" ? "Chó" : "Khác"}</span>
            </div>
            {pet.breed && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Giống</span>
                <span className="text-slate-800">{pet.breed}</span>
              </div>
            )}
            {pet.weightKg && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Cân nặng</span>
                <span className="text-slate-800">{pet.weightKg} kg</span>
              </div>
            )}
            {pet.favoriteFood && (
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Thức ăn hiện tại</span>
                <span className="text-slate-800">{pet.favoriteFood}</span>
              </div>
            )}
            {pet.healthNotes && (
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Tình trạng / Vấn đề</span>
                <span className="text-slate-800">{pet.healthNotes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <h4 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider">Lời khuyên dinh dưỡng</h4>
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/30 text-sm font-semibold text-slate-700 leading-relaxed">
              <p className="font-extrabold text-blue-900 mb-1">{parsed.summary}</p>
              <p className="font-medium">{parsed.advice}</p>
              {parsed.detected_needs && parsed.detected_needs.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {parsed.detected_needs.map((need: string, i: number) => (
                    <span key={i} className="text-[10px] font-black uppercase bg-blue-100/50 text-blue-800 px-2 py-0.5 rounded-full">
                      #{need}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {parsed.warning && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-semibold text-red-800">
              <h5 className="font-black text-red-900 mb-1 flex items-center gap-1.5">⚠️ Cảnh báo sức khỏe</h5>
              <p className="font-medium leading-relaxed">{parsed.warning}</p>
            </div>
          )}

          {parsed.budget_analysis && (
            <div className="space-y-2">
              <h4 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider">Phân tích ngân sách</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400">Ngân sách tháng</span>
                  <p className="text-base font-black text-[#0B1F3A]">
                    {parsed.budget_analysis.monthly_budget ? `${parsed.budget_analysis.monthly_budget.toLocaleString("vi-VN")}đ` : "Chưa cập nhật"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400">Phân khúc</span>
                  <p className="text-base font-black text-[#0B1F3A]">
                    {parsed.budget_analysis.budget_segment || "Chưa rõ"}
                  </p>
                </div>
              </div>
              {parsed.budget_analysis.explanation && (
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  {parsed.budget_analysis.explanation}
                </p>
              )}
            </div>
          )}

          {parsed.recommended_products && parsed.recommended_products.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider">Sản phẩm đề xuất</h4>
              <div className="grid gap-3">
                {parsed.recommended_products.map((item: any, i: number) => {
                  let groupLabel = "Đề xuất";
                  let groupColor = "bg-blue-50 text-blue-700 border-blue-100";
                  if (item.group === "saving") {
                    groupLabel = "Gói tiết kiệm";
                    groupColor = "bg-green-50 text-green-700 border-green-100";
                  } else if (item.group === "premium") {
                    groupLabel = "Gói cao cấp";
                    groupColor = "bg-amber-50 text-amber-700 border-amber-100";
                  }
                  return (
                    <div key={i} className="p-4 border border-slate-100 rounded-2xl flex flex-col gap-2 bg-white hover:border-blue-200 transition">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase border px-2 py-0.5 rounded-full ${groupColor}`}>
                          {groupLabel}
                        </span>
                        {item.budget_fit && (
                          <span className="text-[10px] font-bold text-slate-500">
                            {item.budget_fit}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-slate-800 leading-normal">
                        {item.name || `Sản phẩm đề xuất #${item.id}`}
                      </p>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {parsed.care_tips && parsed.care_tips.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider">Mẹo chăm sóc bé</h4>
              <ul className="list-disc pl-5 text-xs font-semibold text-slate-600 space-y-1.5 leading-relaxed">
                {parsed.care_tips.map((tip: string, i: number) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl bg-slate-50 px-5 text-sm font-black text-slate-600 transition hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
