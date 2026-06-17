import { useState } from "react";
import { type PetData, createPetApi, updatePetApi } from "@/src/api/customerPetsApi";
import { X, Heart, Calendar, Scale, Activity, AlertCircle, Utensils } from "lucide-react";
import { toast } from "sonner";

interface PetFormModalProps {
  pet?: PetData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PetFormModal({ pet, onClose, onSuccess }: PetFormModalProps) {
  const [name, setName] = useState(pet?.name || "");
  const [species, setSpecies] = useState<"cat" | "dog" | "other">(pet?.species || "dog");
  const [breed, setBreed] = useState(pet?.breed || "");
  const [gender, setGender] = useState<"male" | "female" | "unknown">(pet?.gender || "unknown");
  const [birthday, setBirthday] = useState(pet?.birthday || "");
  const [weightKg, setWeightKg] = useState<string>(pet?.weightKg ? String(pet.weightKg) : "");
  const [healthNotes, setHealthNotes] = useState(pet?.healthNotes || "");
  const [allergies, setAllergies] = useState(pet?.allergies || "");
  const [favoriteFood, setFavoriteFood] = useState(pet?.favoriteFood || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tên thú cưng là bắt buộc.");
      return;
    }
    if (birthday && new Date(birthday) > new Date()) {
      toast.error("Ngày sinh không thể ở tương lai.");
      return;
    }
    const parsedWeight = weightKg ? parseFloat(weightKg) : null;
    if (parsedWeight !== null && (isNaN(parsedWeight) || parsedWeight <= 0)) {
      toast.error("Cân nặng phải lớn hơn 0.");
      return;
    }

    const payload: PetData = {
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
      gender,
      birthday: birthday || null,
      weightKg: parsedWeight,
      healthNotes: healthNotes.trim() || undefined,
      allergies: allergies.trim() || undefined,
      favoriteFood: favoriteFood.trim() || undefined
    };

    setIsSubmitting(true);
    try {
      const res = pet?.id 
        ? await updatePetApi(pet.id, payload)
        : await createPetApi(payload);

      if (res.success) {
        toast.success(res.message || "Lưu hồ sơ thú cưng thành công!");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Lỗi lưu hồ sơ.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-sm font-black text-ink flex items-center gap-1.5">
            <Heart className="text-forest fill-forest/10" size={16} />
            {pet ? "Sửa hồ sơ thú cưng" : "Thêm hồ sơ thú cưng mới"}
          </h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-50 hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 no-scrollbar">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Tên thú cưng *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest" required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Loài *</label>
              <select value={species} onChange={(e) => setSpecies(e.target.value as any)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs bg-white outline-none focus:border-forest" required>
                <option value="dog">Chó</option>
                <option value="cat">Mèo</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Giống loài</label>
              <input type="text" value={breed} placeholder="Ví dụ: Poodle, Golden..." onChange={(e) => setBreed(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Giới tính</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs bg-white outline-none focus:border-forest">
                <option value="male">Đực</option>
                <option value="female">Cái</option>
                <option value="unknown">Không rõ / Triệt sản</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Calendar size={10} /> Ngày sinh</label>
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Scale size={10} /> Cân nặng (kg)</label>
              <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Activity size={10} /> Tình trạng sức khỏe</label>
            <textarea value={healthNotes} placeholder="Thông tin tiêm ngừa, bệnh lý..." onChange={(e) => setHealthNotes(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest min-h-[50px] resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><AlertCircle size={10} /> Dị ứng</label>
              <input type="text" value={allergies} placeholder="Ví dụ: Thịt gà, phấn hoa..." onChange={(e) => setAllergies(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Utensils size={10} /> Thức ăn yêu thích</label>
              <input type="text" value={favoriteFood} placeholder="Ví dụ: Hạt cá hồi, Pate..." onChange={(e) => setFavoriteFood(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="rounded-full border border-gray-200 px-5 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="rounded-full bg-forest px-6 py-2 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 disabled:opacity-50">
              {isSubmitting ? "Đang lưu..." : "Lưu hồ sơ"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
