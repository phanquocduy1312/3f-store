import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/src/config/api";
import { RoleFormModal } from "./RoleFormModal";

interface RolesTabProps {
  hasEditAccess?: boolean;
}

export function RolesTab({ hasEditAccess = false }: RolesTabProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(undefined);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRoles(data.data || []);
      } else {
        toast.error(data.message || "Lỗi tải danh sách vai trò.");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDeleteRole = async (id: number, name: string) => {
    if (["dev", "super_admin", "manager", "editor", "cskh", "admin"].includes(name)) {
      return toast.error("Không thể xóa vai trò mặc định của hệ thống.");
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/roles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa vai trò thành công!");
        fetchRoles();
      } else {
        toast.error(data.message || "Lỗi khi xóa vai trò.");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ.");
    }
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRole(undefined);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0057E7] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấu hình vai trò & Quyền truy cập</h3>
        {hasEditAccess && (
          <button
            onClick={handleCreateRole}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0057E7] hover:bg-[#003B7A] px-3.5 text-xs font-bold text-white transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Thêm vai trò mới
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#DCEBFF] bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-[#DCEBFF] text-[10px] font-black uppercase text-[#64748B] tracking-wider">
              <th className="p-4">Tên vai trò</th>
              <th className="p-4">Mã (Code)</th>
              <th className="p-4">Chức năng được truy cập</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF6FF] text-xs">
            {roles.map((role) => {
              const isSystem = ["dev", "super_admin", "manager", "editor", "cskh", "admin"].includes(role.name);
              return (
                <tr key={role.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-bold text-[#0B1F3A]">{role.display_name}</td>
                  <td className="p-4">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold uppercase">
                      {role.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xl">
                      {role.permissions.map((p: string) => (
                        <span key={p} className="text-[9px] font-bold bg-[#EBF3FF] text-[#0057E7] px-2 py-0.5 rounded border border-[#DCEBFF]/50 uppercase tracking-wide">
                          {p.replace("_", " ")}
                        </span>
                      ))}
                      {role.permissions.length === 0 && (
                        <span className="text-[10px] font-bold text-red-500 inline-flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" /> Chưa có quyền
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        disabled={role.name === 'dev' || role.name === 'admin' || !hasEditAccess}
                        className="h-8 w-8 rounded-lg border border-[#DCEBFF] text-[#64748B] hover:text-[#0057E7] hover:bg-slate-100 flex items-center justify-center transition disabled:opacity-30"
                        title={hasEditAccess ? "Sửa quyền" : "Không có quyền sửa"}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id, role.name)}
                        disabled={isSystem || !hasEditAccess}
                        className="h-8 w-8 rounded-lg border border-[#DCEBFF] text-[#64748B] hover:text-[#EF3340] hover:bg-[#FFF2F3] flex items-center justify-center transition disabled:opacity-30"
                        title={hasEditAccess ? "Xóa vai trò" : "Không có quyền xóa"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RoleFormModal
        key={selectedRole ? selectedRole.id : "new"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={fetchRoles}
        editingRole={selectedRole}
      />
    </div>
  );
}
