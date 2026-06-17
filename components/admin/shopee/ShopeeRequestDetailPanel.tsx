import { AlertTriangle, CheckCircle2, CircleDashed, ExternalLink, RefreshCcw, X } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  isTerminalStatus,
} from "@/lib/shopee-requests";
import { cn } from "@/lib/utils";
import type React from "react";
import type { ShopeePointRequest } from "@/types/shopee";
import { useState } from "react";
import { ShopeeApiBadge } from "./ShopeeApiBadge";
import { ShopeeStatusBadge } from "./ShopeeStatusBadge";
import { buildImageUrl } from "@/src/config/api";
interface ShopeeRequestDetailPanelProps {
  request?: ShopeePointRequest;
  duplicatedCodes: string[];
  mode?: "panel" | "drawer";
  onClearSelection: () => void;
  onRequireMoreInfo: () => void;
  onReject: () => void;
  onApprove: () => void;
  onReconcile: () => void;
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[#DCEBFF] bg-white p-4">
      <h3 className="text-[14px] font-black text-[#0B1F3A]">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfoPair({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" | "danger" }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border border-[#EEF6FF] bg-[#F8FBFF] px-3 py-2.5",
        tone === "warning" && "border-orange-200 bg-orange-50",
        tone === "danger" && "border-red-200 bg-red-50",
      )}
    >
      <p className="text-[11px] font-bold uppercase text-[#64748B]">{label}</p>
      <p className="mt-1 break-words text-[13px] font-black text-[#0B1F3A]">{value}</p>
    </div>
  );
}

function CheckRow({
  label,
  state,
}: {
  label: string;
  state: "pass" | "warning" | "fail" | "unknown";
}) {
  const colorClass =
    state === "pass"
      ? "text-[#16A34A]"
      : state === "warning"
        ? "text-[#F59E0B]"
        : state === "fail"
          ? "text-[#EF3340]"
          : "text-[#94A3B8]";
  const Icon = state === "pass" ? CheckCircle2 : state === "unknown" ? CircleDashed : AlertTriangle;

  return (
    <div className="flex min-h-10 items-center gap-3 rounded-2xl border border-[#EEF6FF] bg-[#F8FBFF] px-3 py-2">
      <Icon className={`h-4 w-4 shrink-0 ${colorClass}`} />
      <span className="text-[13px] font-semibold text-[#0B1F3A]">{label}</span>
    </div>
  );
}

