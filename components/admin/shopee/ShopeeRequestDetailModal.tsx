import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  X,
  XCircle,
  ImageOff,
} from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  isTerminalStatus,
} from "@/lib/shopee-requests";
import { cn } from "@/lib/utils";
import type { ShopeePointRequest } from "@/types/shopee";
import { ShopeeApiBadge } from "./ShopeeApiBadge";
import { ShopeeStatusBadge } from "./ShopeeStatusBadge";
import { buildImageUrl } from "@/src/config/api";

interface ShopeeRequestDetailModalProps {
  request?: ShopeePointRequest;
  duplicatedCodes: string[];
  open: boolean;
  isVerifying?: boolean;
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  onReconcile: () => void;
}

function DetailCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-[#DCEBFF] bg-white p-5 shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[18px] font-black text-[#0B1F3A]">{title}</h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#DCEBFF] bg-[#F6FAFF] p-4">
      <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-[#64748B]">{label}</p>
      <p className="mt-2 text-[15px] font-black text-[#0B1F3A]">{value}</p>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-[#64748B]">{label}</p>
      <p className="mt-1 text-[16px] font-black text-[#0B1F3A] break-words">{value}</p>
    </div>
  );
}

function ComparisonRow({
  label,
  leftValue,
  rightValue,
  tone = "default",
}: {
  label: string;
  leftValue: string;
  rightValue: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#DCEBFF] bg-[#F6FAFF] p-4",
        tone === "success" && "border-green-200 bg-green-50",
        tone === "warning" && "border-orange-200 bg-orange-50",
        tone === "danger" && "border-red-200 bg-red-50",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[13px] font-black text-[#0B1F3A]">{label}</p>
        <span
          className={cn(
            "text-[12px] font-bold",
            tone === "success" && "text-green-700",
            tone === "warning" && "text-orange-700",
            tone === "danger" && "text-red-700",
            tone === "default" && "text-[#64748B]",
          )}
        >
          {tone === "success" && "Khớp dữ liệu"}
          {tone === "warning" && "Cần kiểm tra"}
          {tone === "danger" && "Không hợp lệ"}
          {tone === "default" && "Đối chiếu thông tin"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Khách nhập</p>
          <p className="mt-1 text-[20px] font-black text-[#0B1F3A]">{leftValue}</p>
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Shopee API</p>
          <p className="mt-1 text-[20px] font-black text-[#0B1F3A]">{rightValue}</p>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({
  label,
  state,
}: {
  label: string;
  state: "pass" | "warning" | "fail" | "unknown";
}) {
  const Icon =
    state === "pass"
      ? CheckCircle2
      : state === "warning"
        ? AlertTriangle
        : state === "fail"
          ? XCircle
          : CircleDashed;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-3">
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          state === "pass" && "text-[#16A34A]",
          state === "warning" && "text-[#F59E0B]",
          state === "fail" && "text-[#EF3340]",
          state === "unknown" && "text-[#94A3B8]",
        )}
      />
      <span className="text-[14px] font-semibold text-[#0B1F3A]">{label}</span>
    </div>
  );
}

export function ShopeeRequestDetailModal({
  request,
  duplicatedCodes,
  open,
  isVerifying = false,
  onClose,
  onReject,
  onApprove,
  onReconcile,
}: ShopeeRequestDetailModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

  const timeline = useMemo(() => {
    if (!request) {
      return [];
    }

    const items = [
      {
        key: "created",
        title: "Khách gửi yêu cầu",
        time: formatDateTime(request.createdAt),
        description: `Tạo yêu cầu tích điểm cho đơn #${request.shopeeOrderCode}.`,
      },
    ];

    const processingStatus = request.processingStatus || request.status;
    const verificationStatus = request.verificationStatus || request.apiCheckStatus;

    if (request.apiChecked) {
      items.push({
        key: "api",
        title: "Hệ thống đối chiếu API",
        time: formatDateTime(request.updatedAt || request.createdAt),
        description:
          verificationStatus === "valid"
            ? "Shopee API trả về dữ liệu hợp lệ."
            : verificationStatus === "not_found"
              ? "Không tìm thấy đơn trên Shopee API."
              : "Đơn cần admin kiểm tra thêm trước khi xử lý.",
      });
    }

    if (processingStatus === "approved") {
      items.push({
        key: "approved",
        title: "Admin duyệt & cộng điểm",
        time: formatDateTime(request.approvedAt || request.updatedAt || request.createdAt),
        description: `${request.approvedBy || "Admin 3F"} đã duyệt ${request.approvedPoints || request.expectedPoints} điểm.`,
      });
    }

    if (processingStatus === "rejected") {
      items.push({
        key: "rejected",
        title: "Admin từ chối yêu cầu",
        time: formatDateTime(request.updatedAt || request.createdAt),
        description: request.rejectedReason || "Yêu cầu đã bị từ chối.",
      });
    }

    return items;
  }, [request]);

  if (!open || !request) {
    return null;
  }

  const processingStatus = request.processingStatus || request.status;
  const verificationStatus = request.verificationStatus || request.apiCheckStatus;

  const isDuplicate = duplicatedCodes.includes(request.shopeeOrderCode) || verificationStatus === "duplicate";
  const isPending = processingStatus === "pending";
  const isApproved = processingStatus === "approved";
  const isRejected = processingStatus === "rejected";
  const disabledActions = isApproved || isRejected;

  // Amount mismatch: use real numbers if available
  const shopeeAmount = request.apiOrderAmount;
  const inputAmount = request.customerInputAmount;
  const amountMismatch =
    verificationStatus === "mismatch" ||
    (typeof shopeeAmount === "number" && typeof inputAmount === "number" && shopeeAmount !== inputAmount);
  const amountDiff = typeof shopeeAmount === "number" && typeof inputAmount === "number"
    ? Math.abs(shopeeAmount - inputAmount) : 0;

  const apiNotFound = verificationStatus === "not_found";
  const isInvalidStatus = verificationStatus === "invalid_order_status";
  // Approved manually = approved but verificationStatus was not valid at approval time
  const approvedManually = isApproved && verificationStatus !== "valid";

  // Build comparison tone and message
  let compareTone: "default" | "success" | "warning" | "danger" = "default";
  let compareReasons: string[] = [];

  if (apiNotFound) {
    compareTone = "danger";
    compareReasons.push("Không tìm thấy mã đơn trên Shopee API.");
  }
  if (isDuplicate) {
    compareTone = "danger";
    compareReasons.push("Mã đơn đã xuất hiện trong hệ thống.");
  }
  if (isInvalidStatus && amountMismatch && !apiNotFound) {
    compareTone = "warning";
    compareReasons.push("Đơn chưa hoàn tất và tổng tiền không khớp Shopee API.");
  } else {
    if (isInvalidStatus) {
      compareTone = compareTone === "default" ? "warning" : compareTone;
      compareReasons.push("Đơn Shopee chưa hoàn tất.");
    }
    if (amountMismatch && !apiNotFound) {
      compareTone = compareTone === "default" ? "warning" : compareTone;
      compareReasons.push("Tổng tiền khách nhập không khớp với Shopee API.");
    }
  }
  if (verificationStatus === "valid" && compareTone === "default") {
    compareTone = "success";
  }

  let compareMessage: React.ReactNode;
  if (compareTone === "success") {
    compareMessage = (
      <>
        <span className="block mb-1 font-bold">Đề xuất xử lý: Có thể duyệt</span>
        <span className="font-normal">Lý do: Mã đơn tồn tại, đơn thuộc shop 3F, tổng tiền khớp, chưa từng cộng điểm.</span>
      </>
    );
  } else if (compareTone === "danger") {
    compareMessage = (
      <>
        <span className="block mb-1 font-bold">Đề xuất xử lý: Từ chối</span>
        <span className="font-normal">Lý do: {compareReasons.join(" ")}</span>
      </>
    );
  } else if (compareTone === "warning") {
    compareMessage = (
      <>
        <span className="block mb-1 font-bold">Đề xuất xử lý: Kiểm tra thủ công</span>
        <span className="font-normal">Lý do: {compareReasons.join(" ")}</span>
      </>
    );
  } else {
    compareMessage = (
      <>
        <span className="block mb-1 font-bold">Đề xuất xử lý: Đối chiếu thông tin</span>
        <span className="font-normal">Lý do: Đang tiến hành kiểm tra hoặc chưa rõ kết quả từ API.</span>
      </>
    );
  }

  const footerMessage =
    isApproved
      ? "Yêu cầu này đã được duyệt và cộng điểm."
      : isRejected
        ? "Yêu cầu này đã bị từ chối."
        : "Điểm chỉ được cộng sau khi yêu cầu được duyệt.";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#0B1F3A]/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="fixed left-1/2 top-1/2 z-50 flex h-full w-full max-h-none -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-none bg-white border-[#DCEBFF] sm:h-auto sm:max-h-[calc(100vh-48px)] sm:w-[min(1120px,calc(100vw-48px))] sm:rounded-[28px] sm:border sm:shadow-[0_24px_80px_rgba(6,43,95,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-[#DCEBFF] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[24px] font-black text-[#0B1F3A]">Chi tiết yêu cầu Shopee</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-lg font-black text-[#003B7A]">#{request.shopeeOrderCode}</span>
                {request.source === "guest" && (
                  <span className="inline-block rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide">Guest</span>
                )}
                <ShopeeStatusBadge status={processingStatus} />
                <ShopeeApiBadge status={verificationStatus} compact />
                {approvedManually && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                    ⚠ Đã duyệt thủ công
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#DCEBFF] bg-white text-[#64748B] transition hover:bg-[#F6FAFF]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="admin-scrollbar flex-1 min-h-0 overflow-y-auto bg-[#F8FBFF] px-6 py-5">
          <div className="space-y-5">
            <DetailCard title="Tổng quan xử lý">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <InfoBox label="Trạng thái" value={verificationStatus === "valid" ? "API hợp lệ" : (processingStatus === "pending" ? "Chờ xử lý" : (processingStatus === "approved" ? "Đã duyệt" : "Từ chối"))} />
                <InfoBox label="Điểm dự kiến" value={`${request.expectedPoints}`} />
                <InfoBox label="Tạo lúc" value={formatDateTime(request.createdAt)} />
                <InfoBox label="Cập nhật" value={formatDateTime(request.updatedAt || request.createdAt)} />
              </div>
            </DetailCard>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="space-y-5 xl:col-span-5">
                <DetailCard title="Thông tin khách hàng">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailField 
                      label="Người dùng" 
                      value={request.source === "guest" ? "Khách (Guest)" : (request.customerName || "Khách chưa rõ tên")} 
                    />
                    <DetailField label="SĐT nhận điểm" value={request.phone} />
                    <DetailField label="Email" value={request.email || "Chưa cập nhật"} />
                    <DetailField label="Zalo" value={request.zalo || request.phone} />
                    {request.source === "guest" && (
                      <div className="md:col-span-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 font-medium">
                        Yêu cầu này được gửi từ khách vãng lai, số điện thoại đã được xác thực qua mã OTP.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-[20px] border border-[#DCEBFF] bg-[#F6FAFF] p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <DetailField
                        label="Tình trạng CRM"
                        value={request.isExistingCustomer ? "Đã có trong CRM" : "Chưa có trong CRM"}
                      />
                      <DetailField label="Hạng thành viên" value={request.memberTier || "Silver"} />
                      <DetailField label="Điểm hiện tại" value={`${formatNumber(request.currentPoints || 0)} điểm`} />
                    </div>

                    <button
                      type="button"
                      className="mt-4 inline-flex items-center gap-2 text-[14px] font-bold text-[#0057E7]"
                    >
                      Xem hồ sơ CRM <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </DetailCard>

                <DetailCard title="Thông tin khách nhập">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <DetailField label="Mã đơn Shopee" value={`#${request.shopeeOrderCode}`} />
                      <DetailField
                        label="Tổng tiền khách nhập"
                        value={formatCurrency(request.customerInputAmount)}
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.03em] text-[#64748B]">
                        Ảnh đơn hàng
                      </p>
                      {request.orderImageUrl ? (
                        <>
                          <div className="h-[180px] overflow-hidden rounded-2xl border border-[#DCEBFF] bg-[#F6FAFF]">
                            <img
                              src={buildImageUrl(request.orderImageUrl)}
                              alt={`Đơn Shopee ${request.shopeeOrderCode}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewImage(buildImageUrl(request.orderImageUrl!))}
                            className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-[14px] font-bold text-[#0057E7] transition hover:bg-[#F6FAFF]"
                          >
                            Xem ảnh lớn <ExternalLink className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-gray-400">
                          <ImageOff className="mb-2 h-8 w-8 opacity-50" />
                          <span className="text-[13px] font-medium">Không có ảnh đính kèm</span>
                        </div>
                      )}
                    </div>
                  </div>
                </DetailCard>

                {request.adminNote && (
                  <DetailCard title="Ghi chú nội bộ">
                    <div className="rounded-[16px] border border-[#FDE68A] bg-[#FEFCE8] p-4 text-[14px] leading-relaxed text-[#854D0E] shadow-sm">
                      {request.adminNote}
                    </div>
                  </DetailCard>
                )}

                <DetailCard title="Lịch sử xử lý">
                  {timeline.length > 0 ? (
                    <div className="space-y-4">
                      {timeline.map((item, index) => (
                        <div key={item.key} className="flex gap-4">
                          <div className="flex w-6 shrink-0 flex-col items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF6FF] text-[#0057E7]">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                            {index < timeline.length - 1 && <div className="mt-2 w-px flex-1 bg-[#DCEBFF]" />}
                          </div>
                          <div className="min-w-0 pb-2">
                            <p className="text-[15px] font-black text-[#0B1F3A]">{item.title}</p>
                            <p className="mt-1 text-[13px] font-semibold text-[#64748B]">{item.time}</p>
                            <p className="mt-2 text-[14px] text-[#0B1F3A]">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[14px] text-[#64748B]">Chưa có thao tác xử lý.</p>
                  )}
                </DetailCard>
              </div>

              <div className="space-y-5 xl:col-span-7">
                <DetailCard
                  title="Thông tin đối chiếu Shopee API"
                  action={
                    processingStatus === "pending" ? (
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={onReconcile}
                        className={cn(
                          "inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-[13px] font-bold transition",
                          isVerifying
                            ? "cursor-not-allowed border-[#DCEBFF] bg-[#F6FAFF] text-[#94A3B8]"
                            : "border-[#BFD7FF] bg-white text-[#0057E7] hover:bg-[#F6FAFF]",
                        )}
                      >
                        {isVerifying ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Đang đối chiếu...</>
                        ) : (
                          <><RefreshCcw className="h-4 w-4" /> Đối chiếu API</>
                        )}
                      </button>
                    ) : undefined
                  }
                >
                  {verificationStatus && verificationStatus !== "not_checked" ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Trạng thái đối chiếu</p>
                          <div className="mt-1"><ShopeeApiBadge status={verificationStatus} /></div>
                        </div>
                        <DetailField label="Mã đơn khách nhập" value={`#${request.shopeeOrderCode}`} />
                        {request.matchedShopeeOrderId && (
                          <DetailField label="Mã đơn Shopee khớp" value={request.matchedShopeeOrderId} />
                        )}
                        <DetailField label="Tổng tiền khách nhập" value={formatCurrency(request.customerInputAmount)} />
                        {request.apiOrderAmount !== undefined && (
                          <DetailField label="Tổng tiền Shopee API" value={formatCurrency(request.apiOrderAmount)} />
                        )}
                        {request.apiOrderStatus && (
                          <DetailField label="Trạng thái đơn Shopee" value={request.apiOrderStatus} />
                        )}
                        {request.verifiedAt && (
                          <DetailField label="Thời gian đối chiếu" value={formatDateTime(request.verifiedAt)} />
                        )}
                        {request.verificationNote && (
                          <div className="md:col-span-2">
                            <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Ghi chú đối chiếu</p>
                            <p className="mt-1 text-[14px] text-[#0B1F3A] rounded-xl bg-[#F6FAFF] border border-[#DCEBFF] p-3">{request.verificationNote}</p>
                          </div>
                        )}
                      </div>

                      {processingStatus === "pending" && (
                        <div className="mt-4">
                          <button
                            type="button"
                            disabled={isVerifying}
                            onClick={onReconcile}
                            className={cn(
                              "inline-flex h-11 items-center gap-2 rounded-2xl border px-5 text-[14px] font-bold transition",
                              isVerifying
                                ? "cursor-not-allowed border-[#DCEBFF] bg-[#F6FAFF] text-[#94A3B8]"
                                : "border-[#BFD7FF] bg-white text-[#0057E7] hover:bg-[#F6FAFF]",
                            )}
                          >
                            {isVerifying ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /> Đang đối chiếu...</>
                            ) : (
                              <><RefreshCcw className="h-4 w-4" /> Đối chiếu lại API</>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-[#DCEBFF] bg-[#F6FAFF] p-5">
                      <p className="text-[18px] font-black text-[#0B1F3A]">Chưa đối chiếu API</p>
                      <p className="mt-2 text-[14px] text-[#64748B]">
                        Bấm “Đối chiếu API” để kiểm tra đơn hàng với Shopee.
                      </p>
                    </div>
                  )}
                </DetailCard>

                <DetailCard title="So sánh thông tin">
                  <div className="space-y-4">
                    <ComparisonRow
                      label="Tổng tiền đơn hàng"
                      leftValue={formatCurrency(request.customerInputAmount)}
                      rightValue={apiNotFound ? "-" : formatCurrency(request.apiOrderAmount)}
                      tone={compareTone}
                    />

                    {amountMismatch && !apiNotFound && amountDiff > 0 && (
                      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-[14px] font-semibold text-orange-700">
                        <span className="block font-bold">Tổng tiền khách nhập không khớp với Shopee API.</span>
                        <span className="mt-1 block font-normal text-[13px]">Chênh lệch: {formatCurrency(amountDiff)}</span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "rounded-2xl border p-4 text-[14px] font-semibold",
                        compareTone === "success" && "border-green-200 bg-green-50 text-green-700",
                        compareTone === "warning" && "border-orange-200 bg-orange-50 text-orange-700",
                        compareTone === "danger" && "border-red-200 bg-red-50 text-red-700",
                        compareTone === "default" && "border-[#DCEBFF] bg-[#F6FAFF] text-[#64748B]",
                      )}
                    >
                      {compareMessage}
                    </div>
                  </div>
                </DetailCard>

                <DetailCard title="Kết quả đối chiếu">
                  <div className="space-y-3">
                    <ChecklistItem
                      label="Mã đơn tồn tại trên Shopee"
                      state={apiNotFound ? "fail" : request.apiChecked ? "pass" : "unknown"}
                    />
                    <ChecklistItem
                      label="Đơn thuộc shop 3F Store"
                      state={apiNotFound ? "unknown" : "pass"}
                    />
                    <ChecklistItem
                      label="Đơn đã hoàn tất"
                      state={
                        request.apiOrderStatus === "COMPLETED"
                          ? "pass"
                          : request.apiOrderStatus === "SHIPPED"
                            ? "warning"
                            : request.apiChecked
                              ? "fail"
                              : "unknown"
                      }
                    />
                    <ChecklistItem
                      label="Tổng tiền khớp"
                      state={
                        apiNotFound
                          ? "unknown"
                          : amountMismatch
                            ? "warning"
                            : request.apiChecked
                              ? "pass"
                              : "unknown"
                      }
                    />
                    <ChecklistItem
                      label="Mã đơn chưa từng cộng điểm"
                      state={isDuplicate ? "warning" : "pass"}
                    />
                  </div>

                  {isDuplicate && (
                    <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-[14px] font-semibold text-orange-700">
                      Mã đơn này đã xuất hiện trong hệ thống. Vui lòng kiểm tra trước khi duyệt.
                    </div>
                  )}

                  {approvedManually && (
                    <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-[14px] font-semibold text-amber-700">
                      ⚠ Đã duyệt dù Shopee API chưa hợp lệ
                    </div>
                  )}

                  {!!request.verificationIssues?.length && (
                    <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-[14px] text-orange-700">
                      <p className="font-black">Cần kiểm tra:</p>
                      {request.verificationIssues.map((issue) => (
                        <p key={issue} className="mt-1">
                          - {issue}
                        </p>
                      ))}
                    </div>
                  )}
                </DetailCard>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#DCEBFF] bg-white px-6 py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-semibold text-[#64748B]">{footerMessage}</div>

            {processingStatus === "pending" && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onReject}
                  className="h-11 rounded-2xl border border-red-200 bg-red-50 px-5 text-[14px] font-bold text-red-600 transition hover:bg-red-100"
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (verificationStatus !== "valid") {
                      setShowOverrideConfirm(true);
                    } else {
                      onApprove();
                    }
                  }}
                  className={cn(
                    "h-11 rounded-2xl px-6 text-[14px] font-black text-white transition",
                    verificationStatus === "valid" 
                      ? "bg-[#0057E7] shadow-[0_8px_18px_rgba(0,87,231,0.22)] hover:bg-[#003B7A]" 
                      : "bg-amber-500 shadow-[0_8px_18px_rgba(245,158,11,0.22)] hover:bg-amber-600"
                  )}
                >
                  {verificationStatus !== "valid" ? "Duyệt bắt buộc" : "Duyệt & cộng điểm"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#082B5F]/55 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-full max-w-[960px] overflow-hidden rounded-[28px] border border-[#DCEBFF] bg-white p-3 shadow-[0_24px_80px_rgba(6,43,95,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#DCEBFF] bg-white text-[#64748B]"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Ảnh đơn Shopee"
              className="block max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {showOverrideConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#082B5F]/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-[0_24px_80px_rgba(6,43,95,0.22)]">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-center text-lg font-bold text-[#0B1F3A]">Duyệt bắt buộc (Cảnh báo)</h3>
              <p className="mb-6 text-center text-[14px] leading-relaxed text-[#64748B]">
                Yêu cầu này <strong>CHƯA</strong> được Shopee API xác nhận là hợp lệ. Bạn có chắc chắn muốn duyệt và cộng điểm cho đơn hàng này không? Việc này là không thể hoàn tác.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowOverrideConfirm(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOverrideConfirm(false);
                    onApprove();
                  }}
                  className="flex-1 rounded-xl bg-amber-500 px-4 py-3 text-[14px] font-bold text-white transition hover:bg-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
                >
                  Vẫn duyệt & cộng điểm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
