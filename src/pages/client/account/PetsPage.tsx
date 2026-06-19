import { FormEvent, useEffect, useMemo, useState } from "react";
import { Calendar, Cat, Dog, Edit2, Heart, Loader2, Plus, Scale, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  createPetApi,
  deletePetApi,
  listPetsApi,
  updatePetApi,
  type PetData,
} from "@/src/api/customerPetsApi";

type PetForm = PetData;

const emptyPet: PetForm = {
  name: "",
  species: "dog",
  breed: "",
  gender: "unknown",
  birthday: "",
  weightKg: null,
  healthNotes: "",
  allergies: "",
  favoriteFood: "",
  avatarUrl: null,
};

const speciesLabels: Record<PetData["species"], string> = {
  dog: "Chó",
  cat: "Mèo",
  other: "Khác",
};

const genderLabels: Record<NonNullable<PetData["gender"]>, string> = {
  male: "Đực",
  female: "Cái",
  unknown: "Chưa rõ",
};

function PetAvatar({ pet }: { pet: PetData }) {
  if (pet.avatarUrl) {
    return <img src={pet.avatarUrl} alt={pet.name} className="h-14 w-14 rounded-2xl object-cover" />;
  }

  const Icon = pet.species === "cat" ? Cat : pet.species === "dog" ? Dog : Heart;
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#0057E7]">
      <Icon className="h-7 w-7" />
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  return new Date(value).toLocaleDateString("vi-VN");
}

function validatePet(form: PetForm) {
  if (!form.name.trim()) return "Vui lòng nhập tên thú cưng.";
  if (!form.species) return "Vui lòng chọn loài thú cưng.";
  if (form.birthday && new Date(form.birthday) > new Date()) return "Ngày sinh không được lớn hơn hôm nay.";
  if (form.weightKg != null && Number(form.weightKg) <= 0) return "Cân nặng phải lớn hơn 0.";
  return "";
}

function buildPayload(form: PetForm): PetData {
  return {
    ...form,
    name: form.name.trim(),
    breed: form.breed?.trim() || "",
    birthday: form.birthday || null,
    weightKg: form.weightKg === null || form.weightKg === undefined ? null : Number(form.weightKg),
    healthNotes: form.healthNotes?.trim() || "",
    allergies: form.allergies?.trim() || "",
    favoriteFood: form.favoriteFood?.trim() || "",
  };
}

