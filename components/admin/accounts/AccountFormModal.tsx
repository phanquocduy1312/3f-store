import React, { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/src/config/api";

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  editingAccount?: any; // If present, we are editing
}

export function AccountFormModal({ isOpen, onClose, onSaveSuccess, editingAccount }: AccountFormModalProps) {
  const [name, setName] = useState(editingAccount?.name || "");
  const [email, setEmail] = useState(editingAccount?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(editingAccount?.role || "manager");
  const [isActive, setIsActive] = useState(editingAccount ? editingAccount.is_active === 1 : true);
  const [isSaving, setIsSaving] = useState(false);

  const [roles, setRoles] = useState<any[]>([
    { id: 1, name: "dev", display_name: "Developer" },
    { id: 2, name: "super_admin", display_name: "Super Admin" },
    { id: 3, name: "manager", display_name: "Store Manager" },
    { id: 4, name: "editor", display_name: "Marketing Editor" },
    { id: 5, name: "cskh", display_name: "CSKH Agent" }
  ]);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);
  const [currentAdminRole, setCurrentAdminRole] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      const userStr = localStorage.getItem("admin_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentAdminId(Number(user.id) || null);
        setCurrentAdminRole(user.role || null);
      }
    } catch (e) {}
  }, []);

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_BASE_URL}/api/admin/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setRoles(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.warning("Vui lòng điền đầy đủ Tên và Email.");
      return;
    }
    if (!editingAccount && !password) {
      toast.warning("Vui lòng nhập mật khẩu cho tài khoản mới.");
      return;
    }
    if (editingAccount && currentAdminId && Number(editingAccount.id) === currentAdminId) {
      if (role !== editingAccount.role) {
        toast.error("Bạn không thể tự thay đổi vai trò của chính mình.");
        return;
      }
      if (!isActive) {
        toast.error("Bạn không thể tự khóa tài khoản của mình.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = editingAccount 
        ? `${API_BASE_URL}/api/admin/accounts/${editingAccount.id}` 
        : `${API_BASE_URL}/api/admin/accounts`;
      
      const payload: any = {
        name,
        email,
        role,
        is_active: isActive ? 1 : 0
      };

      if (password) {
        payload.password = password;
      }

      const res = await fetch(url, {
        method: editingAccount ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(editingAccount ? "Cập nhật tài khoản nhân sự thành công!" : "Tạo tài khoản nhân sự thành công!");
        onSaveSuccess();
        onClose();
      } else {
        toast.error(data.message || "Lỗi khi lưu thông tin.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#DCEBFF] bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 transition p-1 bg-slate-50 rounded-xl"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-base font-black text-[#0B1F3A] mb-4">
          {editingAccount ? `Cập nhật tài khoản: ${editingAccount.name}` : "Tạo tài khoản nhân sự mới"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Họ và tên</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-2.5 text-xs font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Địa chỉ Email</label>
            <input
              type="email"
              required
              disabled={!!editingAccount}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-2.5 text-xs font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
              {editingAccount ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
            </label>
            <input
              type="password"
              required={!editingAccount}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-2.5 text-xs font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Vai trò (Role)</label>
            <select
              value={role}
              disabled={editingAccount && currentAdminId !== null && Number(editingAccount.id) === currentAdminId}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-2.5 text-xs font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none cursor-pointer capitalize disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {roles
                .filter((r) => {
                  const topTierRoles = ["dev", "admin", "super_admin"];
                  const isCurrentAdminTopTier = currentAdminRole && topTierRoles.includes(currentAdminRole);
                  if (topTierRoles.includes(r.name)) {
                    return isCurrentAdminTopTier;
                  }
                  return true;
                })
                .map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.display_name} ({r.name})
                  </option>
                ))}
            </select>
          </div>

          {editingAccount && (
            <div className="space-y-2 py-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modalIsActive"
                  checked={isActive}
                  disabled={currentAdminId !== null && Number(editingAccount.id) === currentAdminId}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-[#DCEBFF] text-[#0057E7] focus:ring-[#0057E7] cursor-pointer disabled:cursor-not-allowed"
                />
                <label htmlFor="modalIsActive" className="text-xs font-bold text-[#0B1F3A] cursor-pointer select-none">
                  Kích hoạt tài khoản hoạt động
                </label>
              </div>
              {currentAdminId !== null && Number(editingAccount.id) === currentAdminId && (
                <p className="text-[10px] text-amber-600 font-bold">
                  * Bạn không thể tự thay đổi vai trò hoặc khóa tài khoản của chính mình.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-[#EEF6FF] pt-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#64748B] bg-slate-50 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#0057E7] px-4 text-xs font-bold text-white transition hover:bg-[#003B7A] disabled:opacity-60"
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
              ) : (
                <><Save className="h-4 w-4" /> Lưu thông tin</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
