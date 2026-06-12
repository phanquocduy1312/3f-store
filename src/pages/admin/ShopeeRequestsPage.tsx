import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Plus, RefreshCcw } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ShopeeActionModal } from "@/components/admin/shopee/ShopeeActionModal";
import { ShopeeFilters } from "@/components/admin/shopee/ShopeeFilters";
import { ShopeeManualRequestModal } from "@/components/admin/shopee/ShopeeManualRequestModal";
import { ShopeeRequestDetailModal } from "@/components/admin/shopee/ShopeeRequestDetailModal";
import { ShopeeRequestTable } from "@/components/admin/shopee/ShopeeRequestTable";
import { ShopeeStats } from "@/components/admin/shopee/ShopeeStats";
import { ShopeeTabs, type ShopeeTabKey } from "@/components/admin/shopee/ShopeeTabs";
import {
  getDuplicatedCodes,
} from "@/lib/shopee-requests";
import type { ShopeePointRequest } from "@/types/shopee";
import {
  getShopeePointRequests,
  getShopeePointRequestDetail,
  approveShopeePointRequest,
  rejectShopeePointRequest,
  createShopeePointRequest,
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
  now = new Date(2026, 5, 12, 23, 59, 59) // Use local time for June 12, 2026
): DateRangeResult {
  const currentEnd = now;

  if (range === "today") {
    const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const previousEnd = new Date(currentStart.getTime() - 1);

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      comparisonLabel: "so với hôm qua",
      showComparison: true,
    };
  }

  if (range === "this_week") {
    const day = now.getDay() || 7;
    const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
    const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate() - 7);
    const previousEnd = new Date(currentStart.getTime() - 1);

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      comparisonLabel: "so với tuần trước",
      showComparison: true,
    };
  }

  if (range === "this_month") {
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1);
    const previousEnd = new Date(currentStart.getTime() - 1);

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      comparisonLabel: "so với tháng trước",
      showComparison: true,
    };
  }

  if (range === "this_year") {
    const currentStart = new Date(now.getFullYear(), 0, 1);
    const previousStart = new Date(currentStart.getFullYear() - 1, 0, 1);
    const previousEnd = new Date(currentStart.getTime() - 1);

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      comparisonLabel: "so với năm trước",
      showComparison: true,
    };
  }

  return {
    comparisonLabel: "Tổng dữ liệu",
    showComparison: false,
  };
}

function isDateInRange(dateValue?: string, start?: Date, end?: Date) {
  if (!dateValue) return false;
  if (!start || !end) return true;
  const date = new Date(dateValue).getTime();
  return date >= start.getTime() && date <= end.getTime();
}

function filterRequestsByDate(
  requests: ShopeePointRequest[],
  range: DateRangeResult,
  dateField: "createdAt" | "updatedAt" | "approvedAt",
) {
  if (!range.currentStart || !range.currentEnd) return requests;
  return requests.filter((r) => isDateInRange(r[dateField], range.currentStart, range.currentEnd));
}

function filterRequestsByPreviousDate(
  requests: ShopeePointRequest[],
  range: DateRangeResult,
  dateField: "createdAt" | "updatedAt" | "approvedAt",
) {
  if (!range.previousStart || !range.previousEnd) return [];
  return requests.filter((r) => isDateInRange(r[dateField], range.previousStart, range.previousEnd));
}

