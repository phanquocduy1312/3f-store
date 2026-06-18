import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { getProfileApi, patchProfileApi, uploadAvatarApi, type ProfileData } from "@/src/api/customerProfileApi";
import { PhoneChangeModal } from "./PhoneChangeModal";
import { User, Mail, Calendar, Sparkles, Phone, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { buildImageUrl } from "@/src/config/api";

export function ProfileTab() {
  const { refreshCustomer } = useCustomerAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    const res = await getProfileApi();
    if (res.success && res.data) {
      setProfile(res.data);
      setFullName(res.data.fullName);
      setEmail(res.data.email || "");
      setBirthday(res.data.birthday || "");
      setGender(res.data.gender || "male");
      setAvatarUrl(res.data.avatarUrl || "");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;
    setIsSaving(true);
    try {
      const res = await patchProfileApi({ fullName, email, birthday, gender });
      if (res.success) {
        toast.success(res.message || "Cập nhật hồ sơ thành công!");
        await refreshCustomer();
        await fetchProfile();
      } else {
        toast.error(res.message || "Lỗi cập nhật.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước file không vượt quá 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadAvatarApi(file);
      if (res.success && res.avatarUrl) {
        setAvatarUrl(res.avatarUrl);
        toast.success("Cập nhật ảnh đại diện thành công!");
        await refreshCustomer();
      } else {
        toast.error(res.message || "Không thể upload ảnh.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="h-64 rounded-3xl bg-white border border-[#E0EBF7] animate-pulse" />;
  }

  const isModified = fullName !== profile?.fullName || email !== (profile?.email || "") || birthday !== (profile?.birthday || "") || gender !== (profile?.gender || "");

  return (
    <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-6">
      
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-base font-black text-ink">Hồ sơ cá nhân</h3>
        <p className="text-xs text-gray-400 font-semibold">Cập nhật thông tin tài khoản và số điện thoại thành viên 3F Club.</p>
      </div>

      {/* Avatar upload section */}
      <div className="flex flex-col items-center gap-4 sm:flex-row border-b border-gray-100 pb-5">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-forest/10 bg-forest/5 flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img src={buildImageUrl(avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-black text-forest">{fullName.charAt(0) || "U"}</span>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>
          )}
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs font-black text-ink">Ảnh đại diện</p>
          <p className="text-[10px] font-semibold text-gray-400">Định dạng JPG, PNG hoặc WEBP, tối đa 2MB.</p>
          <label className="inline-block mt-2 rounded-full border border-forest px-4 py-1.5 text-[10px] font-bold text-forest hover:bg-forest/5 cursor-pointer transition">
            {isUploading ? "Đang tải lên..." : "Tải ảnh mới"}
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={isUploading} />
          </label>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          
          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Họ và tên *</label>
            <div className="relative">
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] pl-10 pr-4 py-3 text-xs outline-none focus:border-forest" required />
              <User size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Địa chỉ Email</label>
            <div className="relative">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] pl-10 pr-4 py-3 text-xs outline-none focus:border-forest" />
              <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Ngày sinh</label>
            <div className="relative">
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] pl-10 pr-4 py-3 text-xs outline-none focus:border-forest" />
              <Calendar size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
            <p className="mt-1 text-[10px] text-gray-400 font-semibold">Dùng để nhận quà ưu đãi sinh nhật từ 3F Club.</p>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Giới tính</label>
            <div className="relative">
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-2xl border border-[#E0EBF7] pl-10 pr-4 py-3 text-xs bg-white outline-none focus:border-forest">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
                <option value="unknown">Không muốn nói</option>
              </select>
              <Sparkles size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

        </div>

        {/* Phone linking section */}
        <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500">
              <Phone size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Số điện thoại liên kết</p>
              <p className="text-xs font-black text-ink">
                {profile?.phone ? profile.phone : "Chưa liên kết"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPhoneModal(true)}
            className="rounded-xl border border-forest px-4 py-2 text-xs font-bold text-forest hover:bg-forest/5"
          >
            {profile?.phone ? "Đổi số điện thoại" : "Liên kết số điện thoại"}
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!isModified || isSaving}
            className="rounded-full bg-forest px-6 py-3 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>

      </form>

      {showPhoneModal && (
        <PhoneChangeModal
          onClose={() => setShowPhoneModal(false)}
          onSuccess={async () => {
            await refreshCustomer();
            await fetchProfile();
          }}
        />
      )}

    </div>
  );
}
export default ProfileTab;
