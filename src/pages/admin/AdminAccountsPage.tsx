import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AccountsTable } from "@/components/admin/accounts/AccountsTable";
import { AccountFormModal } from "@/components/admin/accounts/AccountFormModal";
import { RolesTab } from "@/components/admin/accounts/RolesTab";
import { Users, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/src/config/api";

type TabKey = "accounts" | "roles";

export default function AdminAccountsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 1024;
    return false;
  });

  const [activeTab, setActiveTab] = useState<TabKey>("accounts");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(undefined);
  const [currentAdminId, setCurrentAdminId] = useState(0);
  const [currentAdminRole, setCurrentAdminRole] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("admin_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentAdminId(Number(user.id) || 0);
        const role = user.role || "";
        setCurrentAdminRole(role);
        const perms = user.permissions || [];
        setIsAuthorized(role === "dev" || role === "admin" || perms.includes("accounts"));
      } else {
        setIsAuthorized(false);
      }
    } catch (e) {
      setIsAuthorized(false);
    }
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = new URL(`${API_BASE_URL}/api/admin/accounts`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", "10");
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAccounts(data.data.items || []);
        setTotalPages(data.data.totalPages || 1);
      } else {
        toast.error(data.message || "Lỗi tải danh sách tài khoản.");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && activeTab === "accounts") {
      fetchAccounts();
    }
  }, [page, search, isAuthorized, activeTab]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân sự này? Thao tác này không thể hoàn tác.")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/accounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa tài khoản thành công!");
        fetchAccounts();
      } else {
        toast.error(data.message || "Lỗi khi xóa tài khoản.");
      }
    } catch (err) {
      toast.error("Không gửi được yêu cầu.");
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F6FAFF]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0057E7] border-t-transparent" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#F6FAFF] font-sans relative flex items-center justify-center text-center">
        <div className="max-w-md bg-white border border-[#DCEBFF] p-8 rounded-3xl shadow-sm flex flex-col items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0B1F3A]">Từ chối truy cập</h2>
            <p className="mt-2 text-xs font-semibold text-slate-400">Tài khoản của bạn không có quyền quản trị nhân sự hệ thống.</p>
          </div>
          <button onClick={() => window.location.href = "/admin"} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0057E7] px-6 text-xs font-bold text-white shadow-sm">
            Quay về Bảng điều khiển
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar activeMenu="Nhân sự" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />
      {!sidebarCollapsed && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      <div className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed((c) => !c)} />

        <main className="flex-1 px-4 py-6 sm:px-6 space-y-6">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF6FF] pb-4">
            <div>
              <h1 className="text-[24px] font-black text-[#0B1F3A]">Quản trị nhân sự</h1>
              <p className="mt-1 text-xs text-[#64748B]">Cấu hình danh sách nhân viên và thiết lập phân quyền chức năng hệ thống</p>
            </div>
            {activeTab === "accounts" && (
              <button
                onClick={() => { setSelectedAccount(undefined); setIsModalOpen(true); }}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0057E7] px-4 text-xs font-bold text-white transition hover:bg-[#003B7A] self-start sm:self-auto shadow-sm"
              >
                <Plus className="h-4 w-4" /> Thêm nhân sự mới
              </button>
            )}
          </section>

          <div className="flex gap-2 border-b border-[#DCEBFF] pb-px">
            <button
              onClick={() => setActiveTab("accounts")}
              className={`pb-2.5 px-4 text-xs font-bold relative transition-colors ${activeTab === "accounts" ? "text-[#0057E7]" : "text-[#64748B] hover:text-[#0B1F3A]"}`}
            >
              Tài khoản nhân sự
              {activeTab === "accounts" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0057E7] rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`pb-2.5 px-4 text-xs font-bold relative transition-colors ${activeTab === "roles" ? "text-[#0057E7]" : "text-[#64748B] hover:text-[#0B1F3A]"}`}
            >
              Vai trò & Phân quyền
              {activeTab === "roles" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0057E7] rounded-full" />}
            </button>
          </div>

          {activeTab === "accounts" ? (
            <div className="space-y-4">
              <div className="flex max-w-sm items-center gap-2 rounded-xl border border-[#DCEBFF] bg-white px-3 py-2 shadow-sm focus-within:border-[#0057E7] transition">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Tìm nhân viên theo tên, email..."
                  className="w-full bg-transparent text-xs font-semibold text-[#0B1F3A] outline-none"
                />
              </div>

              <AccountsTable
                accounts={accounts}
                isLoading={isLoading}
                onEdit={(acc) => { setSelectedAccount(acc); setIsModalOpen(true); }}
                onDelete={handleDelete}
                currentAdminId={currentAdminId}
                currentAdminRole={currentAdminRole}
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#EEF6FF] pt-4">
                  <span className="text-[11px] font-bold text-[#64748B]">Trang {page} / {totalPages}</span>
                  <div className="flex gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCEBFF] bg-white hover:bg-slate-50 transition disabled:opacity-50">
                      <ChevronLeft className="h-4 w-4 text-[#0B1F3A]" />
                    </button>
                    <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCEBFF] bg-white hover:bg-slate-50 transition disabled:opacity-50">
                      <ChevronRight className="h-4 w-4 text-[#0B1F3A]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <RolesTab />
          )}
        </main>
      </div>

      <AccountFormModal
        key={selectedAccount ? selectedAccount.id : "new"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={fetchAccounts}
        editingAccount={selectedAccount}
      />
    </div>
  );
}