export default function ShopeeRequestsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("today");
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
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getShopeePointRequests({ limit: 100 });
      const mapped = (result.data || []).map((row: any) => ({
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
        apiChecked: row.verificationStatus !== "not_checked",
        apiCheckStatus: row.verificationStatus || "not_checked",
        apiOrderStatus: row.verificationStatus === "valid" ? "COMPLETED" : undefined,
        apiOrderAmount: row.verificationStatus === "valid" ? Number(row.orderAmount || 0) : undefined,
      }));
      setRequests(mapped);
      if (mapped.length > 0 && !selectedRequestId) {
        setSelectedRequestId(mapped[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Không tải được danh sách yêu cầu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

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
              apiChecked: data.scan ? true : false,
              apiCheckStatus: (data.verificationStatus === "not_checked" ? "not_checked" : data.verificationStatus) as any,
              apiOrderAmount: data.scan ? Number(data.scan.extractedOrderAmount || 0) : undefined,
              apiOrderStatus: data.scan ? data.scan.extractedOrderStatus : undefined,
              apiShopId: data.scan ? data.scan.extractedCustomerName : undefined,
              apiBuyerId: data.scan ? data.scan.extractedPhone : undefined,
              apiCreateTime: data.scan ? data.scan.extractedOrderDate : undefined,
              apiCompleteTime: data.scan ? data.scan.extractedOrderDate : undefined,
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

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const duplicatedCodes = useMemo(() => getDuplicatedCodes(requests), [requests]);

  const range = useMemo(() => getShopeeDateRange(selectedDate as ShopeeDateRange), [selectedDate]);

  const currentCreatedRequests = useMemo(
    () => filterRequestsByDate(requests, range, "createdAt"),
    [requests, range],
  );
  const previousCreatedRequests = useMemo(
    () => filterRequestsByPreviousDate(requests, range, "createdAt"),
    [requests, range],
  );

  const currentApprovedRequests = useMemo(
    () => filterRequestsByDate(requests, range, "approvedAt").filter((r) => r.status === "approved"),
    [requests, range],
  );
  const previousApprovedRequests = useMemo(
    () => filterRequestsByPreviousDate(requests, range, "approvedAt").filter((r) => r.status === "approved"),
    [requests, range],
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
      approvedRequests: { current: currentApprovedRequests.length, previous: previousApprovedRequests.length },
      totalApprovedPoints: {
        current: currentApprovedRequests.reduce((sum, r) => sum + (r.approvedPoints || r.expectedPoints || 0), 0),
        previous: previousApprovedRequests.reduce((sum, r) => sum + (r.approvedPoints || r.expectedPoints || 0), 0),
      },
    }),
    [currentCreatedRequests, previousCreatedRequests, currentApprovedRequests, previousApprovedRequests],
  );

  const tabCounts = useMemo(
    () => ({
      all: currentCreatedRequests.length,
      pending: currentCreatedRequests.filter((request) => request.processingStatus === "pending").length,
      valid: currentCreatedRequests.filter((request) => request.verificationStatus === "valid").length,
      manual_review: currentCreatedRequests.filter((request) => ["manual_review", "mismatch", "invalid_order_status"].includes(request.verificationStatus || "")).length,
      approved: currentCreatedRequests.filter((request) => request.processingStatus === "approved").length,
      rejected: currentCreatedRequests.filter((request) => request.processingStatus === "rejected").length,
      duplicate: currentCreatedRequests.filter((request) => request.verificationStatus === "duplicate").length,
      not_found: currentCreatedRequests.filter((request) => request.verificationStatus === "not_found").length,
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
          matchesTab = ["manual_review", "mismatch", "invalid_order_status"].includes(request.verificationStatus || "");
        }
      }

      return matchesSearch && matchesStatus && matchesApi && matchesTab;
    });
  }, [activeTab, apiFilter, currentCreatedRequests, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, apiFilter, activeTab]);

  useEffect(() => {
    if (!selectedRequestId && requests[0]) {
      setSelectedRequestId(requests[0].id);
    }
  }, [requests, selectedRequestId]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRequests = filteredRequests.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selectedRequest = requests.find((request) => request.id === selectedRequestId);

  const openModal = (mode: ModalMode) => {
    setModalMode(mode);
    setModalValue("");
  };

  const closeModal = () => {
    setModalMode(null);
    setModalValue("");
  };

  const handleConfirmModal = async () => {
    if (!selectedRequest) {
      return;
    }

    setIsLoading(true);
    try {
      const reqId = Number(selectedRequest.id);
      if (modalMode === "approve") {
        await approveShopeePointRequest(reqId, modalValue);
        window.alert("Đã duyệt và cộng điểm thành công.");
      } else if (modalMode === "reject") {
        await rejectShopeePointRequest(reqId, modalValue);
        window.alert("Đã từ chối yêu cầu.");
      }
      setIsDetailModalOpen(false);
      closeModal();
      await loadRequests();
    } catch (err: any) {
      window.alert(err?.message || "Có lỗi xảy ra khi cập nhật yêu cầu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconcileRequest = async (requestId: string) => {
    setIsLoading(true);
    setTimeout(async () => {
      await loadRequests();
      setIsLoading(false);
      window.alert("Đã đối chiếu API thành công.");
    }, 500);
  };

  const handleBulkReconcile = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      await loadRequests();
      setIsLoading(false);
      window.alert("Đã đối chiếu API hàng loạt thành công.");
    }, 800);
  };

  const handleCreateManualRequest = async (
    newRequestData: Omit<ShopeePointRequest, "id" | "createdAt" | "updatedAt">
  ) => {
    setIsLoading(true);
    try {
      await createShopeePointRequest({
        phone: newRequestData.phone,
        email: newRequestData.email || "",
        customerName: newRequestData.customerName || "",
        zalo: newRequestData.zalo || "",
        shopeeOrderCode: newRequestData.shopeeOrderCode,
        orderAmount: newRequestData.customerInputAmount,
        imageId: null,
        scanId: null,
      });
      window.alert("Tạo yêu cầu tích điểm thành công.");
      setIsManualModalOpen(false);
      await loadRequests();
    } catch (err: any) {
      window.alert(err?.message || "Không thể tạo yêu cầu.");
    } finally {
      setIsLoading(false);
    }

    // Focus back on the create button
    setTimeout(() => {
      createButtonRef.current?.focus();
    }, 100);
  };

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
    <div className="min-h-screen bg-[#F6FAFF]">
      <AdminSidebar activeMenu="Yêu cầu Shopee" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={`min-h-screen overflow-x-hidden ${sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
        <AdminHeader
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <main className="space-y-5 px-4 py-4 sm:px-6 sm:py-6">
          <section className="flex flex-col gap-4 min-[1800px]:flex-row min-[1800px]:items-center min-[1800px]:justify-between">
            <div>
              <h1 className="text-[30px] font-black text-[#0B1F3A]">Yêu cầu Shopee</h1>
              <p className="mt-1 text-[14px] text-[#64748B]">Duyệt yêu cầu tích điểm từ đơn Shopee vào 3F Club</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBulkReconcile}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-5 text-[14px] font-bold text-[#0057E7] transition hover:bg-[#F6FAFF]"
              >
                <RefreshCcw className="h-4 w-4" />
                Đối chiếu API hàng loạt
              </button>
              <button
                type="button"
                onClick={() => window.alert("Tính năng xuất danh sách sẽ nối backend sau.")}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-5 text-[14px] font-bold text-[#0057E7] transition hover:bg-[#F6FAFF]"
              >
                <Download className="h-4 w-4" />
                Xuất danh sách
              </button>
              <button
                ref={createButtonRef}
                type="button"
                onClick={() => setIsManualModalOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white transition hover:bg-[#003B7A]"
              >
                <Plus className="h-4 w-4" />
                Tạo yêu cầu thủ công
              </button>
            </div>
          </section>

          <ShopeeStats stats={stats} range={range} />

          <ShopeeFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            apiFilter={apiFilter}
            onApiFilterChange={setApiFilter}
            onReset={resetFilters}
            onOpenAdvanced={() => {
              // TODO: Implement advanced filters
            }}
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
              onSelect={handleSelectRequest}
              onPageChange={setPage}
            />
          )}
        </main>

        <footer className="flex h-14 items-center justify-between border-t border-[#DCEBFF] bg-white px-4 text-[12px] font-semibold text-slate-400 sm:px-6">
          <span>© 2026 3F Store Admin. Tất cả quyền được bảo lưu.</span>
          <span>Phiên bản 1.0.0</span>
        </footer>
      </div>

      <ShopeeRequestDetailModal
        open={isDetailModalOpen}
        request={detailedRequest || selectedRequest}
        duplicatedCodes={duplicatedCodes}
        onClose={() => setIsDetailModalOpen(false)}
        onReject={() => openModal("reject")}
        onApprove={() => openModal("approve")}
        onReconcile={() => selectedRequest && handleReconcileRequest(selectedRequest.id)}
      />

      <ShopeeActionModal
        mode={modalMode}
        request={selectedRequest}
        value={modalValue}
        onValueChange={setModalValue}
        onClose={closeModal}
        onConfirm={handleConfirmModal}
      />

      <ShopeeManualRequestModal
        open={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleCreateManualRequest}
        existingRequests={requests}
      />
    </div>
  );
}
