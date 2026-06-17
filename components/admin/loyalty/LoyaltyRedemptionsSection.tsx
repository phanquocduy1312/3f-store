import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Ban,
  Check,
  CheckCircle2,
  Eye,
  Gift,
  Info,
  Loader2,
  Search,
  Ticket,
  X,
  XCircle,
} from "lucide-react";
import {
  approveLoyaltyRedemption,
  fulfillLoyaltyRedemption,
  getAdminLoyaltyRedemptions,
  rejectLoyaltyRedemption,
  type LoyaltyRedemption,
} from "@/src/services/loyaltyRedemptionsApi";
import { useToast } from "@/components/ui/toast-notification";

const statusLabels: Record<LoyaltyRedemption["status"], string> = {
  pending: "Chờ xử lý",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
  fulfilled: "Đã hoàn tất",
  cancelled: "Đã hủy",
};

const statusClasses: Record<LoyaltyRedemption["status"], string> = {
  pending: "border-orange-100 bg-orange-50 text-orange-600",
  approved: "border-blue-100 bg-blue-50 text-blue-600",
  rejected: "border-red-100 bg-red-50 text-red-500",
  fulfilled: "border-emerald-100 bg-emerald-50 text-emerald-600",
  cancelled: "border-slate-200 bg-slate-50 text-slate-500",
};

type ConfirmState =
  | { mode: "approve"; redemption: LoyaltyRedemption }
  | { mode: "reject"; redemption: LoyaltyRedemption; note: string }
  | { mode: "fulfill"; redemption: LoyaltyRedemption }
  | null;

