import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { User, Lock, Calendar, Clock, Activity, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/src/config/api";

export default function AdminProfilePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 1024;
    return false;
  });

  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [updatingInfo, setUpdatingInfo] = useState(false);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPass, setUpdatingPass] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAdmin(data.data);
        setName(data.data.name || "");
        setEmail(data.data.email || "");
      } else {
        toast.error("Không thể tải thông tin hồ sơ.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return toast.error("Vui lòng điền đầy đủ tên và email.");
    }
    setUpdatingInfo(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật thông tin thành công!");
        localStorage.setItem("admin_user", JSON.stringify(data.data.admin));
        window.dispatchEvent(new Event("admin_user_updated"));
        fetchProfile();
      } else {
        toast.error(data.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối khi cập nhật.");
    } finally {
      setUpdatingInfo(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Vui lòng điền đầy đủ thông tin mật khẩu.");
    }
    if (newPassword.length < 6) {
      return toast.error("Mật khẩu mới phải từ 6 ký tự trở lên.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Xác nhận mật khẩu mới không khớp.");
    }
    setUpdatingPass(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, current_password: currentPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Thay đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Đổi mật khẩu thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối khi đổi mật khẩu.");
    } finally {
      setUpdatingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F6FAFF]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0057E7] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar activeMenu="Hồ sơ" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />
      {!sidebarCollapsed && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed((c) => !c)} />
        <main className="flex-1 px-4 py-6 sm:px-6 space-y-6">
          <div>
            <h1 className="text-[24px] font-black text-[#0B1F3A]">Hồ sơ cá nhân</h1>
            <p className="mt-1 text-xs text-[#64748B]">Quản lý thông tin tài khoản admin và cấu hình bảo mật</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bento Card 1: Thông tin cá nhân */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#DCEBFF] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-[#EEF6FF] pb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#0057E7] flex items-center justify-center shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-[#0B1F3A]">Thông tin tài khoản</h3>
                  <p className="text-[11px] text-[#64748B]">Cập nhật tên hiển thị và email quản trị</p>
                </div>
              </div>

              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-[#0B1F3A]">Họ và tên</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-4 text-xs font-semibold bg-slate-50 border border-[#DCEBFF] rounded-xl outline-none focus:border-[#0057E7] focus:bg-white transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-[#0B1F3A]">Email đăng nhập</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 text-xs font-semibold bg-slate-50 border border-[#DCEBFF] rounded-xl outline-none focus:border-[#0057E7] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updatingInfo}
                    className="h-10 px-6 bg-[#0057E7] hover:bg-[#003B7A] text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {updatingInfo ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>

            {/* Bento Card 3: Thống kê & Trạng thái */}
            <div className="bg-white rounded-3xl border border-[#DCEBFF] p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-[#EEF6FF] pb-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#0B1F3A]">Chi tiết tài khoản</h3>
                    <p className="text-[11px] text-[#64748B]">Trạng thái và thống kê hệ thống</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">Vai trò</span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-bold capitalize text-[10px]">
                      {admin?.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">Trạng thái</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-600 font-bold text-[10px]">
                      <CheckCircle className="h-3 w-3" /> Hoạt động
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">Ngày tạo</span>
                    <span className="font-bold text-[#0B1F3A] inline-flex items-center gap-1 text-[11px]">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {admin?.created_at ? new Date(admin.created_at).toLocaleDateString("vi-VN") : "---"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">Đăng nhập cuối</span>
                    <span className="font-bold text-[#0B1F3A] inline-flex items-center gap-1 text-[11px]">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {admin?.last_login_at ? new Date(admin.last_login_at).toLocaleString("vi-VN") : "Chưa có"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Bảo mật & Đổi mật khẩu */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-[#DCEBFF] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-[#EEF6FF] pb-4">
                <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-[#0B1F3A]">Thiết lập mật khẩu</h3>
                  <p className="text-[11px] text-[#64748B]">Thay đổi mật khẩu đăng nhập tài khoản</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#0B1F3A]">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-11 px-4 text-xs font-semibold bg-slate-50 border border-[#DCEBFF] rounded-xl outline-none focus:border-[#0057E7] focus:bg-white transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#0B1F3A]">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-4 text-xs font-semibold bg-slate-50 border border-[#DCEBFF] rounded-xl outline-none focus:border-[#0057E7] focus:bg-white transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#0B1F3A]">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-4 text-xs font-semibold bg-slate-50 border border-[#DCEBFF] rounded-xl outline-none focus:border-[#0057E7] focus:bg-white transition"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingPass}
                    className="h-10 px-6 bg-[#0057E7] hover:bg-[#003B7A] text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {updatingPass ? "Đang cập nhật..." : "Đổi mật khẩu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
