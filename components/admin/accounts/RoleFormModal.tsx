import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/src/config/api";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  editingRole?: any;
}

const AVAILABLE_PERMISSIONS = [
  { key: "dashboard", label: "Trang chủ (Dashboard)" },
  { key: "orders", label: "Đơn hàng (Orders)" },
  { key: "customers", label: "Khách hàng (Customers)" },
  { key: "pet_advisor", label: "AI Pet Advisor" },
  { key: "club_3f", label: "3F Club Loyalty" },
  { key: "products", label: "Sản phẩm (Products)" },
  { key: "reviews", label: "Đánh giá (Reviews)" },
  { key: "categories", label: "Danh mục (Categories)" },
  { key: "banners", label: "Quản lý Banner" },
  { key: "news", label: "Quản lý Tin tức" },
  { key: "vouchers", label: "Voucher (Vouchers)" },
  { key: "analytics", label: "Báo cáo (Analytics)" },
  { key: "accounts", label: "Nhân sự & Phân quyền" }
];

export function RoleFormModal({ isOpen, onClose, onSaveSuccess, editingRole }: RoleFormModalProps) {
  const [name, setName] = useState(editingRole?.name || "");
  const [displayName, setDisplayName] = useState(editingRole?.display_name || "");
  const [permissions, setPermissions] = useState<string[]>(editingRole?.permissions || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingRole) {
      setName(editingRole.name || "");
      setDisplayName(editingRole.display_name || "");
      setPermissions(editingRole.permissions || []);
    } else {
      setName("");
      setDisplayName("");
      setPermissions([]);
    }
  }, [editingRole, isOpen]);

  if (!isOpen) return null;

  const handleTogglePerm = (key: string) => {
    setPermissions((prev) => 
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !displayName) {
      return toast.warning("Vui lòng điền đủ tên vai trò và tên hiển thị.");
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = editingRole 
        ? `${API_BASE_URL}/api/admin/roles/${editingRole.id}` 
        : `${API_BASE_URL}/api/admin/roles`;
        
      const res = await fetch(url, {
        method: editingRole ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, display_name: displayName, permissions })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingRole ? "Cập nhật vai trò thành công!" : "Tạo vai trò mới thành công!");
        onSaveSuccess();
        onClose();
      } else {
        toast.error(data.message || "Lỗi khi lưu vai trò.");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#DCEBFF] bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition p-1 bg-slate-50 rounded-xl">
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-base font-black text-[#0B1F3A] mb-4">
          {editingRole ? `Cấu hình vai trò: ${editingRole.display_name}` : "Tạo vai trò phân quyền mới"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Mã vai trò (Role Code)</label>
              <input
                type="text"
                disabled={!!editingRole}
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder="vd: marketing_staff"
                className="mt-1 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-2 text-xs font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Tên hiển thị</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="vd: Nhân viên Marketing"
                className="mt-1 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-2 text-xs font-bold text-[#0B1F3A] focus:border-[#0057E7] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-2">Chọn quyền chức năng</label>
            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto border border-[#DCEBFF] rounded-xl p-3 bg-slate-50">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <label key={perm.key} className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] cursor-pointer py-1 hover:bg-slate-100/50 rounded px-1 transition">
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm.key)}
                    onChange={() => handleTogglePerm(perm.key)}
                    className="h-4 w-4 rounded border-[#DCEBFF] text-[#0057E7] focus:ring-[#0057E7]"
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#EEF6FF] pt-4 mt-5">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#64748B] bg-slate-50 hover:bg-slate-100 rounded-xl transition">
              Hủy
            </button>
            <button type="submit" disabled={isSaving} className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#0057E7] px-4 text-xs font-bold text-white transition hover:bg-[#003B7A] disabled:opacity-60">
              {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</> : <><Save className="h-4 w-4" /> Lưu cấu hình</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