export function LoyaltyRedemptionsSection() {
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [detailRedemption, setDetailRedemption] = useState<LoyaltyRedemption | null>(null);
  const { toast } = useToast();

  const fetchRedemptions = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getAdminLoyaltyRedemptions({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      });
      setRedemptions(response.data || []);
    } catch (error: any) {
      const message = error?.message || "Không thể tải danh sách yêu cầu đổi quà. Vui lòng thử lại.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRedemptions();
  }, [statusFilter, search]);

  useEffect(() => {
    if (!confirmState && !detailRedemption) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirmState(null);
        setDetailRedemption(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirmState, detailRedemption]);

  const stats = useMemo(
    () => ({
      total: redemptions.length,
      pending: redemptions.filter((item) => item.status === "pending").length,
      completed: redemptions.filter((item) => item.status === "fulfilled").length,
    }),
    [redemptions],
  );

  const runAction = async (id: number, action: () => Promise<unknown>, successMessage: string) => {
    setActionLoadingId(id);
    try {
      await action();
      toast.success(successMessage);
      setConfirmState(null);
      await fetchRedemptions();
    } catch (error: any) {
      toast.error(error?.message || "Thao tác thất bại.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitConfirmAction = async () => {
    if (!confirmState) return;

    if (confirmState.mode === "approve") {
      await runAction(
        confirmState.redemption.id,
        () => approveLoyaltyRedemption(confirmState.redemption.id, "Đã duyệt"),
        "Đã duyệt yêu cầu đổi quà.",
      );
      return;
    }

    if (confirmState.mode === "reject") {
      const note = confirmState.note.trim();
      if (!note) {
        toast.warning("Vui lòng nhập lý do từ chối.");
        return;
      }
      await runAction(
        confirmState.redemption.id,
        () => rejectLoyaltyRedemption(confirmState.redemption.id, note),
        "Đã từ chối yêu cầu đổi quà.",
      );
      return;
    }

    await runAction(
      confirmState.redemption.id,
      () => fulfillLoyaltyRedemption(confirmState.redemption.id, "Đã bàn giao cho khách"),
      isVoucherReward(confirmState.redemption) ? "Đã cấp voucher cho khách." : "Đã đánh dấu bàn giao quà thành công.",
    );
  };

  return (
    <>
      <div className="space-y-4">
        <section className="rounded-[24px] border border-[#DCEBFF] bg-white p-5 shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-[24px] font-black text-[#0B1F3A]">Yêu cầu đổi quà</h2>
              <p className="mt-1 text-[14px] font-semibold text-[#64748B]">
                Theo dõi các yêu cầu đổi quà, voucher và xử lý trạng thái giao quà cho khách hàng.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatsCard label="Tổng yêu cầu" value={stats.total} />
              <StatsCard label="Chờ xử lý" value={stats.pending} accent="text-orange-600" />
              <StatsCard label="Hoàn tất" value={stats.completed} accent="text-emerald-600" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSearch(searchDraft.trim());
              }}
              className="relative"
            >
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
              <input
                type="text"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Tìm theo tên khách, SĐT, tên quà..."
                className="h-11 w-full rounded-2xl border border-[#DCEBFF] bg-white py-2.5 pl-10 pr-4 text-[14px] font-semibold text-[#0B1F3A] placeholder-[#94A3B8] outline-none transition focus:border-[#0057E7]"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-[14px] font-semibold text-[#0B1F3A] outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <ProcessGuide />
        </section>

        <section className="overflow-hidden rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
          {errorMessage ? (
            <ErrorState message={errorMessage} onRetry={() => void fetchRedemptions()} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left text-[13px] text-[#0B1F3A]">
                <thead className="border-b border-[#EEF6FF] bg-[#F8FBFF] text-[11px] font-black uppercase tracking-[0.04em] text-[#64748B]">
                  <tr>
                    <th className="px-6 py-3">Mã</th>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Quà đổi</th>
                    <th className="px-4 py-3">Điểm đã dùng</th>
                    <th className="px-4 py-3">Voucher cấp ra</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thời gian tạo</th>
                    <th className="px-4 py-3">Ghi chú</th>
                    <th className="w-[140px] px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF6FF]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-[#64748B]">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-[#0057E7]" />
                          <span>Đang tải danh sách yêu cầu đổi quà...</span>
                        </div>
                      </td>
                    </tr>
                  ) : redemptions.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    redemptions.map((redemption) => (
                      <tr key={redemption.id} className="hover:bg-[#F8FBFF]/60">
                        <td className="px-6 py-4 font-black text-[#0B1F3A]">#{redemption.id}</td>
                        <td className="px-4 py-4">
                          <div className="font-black text-[#0B1F3A]">{redemption.customer_name || "Khách chưa rõ tên"}</div>
                          <div className="mt-1 text-[12px] font-semibold text-[#64748B]">
                            {redemption.customer_phone || "Không có SĐT"}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-black text-[#0B1F3A]">{redemption.reward_name}</td>
                        <td className="px-4 py-4 font-black text-[#0057E7]">
                          {Math.abs(redemption.points_spent).toLocaleString("vi-VN")} điểm
                        </td>
                        <td className="px-4 py-4 font-bold text-[#0B1F3A]">{redemption.voucher_code || "Chưa cấp mã"}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${statusClasses[redemption.status]}`}
                          >
                            {statusLabels[redemption.status]}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-[#64748B]">{formatDateTime(redemption.created_at)}</td>
                        <td className="px-4 py-4">
                          <div className="line-clamp-2 max-w-[220px] text-[12px] font-semibold leading-5 text-[#64748B]">
                            {redemption.note || "Không có ghi chú."}
                          </div>
                          {redemption.processed_by && (
                            <div className="mt-1 text-[11px] font-semibold text-[#94A3B8]">
                              Xử lý bởi: {redemption.processed_by}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <RedemptionActions
                            redemption={redemption}
                            isLoading={actionLoadingId === redemption.id}
                            onApprove={() => setConfirmState({ mode: "approve", redemption })}
                            onReject={() => setConfirmState({ mode: "reject", redemption, note: redemption.note || "" })}
                            onFulfill={() => setConfirmState({ mode: "fulfill", redemption })}
                            onView={() => setDetailRedemption(redemption)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        state={confirmState}
        isSubmitting={actionLoadingId !== null}
        onClose={() => {
          if (actionLoadingId === null) setConfirmState(null);
        }}
        onChangeRejectNote={(note) =>
          setConfirmState((prev) => (prev && prev.mode === "reject" ? { ...prev, note } : prev))
        }
        onConfirm={() => void submitConfirmAction()}
      />

      <RedemptionDetailModal
        redemption={detailRedemption}
        onClose={() => setDetailRedemption(null)}
      />
    </>
  );
}

function ProcessGuide() {
  const steps = [
    "Chờ xử lý",
    "Duyệt yêu cầu",
    "Giao quà / cấp voucher",
    "Hoàn tất",
  ];

  return (
    <div className="mt-4 rounded-[16px] border border-[#DCEBFF] bg-[#F8FBFF] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#0057E7]">
            <Info className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-black text-[#0B1F3A]">Quy trình xử lý yêu cầu đổi quà</h3>
            <p className="mt-1 text-[12px] font-semibold leading-5 text-[#64748B]">
              Admin duyệt yêu cầu hợp lệ, sau đó giao quà hoặc cấp voucher cho khách.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, index) => (
            <div key={step} className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-[12px] font-black text-[#0B1F3A] shadow-[0_4px_16px_rgba(6,43,95,0.05)]">
                {index + 1}. {step}
              </span>
              {index < steps.length - 1 && <span className="text-[#94A3B8]">→</span>}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[12px] font-semibold leading-5 text-[#64748B]">
        Nếu từ chối, hệ thống sẽ hoàn điểm theo logic backend nếu điểm đã bị trừ.
      </p>
    </div>
  );
}

function RedemptionActions({
  redemption,
  isLoading,
  onApprove,
  onReject,
  onFulfill,
  onView,
}: {
  redemption: LoyaltyRedemption;
  isLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onFulfill: () => void;
  onView: () => void;
}) {
  const fulfillTitle = isVoucherReward(redemption) ? "Cấp voucher" : "Đánh dấu đã giao";

  return (
    <div className="flex items-center justify-end gap-2">
      <ActionIconButton title="Xem chi tiết" tone="neutral" disabled={false} onClick={onView}>
        <Eye className="h-4 w-4" />
      </ActionIconButton>

      {redemption.status === "pending" && (
        <>
          <ActionIconButton title="Duyệt yêu cầu" tone="success" disabled={isLoading} onClick={onApprove}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </ActionIconButton>
          <ActionIconButton title="Từ chối yêu cầu" tone="danger" disabled={isLoading} onClick={onReject}>
            <X className="h-4 w-4" />
          </ActionIconButton>
        </>
      )}

      {redemption.status === "approved" && (
        <ActionIconButton title={fulfillTitle} tone="primary" disabled={isLoading} onClick={onFulfill}>
          {isVoucherReward(redemption) ? <Ticket className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
        </ActionIconButton>
      )}

      {redemption.status === "fulfilled" && (
        <StatusIcon title="Đã hoàn tất" tone="success">
          <CheckCircle2 className="h-4 w-4" />
        </StatusIcon>
      )}

      {redemption.status === "rejected" && (
        <StatusIcon title="Đã từ chối" tone="danger">
          <XCircle className="h-4 w-4" />
        </StatusIcon>
      )}

      {redemption.status === "cancelled" && (
        <StatusIcon title="Đã hủy" tone="muted">
          <Ban className="h-4 w-4" />
        </StatusIcon>
      )}
    </div>
  );
}

function ActionIconButton({
  title,
  tone,
  disabled,
  onClick,
  children,
}: {
  title: string;
  tone: "success" | "danger" | "primary" | "neutral";
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const className =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
      : tone === "danger"
        ? "border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
        : tone === "primary"
          ? "border-blue-100 bg-blue-50 text-[#0057E7] hover:bg-blue-100"
          : "border-[#DCEBFF] bg-white text-[#64748B] hover:bg-[#F6FAFF]";

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}


function ConfirmDialog({
  state,
  isSubmitting,
  onClose,
  onConfirm,
  onChangeRejectNote,
}: {
  state: ConfirmState;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangeRejectNote: (note: string) => void;
}) {
  if (!state) return null;

  const config =
    state.mode === "approve"
      ? {
          title: "Duyệt yêu cầu đổi quà?",
          description: "Yêu cầu hợp lệ sẽ chuyển sang bước giao quà hoặc cấp voucher.",
          confirmLabel: "Duyệt yêu cầu",
        }
      : state.mode === "reject"
        ? {
            title: "Từ chối yêu cầu đổi quà?",
            description: "Nếu điểm đã được trừ, hệ thống sẽ hoàn điểm theo logic backend.",
            confirmLabel: "Từ chối",
          }
        : {
            title: isVoucherReward(state.redemption) ? "Cấp voucher cho khách?" : "Đánh dấu đã giao quà?",
            description: isVoucherReward(state.redemption)
              ? "Hệ thống sẽ lấy một mã voucher khả dụng và gán cho yêu cầu này."
              : "Yêu cầu sẽ được đánh dấu đã hoàn tất.",
            confirmLabel: isVoucherReward(state.redemption) ? "Cấp voucher" : "Đã giao quà",
          };

  return (
    <ModalShell onClose={onClose}>
      <div className="rounded-[28px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="border-b border-[#EAF2FF] px-6 py-5">
          <h3 className="text-[24px] font-black text-[#0B1F3A]">{config.title}</h3>
          <p className="mt-2 text-[14px] font-semibold leading-6 text-[#64748B]">{config.description}</p>
        </div>
        <div className="px-6 py-5">
          <div className="rounded-[20px] border border-[#EAF2FF] bg-[#F8FBFF] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Mã yêu cầu" value={`#${state.redemption.id}`} />
              <DetailItem label="Khách hàng" value={state.redemption.customer_name || "Khách chưa rõ tên"} />
              <DetailItem label="Quà đổi" value={state.redemption.reward_name} />
              <DetailItem
                label="Điểm đã dùng"
                value={`${Math.abs(state.redemption.points_spent).toLocaleString("vi-VN")} điểm`}
              />
            </div>
          </div>

          {state.mode === "reject" && (
            <label className="mt-4 block">
              <div className="mb-2 text-[13px] font-black text-[#0B1F3A]">Lý do từ chối</div>
              <textarea
                value={state.note}
                onChange={(event) => onChangeRejectNote(event.target.value)}
                rows={4}
                placeholder="Nhập lý do từ chối..."
                className="w-full rounded-2xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-3 text-[14px] font-semibold text-[#0B1F3A] outline-none transition focus:border-[#0057E7] focus:bg-white"
              />
            </label>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#EAF2FF] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 rounded-2xl border border-[#DCEBFF] px-5 text-[14px] font-bold text-[#64748B] disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function RedemptionDetailModal({
  redemption,
  onClose,
}: {
  redemption: LoyaltyRedemption | null;
  onClose: () => void;
}) {
  if (!redemption) return null;

  return (
    <ModalShell onClose={onClose} maxWidthClassName="max-w-[960px]">
      <div className="relative flex max-h-[calc(100vh-64px)] w-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="shrink-0 border-b border-[#EAF2FF] px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[24px] font-black text-[#0B1F3A]">Chi tiết yêu cầu đổi quà</h3>
            <p className="mt-2 text-[14px] font-semibold text-[#64748B]">
              Xem thông tin yêu cầu, khách hàng, quà đổi và trạng thái xử lý hiện tại từ dữ liệu đang có trên hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#64748B] transition hover:bg-[#F4F8FF]"
          >
            <X className="h-5 w-5" />
          </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <DetailCard title="Thông tin yêu cầu">
                <DetailItem label="Mã yêu cầu" value={`#${redemption.id}`} />
                <DetailItem label="Trạng thái" value={statusLabels[redemption.status]} />
                <DetailItem label="Thời gian tạo" value={formatDateTime(redemption.created_at)} />
                <DetailItem label="Thời gian xử lý" value={formatDateTime(redemption.processed_at)} />
                <DetailItem label="Người xử lý" value={redemption.processed_by || "Chưa xử lý"} />
              </DetailCard>

              <DetailCard title="Quà đổi">
                <DetailItem label="Tên quà" value={redemption.reward_name} />
                <DetailItem label="Loại quà" value={getRewardTypeLabel(redemption)} />
                <DetailItem
                  label="Điểm đã dùng"
                  value={`${Math.abs(redemption.points_spent).toLocaleString("vi-VN")} điểm`}
                />
              </DetailCard>
            </div>

            <div className="space-y-4">
              <DetailCard title="Khách hàng">
                <DetailItem label="Khách hàng" value={redemption.customer_name || "Khách chưa rõ tên"} />
                <DetailItem label="SĐT" value={redemption.customer_phone || "Không có SĐT"} />
              </DetailCard>

              <DetailCard title="Voucher & ghi chú">
                <DetailItem label="Voucher đã cấp" value={redemption.voucher_code || "Chưa cấp mã"} />
                <DetailItem label="Ghi chú khách hàng / xử lý" value={redemption.note || "Không có ghi chú"} multiline />
              </DetailCard>
            </div>

            <div className="lg:col-span-2">
              <DetailCard title="Lịch sử xử lý">
                <div className="rounded-2xl border border-dashed border-[#DCEBFF] bg-white px-4 py-4 text-[13px] font-semibold text-[#64748B]">
                  Chưa có lịch sử xử lý chi tiết.
                </div>
              </DetailCard>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end border-t border-[#EAF2FF] bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-2xl border border-[#DCEBFF] px-5 text-[14px] font-bold text-[#64748B] transition hover:bg-[#F6FAFF]"
          >
            Đóng
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  children,
  onClose,
  maxWidthClassName = "max-w-[640px]",
}: {
  children: ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0B1F3A]/40 p-4" onClick={onClose}>
      <div className={`w-full ${maxWidthClassName}`} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[#EAF2FF] bg-[#FCFDFF] p-5">
      <h4 className="text-[16px] font-black text-[#0B1F3A]">{title}</h4>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function DetailItem({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="text-[12px] font-bold text-[#64748B]">{label}</div>
      <div className={`mt-1 text-[14px] font-black text-[#0B1F3A] ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</div>
    </div>
  );
}

function StatusIcon({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "success" | "danger" | "muted";
  children: ReactNode;
}) {
  const className =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
      : tone === "danger"
        ? "border-red-100 bg-red-50 text-red-500"
        : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <span
      title={title}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${className}`}
    >
      {children}
    </span>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1F3] text-[#E11D48]">
        <XCircle className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-[20px] font-black text-[#0B1F3A]">Không thể tải danh sách</h3>
      <p className="mx-auto mt-2 max-w-xl text-[14px] font-semibold leading-6 text-[#64748B]">
        {message || "Không thể tải danh sách yêu cầu đổi quà. Vui lòng thử lại."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-11 items-center rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white"
      >
        Thử lại
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#0057E7]">
        <Gift className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-[20px] font-black text-[#0B1F3A]">Chưa có yêu cầu đổi quà</h3>
      <p className="mx-auto mt-2 max-w-xl text-[14px] font-semibold leading-6 text-[#64748B]">
        Khi khách hàng đổi quà, yêu cầu sẽ hiển thị tại đây để admin xử lý.
      </p>
    </div>
  );
}

function StatsCard({
  label,
  value,
  accent = "text-[#0B1F3A]",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-3">
      <div className="text-[12px] font-bold text-[#64748B]">{label}</div>
      <div className={`mt-1 text-[20px] font-black ${accent}`}>{value.toLocaleString("vi-VN")}</div>
    </div>
  );
}

function isVoucherReward(redemption: LoyaltyRedemption) {
  return (redemption.reward_type || "").toLowerCase() === "voucher";
}

function getRewardTypeLabel(redemption: LoyaltyRedemption) {
  return isVoucherReward(redemption) ? "Voucher" : "Quà vật lý / quà khác";
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
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
}