export function ShopeeRequestDetailPanel({
  request,
  duplicatedCodes,
  mode = "panel",
  onClearSelection,
  onRequireMoreInfo,
  onReject,
  onApprove,
  onReconcile,
}: ShopeeRequestDetailPanelProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!request) {
    return (
      <section className="hidden min-h-[420px] items-center justify-center rounded-[24px] border border-[#DCEBFF] bg-white p-8 text-center shadow-[0_8px_24px_rgba(6,43,95,0.06)] 2xl:flex">
        <div>
          <h3 className="text-[20px] font-black text-[#0B1F3A]">Chọn một yêu cầu để xem chi tiết</h3>
          <p className="mt-2 text-[14px] text-[#64748B]">Thông tin xử lý sẽ hiển thị ở panel bên phải.</p>
        </div>
      </section>
    );
  }

  const isDuplicate = duplicatedCodes.includes(request.shopeeOrderCode);
  const disabledActions = isTerminalStatus(request.status);
  const amountMismatch = request.apiChecked && request.apiOrderAmount !== undefined && request.apiOrderAmount !== request.customerInputAmount;
  const apiNotFound = request.apiCheckStatus === "not_found";
  const shellClass =
    mode === "drawer"
      ? "fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-[#DCEBFF] bg-white shadow-2xl sm:w-[520px]"
      : "sticky top-[92px] hidden h-[calc(100vh-116px)] flex-col overflow-hidden rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.06)] 2xl:flex";

  return (
    <>
      <section className={shellClass}>
        <div className="shrink-0 border-b border-[#DCEBFF] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[20px] font-black text-[#0B1F3A]">Chi tiết yêu cầu</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-black text-[#082B5F]">#{request.shopeeOrderCode}</p>
                <ShopeeStatusBadge status={request.status} />
              </div>
            </div>
            <button
              type="button"
              onClick={onClearSelection}
              className="rounded-xl p-2 text-[#64748B] transition hover:bg-[#F6FAFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="admin-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F8FBFF] px-5 py-4">
          <DetailCard title="Tổng quan xử lý">
            <div className="grid grid-cols-2 gap-3">
              <InfoPair label="Trạng thái" value={request.status.replaceAll("_", " ")} />
              <InfoPair label="Điểm dự kiến" value={`${request.expectedPoints}`} />
              <InfoPair label="Tạo lúc" value={formatDateTime(request.createdAt)} />
              <InfoPair label="Cập nhật" value={formatDateTime(request.updatedAt || request.createdAt)} />
            </div>
          </DetailCard>

          <DetailCard title="Khách hàng">
            <div className="space-y-2 text-[13px] font-semibold text-[#0B1F3A]">
              <p className="text-[16px] font-black">{request.customerName || "Khách chưa rõ tên"}</p>
              <p>{request.phone}</p>
              <p className="break-words text-[#64748B]">{request.email || "Chưa cập nhật email"}</p>
              <p>{request.isExistingCustomer ? "Đã có trong CRM" : "Khách mới"}</p>
              <p className="text-[#64748B]">
                {request.memberTier || "Silver"} · {formatNumber(request.currentPoints || 0)} điểm
              </p>
            </div>
            <button type="button" className="mt-3 inline-flex items-center gap-2 text-[13px] font-bold text-[#0057E7]">
              Xem hồ sơ CRM <ExternalLink className="h-4 w-4" />
            </button>
          </DetailCard>

          <DetailCard title="So sánh đơn">
            <div className="grid grid-cols-2 gap-3">
              <InfoPair label="Khách nhập" value={formatCurrency(request.customerInputAmount)} tone={amountMismatch ? "warning" : "default"} />
              <InfoPair label="Shopee API" value={formatCurrency(request.apiOrderAmount)} tone={apiNotFound ? "danger" : amountMismatch ? "warning" : "default"} />
              <InfoPair label="Trạng thái đơn" value={request.apiOrderStatus || "Chưa đối chiếu"} tone={apiNotFound ? "danger" : "default"} />
              <InfoPair label="Điểm dự kiến" value={`${request.expectedPoints}`} />
            </div>
          </DetailCard>

          <DetailCard title="Ảnh đơn">
            <div className="h-[120px] overflow-hidden rounded-2xl border border-[#DCEBFF] bg-[#F6FAFF]">
              {request.orderImageUrl ? (
                <img src={buildImageUrl(request.orderImageUrl)} alt={`Đơn Shopee ${request.shopeeOrderCode}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] font-semibold text-[#94A3B8]">Chưa có ảnh đơn</div>
              )}
            </div>
            <button
              type="button"
              disabled={!request.orderImageUrl}
              onClick={() => request.orderImageUrl && setPreviewImage(buildImageUrl(request.orderImageUrl))}
              className="mt-3 inline-flex items-center gap-2 text-[13px] font-bold text-[#0057E7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Xem ảnh lớn <ExternalLink className="h-4 w-4" />
            </button>
          </DetailCard>

          <DetailCard title="Shopee API">
            {request.apiChecked ? (
              <div className="grid grid-cols-2 gap-3">
                <InfoPair label="Trạng thái" value={request.apiOrderStatus || "-"} />
                <InfoPair label="Tổng tiền API" value={formatCurrency(request.apiOrderAmount)} />
                <InfoPair label="Ngày tạo" value={formatDateTime(request.apiCreateTime)} />
                <InfoPair label="Ngày hoàn tất" value={formatDateTime(request.apiCompleteTime)} />
                <InfoPair label="Shop ID" value={request.apiShopId || "-"} />
                <InfoPair label="Buyer ID" value={request.apiBuyerId || "-"} />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F8FBFF] p-4">
                <p className="text-[14px] font-black text-[#0B1F3A]">Chưa đối chiếu API</p>
                <button
                  type="button"
                  onClick={onReconcile}
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-[12px] font-bold text-[#0057E7]"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Đối chiếu lại API
                </button>
              </div>
            )}
          </DetailCard>

          <DetailCard title="Checklist đối chiếu">
            <div className="mb-3 flex items-center justify-between gap-3">
              <ShopeeApiBadge status={request.apiCheckStatus} />
              <button type="button" onClick={onReconcile} className="text-[12px] font-bold text-[#0057E7]">
                Đối chiếu lại API
              </button>
            </div>
            <div className="grid gap-2">
              <CheckRow label="Mã đơn tồn tại trên Shopee" state={request.apiCheckStatus === "not_found" ? "fail" : request.apiChecked ? "pass" : "unknown"} />
              <CheckRow label="Đơn thuộc shop 3F Store" state={request.apiCheckStatus === "not_found" ? "unknown" : "pass"} />
              <CheckRow label="Đơn đã hoàn tất" state={request.apiOrderStatus === "COMPLETED" ? "pass" : request.apiOrderStatus === "SHIPPED" ? "warning" : "fail"} />
              <CheckRow label="Tổng tiền khớp" state={request.apiCheckStatus === "mismatch" ? "fail" : request.apiChecked ? "pass" : "unknown"} />
              <CheckRow label="Mã đơn chưa từng cộng điểm" state={isDuplicate || request.status === "duplicate" ? "warning" : "pass"} />
            </div>

            {isDuplicate && (
              <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-[13px] font-semibold text-orange-700">
                Mã đơn này đã xuất hiện trong hệ thống. Vui lòng kiểm tra trước khi duyệt.
              </div>
            )}

            {!!request.verificationIssues?.length && (
              <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-[13px] text-orange-700">
                <p className="font-black">Cần kiểm tra:</p>
                {request.verificationIssues.map((issue) => (
                  <p key={issue} className="mt-1">- {issue}</p>
                ))}
              </div>
            )}
          </DetailCard>
        </div>

        <div className="shrink-0 border-t border-[#DCEBFF] bg-white px-5 py-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={disabledActions}
              onClick={onReject}
              className="h-11 rounded-2xl border border-red-200 bg-red-50 px-5 text-[14px] font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Từ chối
            </button>
            <button
              type="button"
              disabled={disabledActions}
              onClick={onApprove}
              className="h-11 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white transition hover:bg-[#003B7A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Duyệt & cộng điểm
            </button>
          </div>
          {disabledActions && (
            <p className="mt-2 text-[12px] font-semibold text-[#64748B]">Yêu cầu này đã được xử lý.</p>
          )}
        </div>
      </section>

      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#082B5F]/50 p-4 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="relative max-h-[80vh] w-full max-w-[800px] overflow-hidden rounded-[24px] bg-white p-3" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 text-[#0B1F3A] shadow"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={previewImage} alt="Ảnh đơn Shopee" className="max-h-[calc(80vh-24px)] w-full rounded-[18px] object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
