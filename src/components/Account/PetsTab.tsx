import { useEffect, useState } from "react";
import { type PetData, listPetsApi, deletePetApi } from "@/src/api/customerPetsApi";
import { PetFormModal } from "./PetFormModal";
import { Dog, Cat, Heart, PlusCircle, Trash2, Edit2, Calendar, Scale, Activity, Brain } from "lucide-react";
import { toast } from "sonner";

export function PetsTab() {
  const [pets, setPets] = useState<PetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<PetData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPets = async () => {
    setIsLoading(true);
    try {
      const res = await listPetsApi();
      if (res.success && res.data) {
        setPets(res.data);
      }
    } catch {
      toast.error("Không thể tải danh sách thú cưng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa hồ sơ thú cưng này?")) return;
    try {
      const res = await deletePetApi(id);
      if (res.success) {
        toast.success(res.message || "Xóa hồ sơ thú cưng thành công!");
        setPets(pets.filter(p => p.id !== id));
      } else {
        toast.error(res.message || "Lỗi xóa hồ sơ.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    }
  };

  if (isLoading) {
    return <div className="h-64 rounded-3xl bg-white border border-[#E0EBF7] animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Title & Add Button */}
      <div className="rounded-3xl border border-[#E0EBF7] bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-ink">Hồ sơ thú cưng</h3>
          <p className="text-xs text-gray-400 font-semibold">Quản lý thông tin thú cưng của bạn để nhận tư vấn dinh dưỡng và gợi ý sản phẩm phù hợp.</p>
        </div>
        <button
          onClick={() => {
            setSelectedPet(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle size={14} /> Thêm thú cưng
        </button>
      </div>

      {/* AI Pet Advisor Warning Box */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 flex items-start gap-3">
        <Brain className="text-blue-500 shrink-0 mt-0.5" size={16} />
        <div>
          <h4 className="text-xs font-black text-blue-800">Cá nhân hóa cùng AI Pet Advisor</h4>
          <p className="text-[10px] font-semibold text-blue-600 mt-0.5">
            Thông tin về cân nặng, độ tuổi, giống loài và dị ứng của thú cưng sẽ được AI Pet Advisor đọc trực tiếp để đề xuất khẩu phần ăn & sản phẩm phù hợp nhất.
          </p>
        </div>
      </div>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <div className="rounded-3xl border border-[#E0EBF7] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/5 text-forest">
            <Heart size={20} />
          </div>
          <h4 className="text-xs font-black text-ink">Chưa có hồ sơ thú cưng</h4>
          <p className="mx-auto mt-1 max-w-xs text-[10px] font-semibold text-gray-400">
            Thêm hồ sơ thú cưng ngay để bắt đầu cá nhân hóa trải nghiệm mua sắm của bạn.
          </p>
          <button
            onClick={() => {
              setSelectedPet(null);
              setShowModal(true);
            }}
            className="mt-4 rounded-full border border-forest px-5 py-2 text-xs font-bold text-forest hover:bg-forest/5"
          >
            Tạo hồ sơ đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pets.map((pet) => (
            <div key={pet.id} className="rounded-3xl border border-[#E0EBF7] bg-white p-5 shadow-sm space-y-4 hover:border-forest/35 transition-all">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-forest">
                    {pet.species === "cat" ? <Cat size={18} /> : <Dog size={18} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-ink flex items-center gap-1.5">
                      {pet.name}
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        pet.gender === "male" ? "bg-blue-50 text-blue-700" :
                        pet.gender === "female" ? "bg-pink-50 text-pink-700" : "bg-gray-50 text-gray-600"
                      }`}>
                        {pet.gender === "male" ? "Đực" : pet.gender === "female" ? "Cái" : "Khác"}
                      </span>
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                      {pet.breed || (pet.species === "cat" ? "Giống mèo" : pet.species === "dog" ? "Giống chó" : "Chưa xác định giống")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedPet(pet);
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg border border-gray-100 text-gray-400 hover:text-forest hover:bg-forest/5"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="p-1.5 rounded-lg border border-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-gray-400 shrink-0" />
                  <span>
                    Ngày sinh: {pet.birthday ? new Date(pet.birthday).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scale size={12} className="text-gray-400 shrink-0" />
                  <span>Cân nặng: {pet.weightKg ? `${pet.weightKg} kg` : "Chưa cập nhật"}</span>
                </div>
              </div>

              {(pet.healthNotes || pet.allergies || pet.favoriteFood) && (
                <div className="rounded-2xl bg-gray-50/70 p-3 text-[10px] font-bold text-gray-600 space-y-1">
                  {pet.allergies && <p><span className="text-red-500">Dị ứng:</span> {pet.allergies}</p>}
                  {pet.favoriteFood && <p><span className="text-forest">Yêu thích:</span> {pet.favoriteFood}</p>}
                  {pet.healthNotes && <p className="text-gray-400 line-clamp-1"><span className="text-gray-500">Sức khỏe:</span> {pet.healthNotes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PetFormModal
          pet={selectedPet}
          onClose={() => {
            setShowModal(false);
            setSelectedPet(null);
          }}
          onSuccess={fetchPets}
        />
      )}

    </div>
  );
}
export default PetsTab;
