import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { ShopeeActionModal } from "@/components/admin/shopee/ShopeeActionModal";
import { ShopeeFilters } from "@/components/admin/shopee/ShopeeFilters";
import { ShopeeRequestDetailModal } from "@/components/admin/shopee/ShopeeRequestDetailModal";
import { ShopeeRequestTable } from "@/components/admin/shopee/ShopeeRequestTable";
import { ShopeeStats } from "@/components/admin/shopee/ShopeeStats";
import { ShopeeTabs, type ShopeeTabKey } from "@/components/admin/shopee/ShopeeTabs";
import { ToastContainer, useToast } from "@/components/ui/toast-notification";
import { getDuplicatedCodes } from "@/lib/shopee-requests";
import type { ShopeePointRequest } from "@/types/shopee";
import {
  getShopeePointRequests,
  getShopeePointRequestDetail,
  approveShopeePointRequest,
  rejectShopeePointRequest,
  createShopeePointRequest,
  verifyShopeePointRequest,
  verifyBulkShopeePointRequests,
} from "@/src/services/shopeePointApi";
import { buildImageUrl } from "@/src/config/api";

type ModalMode = "approve" | "reject" | null;

type ShopeeDateRange = "today" | "this_week" | "this_month" | "this_year" | "all_time" | "custom";

type DateRangeResult = {
  currentStart?: Date;
  currentEnd?: Date;
  previousStart?: Date;
  previousEnd?: Date;
  comparisonLabel: string;
  showComparison: boolean;
};

function getShopeeDateRange(
  range: ShopeeDateRange,
  now = new Date()
): DateRangeResult {
  const currentEnd = now;

  if (range === "today") {
    const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const previousEnd = new Date(currentStart.getTime() - 1);
    return {
      currentStart, currentEnd, previousStart, previousEnd,
      comparisonLabel: "so với hôm qua", showComparison: true,
    };
  }

  if (range === "this_week") {
    const day = now.getDay() || 7;
    const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
    const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate() - 7);
    const previousEnd = new Date(currentStart.getTime() - 1);
    return {
      currentStart, currentEnd, previousStart, previousEnd,
      comparisonLabel: "so với tuần trước", showComparison: true,
    };
  }

  if (range === "this_month") {
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1);
    const previousEnd = new Date(currentStart.getTime() - 1);
    return {
      currentStart, currentEnd, previousStart, previousEnd,
      comparisonLabel: "so với tháng trước", showComparison: true,
    };
  }

  if (range === "this_year") {
    const currentStart = new Date(now.getFullYear(), 0, 1);
    const previousStart = new Date(currentStart.getFullYear() - 1, 0, 1);
    const previousEnd = new Date(currentStart.getTime() - 1);
    return {
      currentStart, currentEnd, previousStart, previousEnd,
      comparisonLabel: "so với năm trước", showComparison: true,
    };
  }

  return { comparisonLabel: "Tổng dữ liệu", showComparison: false };
}

function isDateInRange(dateValue?: string, start?: Date, end?: Date) {
  if (!dateValue) return false;
  if (!start || !end) return true;
  const date = new Date(dateValue).getTime();
  return date >= start.getTime() && date <= end.getTime();
}

function filterRequestsByDate(
  requests: ShopeePointRequest[], range: DateRangeResult, dateField: "createdAt" | "updatedAt" | "approvedAt",
) {
  if (!range.currentStart || !range.currentEnd) return requests;
  return requests.filter((r) => isDateInRange(r[dateField], range.currentStart, range.currentEnd));
}

function filterRequestsByPreviousDate(
  requests: ShopeePointRequest[], range: DateRangeResult, dateField: "createdAt" | "updatedAt" | "approvedAt",
) {
  if (!range.previousStart || !range.previousEnd) return [];
  return requests.filter((r) => isDateInRange(r[dateField], range.previousStart, range.previousEnd));
}

