import { AlertTriangle, Eye, Loader2, MoreHorizontal, RefreshCcw } from "lucide-react";
import {
  formatCurrency,
  formatRelativeTime,
  getRequestAmountForPoints,
} from "@/lib/shopee-requests";
import { cn } from "@/lib/utils";
import type { ShopeePointRequest } from "@/types/shopee";
import { ShopeeApiBadge } from "./ShopeeApiBadge";
import { ShopeeStatusBadge } from "./ShopeeStatusBadge";

interface ShopeeRequestTableProps {
  requests: ShopeePointRequest[];
  selectedId?: string;
  duplicatedCodes: string[];
  page: number;
  totalPages: number;
  totalItems: number;
  selectedIds: Set<string>;
  verifyingIds: Set<string>;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onVerifySingle: (id: string) => void;
}

export function ShopeeRequestTable({
  requests,
  selectedId,
  duplicatedCodes,
  page,
  totalPages,
  totalItems,
  selectedIds,
  verifyingIds,
  onSelect,
  onPageChange,
  onToggleSelect,
  onToggleSelectAll,
  onVerifySingle,
}: ShopeeRequestTableProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * 10 + 1;
  const end = Math.min(page * 10, totalItems);

  const allChecked = requests.length > 0 && requests.every((r) => selectedIds.has(r.id));

  return (
    <section className="min-w-0 overflow-hidden rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.06)]">
      {requests.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <h3 className="text-[18px] font-black text-[#0B1F3A]">Không tìm thấy yêu cầu phù hợp</h3>
          <p className="mt-2 text-[14px] text-[#64748B]">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <>
          <div className="admin-scrollbar overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed">
              <thead className="bg-[#F8FBFF] text-left text-[11px] font-black uppercase tracking-[0.04em] text-[#64748B]">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={onToggleSelectAll}
                      className="h-4 w-4 rounded border-[#DCEBFF]"
                    />
                  </th>
                  <th className="w-[170px] px-4 py-3">Mã đơn</th>
                  <th className="w-[180px] px-4 py-3">Khách hàng</th>
                  <th className="w-[130px] px-4 py-3">Khách nhập</th>
                  <th className="w-[140px] px-4 py-3">Shopee API</th>
                  <th className="w-[70px] px-4 py-3">Điểm</th>
                  <th className="w-[140px] px-4 py-3">Đối chiếu</th>
                  <th className="w-[110px] px-4 py-3">Trạng thái</th>
                  <th className="w-[140px] px-3 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const isSelected = selectedId === request.id;
                  const isDuplicate = duplicatedCodes.includes(request.shopeeOrderCode);
                  const isVerifying = verifyingIds.has(request.id);
                  const canVerify =
                    request.processingStatus !== "approved" &&
                    request.processingStatus !== "rejected";

                  return (
                    <tr
                      key={request.id}
                      onClick={() => onSelect(request.id)}
                      className={cn(
                        "h-[72px] cursor-pointer border-b border-[#EEF6FF] text-[13px] text-[#0B1F3A] transition hover:bg-[#F8FBFF]",
                        isSelected && "bg-[#F6FAFF] ring-1 ring-inset ring-[#BFD7FF]",
                      )}
                    >
                      <td className="px-3 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(request.id)}
                          onChange={() => onToggleSelect(request.id)}
                          className="h-4 w-4 rounded border-[#DCEBFF]"
                        />
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2 font-black text-[#082B5F]">
                          <span className="line-clamp-1">#{request.shopeeOrderCode}</span>
                          {isDuplicate && <AlertTriangle className="h-4 w-4 shrink-0 text-[#F59E0B]" />}
                        </div>
                        <p className="mt-1 text-[12px] font-medium text-[#94A3B8]">
                          {formatRelativeTime(request.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="line-clamp-2 font-bold">{request.customerName || "Khách chưa rõ tên"}</p>
                          {request.source === "guest" && (
                            <span className="inline-block rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 uppercase tracking-wide">Guest</span>
                          )}
                        </div>
                        <p className="mt-1 text-[12px] text-[#64748B]">{request.phone}</p>
                      </td>
                      <td className="px-4 py-3 align-middle font-bold">{formatCurrency(request.customerInputAmount)}</td>
                      <td className="px-4 py-3 align-middle">
                        <p className="font-bold">{request.apiOrderAmount ? formatCurrency(request.apiOrderAmount) : "-"}</p>
                        <p
                          className={cn(
                            "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold",
                            request.apiOrderStatus === "COMPLETED" && "bg-green-50 text-green-600",
                            request.apiOrderStatus === "SHIPPED" && "bg-blue-50 text-blue-600",
                            request.apiOrderStatus === "TO_CONFIRM_RECEIVE" && "bg-amber-50 text-amber-600",
                            (request.apiOrderStatus === "CANCELLED" ||
                              request.apiOrderStatus === "RETURNED" ||
                              request.apiOrderStatus === "NOT_FOUND") &&
                              "bg-red-50 text-red-600",
                          )}
                        >
                          {request.apiOrderStatus || "NOT_CHECKED"}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-middle font-bold text-[#082B5F]">
                        {getRequestAmountForPoints(request) ? request.expectedPoints : 0}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col gap-1 items-start">
                          <ShopeeApiBadge status={request.verificationStatus || request.apiCheckStatus} compact />
                          {request.processingStatus === "approved" && (request.verificationStatus || request.apiCheckStatus) !== "valid" && (
                            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 whitespace-nowrap">
                              ⚠ Đã duyệt thủ công
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <ShopeeStatusBadge status={request.processingStatus || request.status} />
                      </td>
                      <td className="px-3 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {canVerify && (
                            <button
                              type="button"
                              disabled={isVerifying}
                              onClick={() => onVerifySingle(request.id)}
                              className={cn(
                                "inline-flex h-8 items-center gap-1.5 rounded-xl border px-2.5 text-[11px] font-bold transition",
                                isVerifying
                                  ? "cursor-not-allowed border-[#DCEBFF] bg-[#F6FAFF] text-[#94A3B8]"
                                  : "border-[#BFD7FF] bg-white text-[#0057E7] hover:bg-[#EEF6FF]",
                              )}
                            >
                              {isVerifying ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Đang đối chiếu...
                                </>
                              ) : (
                                <>
                                  <RefreshCcw className="h-3.5 w-3.5" />
                                  Đối chiếu
                                </>
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelect(request.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#DCEBFF] text-[#64748B] transition hover:bg-[#F6FAFF] hover:text-[#0057E7]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#EEF6FF] px-5 py-4 text-[13px] text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Hiển thị {start} - {end} / {totalItems} kết quả
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCEBFF] bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border text-[13px] font-bold",
                    page === pageNumber
                      ? "border-[#0057E7] bg-[#EEF6FF] text-[#0057E7]"
                      : "border-transparent text-[#64748B] hover:border-[#DCEBFF] hover:bg-white",
                  )}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCEBFF] bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
