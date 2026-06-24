import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  adminDeleteVoucher,
  adminGetVouchers,
  adminSaveVoucher,
  adminToggleVoucherActive,
  getFeaturedVouchers,
  type AdminVoucherListMeta,
  type AdminVoucher,
  type AdminVoucherPayload,
  type PublicVoucher,
  type VoucherDiscountType,
  type VoucherStats,
} from "@/src/api/vouchersApi";
import { toast } from "sonner";
import {
  Bone,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit2,
  Gift,
  PawPrint,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  Truck,
  X,
} from "lucide-react";

const emptyForm: AdminVoucherPayload = {
  code: "",
  name: "",
  description: "",
  discountType: "fixed",
  discountValue: 0,
  maxDiscountAmount: "",
  minOrderAmount: 0,
  usageLimit: "",
  perCustomerLimit: 1,
  startsAt: "",
  endsAt: "",
  isActive: 1,
  showOnHome: 1,
  showInCart: 1,
  showInAiAdvisor: 0,
  displayTitle: "",
  displayLabel: "",
  badgeText: "",
  themeColor: "sky",
  iconKey: "ticket",
  sortOrder: 0,
};

const themeClasses: Record<string, { block: string; text: string; soft: string }> = {
  sky: { block: "from-sky-400 to-sky-600", text: "text-sky-700", soft: "bg-sky-50" },
  indigo: { block: "from-blue-400 to-indigo-500", text: "text-indigo-700", soft: "bg-blue-50" },
  amber: { block: "from-amber-400 to-orange-500", text: "text-orange-700", soft: "bg-amber-50" },
  rose: { block: "from-rose-400 to-pink-500", text: "text-rose-700", soft: "bg-rose-50" },
  violet: { block: "from-violet-400 to-purple-600", text: "text-purple-700", soft: "bg-violet-50" },
  teal: { block: "from-teal-400 to-cyan-600", text: "text-cyan-700", soft: "bg-teal-50" },
  red: { block: "from-red-400 to-rose-500", text: "text-red-700", soft: "bg-red-50" },
};

const iconMap = {
  ticket: Ticket,
  paw: PawPrint,
  truck: Truck,
  gift: Gift,
  bone: Bone,
  sparkles: Sparkles,
};

const formInputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-[#0B1F3A] outline-none transition focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100";

function toInputDate(value?: string | null) {
  return value ? value.replace(" ", "T").slice(0, 16) : "";
}

function money(value: number | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function voucherToForm(voucher: AdminVoucher): AdminVoucherPayload {
  return {
    id: voucher.id,
    code: voucher.code,
    name: voucher.name,
    description: voucher.description || "",
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    maxDiscountAmount: voucher.maxDiscountAmount ?? "",
    minOrderAmount: voucher.minOrderAmount,
    usageLimit: voucher.usageLimit ?? "",
    perCustomerLimit: voucher.perCustomerLimit ?? "",
    startsAt: toInputDate(voucher.startsAt),
    endsAt: toInputDate(voucher.endsAt),
    isActive: voucher.isActive,
    showOnHome: voucher.showOnHome,
    showInCart: voucher.showInCart,
    showInAiAdvisor: voucher.showInAiAdvisor,
    displayTitle: voucher.displayTitle || "",
    displayLabel: voucher.displayLabel || "",
    badgeText: voucher.badgeText || "",
    themeColor: voucher.themeColor || "sky",
    iconKey: voucher.iconKey || "ticket",
    sortOrder: voucher.sortOrder,
  };
}

function describeDiscount(voucher: AdminVoucher | AdminVoucherPayload) {
  const value = Number(voucher.discountValue || 0);
  if (voucher.discountType === "percent") {
    return `Giảm ${value}%${Number(voucher.maxDiscountAmount || 0) > 0 ? ` tối đa ${money(Number(voucher.maxDiscountAmount))}` : ""}`;
  }
  if (voucher.discountType === "free_shipping") return `Giảm phí ship ${money(value)}`;
  if (voucher.discountType === "gift") return "Quà tặng kèm đơn hàng";
  return `Giảm ${money(value)}`;
}

function VoucherPreview({ form, noEndDate }: { form: AdminVoucherPayload; noEndDate: boolean }) {
  const theme = themeClasses[form.themeColor] || themeClasses.sky;
  const Icon = iconMap[form.iconKey as keyof typeof iconMap] || Ticket;

  let displayTitle = form.displayTitle;
  if (!displayTitle) {
    if (form.discountType === "fixed") {
      displayTitle = form.discountValue > 0 ? `GIẢM ${Number(form.discountValue).toLocaleString("vi-VN")}đ` : "";
    } else if (form.discountType === "percent") {
      displayTitle = form.discountValue > 0 ? `GIẢM ${form.discountValue}%` : "";
    } else if (form.discountType === "free_shipping") {
      displayTitle = "FREESHIP";
    } else if (form.discountType === "gift") {
      displayTitle = "TẶNG QUÀ";
    }
  }

  let badgeText = form.badgeText;
  const now = new Date();
  const starts = form.startsAt ? new Date(form.startsAt) : null;
  const ends = (!noEndDate && form.endsAt) ? new Date(form.endsAt) : null;

  if (form.isActive === 0) {
    badgeText = "Đã tắt";
  } else if (starts && starts > now) {
    badgeText = "Sắp diễn ra";
  } else if (ends && ends < now) {
    badgeText = "Hết hạn";
  } else if (!badgeText) {
    badgeText = form.showInAiAdvisor === 1 ? "AI Voucher" : "Đang hoạt động";
  }

  let descriptionText = form.description || "";
  if (!descriptionText) {
    if (form.discountValue > 0 || form.discountType === "free_shipping" || form.discountType === "gift") {
      descriptionText = describeDiscount(form);
    } else {
      descriptionText = "Chưa nhập giá trị giảm";
    }
  }

  return (
    <div className="relative flex h-[132px] overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
      <div className={`relative flex w-[112px] shrink-0 flex-col items-center justify-center bg-gradient-to-br ${theme.block} text-white`}>
        <Icon className="h-8 w-8" />
        <span className="mt-3 text-[10px] font-black uppercase tracking-widest">
          {form.displayLabel || (form.showInAiAdvisor === 1 ? "TƯ VẤN AI" : form.showOnHome === 1 ? "HOT DEALS" : "VOUCHER")}
        </span>
      </div>
      <div className="absolute left-[104px] -top-3 h-6 w-6 rounded-full bg-[#F6FAFF]" />
      <div className="absolute left-[104px] -bottom-3 h-6 w-6 rounded-full bg-[#F6FAFF]" />
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div>
          <h3 className={`text-xl font-black ${theme.text}`}>{displayTitle || "Đang cấu hình"}</h3>
          <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">{descriptionText}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${theme.soft} ${theme.text}`}>{badgeText}</span>
          <span className="rounded-full bg-[#0B1F3A] px-4 py-2 text-xs font-black text-white">{form.code || "CODE"}</span>
        </div>
      </div>
    </div>
  );
}

export function AdminVouchersPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [stats, setStats] = useState<VoucherStats>({ total: 0, active: 0, expired: 0, used: 0 });
  const [meta, setMeta] = useState<AdminVoucherListMeta>({ page: 1, perPage: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [placement, setPlacement] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AdminVoucherPayload>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [noEndDate, setNoEndDate] = useState(false);

  const [adminRole, setAdminRole] = useState("admin");
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("admin_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminRole(user.role || "admin");
        setAdminPermissions(user.permissions || []);
      }
    } catch (e) {}
  }, []);
  const hasEditAccess = adminRole === "dev" || adminRole === "admin" || adminPermissions.includes("vouchers");

  const getError = (key: string) => {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    return errors[key] || errors[snakeKey] || "";
  };


  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminGetVouchers({ q: search, isActive: status, placement, page, perPage });
      setVouchers(res.data || []);
      setStats(res.stats || { total: 0, active: 0, expired: 0, used: 0 });
      setMeta(res.meta || { page, perPage, total: res.data?.length || 0, totalPages: 1 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = window.setTimeout(loadData, 250);
    return () => window.clearTimeout(handle);
  }, [search, status, placement, page, perPage]);

  useEffect(() => {
    setPage(1);
  }, [search, status, placement, perPage]);

  const filteredStats = useMemo(() => ({
    home: stats.home ?? vouchers.filter((item) => item.showOnHome === 1).length,
    cart: stats.cart ?? vouchers.filter((item) => item.showInCart === 1).length,
    ai: stats.ai ?? vouchers.filter((item) => item.showInAiAdvisor === 1).length,
  }), [stats.ai, stats.cart, stats.home, vouchers]);

  const openCreate = () => {
    setForm(emptyForm);
    setNoEndDate(false);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (voucher: AdminVoucher) => {
    setForm(voucherToForm(voucher));
    setNoEndDate(!voucher.endsAt);
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    // Client-side validations
    const codeVal = form.code.trim();
    if (!codeVal) {
      setErrors(prev => ({ ...prev, code: "Vui lòng nhập mã voucher." }));
      toast.error("Vui lòng nhập mã voucher.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(codeVal)) {
      setErrors(prev => ({ ...prev, code: "Mã voucher chỉ được gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới." }));
      toast.error("Mã voucher chỉ được gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.");
      return;
    }
    if (codeVal.length < 4 || codeVal.length > 30) {
      setErrors(prev => ({ ...prev, code: "Mã voucher phải từ 4 đến 30 ký tự." }));
      toast.error("Mã voucher phải từ 4 đến 30 ký tự.");
      return;
    }
    if (!form.name.trim()) {
      setErrors(prev => ({ ...prev, name: "Vui lòng nhập tên voucher." }));
      toast.error("Vui lòng nhập tên voucher.");
      return;
    }

    if (form.discountType === "percent") {
      if (form.discountValue <= 0) {
        setErrors(prev => ({ ...prev, discountValue: "Phần trăm giảm phải lớn hơn 0." }));
        toast.error("Phần trăm giảm phải lớn hơn 0.");
        return;
      }
      if (form.discountValue > 100) {
        setErrors(prev => ({ ...prev, discountValue: "Phần trăm giảm không được vượt quá 100%." }));
        toast.error("Phần trăm giảm không được vượt quá 100%.");
        return;
      }
      if (!form.maxDiscountAmount || Number(form.maxDiscountAmount) <= 0) {
        setErrors(prev => ({ ...prev, maxDiscountAmount: "Voucher giảm theo phần trăm bắt buộc có mức giảm tối đa." }));
        toast.error("Voucher giảm theo phần trăm bắt buộc có mức giảm tối đa.");
        return;
      }
    } else if (form.discountType === "fixed") {
      if (form.discountValue <= 0) {
        setErrors(prev => ({ ...prev, discountValue: "Giá trị giảm phải lớn hơn 0." }));
        toast.error("Giá trị giảm phải lớn hơn 0.");
        return;
      }
    } else if (form.discountType === "free_shipping") {
      if (!form.maxDiscountAmount || Number(form.maxDiscountAmount) <= 0) {
        setErrors(prev => ({ ...prev, maxDiscountAmount: "Voucher miễn phí vận chuyển cần có mức giảm phí vận chuyển tối đa." }));
        toast.error("Voucher miễn phí vận chuyển cần có mức giảm phí vận chuyển tối đa.");
        return;
      }
    } else if (form.discountType === "gift") {
      if (form.isActive === 1) {
        setErrors(prev => ({ ...prev, isActive: "Voucher tặng quà chưa được hỗ trợ áp dụng tự động. Vui lòng để trạng thái tắt hoặc cấu hình quà tặng." }));
        toast.error("Voucher tặng quà chưa được hỗ trợ áp dụng tự động. Vui lòng để trạng thái tắt hoặc cấu hình quà tặng.");
        return;
      }
    }

    if (!noEndDate) {
      if (!form.endsAt) {
        setErrors(prev => ({ ...prev, endsAt: "Vui lòng nhập ngày kết thúc hoặc chọn không giới hạn." }));
        toast.error("Vui lòng nhập ngày kết thúc hoặc chọn không giới hạn.");
        return;
      }
      const starts = form.startsAt ? new Date(form.startsAt) : new Date();
      const ends = new Date(form.endsAt);
      if (ends <= starts) {
        setErrors(prev => ({ ...prev, endsAt: "Ngày kết thúc phải sau ngày bắt đầu." }));
        toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
        return;
      }
    }

    if (form.usageLimit !== "" && Number(form.usageLimit) < 1) {
      setErrors(prev => ({ ...prev, usageLimit: "Tổng lượt sử dụng phải lớn hơn hoặc bằng 1." }));
      toast.error("Tổng lượt sử dụng phải lớn hơn hoặc bằng 1.");
      return;
    }
    if (form.perCustomerLimit !== "" && Number(form.perCustomerLimit) < 1) {
      setErrors(prev => ({ ...prev, perCustomerLimit: "Số lượt mỗi khách phải lớn hơn hoặc bằng 1." }));
      toast.error("Số lượt mỗi khách phải lớn hơn hoặc bằng 1.");
      return;
    }
    if (form.usageLimit !== "" && form.perCustomerLimit !== "" && Number(form.perCustomerLimit) > Number(form.usageLimit)) {
      setErrors(prev => ({ ...prev, perCustomerLimit: "Số lượt mỗi khách không được lớn hơn tổng lượt sử dụng." }));
      toast.error("Số lượt mỗi khách không được lớn hơn tổng lượt sử dụng.");
      return;
    }

    if (form.showInAiAdvisor === 1 && form.isActive === 0) {
      setErrors(prev => ({ ...prev, showInAiAdvisor: "Voucher Tư vấn AI phải được bật trạng thái hoạt động." }));
      toast.error("Voucher Tư vấn AI phải được bật trạng thái hoạt động.");
      return;
    }

    try {
      setSaving(true);
      await adminSaveVoucher({ ...form, noEndDate });
      toast.success("Đã lưu voucher");
      setModalOpen(false);
      loadData();
    } catch (error: any) {
      if (error && typeof error === "object" && "errors" in error) {
        setErrors(error.errors as Record<string, string>);
        toast.error("Vui lòng sửa các lỗi hiển thị bên dưới.");
      } else {
        toast.error(error instanceof Error ? error.message : "Không lưu được voucher");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (voucher: AdminVoucher) => {
    try {
      await adminToggleVoucherActive(voucher.id, voucher.isActive === 1 ? 0 : 1);
      toast.success(voucher.isActive === 1 ? "Đã tắt voucher" : "Đã bật voucher");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cập nhật được trạng thái");
    }
  };

  const handleDelete = async (voucher: AdminVoucher) => {
    if (!window.confirm(`Xóa voucher ${voucher.code}?`)) return;
    try {
      await adminDeleteVoucher(voucher.id);
      toast.success("Đã xóa voucher");
      if (vouchers.length === 1 && page > 1) {
        setPage((value) => Math.max(1, value - 1));
      } else {
        loadData();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được voucher");
    }
  };

  const updateForm = <K extends keyof AdminVoucherPayload>(key: K, value: AdminVoucherPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    const snakeKey = (key as string).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    setErrors((prev) => ({ ...prev, [snakeKey]: "" }));
  };

  const handleNoEndDateChange = (checked: boolean) => {
    setNoEndDate(checked);
    setErrors((prev) => ({ ...prev, endsAt: "" }));
    if (checked) {
      updateForm("endsAt", "");
    }
  };

  const startItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.perPage + 1;
  const endItem = Math.min(meta.total, meta.page * meta.perPage);

  const getPageNumbers = () => {
    const current = meta.page;
    const total = meta.totalPages;
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (current <= 3) {
      pages.push(1, 2, 3, "...", total);
    } else if (current >= total - 2) {
      pages.push(1, "...", total - 2, total - 1, total);
    } else {
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
    return pages;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6FAFF] font-inter text-[#0B1F3A]">
      <AdminSidebar activeMenu="Voucher" setActiveMenu={() => undefined} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex min-w-0 flex-col transition-all duration-300 ${collapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setCollapsed((value) => !value)} />
        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Quản trị voucher</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">Đồng bộ mã giảm giá cho trang chủ, checkout và Tư vấn AI.</p>
            </div>
            {hasEditAccess && (
              <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0057E7] px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#0047C4]">
                <Plus className="h-4 w-4" />
                Thêm voucher
              </button>
            )}
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminKpiCard title="Tổng voucher" value={String(stats.total)} change="" trend="up" iconName="gift" comparisonLabel="Tất cả chiến dịch" />
            <AdminKpiCard title="Đang hoạt động" value={String(stats.active)} change="" trend="up" iconName="check-circle" comparisonLabel="Có thể áp dụng" />
            <AdminKpiCard title="Đã dùng" value={String(stats.used)} change="" trend="up" iconName="receipt" comparisonLabel="Tổng lượt đặt hàng" />
            <AdminKpiCard title="Đang hiển thị" value={`${filteredStats.home}/${filteredStats.cart}/${filteredStats.ai}`} change="" trend="up" iconName="sparkles" comparisonLabel="Home / Cart / AI" />
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-[#DCEBFF] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm mã, tên hoặc mô tả..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm font-semibold outline-none focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0057E7]">
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Đang bật</option>
                <option value="0">Đang tắt</option>
              </select>
              <select value={placement} onChange={(event) => setPlacement(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0057E7]">
                <option value="">Tất cả nơi hiển thị</option>
                <option value="home">Trang chủ</option>
                <option value="cart">Checkout</option>
                <option value="ai">Tư vấn AI</option>
              </select>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-[#F8FBFF] text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Voucher</th>
                    <th className="px-5 py-4">Giảm giá</th>
                    <th className="px-5 py-4">Điều kiện</th>
                    <th className="px-5 py-4">Hiển thị</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center font-bold text-slate-500">Đang tải voucher...</td></tr>
                  ) : vouchers.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center font-bold text-slate-500">Chưa có voucher phù hợp.</td></tr>
                  ) : vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-black text-[#0B1F3A]">{voucher.code}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">{voucher.name}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">{describeDiscount(voucher)}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                        <div>Đơn từ {money(voucher.minOrderAmount)}</div>
                        <div>{voucher.usedCount}/{voucher.usageLimit ?? "∞"} lượt</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {voucher.showOnHome === 1 && <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-700">Home</span>}
                          {voucher.showInCart === 1 && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">Cart</span>}
                          {voucher.showInAiAdvisor === 1 && <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-700">AI</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${voucher.isActive === 1 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          {voucher.isActive === 1 ? "Đang bật" : "Đang tắt"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {hasEditAccess ? (
                            <>
                              <button onClick={() => handleToggle(voucher)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50">{voucher.isActive === 1 ? "Tắt" : "Bật"}</button>
                              <button onClick={() => openEdit(voucher)} className="rounded-lg p-2 text-[#0057E7] hover:bg-blue-50" title="Sửa"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => handleDelete(voucher)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Xóa"><Trash2 className="h-4 w-4" /></button>
                            </>
                          ) : (
                            <button onClick={() => openEdit(voucher)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50">Xem chi tiết</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-4 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="font-semibold text-slate-600">
                  Hiển thị <span className="font-bold text-[#0B1F3A]">{startItem}</span> - <span className="font-bold text-[#0B1F3A]">{endItem}</span> trong <span className="font-bold text-[#0B1F3A]">{meta.total}</span> voucher
                </span>
                <span className="h-4 w-px bg-slate-200 hidden sm:inline-block" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Số dòng:</span>
                  <select
                    value={perPage}
                    onChange={(event) => setPerPage(Number(event.target.value))}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2 py-0 text-xs font-bold text-slate-700 outline-none transition focus:border-[#0057E7] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={loading || meta.page <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0057E7] disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`dots-${idx}`} className="inline-flex h-9 w-9 items-center justify-center text-slate-400 text-xs font-bold">
                        ...
                      </span>
                    );
                  }
                  const pageNum = p as number;
                  const isCurrent = pageNum === meta.page;
                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-[#0057E7] text-white shadow-md shadow-blue-200/50"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0057E7] hover:border-slate-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))}
                  disabled={loading || meta.page >= meta.totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0057E7] disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                  title="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#F8FBFF] px-6 py-4">
              <div>
                <h2 className="text-lg font-black">{form.id ? "Cập nhật voucher" : "Thêm voucher"}</h2>
                <p className="text-xs font-semibold text-slate-500">Các thay đổi sẽ đồng bộ sang website qua API.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr_380px]">
              <fieldset disabled={!hasEditAccess} className="space-y-6">
                {/* Section 1: Thông tin mã */}
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4 bg-[#F8FBFF]/50">
                  <h3 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider border-b border-slate-100 pb-2">1. Thông tin mã</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Mã voucher">
                      <input
                        value={form.code}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
                          updateForm("code", val);
                        }}
                        className={formInputClass}
                        placeholder="BOSS15"
                      />
                      {getError("code") && <p className="mt-1 text-xs font-bold text-red-600">{getError("code")}</p>}
                    </Field>
                    <Field label="Tên nội bộ">
                      <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} className={formInputClass} placeholder="Giảm 15% cho boss" />
                      {getError("name") && <p className="mt-1 text-xs font-bold text-red-600">{getError("name")}</p>}
                    </Field>
                  </div>
                  <Field label="Mô tả / Điều kiện hiển thị ngoài website">
                    <textarea value={form.description || ""} onChange={(e) => updateForm("description", e.target.value)} className={`${formInputClass} min-h-[76px]`} placeholder="Điều kiện ngắn hiển thị ngoài website" />
                    {getError("description") && <p className="mt-1 text-xs font-bold text-red-600">{getError("description")}</p>}
                  </Field>
                </div>

                {/* Section 2: Giá trị ưu đãi */}
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4 bg-[#F8FBFF]/50">
                  <h3 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider border-b border-slate-100 pb-2">2. Giá trị ưu đãi</h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Field label="Loại giảm">
                      <select value={form.discountType} onChange={(e) => {
                        const type = e.target.value as VoucherDiscountType;
                        updateForm("discountType", type);
                        if (type === "fixed") {
                          updateForm("maxDiscountAmount", "");
                        }
                      }} className={formInputClass}>
                        <option value="fixed">Giảm tiền</option>
                        <option value="percent">Giảm %</option>
                        <option value="free_shipping">Freeship</option>
                        <option value="gift">Quà tặng</option>
                      </select>
                      {getError("discountType") && <p className="mt-1 text-xs font-bold text-red-600">{getError("discountType")}</p>}
                    </Field>
                    <Field label="Giá trị giảm">
                      <NumberInput value={form.discountValue} onChange={(value) => updateForm("discountValue", value === "" ? 0 : value)} disabled={form.discountType === "free_shipping" || form.discountType === "gift"} />
                      {getError("discountValue") && <p className="mt-1 text-xs font-bold text-red-600">{getError("discountValue")}</p>}
                    </Field>
                    <Field label="Giảm tối đa">
                      <NumberInput 
                        value={form.maxDiscountAmount || ""} 
                        onChange={(value) => updateForm("maxDiscountAmount", value || "")} 
                        disabled={form.discountType === "fixed" || form.discountType === "gift"} 
                      />
                      {getError("maxDiscountAmount") && <p className="mt-1 text-xs font-bold text-red-600">{getError("maxDiscountAmount")}</p>}
                    </Field>
                    <Field label="Đơn tối thiểu">
                      <NumberInput value={form.minOrderAmount} onChange={(value) => updateForm("minOrderAmount", value === "" ? 0 : value)} />
                      {getError("minOrderAmount") && <p className="mt-1 text-xs font-bold text-red-600">{getError("minOrderAmount")}</p>}
                    </Field>
                  </div>
                </div>

                {/* Section 3: Thời gian hiệu lực */}
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4 bg-[#F8FBFF]/50">
                  <h3 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider border-b border-slate-100 pb-2">3. Thời gian hiệu lực</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Bắt đầu">
                      <input type="datetime-local" value={form.startsAt || ""} onChange={(e) => updateForm("startsAt", e.target.value)} className={formInputClass} />
                      {getError("startsAt") && <p className="mt-1 text-xs font-bold text-red-600">{getError("startsAt")}</p>}
                    </Field>
                    <Field label="Kết thúc">
                      <input type="datetime-local" value={form.endsAt || ""} onChange={(e) => updateForm("endsAt", e.target.value)} disabled={noEndDate} className={formInputClass} />
                      {getError("endsAt") && <p className="mt-1 text-xs font-bold text-red-600">{getError("endsAt")}</p>}
                    </Field>
                    <div className="flex items-end">
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 h-[42px] w-full">
                        <input type="checkbox" checked={noEndDate} onChange={(e) => handleNoEndDateChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#0057E7]" />
                        <span className="text-xs font-black text-slate-700 font-semibold">Không giới hạn kết thúc</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 4: Giới hạn sử dụng */}
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4 bg-[#F8FBFF]/50">
                  <h3 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider border-b border-slate-100 pb-2">4. Giới hạn sử dụng</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Tổng lượt sử dụng">
                      <NumberInput value={form.usageLimit || ""} onChange={(value) => updateForm("usageLimit", value || "")} />
                      {getError("usageLimit") && <p className="mt-1 text-xs font-bold text-red-600">{getError("usageLimit")}</p>}
                    </Field>
                    <Field label="Mỗi khách">
                      <NumberInput value={form.perCustomerLimit || ""} onChange={(value) => updateForm("perCustomerLimit", value || "")} />
                      {getError("perCustomerLimit") && <p className="mt-1 text-xs font-bold text-red-600">{getError("perCustomerLimit")}</p>}
                    </Field>
                    {form.id && (
                      <Field label="Đã sử dụng (Chỉ xem)">
                        <input 
                          type="number" 
                          readOnly 
                          value={vouchers.find(v => v.id === form.id)?.usedCount || 0} 
                          className={`${formInputClass} bg-slate-50 cursor-not-allowed`} 
                        />
                      </Field>
                    )}
                  </div>
                </div>

                {/* Section 5: Vị trí hiển thị */}
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4 bg-[#F8FBFF]/50">
                  <h3 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider border-b border-slate-100 pb-2">5. Vị trí hiển thị</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Toggle label="Trang chủ" checked={form.showOnHome === 1} onChange={(checked) => updateForm("showOnHome", checked ? 1 : 0)} />
                    <Toggle label="Checkout" checked={form.showInCart === 1} onChange={(checked) => updateForm("showInCart", checked ? 1 : 0)} />
                    <Toggle label="Tư vấn AI" checked={form.showInAiAdvisor === 1} onChange={(checked) => updateForm("showInAiAdvisor", checked ? 1 : 0)} />
                  </div>
                  {form.showInAiAdvisor === 1 && (
                    <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 animate-fade-in">
                      ⚠️ Chỉ được phép bật tối đa 1 voucher cho Tư vấn AI. Khi lưu, các voucher AI khác sẽ tự động tắt.
                    </p>
                  )}
                  {getError("showInAiAdvisor") && <p className="mt-1 text-xs font-bold text-red-600">{getError("showInAiAdvisor")}</p>}
                </div>

                {/* Section 6: Giao diện thẻ voucher */}
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4 bg-[#F8FBFF]/50">
                  <h3 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider border-b border-slate-100 pb-2">6. Giao diện thẻ voucher</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Tiêu đề hiển thị">
                      <input value={form.displayTitle || ""} onChange={(e) => updateForm("displayTitle", e.target.value)} className={formInputClass} placeholder="Mặc định: Tự sinh theo loại giảm" />
                    </Field>
                    <Field label="Nhãn góc trái">
                      <input value={form.displayLabel || ""} onChange={(e) => updateForm("displayLabel", e.target.value)} className={formInputClass} placeholder="Mặc định: Tự sinh theo vị trí" />
                    </Field>
                    <Field label="Nhãn phụ (Badge)">
                      <input value={form.badgeText || ""} onChange={(e) => updateForm("badgeText", e.target.value)} className={formInputClass} placeholder="Mặc định: Tự sinh theo vị trí" />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Màu card">
                      <select value={form.themeColor} onChange={(e) => updateForm("themeColor", e.target.value)} className={formInputClass}>
                        {Object.keys(themeClasses).map((theme) => <option key={theme} value={theme}>{theme}</option>)}
                      </select>
                    </Field>
                    <Field label="Icon">
                      <select value={form.iconKey} onChange={(e) => updateForm("iconKey", e.target.value)} className={formInputClass}>
                        {Object.keys(iconMap).map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                      </select>
                    </Field>
                    <Field label="Thứ tự hiển thị">
                      <NumberInput value={form.sortOrder} onChange={(value) => updateForm("sortOrder", value === "" ? 0 : value)} />
                    </Field>
                  </div>
                </div>

                {/* Section 7: Trạng thái */}
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4 bg-[#F8FBFF]/50">
                  <h3 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider border-b border-slate-100 pb-2">7. Trạng thái hoạt động</h3>
                  <Toggle label="Kích hoạt voucher" checked={form.isActive === 1} onChange={(checked) => updateForm("isActive", checked ? 1 : 0)} />
                  {form.isActive === 0 && (
                    <p className="text-xs font-semibold text-slate-500 italic mt-1.5">
                      Voucher đang tắt nên sẽ không hiển thị ngoài website.
                    </p>
                  )}
                  {getError("isActive") && <p className="mt-1 text-xs font-bold text-red-600">{getError("isActive")}</p>}
                </div>
              </fieldset>
              <div className="space-y-4 lg:sticky lg:top-0 lg:self-start">
                <VoucherPreview form={form} noEndDate={noEndDate} />
                <div className="rounded-2xl border border-slate-100 bg-[#F8FBFF] p-4 text-sm font-semibold text-slate-600 space-y-3.5">
                  <div className="flex items-center gap-2 font-black text-[#0B1F3A] border-b border-slate-100 pb-2">
                    <CheckCircle2 className="h-4 w-4 text-[#0057E7]" />
                    Tóm tắt cấu hình
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wide text-[10px]">Ưu đãi giảm giá</span>
                      {form.discountValue <= 0 && form.discountType !== "free_shipping" && form.discountType !== "gift" ? (
                        <span className="text-red-500 font-bold">Chưa nhập giá trị giảm</span>
                      ) : (
                        <span className="text-[#0B1F3A] font-extrabold text-[13px]">{describeDiscount(form)}</span>
                      )}
                      
                      {form.discountType === "percent" && (!form.maxDiscountAmount || Number(form.maxDiscountAmount) <= 0) && (
                        <p className="text-rose-600 font-bold mt-1">⚠️ Cần nhập mức giảm tối đa</p>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wide text-[10px]">Đơn tối thiểu</span>
                      <span className="text-[#0B1F3A] font-bold">
                        {form.minOrderAmount > 0 ? money(form.minOrderAmount) : "Voucher áp dụng cho mọi đơn hàng (0đ)."}
                      </span>
                      {form.discountType === "fixed" && form.discountValue > form.minOrderAmount && form.minOrderAmount > 0 && (
                        <p className="text-amber-600 font-bold mt-1">⚠️ Giá trị giảm đang lớn hơn đơn tối thiểu. Vui lòng kiểm tra để tránh giảm quá sâu.</p>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wide text-[10px]">Thời hạn</span>
                      <span className="text-[#0B1F3A] font-bold">
                        {form.startsAt ? `Từ: ${new Date(form.startsAt).toLocaleString("vi-VN")}` : "Bắt đầu: Ngay lập tức"}
                        <br />
                        {noEndDate ? "Hạn dùng: Không giới hạn ngày kết thúc" : form.endsAt ? `Đến: ${new Date(form.endsAt).toLocaleString("vi-VN")}` : "Hạn dùng: Chưa cấu hình kết thúc"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wide text-[10px]">Giới hạn lượt dùng</span>
                      <span className="text-[#0B1F3A] font-bold">
                        Tổng lượt: {form.usageLimit ? `${form.usageLimit} lượt` : "Không giới hạn"}
                        {form.id && vouchers.find(v => v.id === form.id) && (
                          <span className="text-slate-400 font-semibold ml-1">
                            (Đã dùng: {vouchers.find(v => v.id === form.id)?.usedCount} lượt)
                          </span>
                        )}
                        <br />
                        Mỗi khách: {form.perCustomerLimit ? `Tối đa ${form.perCustomerLimit} lần` : "Không giới hạn"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wide text-[10px]">Vị trí hiển thị</span>
                      <span className="text-[#0B1F3A] font-bold">
                        {[
                          form.showOnHome ? "Trang chủ" : "",
                          form.showInCart ? "Checkout" : "",
                          form.showInAiAdvisor ? "Tư vấn AI" : "",
                        ].filter(Boolean).join(", ") || "Chưa chọn nơi hiển thị"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 bg-[#F8FBFF] px-6 py-4">
              <button onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50">Hủy</button>
              {hasEditAccess && (
                <button onClick={handleSave} disabled={saving} className="rounded-xl bg-[#0057E7] px-5 py-2.5 text-sm font-black text-white hover:bg-[#0047C4] disabled:opacity-50">
                  {saving ? "Đang lưu..." : "Lưu voucher"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: number | ""; 
  onChange: (value: number | "") => void; 
  disabled?: boolean;
}) {
  return (
    <input 
      type="number" 
      min={0} 
      value={value} 
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "" ? "" : Number(val));
      }} 
      disabled={disabled}
      className={`${formInputClass} ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : ""}`} 
    />
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#0057E7]" />
      <span className="text-sm font-black text-slate-700">{label}</span>
    </label>
  );
}

export default AdminVouchersPage;
