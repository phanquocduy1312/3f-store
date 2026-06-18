import { useEffect, useState } from "react";
import { 
  changePasswordApi, listSessionsApi, revokeSessionApi, logoutAllSessionsApi, type SessionData 
} from "@/src/api/customerSecurityApi";
import { getProfileApi, type ProfileData } from "@/src/api/customerProfileApi";
import { Shield, Key, Laptop, Globe, LogOut, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function SecurityTab() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profRes, sessRes] = await Promise.all([
        getProfileApi(),
        listSessionsApi()
      ]);
      if (profRes.success && profRes.data) setProfile(profRes.data);
      if (sessRes.success && sessRes.data) setSessions(sessRes.data);
    } catch {
      toast.error("Không thể tải thông tin bảo mật.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải từ 6 ký tự.");
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePasswordApi({
        currentPassword: profile?.hasPassword ? currentPassword : "",
        newPassword,
        newPasswordConfirmation
      });

      if (res.success) {
        toast.success(res.message || "Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirmation("");
        // Reload profile to update hasPassword state if it was false
        const profRes = await getProfileApi();
        if (profRes.success && profRes.data) setProfile(profRes.data);
      } else {
        toast.error(res.message || "Đổi mật khẩu không thành công.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeSession = async (id: number) => {
    try {
      const res = await revokeSessionApi(id);
      if (res.success) {
        toast.success(res.message || "Đã hủy phiên đăng nhập.");
        setSessions(sessions.filter(s => s.id !== id));
      } else {
        toast.error(res.message || "Không thể hủy phiên đăng nhập.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?")) return;
    try {
      const res = await logoutAllSessionsApi();
      if (res.success) {
        toast.success(res.message || "Đã đăng xuất khỏi tất cả thiết bị.");
        // Re-fetch sessions list
        const sessRes = await listSessionsApi();
        if (sessRes.success && sessRes.data) setSessions(sessRes.data);
      } else {
        toast.error(res.message || "Lỗi khi đăng xuất các thiết bị.");
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
      
      {/* Change Password Card */}
      <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
          <Key className="text-forest" size={18} />
          <div>
            <h3 className="text-sm font-black text-ink">Đổi mật khẩu</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              {profile?.hasPassword ? "Đổi mật khẩu định kỳ để bảo vệ tài khoản" : "Tài khoản của bạn chưa cài đặt mật khẩu"}
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {profile?.hasPassword && (
              <div>
                <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest"
                  required
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={newPasswordConfirmation}
                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                className="w-full rounded-2xl border border-[#E0EBF7] px-4 py-2.5 text-xs outline-none focus:border-forest"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white shadow-soft transition hover:bg-forest/90 disabled:opacity-50"
            >
              {isSubmitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </div>
        </form>
      </div>

      {/* Login Sessions Card */}
      <div className="rounded-3xl border border-[#E0EBF7] bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="text-forest" size={18} />
            <div>
              <h3 className="text-sm font-black text-ink">Phiên đăng nhập hoạt động</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Danh sách thiết bị đã đăng nhập tài khoản của bạn</p>
            </div>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={handleLogoutAll}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/65 px-3 py-1.5 rounded-full self-start sm:self-auto transition-colors"
            >
              <LogOut size={12} /> Đăng xuất thiết bị khác
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {sessions.map((session) => (
            <div key={session.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 mt-0.5">
                  <Laptop size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-ink line-clamp-1">{session.userAgent}</span>
                    {session.isCurrent && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-700 border border-green-100">
                        <CheckCircle2 size={10} /> Thiết bị hiện tại
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-gray-400">
                    <span className="flex items-center gap-1"><Globe size={10} /> {session.ipAddress}</span>
                    <span>•</span>
                    <span>Đăng nhập lúc: {new Date(session.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  title="Hủy phiên đăng nhập này"
                  className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
export default SecurityTab;
