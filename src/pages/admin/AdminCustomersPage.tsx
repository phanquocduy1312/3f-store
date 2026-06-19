import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { adminCustomersApi, AdminCustomerListParams } from "../../api/adminCustomersApi";
import { Search, Filter, ShieldAlert, CheckCircle2, XCircle, Eye, ShieldOff, SearchX } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function AdminCustomersPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Khách hàng");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [tierFilter, setTierFilter] = useState<"all" | "Silver" | "Gold" | "Platinum">("all");
  const [phoneVerifiedFilter, setPhoneVerifiedFilter] = useState<"all" | "yes" | "no">("all");
  const [hasOrdersFilter, setHasOrdersFilter] = useState<"all" | "yes" | "no">("all");

  const [confirmBlockId, setConfirmBlockId] = useState<number | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params: AdminCustomerListParams = {
        page,
        limit,
        q: searchValue,
        status: statusFilter,
        tier: tierFilter,
        phoneVerified: phoneVerifiedFilter,
        hasOrders: hasOrdersFilter
      };
      const res = await adminCustomersApi.getList(params);
      setCustomers(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadCustomers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, page, limit, statusFilter, tierFilter, phoneVerifiedFilter, hasOrdersFilter]);

  useEffect(() => {
    // Reset page to 1 when filters change
    setPage(1);
  }, [searchValue, statusFilter, tierFilter, phoneVerifiedFilter, hasOrdersFilter]);

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    if (currentStatus === "active") {
      setConfirmBlockId(id);
      setBlockReason("");
    } else {
      if (window.confirm("Bạn có chắc muốn mở khóa tài khoản này?")) {
        try {
          await adminCustomersApi.updateStatus(id, "active", "");
          toast.success("Mở khóa tài khoản thành công");
          loadCustomers();
        } catch (e: any) {
          toast.error(e.message || "Lỗi khi mở khóa");
        }
      }
    }
  };

  const confirmBlock = async () => {
    if (!confirmBlockId) return;
    if (!blockReason.trim()) {
      toast.error("Vui lòng nhập lý do khóa");
      return;
    }
    try {
      await adminCustomersApi.updateStatus(confirmBlockId, "blocked", blockReason);
      toast.success("Khóa tài khoản thành công");
      setConfirmBlockId(null);
      loadCustomers();
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi khóa");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} collapsed={sidebarCollapsed} />
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}
      
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} searchValue={searchValue} onSearchChange={setSearchValue} />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#0B1F3A]">Quản lý khách hàng</h1>
              <p className="text-sm text-[#64748B]">Tìm kiếm và quản lý thông tin khách hàng, hạng thẻ 3F Club</p>
            </div>
            {/* Stats Cards (Basic) */}
            <div className="flex gap-4">
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-[#DCEBFF]">
                <p className="text-xs text-slate-500 font-semibold">Tổng khách hàng</p>
                <p className="text-lg font-black text-[#0B1F3A]">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#DCEBFF] overflow-hidden flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-[#DCEBFF] flex flex-wrap gap-4 items-center bg-slate-50/50">
              <div className="flex items-center gap-2 bg-white border border-[#DCEBFF] rounded-lg px-3 py-2 w-full sm:w-64">
                <Search size={16} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm Tên, SĐT, Email..." 
                  value={searchValue} 
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>

              <select className="bg-white border border-[#DCEBFF] rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="blocked">Bị khóa</option>
              </select>

              <select className="bg-white border border-[#DCEBFF] rounded-lg px-3 py-2 text-sm" value={tierFilter} onChange={e => setTierFilter(e.target.value as any)}>
                <option value="all">Tất cả hạng</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>

              <select className="bg-white border border-[#DCEBFF] rounded-lg px-3 py-2 text-sm" value={phoneVerifiedFilter} onChange={e => setPhoneVerifiedFilter(e.target.value as any)}>
                <option value="all">Xác thực SĐT (Tất cả)</option>
                <option value="yes">Đã xác thực</option>
                <option value="no">Chưa xác thực</option>
              </select>

              <select className="bg-white border border-[#DCEBFF] rounded-lg px-3 py-2 text-sm" value={hasOrdersFilter} onChange={e => setHasOrdersFilter(e.target.value as any)}>
                <option value="all">Đơn hàng (Tất cả)</option>
                <option value="yes">Đã mua hàng</option>
                <option value="no">Chưa mua hàng</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#DCEBFF]">
                  <tr>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Xác minh</th>
                    <th className="px-4 py-3">3F Club</th>
                    <th className="px-4 py-3">Giao dịch</th>
                    <th className="px-4 py-3">Ngày ĐK</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-slate-300 border-t-[#0057E7] rounded-full animate-spin"></div>
                          Đang tải dữ liệu...
                        </div>
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        <SearchX size={32} className="mx-auto mb-3 text-slate-300" />
                        <p>Không tìm thấy khách hàng nào</p>
                      </td>
                    </tr>
                  ) : (
                    customers.map(c => (
                      <tr key={c.id} className="border-b border-[#DCEBFF]/50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {(c.full_name || c.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#0B1F3A]">{c.full_name || c.name || "Chưa cập nhật"}</p>
                              <p className="text-xs text-slate-500">{c.phone || "Trống SĐT"} • {c.email || "Trống Email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 text-xs">
                            <span className={`flex items-center gap-1 ${c.phone_verified_at ? 'text-green-600' : 'text-slate-400'}`}>
                              <CheckCircle2 size={12} /> SĐT
                            </span>
                            <span className={`flex items-center gap-1 ${c.email_verified_at ? 'text-green-600' : 'text-slate-400'}`}>
                              <CheckCircle2 size={12} /> Email
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#0057E7]">{c.tier || "Silver"}</p>
                          <p className="text-xs text-slate-500">{new Intl.NumberFormat('vi-VN').format(c.total_points || 0)} pts</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0B1F3A]">{c.total_orders || 0} đơn</p>
                          <p className="text-xs text-slate-500">{formatCurrency(c.total_spent || 0)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#0B1F3A]">{new Date(c.created_at).toLocaleDateString("vi-VN")}</p>
                          {c.last_login_at && <p className="text-xs text-slate-400">ĐN: {new Date(c.last_login_at).toLocaleDateString("vi-VN")}</p>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {c.status === "active" ? (
                            <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                          ) : (
                            <span className="inline-flex px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Blocked</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => navigate(`/admin/customers/${c.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            {c.status === "active" ? (
                              <button 
                                onClick={() => handleToggleStatus(c.id, c.status)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Khóa tài khoản"
                              >
                                <ShieldAlert size={18} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleToggleStatus(c.id, c.status)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mở khóa tài khoản"
                              >
                                <CheckCircle2 size={18} />
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

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="p-4 border-t border-[#DCEBFF] flex justify-between items-center bg-slate-50/50">
                <span className="text-sm text-slate-500">Trang {page} / {totalPages} (Tổng {total})</span>
                <div className="flex gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 bg-white border border-[#DCEBFF] rounded-lg text-sm disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 bg-white border border-[#DCEBFF] rounded-lg text-sm disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Block Confirm Modal */}
      {confirmBlockId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-red-600 mb-2 flex items-center gap-2">
              <ShieldAlert size={20} /> Xác nhận khóa tài khoản
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Khách hàng sẽ không thể đăng nhập hoặc sử dụng tài khoản. Các phiên đăng nhập hiện tại sẽ bị đăng xuất. Bạn có chắc muốn khóa?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-bold text-[#0B1F3A] mb-1">Lý do khóa <span className="text-red-500">*</span></label>
              <textarea 
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                rows={3}
                placeholder="Nhập lý do khóa..."
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmBlockId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={confirmBlock}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20"
              >
                Khóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
