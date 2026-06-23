import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PawPrint,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminPetAdvisorConsultations } from "@/src/api/adminPetAdvisorApi";
import {
  ConsultationRecord,
  formatMoney,
} from "@/src/utils/pet-advisor-helpers";
import { KpiCard } from "@/src/components/admin/pet-advisor-cards";
import { PetAdvisorConsultationCard } from "@/src/components/admin/pet-advisor-consultation-card";

export function AdminPetAdvisorPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState<"all" | "cat" | "dog" | "other">("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Grid layout usually looks better with multiples of 3 or 4
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [stats, setStats] = useState<any>({});
  const [totalPages, setTotalPages] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAdminPetAdvisorConsultations({ page, limit, q: query, species });
      setRecords(res.items || []);
      setTotal(res.total || 0);
      setCustomers(res.customers || 0);
      setStats(res.stats || {});
      setTotalPages(res.totalPages || 1);
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi tải AI Pet Advisor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchValue);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    loadData();
  }, [page, limit, query, species]);

  return (
    <div className="relative min-h-screen bg-[#F6FAFF] font-sans">
      <AdminSidebar activeMenu="AI Pet Advisor" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />
      {!sidebarCollapsed && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      <div className={`flex min-h-screen min-w-0 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} searchValue={searchValue} onSearchChange={setSearchValue} />

        <main className="flex-1 space-y-5 p-4 sm:p-6">
          {/* Header Action Bar */}
          <section className="rounded-3xl border border-[#DCEBFF] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF6FF] px-3 py-1 text-xs font-black text-[#0057E7]">
                  <Sparkles className="h-4 w-4" />
                  AI Pet Advisor
                </div>
                <h1 className="mt-3 text-2xl font-black text-[#0B1F3A]">Lịch sử tư vấn AI của khách hàng</h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Tổng hợp tất cả lượt tư vấn, trường khách đã nhập, nhu cầu, ngân sách và kết luận AI để sale chăm sóc tiếp.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={species}
                  onChange={e => {
                    setSpecies(e.target.value as any);
                    setPage(1);
                  }}
                  className="h-11 rounded-xl border border-[#DCEBFF] bg-white px-4 text-sm font-bold text-[#0B1F3A] outline-none shadow-sm"
                >
                  <option value="all">Tất cả loài</option>
                  <option value="cat">Mèo</option>
                  <option value="dog">Chó</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
          </section>

          {/* KPI Dashboard Cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard icon={<Sparkles className="h-5 w-5" />} label="Tổng tư vấn" value={total.toLocaleString("vi-VN")} />
            <KpiCard icon={<Users className="h-5 w-5" />} label="Khách đã dùng" value={customers.toLocaleString("vi-VN")} tone="green" />
            <KpiCard icon={<PawPrint className="h-5 w-5" />} label="Mèo / Chó" value={`${stats?.species?.cat || 0} / ${stats?.species?.dog || 0}`} tone="amber" />
            <KpiCard icon={<AlertTriangle className="h-5 w-5" />} label="Có cảnh báo" value={stats?.warningCount || 0} tone="red" />
            <KpiCard icon={<BadgeDollarSign className="h-5 w-5" />} label="Ngân sách TB" value={formatMoney(stats?.averageMonthlyBudget)} tone="slate" />
          </section>

          {/* Main Full-Width Consultation Grid */}
          <section className="rounded-3xl border border-[#DCEBFF] bg-white p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
              <div>
                <h2 className="text-lg font-black text-[#0B1F3A] uppercase tracking-wide">Danh sách lượt tư vấn AI</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">Hiển thị {records.length} trên {total} lượt tư vấn</p>
              </div>
              <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-xs font-black text-[#0057E7]">
                Trang {page} / {totalPages}
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-60 items-center justify-center text-slate-500">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#0057E7]" />
                Đang tải dữ liệu...
              </div>
            ) : records.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF] p-12 text-center text-sm font-bold text-slate-400">
                Chưa có lượt tư vấn phù hợp với bộ lọc tìm kiếm.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {records.map(record => (
                  <PetAdvisorConsultationCard key={record.id} record={record} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-[#DCEBFF] pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#DCEBFF] bg-white px-4 text-xs font-black text-[#0B1F3A] hover:bg-[#F6FAFF] disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                Trang trước
              </button>
              <span className="text-xs font-bold text-slate-500">Trang {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#DCEBFF] bg-white px-4 text-xs font-black text-[#0B1F3A] hover:bg-[#F6FAFF] disabled:opacity-40 transition"
              >
                Trang sau
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
