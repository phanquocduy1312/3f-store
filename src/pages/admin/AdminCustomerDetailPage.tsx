import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Gift,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  ShoppingBag,
  StickyNote,
  Tag,
  Ticket,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { CustomerTagsList } from "@/components/admin/customers/CustomerTagsList";
import { CustomerTagsModal } from "@/components/admin/customers/CustomerTagsModal";
import { CustomerAddressesTab } from "@/components/admin/customers/tabs/CustomerAddressesTab";
import { CustomerNotesTab } from "@/components/admin/customers/tabs/CustomerNotesTab";
import { CustomerOrdersTab } from "@/components/admin/customers/tabs/CustomerOrdersTab";
import { CustomerOverviewTab } from "@/components/admin/customers/tabs/CustomerOverviewTab";
import { CustomerPetsTab } from "@/components/admin/customers/tabs/CustomerPetsTab";
import { CustomerPointsTab } from "@/components/admin/customers/tabs/CustomerPointsTab";
import { CustomerSessionsTab } from "@/components/admin/customers/tabs/CustomerSessionsTab";
import { CustomerTimelineTab } from "@/components/admin/customers/tabs/CustomerTimelineTab";
import { CustomerVouchersTab } from "@/components/admin/customers/tabs/CustomerVouchersTab";
import { adminCustomersApi } from "../../api/adminCustomersApi";

const tabs = [
  { id: "overview", label: "Tổng quan", icon: User },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
  { id: "club", label: "3F Club", icon: Gift },
  { id: "notes", label: "Ghi chú CSKH", icon: StickyNote },
  { id: "timeline", label: "Lịch sử hoạt động", icon: Activity },
  { id: "addresses", label: "Địa chỉ", icon: MapPin },
  { id: "pets", label: "Thú cưng", icon: Heart },
  { id: "vouchers", label: "Kho voucher", icon: Ticket },
  { id: "sessions", label: "Bảo mật & phiên", icon: Shield },
];

const formatCurrency = (value: unknown) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (value?: string | null) => {
  if (!value) return "Chưa có";
  return new Date(value).toLocaleDateString("vi-VN");
};

const getCustomerName = (customer: any) => customer?.full_name || customer?.name || "Chưa cập nhật tên";
const getPointBalance = (customer: any) => Number(customer?.point_balance ?? customer?.points ?? customer?.loyalty_points ?? 0);

