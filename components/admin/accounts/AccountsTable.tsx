import React from "react";
import { Edit2, Trash2, Shield, UserX, Loader2 } from "lucide-react";

interface AccountsTableProps {
  accounts: any[];
  isLoading: boolean;
  onEdit: (account: any) => void;
  onDelete: (id: number) => void;
  currentAdminId: number;
  currentAdminRole?: string;
  hasEditAccess?: boolean;
}

export function AccountsTable({ accounts, isLoading, onEdit, onDelete, currentAdminId, currentAdminRole = "", hasEditAccess = false }: AccountsTableProps) {
  const topTierRoles = ["dev", "admin", "super_admin"];
  const isCurrentAdminTopTier = topTierRoles.includes(currentAdminRole);
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "dev":
        return <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-black text-violet-650 border border-violet-100 uppercase tracking-wider">dev</span>;
      case "super_admin":
        return <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-black text-red-600 border border-red-100 uppercase tracking-wider">super admin</span>;
      case "admin":
        return <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-black text-red-600 border border-red-100 uppercase tracking-wider">admin</span>;
      case "manager":
        return <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-600 border border-blue-100 uppercase tracking-wider">manager</span>;
      case "editor":
        return <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-black text-green-600 border border-green-100 uppercase tracking-wider">editor</span>;
      case "cskh":
        return <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-black text-slate-500 border border-slate-200 uppercase tracking-wider">cskh</span>;
      default:
        return <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-black text-slate-500 border border-slate-200 uppercase tracking-wider">{role}</span>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.04)] overflow-hidden">
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[700px] table-fixed text-left text-xs text-[#0B1F3A]">
          <thead className="bg-[#F8FBFF] text-[10px] font-black uppercase tracking-[0.04em] text-[#64748B] border-b border-[#EEF6FF]">
            <tr>
              <th className="w-[180px] px-6 py-3.5">Họ và tên</th>
              <th className="w-[200px] px-4 py-3.5">Email</th>
              <th className="w-[120px] px-4 py-3.5">Vai trò</th>
              <th className="w-[110px] px-4 py-3.5">Trạng thái</th>
              <th className="w-[140px] px-4 py-3.5">Đăng nhập cuối</th>
              <th className="w-[90px] px-6 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF6FF]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0057E7]" />
                    <span className="font-bold">Đang tải danh sách tài khoản...</span>
                  </div>
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] font-bold">
                  Không tìm thấy tài khoản nhân sự nào.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-[#F8FBFF]/50 transition h-14">
                  <td className="px-6 py-3 font-bold truncate">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{acc.name}</span>
                      {(intVal(acc.id) === intVal(currentAdminId)) && (
                        <span className="inline-flex rounded bg-blue-100 text-blue-800 px-1 py-0.5 text-[8.5px] font-black">Tôi</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#64748B] truncate">{acc.email}</td>
                  <td className="px-4 py-3">{getRoleBadge(acc.role)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        acc.is_active === 1
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : "bg-red-50 text-red-650 border border-red-100"
                      }`}
                    >
                      {acc.is_active === 1 ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#64748B]">{formatDate(acc.last_login_at)}</td>
                  <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      {topTierRoles.includes(acc.role) && !isCurrentAdminTopTier ? (
                        <button
                          disabled
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed"
                          title="Không có quyền chỉnh sửa quản trị viên hệ thống"
                        >
                          <Shield size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => onEdit(acc)}
                          disabled={!hasEditAccess}
                          className="p-1.5 rounded-lg bg-slate-50 text-[#64748B] hover:text-[#0057E7] hover:bg-[#EEF6FF] transition disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-[#64748B]"
                          title={hasEditAccess ? "Chỉnh sửa vai trò / mật khẩu" : "Không có quyền chỉnh sửa"}
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      {intVal(acc.id) !== intVal(currentAdminId) ? (
                        topTierRoles.includes(acc.role) && !isCurrentAdminTopTier ? (
                          <button
                            disabled
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed"
                            title="Không có quyền xóa quản trị viên hệ thống"
                          >
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onDelete(acc.id)}
                            disabled={!hasEditAccess}
                            className="p-1.5 rounded-lg bg-red-50 text-red-650 hover:text-red-850 hover:bg-red-100 transition disabled:opacity-30"
                            title={hasEditAccess ? "Xóa tài khoản" : "Không có quyền xóa"}
                          >
                            <Trash2 size={13} />
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed"
                          title="Không thể tự xóa chính mình"
                        >
                          <UserX size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function intVal(val: any): number {
  return Number(val) || 0;
}
