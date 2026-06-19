import { useState, useEffect } from "react";
import { adminCustomersApi } from "@/src/api/adminCustomersApi";

export function CustomerPetsTab({ customerId }: { customerId: number }) {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminCustomersApi.getPets(customerId).then(data => {
      setPets(data);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, [customerId]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-10 bg-slate-100 rounded-xl"></div><div className="h-32 bg-slate-100 rounded-xl"></div></div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-black text-[#0B1F3A]">Hồ sơ thú cưng</h2>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Khách hàng chưa thêm hồ sơ thú cưng.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map(pet => (
            <div key={pet.id} className="border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden shrink-0">
                  {pet.avatar_url ? (
                    <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                      {pet.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[#0B1F3A]">{pet.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{pet.species} • {pet.gender || "Không rõ giới tính"}</p>
                </div>
              </div>
              <div className="text-sm space-y-1 text-slate-600">
                {pet.breed && <p><span className="font-semibold">Giống:</span> {pet.breed}</p>}
                {pet.weight_kg && <p><span className="font-semibold">Cân nặng:</span> {pet.weight_kg} kg</p>}
                {pet.birthday && <p><span className="font-semibold">Ngày sinh:</span> {new Date(pet.birthday).toLocaleDateString("vi-VN")}</p>}
              </div>
              {(pet.health_notes || pet.allergies) && (
                <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                  {pet.health_notes && <p className="text-slate-600"><span className="font-semibold">Ghi chú SK:</span> {pet.health_notes}</p>}
                  {pet.allergies && <p className="text-red-600"><span className="font-semibold">Dị ứng:</span> {pet.allergies}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