function KpiCard({ icon, label, value, tone = "blue" }: { icon: React.ReactNode; label: string; value: string | number; tone?: "blue" | "green" | "amber" | "slate" }) {
  const toneClass = {
    blue: "bg-[#EEF6FF] text-[#0057E7]",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-[#DCEBFF] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>{icon}</div>
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase text-slate-400">{label}</div>
          <div className="truncate text-lg font-black text-[#0B1F3A]">{value}</div>
        </div>
      </div>
    </div>
  );
}

export function AdminCustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Khách hàng");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== "undefined" && window.innerWidth < 1200);
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

  const summary = useMemo(() => {
    if (!customer) return { orders: 0, spent: 0, points: 0, completion: 0 };
    return {
      orders: Number(customer.total_orders ?? customer.totalOrders ?? 0),
      spent: Number(customer.total_spent ?? customer.totalSpent ?? 0),
      points: getPointBalance(customer),
      completion: Number(customer.profile_completion ?? customer.profileCompletion ?? 0),
    };
  }, [customer]);

  const handleToggleStatus = () => {
    if (!customer) return;
    if (customer.status === "active") {
      setConfirmBlockId(customer.id);
      setBlockReason("");
      return;
    }

    if (window.confirm("Mở khóa tài khoản khách hàng này?")) {
      adminCustomersApi.updateStatus(customer.id, "active", "").then(() => {
        toast.success("Mở khóa thành công");
        loadDetail();
      }).catch((e: any) => toast.error(e.message || "Lỗi khi mở khóa"));
    }
  };

  const confirmBlock = async () => {
    if (!confirmBlockId) return;
    if (!blockReason.trim()) {
      toast.error("Vui lòng nhập lý do khóa");
      return;
    }

    try {
      await adminCustomersApi.updateStatus(confirmBlockId, "blocked", blockReason.trim());
      toast.success("Khóa tài khoản thành công");
      setConfirmBlockId(null);
      loadDetail();
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi khóa tài khoản");
    }
  };

  if (loading || !customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFF]">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#0057E7]" />
          Đang tải hồ sơ khách hàng...
        </div>
      </div>
    );
  }

  const isActive = customer.status === "active";
  const customerName = getCustomerName(customer);

  return (
    <div className="relative min-h-screen bg-[#F6FAFF] font-sans">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} collapsed={sidebarCollapsed} />
      {!sidebarCollapsed && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      <div className={`flex min-h-screen w-full flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} searchValue="" onSearchChange={() => {}} />

        <main className="flex-1 space-y-5 p-4 sm:p-6">
          <section className="rounded-3xl border border-[#DCEBFF] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 gap-4">
                <button
                  onClick={() => navigate("/admin/customers")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#DCEBFF] bg-white text-slate-600 transition hover:bg-[#EEF6FF] hover:text-[#0057E7]"
                  aria-label="Quay lại danh sách khách hàng"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-black text-[#0B1F3A]">{customerName}</h1>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                      {isActive ? "Active" : "Blocked"}
                    </span>
                    {customer.phone_verified_at && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF6FF] px-2.5 py-1 text-[11px] font-bold text-[#0057E7]"><BadgeCheck className="h-3.5 w-3.5" />Đã xác minh SĐT</span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-slate-500">
                    <span>ID: {customer.id}</span>
                    <span>Tham gia: {formatDate(customer.created_at)}</span>
                    <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{customer.phone || "Chưa có SĐT"}</span>
                    <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{customer.email || "Chưa có email"}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <CustomerTagsList key={tagsKey} customerId={Number(id)} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                <button
                  onClick={handleToggleStatus}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
                    isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {isActive ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                  {isActive ? "Khóa tài khoản" : "Mở khóa"}
                </button>
                <button
                  onClick={() => setIsTagsModalOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 text-sm font-bold text-[#0057E7] transition hover:bg-[#EEF6FF]"
                >
                  <Tag size={16} /> Gắn nhãn
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={<ShoppingBag className="h-5 w-5" />} label="Tổng đơn" value={summary.orders} />
            <KpiCard icon={<CircleDollarSign className="h-5 w-5" />} label="Tổng chi tiêu" value={formatCurrency(summary.spent)} tone="green" />
            <KpiCard icon={<Gift className="h-5 w-5" />} label="Điểm 3F" value={summary.points.toLocaleString("vi-VN")} tone="amber" />
            <KpiCard icon={<FileText className="h-5 w-5" />} label="Hoàn thiện hồ sơ" value={`${summary.completion || 0}%`} tone="slate" />
          </section>

          <div className="flex flex-col gap-5 xl:flex-row">
            <aside className="w-full xl:w-72 xl:shrink-0">
              <div className="rounded-2xl border border-[#DCEBFF] bg-white p-3 shadow-sm xl:sticky xl:top-24">
                <nav className="flex gap-2 overflow-x-auto xl:flex-col xl:overflow-visible">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-left text-sm font-bold transition xl:w-full ${
                          active
                            ? "bg-[#0057E7] text-white shadow-[0_10px_24px_rgba(0,87,231,0.22)]"
                            : "text-slate-600 hover:bg-[#F6FAFF] hover:text-[#0B1F3A]"
                        }`}
                      >
                        <Icon size={18} className={active ? "text-white" : "text-slate-400"} />
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <section className="min-w-0 flex-1 rounded-2xl border border-[#DCEBFF] bg-white p-4 shadow-sm md:p-6">
              {activeTab === "overview" && <CustomerOverviewTab customer={customer} />}
              {activeTab === "orders" && <CustomerOrdersTab customerId={customer.id} />}
              {activeTab === "club" && <CustomerPointsTab customerId={customer.id} customerPhone={customer.phone} />}
              {activeTab === "notes" && <CustomerNotesTab customerId={Number(id)} />}
              {activeTab === "timeline" && <CustomerTimelineTab customerId={Number(id)} />}
              {activeTab === "addresses" && <CustomerAddressesTab customerId={customer.id} />}
              {activeTab === "pets" && <CustomerPetsTab customerId={customer.id} />}
              {activeTab === "vouchers" && <CustomerVouchersTab customerId={customer.id} />}
              {activeTab === "sessions" && <CustomerSessionsTab customerId={Number(id)} />}
            </section>
          </div>
        </main>
      </div>

      <CustomerTagsModal
        isOpen={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
        customerId={Number(id)}
        onTagsUpdated={() => setTagsKey(k => k + 1)}
      />

      {confirmBlockId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06152B]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black text-red-600">
                  <ShieldAlert size={20} /> Khóa tài khoản khách hàng
                </h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                  Khách sẽ không thể đăng nhập. Các phiên đăng nhập hiện tại có thể bị vô hiệu hóa tùy cấu hình backend.
                </p>
              </div>
              <button onClick={() => setConfirmBlockId(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mb-1 block text-sm font-bold text-[#0B1F3A]">Lý do khóa</label>
            <textarea
              className="h-28 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm font-semibold outline-none transition focus:border-red-500"
              placeholder="Nhập lý do để lưu lại lịch sử xử lý..."
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
            />
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmBlockId(null)} className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-700 hover:bg-slate-200">
                Hủy
              </button>
              <button onClick={confirmBlock} className="h-10 rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700">
                Khóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