function mapApiRowToRequest(row: any): ShopeePointRequest {
  return {
    id: String(row.id),
    customerName: row.customerName || "",
    phone: row.phone || "",
    email: row.email || "",
    zalo: row.zalo || "",
    shopeeOrderCode: row.shopeeOrderCode || "",
    customerInputAmount: Number(row.orderAmount || 0),
    expectedPoints: Number(row.expectedPoints || 0),
    approvedPoints: Number(row.approvedPoints || 0),
    processingStatus: row.processingStatus || "pending",
    status: row.processingStatus || "pending",
    verificationStatus: row.verificationStatus || "not_checked",
    orderImageUrl: row.imageUrl ? buildImageUrl(row.imageUrl) : "",
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || "",
    apiChecked: row.verificationStatus !== "not_checked" && row.verificationStatus !== undefined,
    apiCheckStatus: row.verificationStatus || "not_checked",
    apiOrderStatus: row.shopeeApiStatus || undefined,
    apiOrderAmount: row.shopeeApiOrderAmount !== undefined && row.shopeeApiOrderAmount !== null
      ? Number(row.shopeeApiOrderAmount) : undefined,
    matchedShopeeOrderId: row.matchedShopeeOrderId || undefined,
    verifiedAt: row.verifiedAt || undefined,
    verificationNote: row.verificationNote || undefined,
    source: row.source || undefined,
    otpVerified: row.otpVerified !== undefined ? Number(row.otpVerified) : undefined,
    otpVerifiedAt: row.otpVerifiedAt || undefined,
    otpProvider: row.otpProvider || undefined,
  };
}

const VERIFY_TOAST_MAP: Record<string, { type: "success" | "warning"; msg: string }> = {
  valid: { type: "success", msg: "Đơn Shopee hợp lệ." },
  not_found: { type: "warning", msg: "Không tìm thấy đơn hàng trên Shopee." },
  mismatch: { type: "warning", msg: "Tổng tiền khách nhập không khớp Shopee." },
  invalid_order_status: { type: "warning", msg: "Đơn Shopee chưa đủ điều kiện tích điểm." },
  duplicate: { type: "warning", msg: "Mã đơn đã được sử dụng." },
  manual_review: { type: "warning", msg: "Cần kiểm tra thủ công." },
};

interface ShopeeRequestsSectionProps {
  onRequestsLoaded?: (requests: ShopeePointRequest[]) => void;
  searchValue?: string;
  selectedDate?: string;
  hideTitle?: boolean;
  hideStats?: boolean;
}

