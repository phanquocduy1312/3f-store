import React, { useEffect, useState } from "react";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getAdminLoyaltyTransactions,
  type CustomerPointTransaction,
} from "@/src/services/loyaltyTransactionsApi";
import { useToast } from "@/components/ui/toast-notification";

const typeLabels: Record<CustomerPointTransaction["type"], string> = {
  earn_shopee_order: "Cộng điểm Shopee",
  spend_reward: "Đổi quà",
  refund_reward: "Hoàn điểm",
  adjust_manual: "Điều chỉnh thủ công",
};

const typeColors: Record<CustomerPointTransaction["type"], string> = {
  earn_shopee_order: "text-green-600 bg-green-50 border-green-100",
  spend_reward: "text-red-500 bg-red-50 border-red-100",
  refund_reward: "text-blue-600 bg-blue-50 border-blue-100",
  adjust_manual: "text-purple-600 bg-purple-50 border-purple-100",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export function LoyaltyTransactionsSection() {
  const [transactions, setTransactions] = useState<CustomerPointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchPhone, typeFilter, dateFrom, dateTo]);

  const { toast } = useToast();

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminLoyaltyTransactions({
        phone: searchPhone || undefined,
        type: typeFilter === "all" ? undefined : typeFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setTransactions(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải lịch sử điểm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, dateFrom, dateTo]);

  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchTransactions();
          }}
          className="relative flex-1 max-w-md"
        >
          <input
            type="text"
            placeholder="Tìm theo số điện thoại khách hàng..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full rounded-2xl border border-[#DCEBFF] bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold text-[#0B1F3A] placeholder-[#94A3B8] focus:border-[#0057E7] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-[#94A3B8]" />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#64748B]">Từ:</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-2xl border border-[#DCEBFF] bg-white px-3 py-2 text-[12px] font-bold text-[#0B1F3A] focus:outline-none" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#64748B]">Đến:</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-2xl border border-[#DCEBFF] bg-white px-3 py-2 text-[12px] font-bold text-[#0B1F3A] focus:outline-none" />
          </div>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-2xl border border-[#DCEBFF] bg-white px-4 py-2 text-[13px] font-bold text-[#0B1F3A] focus:outline-none">
            <option value="all">Tất cả giao dịch</option>
            {Object.entries(typeLabels).map(([key, val]) => (
              <option key={key} value={key}>{val}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.05)] overflow-hidden">
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-left text-[13px] text-[#0B1F3A]">
            <thead className="bg-[#F8FBFF] text-[11px] font-black uppercase tracking-[0.04em] text-[#64748B] border-b border-[#EEF6FF]">
              <tr>
                <th className="w-[150px] px-6 py-3">Thời gian</th>
                <th className="w-[140px] px-4 py-3">SĐT Khách hàng</th>
                <th className="w-[160px] px-4 py-3">Loại giao dịch</th>
                <th className="w-[110px] px-4 py-3">Điểm</th>
                <th className="w-[110px] px-4 py-3">Số dư sau</th>
                <th className="w-[140px] px-4 py-3">Tham chiếu</th>
                <th className="w-[200px] px-6 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF6FF]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-[#0057E7]" />
                      <span>Đang tải lịch sử điểm...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#64748B]">Chưa có giao dịch điểm nào được ghi nhận.</td>
                </tr>
              ) : paginatedTransactions.map((trans) => {
                const pointsFormatted = trans.points > 0 ? `+${trans.points}` : `${trans.points}`;
                const pointsClass = trans.points > 0 ? "text-green-600" : "text-red-500";

                return (
                  <tr key={trans.id} className="hover:bg-[#F8FBFF]/50 transition h-14">
                    <td className="px-6 py-3 font-semibold text-[#64748B]">{formatDateTime(trans.created_at)}</td>
                    <td className="px-4 py-3 font-bold">{trans.customer_phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${typeColors[trans.type]}`}>
                        {typeLabels[trans.type] || trans.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-black ${pointsClass}`}>{pointsFormatted} điểm</td>
                    <td className="px-4 py-3 font-bold text-[#0B1F3A]">{trans.balance_after !== null ? `${trans.balance_after} điểm` : "N/A"}</td>
                    <td className="px-4 py-3 text-[#64748B] text-[12px] truncate">{trans.reference_type ? `${trans.reference_type} #${trans.reference_id}` : "N/A"}</td>
                    <td className="px-6 py-3 text-[#64748B] font-semibold truncate" title={trans.note || ""}>{trans.note || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="px-6 py-4 border-t border-[#DCEBFF] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8FBFF]/50">
            <span className="text-[11px] font-semibold text-[#64748B]">
              Hiển thị <span className="text-slate-700">{startIndex + 1}</span>–
              <span className="text-slate-700">{endIndex}</span> trong tổng số{" "}
              <span className="text-slate-700">{totalItems}</span> giao dịch
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="h-8 w-8 rounded-lg border border-[#DCEBFF] flex items-center justify-center text-[#64748B] hover:bg-white hover:text-[#0B1F3A] disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm bg-white"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                if (totalPages > 5 && Math.abs(pageNum - activePage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 min-w-8 px-2 rounded-lg text-xs font-bold transition shadow-sm ${
                      activePage === pageNum
                        ? "bg-[#0B1F3A] text-white border border-[#0B1F3A]"
                        : "border border-[#DCEBFF] text-[#64748B] hover:bg-white hover:text-[#0B1F3A] bg-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="h-8 w-8 rounded-lg border border-[#DCEBFF] flex items-center justify-center text-[#64748B] hover:bg-white hover:text-[#0B1F3A] disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm bg-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
