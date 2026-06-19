import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { adminCustomersApi } from "../../api/adminCustomersApi";
import { 
  ArrowLeft, ShieldAlert, CheckCircle2, User, Phone, Mail, 
  MapPin, ShoppingBag, Gift, Heart, Shield, FileText, XCircle, Ticket, Tag, Clock, StickyNote, Activity
} from "lucide-react";
import { toast } from "sonner";
import { CustomerOverviewTab } from "@/components/admin/customers/tabs/CustomerOverviewTab";
import { CustomerOrdersTab } from "@/components/admin/customers/tabs/CustomerOrdersTab";
import { CustomerPointsTab } from "@/components/admin/customers/tabs/CustomerPointsTab";
import { CustomerAddressesTab } from "@/components/admin/customers/tabs/CustomerAddressesTab";
import { CustomerVouchersTab } from "@/components/admin/customers/tabs/CustomerVouchersTab";
import { CustomerPetsTab } from "@/components/admin/customers/tabs/CustomerPetsTab";
import { CustomerSessionsTab } from "@/components/admin/customers/tabs/CustomerSessionsTab";
import { CustomerNotesTab } from "@/components/admin/customers/tabs/CustomerNotesTab";
import { CustomerTimelineTab } from "@/components/admin/customers/tabs/CustomerTimelineTab";
import { CustomerTagsModal } from "@/components/admin/customers/CustomerTagsModal";
import { CustomerTagsList } from "@/components/admin/customers/CustomerTagsList";

export function AdminCustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Khách hàng");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [confirmBlockId, setConfirmBlockId] = useState<number | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [tagsKey, setTagsKey] = useState(0);

  const loadDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await adminCustomersApi.getDetail(Number(id));
      setCustomer(res);
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi tải chi tiết khách hàng");
      navigate("/admin/customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleToggleStatus = () => {
    if (!customer) return;
    if (customer.status === "active") {
      setConfirmBlockId(customer.id);
      setBlockReason("");
    } else {
      if (window.confirm("Bạn có chắc muốn mở khóa tài khoản này?")) {
        adminCustomersApi.updateStatus(customer.id, "active", "").then(() => {
          toast.success("Mở khóa thành công");
          loadDetail();
        }).catch((e: any) => toast.error(e.message || "Lỗi khi mở khóa"));
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
      loadDetail();
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi khóa");
    }
  };

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-[#F6FAFF] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0057E7] rounded-full animate-spin"></div>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: User },
    { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
    { id: "club", label: "3F Club", icon: Gift },
    { id: "addresses", label: "Địa chỉ", icon: MapPin },
    { id: "vouchers", label: "Kho Voucher", icon: Ticket },
    { id: "pets", label: "Thú cưng", icon: Heart },
    { id: "sessions", label: "Bảo mật & Phiên", icon: Shield },
    { id: "timeline", label: "Lịch sử hoạt động", icon: Activity },
    { id: "notes", label: "Ghi chú CSKH", icon: StickyNote },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} collapsed={sidebarCollapsed} />
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}
      
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} searchValue={""} onSearchChange={() => {}} />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/admin/customers")} className="p-2 bg-white rounded-xl shadow-sm border border-[#DCEBFF] text-slate-600 hover:text-[#0057E7] transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-[#0B1F3A] flex items-center gap-2">
                  {customer.full_name || customer.name || "Chưa cập nhật tên"}
                  {customer.status === "active" ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-black rounded-full">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] uppercase font-black rounded-full">Blocked</span>
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <CustomerTagsList key={tagsKey} customerId={Number(id)} />
                </div>
                <p className="text-sm text-[#64748B]">ID: {customer.id} • Tham gia: {new Date(customer.created_at).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {customer.status === "active" ? (
                <button onClick={handleToggleStatus} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors text-sm">
                  <ShieldAlert size={16} /> Khóa
                </button>
              ) : (
                <button onClick={handleToggleStatus} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 font-bold rounded-xl transition-colors text-sm">
                  <CheckCircle2 size={16} /> Mở khóa
                </button>
              )}
              <button onClick={() => setIsTagsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#F6FAFF] border border-[#DCEBFF] text-[#0057E7] hover:bg-blue-50 font-bold rounded-xl transition-colors text-sm">
                <Tag size={16} /> Nhãn
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar Tabs */}
            <div className="w-full lg:w-64 shrink-0 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? "bg-[#0057E7] text-white shadow-lg shadow-blue-500/20" 
                      : "bg-transparent text-slate-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? "text-white" : "text-slate-400"} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Content */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#DCEBFF] p-6 min-h-[500px]">
              {activeTab === "overview" && <CustomerOverviewTab customer={customer} />}
              {activeTab === "orders" && <CustomerOrdersTab customerId={customer.id} />}
              {activeTab === "club" && <CustomerPointsTab customerId={customer.id} />}
              {activeTab === "addresses" && <CustomerAddressesTab customerId={customer.id} />}
              {activeTab === "vouchers" && <CustomerVouchersTab customerId={customer.id} />}
              {activeTab === "pets" && <CustomerPetsTab customerId={customer.id} />}
              {activeTab === "sessions" && <CustomerSessionsTab customerId={Number(id)} />}
              {activeTab === "timeline" && <CustomerTimelineTab customerId={Number(id)} />}
              {activeTab === "notes" && <CustomerNotesTab customerId={Number(id)} />}
            </div>
          </div>
        </main>
      </div>

      <CustomerTagsModal 
        isOpen={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
        customerId={Number(id)}
        onTagsUpdated={() => setTagsKey(k => k + 1)}
      />

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