export function PetsPage() {
  const [pets, setPets] = useState<PetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetData | null>(null);
  const [form, setForm] = useState<PetForm>(emptyPet);

  const sortedPets = useMemo(() => [...pets].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)), [pets]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await listPetsApi();
      if (res.success) {
        setPets(res.data ?? []);
      } else {
        toast.error(res.message || "Không thể tải hồ sơ thú cưng.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải hồ sơ thú cưng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const openCreateModal = () => {
    setEditingPet(null);
    setForm(emptyPet);
    setModalOpen(true);
  };

  const openEditModal = (pet: PetData) => {
    setEditingPet(pet);
    setForm({ ...emptyPet, ...pet, birthday: pet.birthday || "" });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingPet(null);
    setForm(emptyPet);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validatePet(form);
    if (validation) {
      toast.error(validation);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(form);
      const res =
        editingPet?.id != null ? await updatePetApi(editingPet.id, payload) : await createPetApi(payload);

      if (res.success) {
        toast.success(editingPet ? "Đã cập nhật hồ sơ thú cưng." : "Đã thêm hồ sơ thú cưng.");
        closeModal();
        fetchPets();
      } else {
        toast.error(res.message || "Không thể lưu hồ sơ thú cưng.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể lưu hồ sơ thú cưng.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pet: PetData) => {
    if (!pet.id) return;
    if (!confirm(`Bạn chắc chắn muốn xóa hồ sơ của ${pet.name}?`)) return;

    try {
      const res = await deletePetApi(pet.id);
      if (res.success) {
        toast.success("Đã xóa hồ sơ thú cưng.");
        fetchPets();
      } else {
        toast.error(res.message || "Không thể xóa hồ sơ thú cưng.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể xóa hồ sơ thú cưng.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0057E7]">Hồ sơ thú cưng</p>
          <h2 className="mt-1 text-2xl font-black text-[#0B1F3A]">Bạn đồng hành của tôi</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Lưu thông tin để 3F gợi ý thức ăn, phụ kiện và chăm sóc phù hợp hơn.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#102b50]"
        >
          <Plus className="h-4 w-4" />
          Thêm thú cưng
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
        </div>
      ) : sortedPets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF] px-6 py-14 text-center">
          <Heart className="mx-auto h-14 w-14 text-[#9AB7DC]" />
          <h3 className="mt-4 text-lg font-black text-[#0B1F3A]">Chưa có hồ sơ thú cưng</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">Thêm hồ sơ để cá nhân hóa trải nghiệm mua sắm.</p>
          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#0B1F3A] ring-1 ring-[#DCEBFF] transition hover:bg-[#EEF6FF]"
          >
            <Plus className="h-4 w-4" />
            Thêm hồ sơ
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedPets.map((pet) => (
            <article key={pet.id} className="rounded-2xl border border-[#DCEBFF] bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <PetAvatar pet={pet} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-[#0B1F3A]">{pet.name}</h3>
                    <span className="rounded-full bg-[#EEF6FF] px-2.5 py-1 text-[11px] font-black text-[#0057E7]">
                      {speciesLabels[pet.species]}
                    </span>
                    <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-600">
                      {genderLabels[pet.gender || "unknown"]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{pet.breed || "Chưa cập nhật giống"}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#F6FAFF] p-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                    <Calendar className="h-4 w-4" />
                    Ngày sinh
                  </div>
                  <p className="mt-1 text-sm font-black text-[#0B1F3A]">{formatDate(pet.birthday)}</p>
                </div>
                <div className="rounded-xl bg-[#F6FAFF] p-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                    <Scale className="h-4 w-4" />
                    Cân nặng
                  </div>
                  <p className="mt-1 text-sm font-black text-[#0B1F3A]">
                    {pet.weightKg ? `${pet.weightKg} kg` : "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              {(pet.allergies || pet.favoriteFood || pet.healthNotes) && (
                <div className="mt-4 space-y-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                  {pet.favoriteFood && <p>Món thích: {pet.favoriteFood}</p>}
                  {pet.allergies && <p>Dị ứng: {pet.allergies}</p>}
                  {pet.healthNotes && <p>Sức khỏe: {pet.healthNotes}</p>}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => openEditModal(pet)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-100"
                >
                  <Edit2 className="h-4 w-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(pet)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F3A]/45 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl md:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-[#0B1F3A]">
                  {editingPet ? "Cập nhật thú cưng" : "Thêm thú cưng"}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">Thông tin càng rõ, gợi ý sản phẩm càng sát.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Tên thú cưng</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="Miu, Lucky..."
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Loài</span>
                <select
                  value={form.species}
                  onChange={(event) => setForm((prev) => ({ ...prev, species: event.target.value as PetData["species"] }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                >
                  <option value="dog">Chó</option>
                  <option value="cat">Mèo</option>
                  <option value="other">Khác</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Giống</span>
                <input
                  value={form.breed || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, breed: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="Poodle, mèo Anh lông ngắn..."
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Giới tính</span>
                <select
                  value={form.gender || "unknown"}
                  onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value as PetData["gender"] }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                >
                  <option value="unknown">Chưa rõ</option>
                  <option value="male">Đực</option>
                  <option value="female">Cái</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Ngày sinh</span>
                <input
                  type="date"
                  value={form.birthday || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, birthday: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Cân nặng (kg)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weightKg ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      weightKg: event.target.value === "" ? null : Number(event.target.value),
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="4.5"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Món yêu thích</span>
                <input
                  value={form.favoriteFood || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, favoriteFood: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="Pate, hạt, snack..."
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Dị ứng</span>
                <input
                  value={form.allergies || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, allergies: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="Không có hoặc ghi rõ"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-black text-[#0B1F3A]">Ghi chú sức khỏe</span>
                <textarea
                  value={form.healthNotes || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, healthNotes: event.target.value }))}
                  className="min-h-28 w-full rounded-xl border border-[#DCEBFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  placeholder="Ví dụ: đang ăn kiêng, bệnh nền, lịch tiêm..."
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="min-h-11 rounded-xl bg-slate-50 px-5 text-sm font-black text-slate-600 transition hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0057E7] px-5 text-sm font-black text-white transition hover:bg-[#0046BA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingPet ? "Lưu thay đổi" : "Thêm hồ sơ"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