export function ShopeeRequestsSection({
  onRequestsLoaded,
  searchValue = "",
  selectedDate = "today",
  hideTitle = false,
  hideStats = false,
}: ShopeeRequestsSectionProps) {
  const [requests, setRequests] = useState<ShopeePointRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>(undefined);
  const [detailedRequest, setDetailedRequest] = useState<ShopeePointRequest | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [apiFilter, setApiFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<ShopeeTabKey>("all");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalValue, setModalValue] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);
  const { toasts, toast, removeToast } = useToast();

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getShopeePointRequests({ limit: 100 });
      const mapped = (result.data || []).map(mapApiRowToRequest);
      setRequests(mapped);
      if (onRequestsLoaded) {
        onRequestsLoaded(mapped);
      }
      if (mapped.length > 0 && !selectedRequestId) {
        setSelectedRequestId(mapped[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Không tải được danh sách yêu cầu.");
      console.error("Load requests error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRequestId, onRequestsLoaded]);

  useEffect(() => { loadRequests(); }, []);

  useEffect(() => {
    if (selectedRequestId && isDetailModalOpen) {
      const fetchDetail = async () => {
        try {
          const result = await getShopeePointRequestDetail(Number(selectedRequestId));
          if (result.success && result.data) {
            const data = result.data;
            const mapped: ShopeePointRequest = {
              id: String(data.id),
              customerName: data.customerName || "",
              phone: data.phone || "",
              email: data.email || "",
              zalo: data.zalo || "",
              shopeeOrderCode: data.shopeeOrderCode || "",
              customerInputAmount: Number(data.orderAmount || 0),
              expectedPoints: Number(data.expectedPoints || 0),
              approvedPoints: Number(data.approvedPoints || 0),
              processingStatus: data.processingStatus || "pending",
              status: data.processingStatus || "pending",
              verificationStatus: data.verificationStatus || "not_checked",
              adminNote: data.adminNote || "",
              rejectedReason: data.rejectedReason || "",
              createdAt: data.createdAt || "",
              updatedAt: data.updatedAt || "",
              approvedAt: data.approvedAt || "",
              orderImageUrl: data.image ? buildImageUrl(data.image.fileUrl) : "",
              apiChecked: data.verificationStatus !== "not_checked" && data.verificationStatus !== undefined,
              apiCheckStatus: (data.verificationStatus || "not_checked") as any,
              apiOrderAmount: data.shopeeApiOrderAmount !== undefined ? Number(data.shopeeApiOrderAmount) : (data.scan ? Number(data.scan.extractedOrderAmount || 0) : undefined),
              apiOrderStatus: data.shopeeApiStatus || (data.scan ? data.scan.extractedOrderStatus : undefined),
              matchedShopeeOrderId: data.matchedShopeeOrderId || undefined,
              verifiedAt: data.verifiedAt || undefined,
              verificationNote: data.verificationNote || undefined,
              apiShopId: data.scan ? data.scan.extractedCustomerName : undefined,
              apiBuyerId: data.scan ? data.scan.extractedPhone : undefined,
              apiCreateTime: data.scan ? data.scan.extractedOrderDate : undefined,
              apiCompleteTime: data.scan ? data.scan.extractedOrderDate : undefined,
              otpVerified: data.otpVerified !== undefined ? Number(data.otpVerified) : undefined,
              otpVerifiedAt: data.otpVerifiedAt || undefined,
              otpProvider: data.otpProvider || undefined,
            };
            setDetailedRequest(mapped);
          }
        } catch (err) {
          console.error("Lỗi khi tải chi tiết yêu cầu:", err);
        }
      };
      fetchDetail();
    } else {
      setDetailedRequest(undefined);
    }
  }, [selectedRequestId, isDetailModalOpen]);

  const handleVerifySingle = useCallback(async (requestId: string) => {
    const numId = Number(requestId);
    setVerifyingIds((prev) => new Set(prev).add(requestId));
    try {
      const result = await verifyShopeePointRequest(numId);
      const status = result.data?.verificationStatus || "manual_review";
      const toastConfig = VERIFY_TOAST_MAP[status] || { type: "warning" as const, msg: "Đối chiếu hoàn tất." };
      toast[toastConfig.type](toastConfig.msg);

      await loadRequests();

      if (isDetailModalOpen && selectedRequestId === requestId) {
        setDetailedRequest(undefined);
        setSelectedRequestId(requestId);
      }
    } catch (err: any) {
      console.error("Verify error:", err);
      toast.error(err?.message || "Lỗi khi đối chiếu đơn hàng.");
    } finally {
      setVerifyingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  }, [toast, loadRequests, isDetailModalOpen, selectedRequestId]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const duplicatedCodes = useMemo(() => getDuplicatedCodes(requests), [requests]);
  const range = useMemo(() => getShopeeDateRange(selectedDate as ShopeeDateRange), [selectedDate]);

  const currentCreatedRequests = useMemo(
    () => filterRequestsByDate(requests, range, "createdAt"), [requests, range],
  );
  const previousCreatedRequests = useMemo(
    () => filterRequestsByPreviousDate(requests, range, "createdAt"), [requests, range],
  );

  const stats = useMemo(
    () => ({
      totalRequests: { current: currentCreatedRequests.length, previous: previousCreatedRequests.length },
      pendingRequests: {
        current: currentCreatedRequests.filter((r) => r.processingStatus === "pending").length,
        previous: previousCreatedRequests.filter((r) => r.processingStatus === "pending").length,
      },
      validApiRequests: {
        current: currentCreatedRequests.filter((r) => r.verificationStatus === "valid").length,
        previous: previousCreatedRequests.filter((r) => r.verificationStatus === "valid").length,
      },
      manualReviewRequests: {
        current: currentCreatedRequests.filter((r) => ["manual_review", "mismatch", "invalid_order_status", "not_found", "duplicate"].includes(r.verificationStatus || "")).length,
        previous: previousCreatedRequests.filter((r) => ["manual_review", "mismatch", "invalid_order_status", "not_found", "duplicate"].includes(r.verificationStatus || "")).length,
      },
      approvedRequests: {
        current: currentCreatedRequests.filter((r) => r.processingStatus === "approved").length,
        previous: previousCreatedRequests.filter((r) => r.processingStatus === "approved").length,
      },
      totalApprovedPoints: {
        current: currentCreatedRequests
          .filter((r) => r.processingStatus === "approved")
          .reduce((sum, r) => sum + (r.approvedPoints || 0), 0),
        previous: previousCreatedRequests
          .filter((r) => r.processingStatus === "approved")
          .reduce((sum, r) => sum + (r.approvedPoints || 0), 0),
      },
    }),
    [currentCreatedRequests, previousCreatedRequests],
  );

  const tabCounts = useMemo(
    () => ({
      all: currentCreatedRequests.length,
      pending: currentCreatedRequests.filter((r) => r.processingStatus === "pending").length,
      valid: currentCreatedRequests.filter((r) => r.verificationStatus === "valid").length,
      manual_review: currentCreatedRequests.filter((r) => ["manual_review", "mismatch", "invalid_order_status", "not_found", "duplicate"].includes(r.verificationStatus || "")).length,
      approved: currentCreatedRequests.filter((r) => r.processingStatus === "approved").length,
      rejected: currentCreatedRequests.filter((r) => r.processingStatus === "rejected").length,
      duplicate: currentCreatedRequests.filter((r) => r.verificationStatus === "duplicate").length,
      not_found: currentCreatedRequests.filter((r) => r.verificationStatus === "not_found").length,
    }),
    [currentCreatedRequests],
  );

  const filteredRequests = useMemo(() => {
    return currentCreatedRequests.filter((request) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        request.shopeeOrderCode.toLowerCase().includes(normalizedSearch) ||
        request.phone.toLowerCase().includes(normalizedSearch) ||
        request.customerName?.toLowerCase().includes(normalizedSearch) ||
        request.email?.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === "all" || request.processingStatus === statusFilter;
      const matchesApi = apiFilter === "all" || request.verificationStatus === apiFilter;

      let matchesTab = activeTab === "all";
      if (!matchesTab) {
        if (activeTab === "pending" || activeTab === "approved" || activeTab === "rejected") {
          matchesTab = request.processingStatus === activeTab;
        } else if (activeTab === "valid" || activeTab === "duplicate" || activeTab === "not_found") {
          matchesTab = request.verificationStatus === activeTab;
        } else if (activeTab === "manual_review") {
          matchesTab = ["manual_review", "mismatch", "invalid_order_status", "not_found", "duplicate"].includes(request.verificationStatus || "");
        }
      }

      return matchesSearch && matchesStatus && matchesApi && matchesTab;
    });
  }, [activeTab, apiFilter, currentCreatedRequests, search, statusFilter]);

  useEffect(() => { setPage(1); }, [search, statusFilter, apiFilter, activeTab]);

  useEffect(() => {
    if (!selectedRequestId && requests[0]) {
      setSelectedRequestId(requests[0].id);
    }
  }, [requests, selectedRequestId]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRequests = filteredRequests.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  const handleBulkVerify = useCallback(async () => {
    let idsToVerify: number[];

    if (selectedIds.size > 0) {
      idsToVerify = Array.from(selectedIds)
        .filter((id) => {
          const req = requests.find((r) => r.id === id);
          return req && req.processingStatus !== "approved" && req.processingStatus !== "rejected";
        })
        .map(Number);
    } else {
      idsToVerify = filteredRequests
        .filter((r) => r.processingStatus === "pending" && (r.verificationStatus === "not_checked" || !r.verificationStatus))
        .map((r) => Number(r.id));
    }

    if (idsToVerify.length === 0) {
      toast.warning("Không có yêu cầu nào cần đối chiếu.");
      return;
    }

    setIsBulkVerifying(true);
    try {
      const result = await verifyBulkShopeePointRequests(idsToVerify);
      const d = result.data || {};

      const parts: string[] = [];
      if (d.valid > 0) parts.push(`${d.valid} hợp lệ`);
      if (d.notFound > 0) parts.push(`${d.notFound} không tìm thấy`);
      if (d.mismatch > 0) parts.push(`${d.mismatch} lệch tiền`);
      if (d.invalidStatus > 0) parts.push(`${d.invalidStatus} chưa đủ điều kiện`);
      if (d.duplicate > 0) parts.push(`${d.duplicate} trùng mã`);
      if (d.manualReview > 0) parts.push(`${d.manualReview} cần kiểm tra`);

      const summary = parts.length > 0 ? parts.join(", ") : "không có kết quả mới";
      toast.success(`Đã đối chiếu ${d.total || idsToVerify.length} yêu cầu: ${summary}.`);

      setSelectedIds(new Set());
      await loadRequests();
    } catch (err: any) {
      console.error("Bulk verify error:", err);
      toast.error(err?.message || "Lỗi khi đối chiếu hàng loạt.");
    } finally {
      setIsBulkVerifying(false);
    }
  }, [selectedIds, requests, filteredRequests, toast, loadRequests]);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const currentPageIds = paginatedRequests.map((r) => r.id);
      const allSelected = currentPageIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [paginatedRequests]);

  const openModal = (mode: ModalMode) => { setModalMode(mode); setModalValue(""); };
  const closeModal = () => { setModalMode(null); setModalValue(""); };

  const handleConfirmModal = async () => {
    if (!selectedRequest) return;
    setIsLoading(true);
    try {
      const reqId = Number(selectedRequest.id);
      if (modalMode === "approve") {
        await approveShopeePointRequest(reqId, modalValue);
        toast.success("Đã duyệt và cộng điểm thành công.");
      } else if (modalMode === "reject") {
        await rejectShopeePointRequest(reqId, modalValue);
        toast.success("Đã từ chối yêu cầu.");
      }
      setIsDetailModalOpen(false);
      closeModal();
      await loadRequests();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra khi cập nhật yêu cầu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconcileRequest = useCallback(async () => {
    if (!selectedRequestId) return;
    await handleVerifySingle(selectedRequestId);
  }, [selectedRequestId, handleVerifySingle]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setApiFilter("all");
    setActiveTab("all");
  };

  const handleSelectRequest = (id: string) => {
    setSelectedRequestId(id);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="w-full space-y-5">
      <section className="flex flex-col gap-4 min-[1800px]:flex-row min-[1800px]:items-center min-[1800px]:justify-between">
        {!hideTitle && (
          <div>
            <h1 className="text-[30px] font-black text-[#0B1F3A]">Yêu cầu Shopee</h1>
            <p className="mt-1 text-[14px] text-[#64748B]">Duyệt yêu cầu tích điểm từ đơn Shopee vào 3F Club</p>
          </div>
        )}
        <div className={`flex flex-wrap gap-3 ${hideTitle ? "w-full justify-end" : ""}`}>
          <button
            type="button"
            disabled={isBulkVerifying}
            onClick={handleBulkVerify}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-5 text-[14px] font-bold text-[#0057E7] transition hover:bg-[#F6FAFF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBulkVerifying ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Đang đối chiếu...</>
            ) : (
              <><RefreshCcw className="h-4 w-4" /> Đối chiếu hàng loạt{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}</>
            )}
          </button>
        </div>
      </section>

      {!hideStats && <ShopeeStats stats={stats} range={range} />}

      <ShopeeFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        apiFilter={apiFilter}
        onApiFilterChange={setApiFilter}
        onReset={resetFilters}
        onOpenAdvanced={() => {}}
      />

      <ShopeeTabs activeTab={activeTab} counts={tabCounts} onChange={setActiveTab} />

      {requests.length === 0 ? (
        <section className="rounded-[24px] border border-[#DCEBFF] bg-white px-6 py-14 text-center shadow-[0_8px_24px_rgba(6,43,95,0.06)]">
          <h3 className="text-[20px] font-black text-[#0B1F3A]">Chưa có yêu cầu Shopee nào</h3>
          <p className="mt-2 text-[14px] text-[#64748B]">
            Khi khách gửi form tích điểm từ đơn Shopee, yêu cầu sẽ xuất hiện tại đây.
          </p>
        </section>
      ) : (
        <ShopeeRequestTable
          requests={paginatedRequests}
          selectedId={selectedRequestId}
          duplicatedCodes={duplicatedCodes}
          page={safePage}
          totalPages={totalPages}
          totalItems={filteredRequests.length}
          selectedIds={selectedIds}
          verifyingIds={verifyingIds}
          onSelect={handleSelectRequest}
          onPageChange={setPage}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onVerifySingle={(id) => handleVerifySingle(id)}
        />
      )}

      <ShopeeRequestDetailModal
        open={isDetailModalOpen}
        request={detailedRequest || selectedRequest}
        duplicatedCodes={duplicatedCodes}
        isVerifying={selectedRequestId ? verifyingIds.has(selectedRequestId) : false}
        onClose={() => setIsDetailModalOpen(false)}
        onReject={() => openModal("reject")}
        onApprove={() => openModal("approve")}
        onReconcile={handleReconcileRequest}
      />

      <ShopeeActionModal
        mode={modalMode}
        request={selectedRequest}
        value={modalValue}
        onValueChange={setModalValue}
        onClose={closeModal}
        onConfirm={handleConfirmModal}
      />



      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
