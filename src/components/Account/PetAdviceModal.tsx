import { PawPrint, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AiResult } from "@/components/pet-advisor/AiResult";
import { Mascot } from "@/components/pet-advisor/Mascot";
import { type AiResultData } from "@/components/pet-advisor/mockAiResult";
import { type PetData } from "@/src/api/customerPetsApi";

interface PetAdviceModalProps {
  pet: PetData | null;
  onClose: () => void;
}

const normalizeResult = (value: unknown): AiResultData => {
  const parsed = (value && typeof value === "object" ? value : {}) as Partial<AiResultData>;

  return {
    summary: parsed.summary || "3F đã ghi nhận hồ sơ của bé.",
    advice: parsed.advice || "Dựa trên thông tin của bé, 3F gợi ý chọn nhóm sản phẩm phù hợp với độ tuổi, nhu cầu và ngân sách.",
    detected_needs: Array.isArray(parsed.detected_needs) ? parsed.detected_needs : [],
    budget_analysis: parsed.budget_analysis,
    recommended_products: Array.isArray(parsed.recommended_products) ? parsed.recommended_products : [],
    care_tips: Array.isArray(parsed.care_tips) ? parsed.care_tips : [],
    warning: parsed.warning || "",
    voucher_code: parsed.voucher_code || "3F30K",
    error: parsed.error,
  };
};

export function PetAdviceModal({ pet, onClose }: PetAdviceModalProps) {
  const navigate = useNavigate();
  if (!pet) return null;

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(pet.aiResult || "");
  } catch {
    return null;
  }

  const result = normalizeResult(parsed);

  const handleExploreProducts = () => {
    onClose();
    navigate(`/products?petType=${pet.species === "dog" ? "dog" : "cat"}`);
  };

  const handleConsultAgent = () => {
    onClose();
    window.open("https://zalo.me/your_number", "_blank");
  };

  const handleShareZalo = () => {
    window.open(
      `https://zalo.me/your_number?text=${encodeURIComponent("Tôi vừa nhận được tư vấn cho thú cưng từ 3F: " + result.summary)}`,
      "_blank"
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
      <div
        className="relative z-10 mx-auto flex w-full overflow-hidden rounded-2xl bg-white shadow-2xl md:rounded-3xl"
        style={{
          width: "900px",
          maxWidth: "calc(100vw - 40px)",
          maxHeight: "706px",
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 text-gray-400 transition-colors hover:text-gray-800"
          aria-label="Đóng"
        >
          <X size={24} />
        </button>

        <div className="relative hidden w-[45%] select-none items-center justify-center overflow-hidden border-r border-gray-100 p-6 md:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-blue-50/50 to-blue-200/30" />
          <div className="absolute inset-0 pointer-events-none overflow-hidden text-blue-300/40">
            <PawPrint className="absolute left-8 top-8 rotate-[-25deg]" size={36} fill="currentColor" />
            <PawPrint className="absolute right-16 top-12 rotate-[20deg]" size={40} fill="currentColor" />
            <PawPrint className="absolute bottom-20 left-10 rotate-[35deg]" size={48} fill="currentColor" />
            <PawPrint className="absolute bottom-10 right-14 rotate-[-15deg]" size={32} fill="currentColor" />
          </div>
          <Mascot className="relative z-10 max-h-[280px] drop-shadow-2xl" />
        </div>

        <div className="flex min-h-[520px] w-full flex-col bg-white p-6 md:w-[55%] md:p-8">
          <AiResult
            result={result}
            onExploreProducts={handleExploreProducts}
            onConsultAgent={handleConsultAgent}
            onShareZalo={handleShareZalo}
            onClose={onClose}
            onCopyVoucher={() => undefined}
          />
        </div>
      </div>
    </div>
  );
}
