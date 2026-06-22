import { useEffect, useMemo, useState } from "react";
import { Calendar, Loader2, Plus, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { deletePetApi, listPetsApi, type PetData } from "@/src/api/customerPetsApi";
import { PetAdviceModal } from "@/src/components/Account/PetAdviceModal";

const speciesLabels: Record<PetData["species"], string> = {
  dog: "Chó",
  cat: "Mèo",
  other: "Khác",
};

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  return new Date(value).toLocaleDateString("vi-VN");
}

export function PetsPage() {
  const [pets, setPets] = useState<PetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvicePet, setSelectedAdvicePet] = useState<PetData | null>(null);

  const sortedPets = useMemo(() => [...pets].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)), [pets]);

  const handleTriggerQuiz = () => {
    window.dispatchEvent(new CustomEvent("open-pet-advisor"));
  };

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await listPetsApi();
      if (res.success) {
        setPets(res.data ?? []);
      } else {
        toast.error(res.message || "Không thể tải lịch sử tư vấn.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải lịch sử tư vấn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
    const handleRefresh = () => fetchPets();
    window.addEventListener("refresh-pets", handleRefresh);
    return () => window.removeEventListener("refresh-pets", handleRefresh);
  }, []);

  const handleDelete = async (pet: PetData) => {
    if (!pet.id) return;
    if (!confirm(`Bạn chắc chắn muốn xóa lịch sử tư vấn cho bé ${pet.name}?`)) return;
    try {
      const res = await deletePetApi(pet.id);
      if (res.success) {
        toast.success("Đã xóa lịch sử tư vấn.");
        fetchPets();
      } else {
        toast.error(res.message || "Không thể xóa lịch sử tư vấn.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể xóa lịch sử tư vấn.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0057E7]">Tư vấn AI</p>
          <h2 className="mt-1 text-2xl font-black text-[#0B1F3A]">Lịch sử tư vấn dinh dưỡng</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Xem lại các kết quả tư vấn dinh dưỡng và chăm sóc từ AI Advisor của 3F Store.
          </p>
        </div>
        <button
          onClick={handleTriggerQuiz}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#102b50]"
        >
          <Plus className="h-4 w-4" />
          Tư vấn AI mới
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
        </div>
      ) : sortedPets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF] px-6 py-14 text-center">
          <Sparkles className="mx-auto h-14 w-14 text-[#9AB7DC] animate-pulse" />
          <h3 className="mt-4 text-lg font-black text-[#0B1F3A]">Chưa có lịch sử tư vấn AI</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">Hãy nhận tư vấn từ chuyên gia AI để thiết kế thực đơn phù hợp nhất cho bé.</p>
          <button
            onClick={handleTriggerQuiz}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#0B1F3A] ring-1 ring-[#DCEBFF] transition hover:bg-[#EEF6FF]"
          >
            <Plus className="h-4 w-4" />
            Nhận tư vấn AI ngay
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedPets.map((pet) => (
            <article key={pet.id} className="rounded-2xl border border-[#DCEBFF] bg-white p-5 shadow-sm flex flex-col justify-between hover:border-blue-200 transition">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0057E7]">
                      <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#0B1F3A]">
                        Tư vấn cho bé {pet.name || "thú cưng"}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 font-bold">
                        <span className="capitalize">{speciesLabels[pet.species] || pet.species}</span>
                        {pet.breed && (
                          <>
                            <span>•</span>
                            <span>{pet.breed}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(pet.createdAt || pet.birthday)}
                  </span>
                </div>

                {(() => {
                  let parsedAdvice = null;
                  if (pet.aiResult) {
                    try {
                      parsedAdvice = JSON.parse(pet.aiResult);
                    } catch (e) {}
                  }
                  if (!parsedAdvice) return null;
                  return (
                    <div className="mt-4 p-4 bg-[#F6FAFF] border border-[#EEF6FF] rounded-xl text-sm font-semibold text-slate-700">
                      <p className="font-extrabold text-blue-900 leading-normal mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-[#0057E7] shrink-0" />
                        Kết luận của AI
                      </p>
                      <p className="line-clamp-3 text-slate-600 leading-relaxed font-medium mt-1">
                        {parsedAdvice.summary}
                      </p>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-55 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedAdvicePet(pet)}
                  className="text-xs font-black text-[#0057E7] hover:underline"
                >
                  Xem chi tiết tư vấn & Đề xuất →
                </button>
                <button
                  onClick={() => handleDelete(pet)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50/50 hover:bg-red-50 px-2.5 py-1.5 text-xs font-black text-red-600 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa lịch sử
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <PetAdviceModal pet={selectedAdvicePet} onClose={() => setSelectedAdvicePet(null)} />
    </div>
  );
}
