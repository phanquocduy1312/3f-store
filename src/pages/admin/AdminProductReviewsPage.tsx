import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  MessageSquareText,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  deleteAdminProductReview,
  getAdminProductReviews,
  type AdminProductReview,
  type AdminProductReviewParams,
  type AdminProductReviewStats,
  type AdminReviewStatus,
  updateAdminProductReviewStatus,
} from "@/src/api/adminProductReviewsApi";

const statusMeta: Record<AdminReviewStatus, { label: string; className: string; icon: typeof Eye }> = {
  published: {
    label: "Đang hiển thị",
    className: "border-green-100 bg-green-50 text-green-700",
    icon: Eye,
  },
  hidden: {
    label: "Đã ẩn",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: EyeOff,
  },
  flagged: {
    label: "Đã ẩn",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: EyeOff,
  },
};

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa rõ";
  return new Date(value.replace(" ", "T")).toLocaleString("vi-VN");
}

function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <div className="flex text-[#F59E0B]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={size} fill={index < value ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

function clampText(value?: string | null, fallback = "Chưa có nội dung") {
  const text = (value || "").trim();
  return text || fallback;
}

export function AdminProductReviewsPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminRole, setAdminRole] = useState("");
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("admin_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminRole(user.role || "");
        setAdminPermissions(user.permissions || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const hasEditAccess = adminRole === "dev" || adminRole === "admin" || adminPermissions.includes("reviews");

  const [searchValue, setSearchValue] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdminProductReviewParams["status"]>("all");
  const [rating, setRating] = useState<AdminProductReviewParams["rating"]>("all");
  const [verified, setVerified] = useState<AdminProductReviewParams["verified"]>("all");
  const [sort, setSort] = useState<AdminProductReviewParams["sort"]>("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<AdminProductReview[]>([]);
  const [stats, setStats] = useState<AdminProductReviewStats>({
    total: 0,
    published: 0,
    hidden: 0,
    flagged: 0,
    verified: 0,
    averageRating: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit, total: 0, totalPages: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedReview = useMemo(
    () => reviews.find((review) => review.id === selectedId) || null,
    [reviews, selectedId],
  );

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getAdminProductReviews({
        page,
        limit,
        q: query,
        status,
        rating,
        verified,
        sort,
      });
      setReviews(data.items || []);
      setStats(data.stats);
      setPagination(data.pagination);
      setSelectedId((current) => {
        if (current && data.items.some((item) => item.id === current)) return current;
        return null;
      });
    } catch (error: any) {
      toast.error(error.message || "Không tải được danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchValue.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    loadReviews();
  }, [page, limit, query, status, rating, verified, sort]);

  const updateStatus = async (review: AdminProductReview, nextStatus: AdminReviewStatus) => {
    if (!hasEditAccess) {
      toast.error("Bạn không có quyền thực hiện thao tác này.");
      return;
    }
    if (review.status === nextStatus) return;
    try {
      setBusyId(review.id);
      await updateAdminProductReviewStatus(review.id, nextStatus);
      toast.success("Đã cập nhật trạng thái đánh giá.");
      await loadReviews();
    } catch (error: any) {
      toast.error(error.message || "Không cập nhật được đánh giá.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteReview = async (review: AdminProductReview) => {
    if (!hasEditAccess) {
      toast.error("Bạn không có quyền thực hiện thao tác này.");
      return;
    }
    const ok = window.confirm("Xóa vĩnh viễn đánh giá này? Rating sản phẩm sẽ được tính lại.");
    if (!ok) return;
    try {
      setBusyId(review.id);
      await deleteAdminProductReview(review.id);
      toast.success("Đã xóa đánh giá.");
      await loadReviews();
    } catch (error: any) {
      toast.error(error.message || "Không xóa được đánh giá.");
    } finally {
      setBusyId(null);
    }
  };

  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages;
    const current = pagination.page;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [pagination.page, pagination.totalPages]);

  return (
    <div className="relative min-h-screen bg-[#F6FAFF] font-sans">
      <AdminSidebar activeMenu="Đánh giá" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />
      {!sidebarCollapsed && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      <div className={`flex min-h-screen min-w-0 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} searchValue={searchValue} onSearchChange={setSearchValue} />

        <main className="flex-1 space-y-5 p-4 sm:p-6">
          <section className="rounded-3xl border border-[#DCEBFF] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF6FF] px-3 py-1 text-xs font-black text-[#0057E7]">
                  <MessageSquareText className="h-4 w-4" />
                  Product Reviews
                </div>
                <h1 className="mt-3 text-2xl font-black text-[#0B1F3A]">Quản lý đánh giá sản phẩm</h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Chỉ review từ khách đã mua và đơn hoàn tất mới được tạo. Admin quản lý hiển thị, xử lý nội dung và kiểm tra nguồn đơn hàng tại đây.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
                <FilterSelect value={status} onChange={(value) => { setStatus(value as any); setPage(1); }}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="published">Đang hiển thị</option>
                  <option value="hidden">Đã ẩn</option>
                </FilterSelect>
                <FilterSelect value={String(rating)} onChange={(value) => { setRating(value === "all" ? "all" : Number(value)); setPage(1); }}>
                  <option value="all">Tất cả sao</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </FilterSelect>
                <FilterSelect value={verified} onChange={(value) => { setVerified(value as any); setPage(1); }}>
                  <option value="all">Mua hàng: tất cả</option>
                  <option value="yes">Đã mua hàng</option>
                  <option value="no">Chưa xác minh</option>
                </FilterSelect>
                <FilterSelect value={sort} onChange={(value) => { setSort(value as any); setPage(1); }}>
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="rating_high">Sao cao</option>
                  <option value="rating_low">Sao thấp</option>
                </FilterSelect>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={<MessageSquareText className="h-5 w-5" />} label="Tổng đánh giá" value={stats.total.toLocaleString("vi-VN")} />
            <Kpi icon={<Eye className="h-5 w-5" />} label="Đang hiển thị" value={stats.published.toLocaleString("vi-VN")} tone="green" />
            <Kpi icon={<EyeOff className="h-5 w-5" />} label="Đã ẩn" value={stats.hidden.toLocaleString("vi-VN")} tone="slate" />
            <Kpi icon={<Star className="h-5 w-5" />} label="Sao TB đang hiện" value={stats.averageRating.toFixed(1)} tone="blue" />
          </section>

          <section>
            <div className="overflow-hidden rounded-2xl border border-[#DCEBFF] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#DCEBFF] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-[#0B1F3A]">Danh sách đánh giá</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Hiển thị {reviews.length} / {pagination.total.toLocaleString("vi-VN")} đánh giá
                  </p>
                </div>
                <div className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-3 sm:w-80">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Tìm khách, SĐT, sản phẩm, mã đơn..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#0B1F3A] outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[460px] items-center justify-center text-sm font-bold text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang tải đánh giá...
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex min-h-[420px] items-center justify-center p-8 text-center">
                  <div>
                    <MessageSquareText className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-black text-[#0B1F3A]">Chưa có đánh giá phù hợp</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#EAF2FF]">
                  {reviews.map((review) => {
                    const active = selectedReview?.id === review.id;
                    const StatusIcon = statusMeta[review.status]?.icon || Eye;
                    const isPublished = review.status === "published";
                    return (
                      <div
                        key={review.id}
                        className={`flex flex-col gap-4 p-4 transition lg:flex-row lg:items-center lg:justify-between ${active ? "bg-[#EEF6FF]" : "bg-white hover:bg-[#F8FBFF]"}`}
                      >
                        <button type="button" onClick={() => setSelectedId(review.id)} className="min-w-0 flex-1 text-left">
                          <div className="flex gap-3">
                            <img
                              src={review.productImage || "/assets/logo/logo.webp"}
                              alt={review.productName || "Sản phẩm"}
                              className="h-16 w-16 shrink-0 rounded-xl border border-[#DCEBFF] bg-white object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Stars value={review.rating} />
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-black ${statusMeta[review.status]?.className}`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusMeta[review.status]?.label}
                                </span>
                                {review.verifiedPurchase && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[11px] font-black text-green-700">
                                    <ShieldCheck className="h-3 w-3" />
                                    Đã mua hàng
                                  </span>
                                )}
                                {review.images.length > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-700">
                                    <ImageIcon className="h-3 w-3" />
                                    {review.images.length}
                                  </span>
                                )}
                              </div>
                              <h3 className="mt-2 line-clamp-1 text-sm font-black text-[#0B1F3A]">{review.productName || `Sản phẩm #${review.productId}`}</h3>
                              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-relaxed text-slate-600">{clampText(review.content)}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                                <span>{review.customerRawName || review.customerName}</span>
                                <span>•</span>
                                <span>{review.orderCode || `Đơn #${review.orderId}`}</span>
                                <span>•</span>
                                <span>{formatDateTime(review.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </button>

                        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:w-[260px] lg:justify-end">
                          <div className="w-full text-xs font-black uppercase text-slate-400 lg:text-right">Thao tác</div>
                          <button
                            type="button"
                            onClick={() => setSelectedId(review.id)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#DCEBFF] bg-white px-3 text-xs font-black text-[#0057E7] transition hover:bg-[#EEF6FF]"
                          >
                            <Eye className="h-4 w-4" />
                            {hasEditAccess ? "Xem/Sửa" : "Xem"}
                          </button>
                          {hasEditAccess && (
                            <>
                              <button
                                type="button"
                                disabled={busyId === review.id}
                                onClick={() => updateStatus(review, isPublished ? "hidden" : "published")}
                                className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-black text-white transition disabled:opacity-45 ${isPublished ? "bg-slate-700 hover:bg-slate-800" : "bg-green-600 hover:bg-green-700"}`}
                              >
                                {isPublished ? <EyeOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                {isPublished ? "Ẩn" : "Hiện"}
                              </button>
                              <button
                                type="button"
                                disabled={busyId === review.id}
                                onClick={() => deleteReview(review)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-45"
                              >
                                {busyId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-[#DCEBFF] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs font-bold text-slate-500">
                  Trang {pagination.page} / {pagination.totalPages}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#DCEBFF] px-3 text-xs font-black text-[#0B1F3A] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </button>
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`h-9 min-w-9 rounded-xl px-3 text-xs font-black ${
                        pageNumber === pagination.page ? "bg-[#0057E7] text-white" : "border border-[#DCEBFF] bg-white text-[#0B1F3A]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
                    className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#DCEBFF] px-3 text-xs font-black text-[#0B1F3A] disabled:opacity-40"
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          </section>
        </main>
      </div>

      {selectedReview && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0B1F3A]/55 p-4 backdrop-blur-sm"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="max-h-[calc(100vh-48px)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <ReviewDetail
              review={selectedReview}
              busy={busyId === selectedReview.id}
              onStatus={(nextStatus) => updateStatus(selectedReview, nextStatus)}
              onDelete={() => deleteReview(selectedReview)}
              onCustomer={() => navigate(`/admin/customers/${selectedReview.customerId}`)}
              onClose={() => setSelectedId(null)}
              hasEditAccess={hasEditAccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, children }: { value?: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 rounded-xl border border-[#DCEBFF] bg-white px-3 text-sm font-bold text-[#0B1F3A] outline-none transition focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100"
    >
      {children}
    </select>
  );
}

function Kpi({ icon, label, value, tone = "blue" }: { icon: ReactNode; label: string; value: string; tone?: "blue" | "green" | "amber" | "slate" }) {
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

function ReviewDetail({
  review,
  busy,
  onStatus,
  onDelete,
  onCustomer,
  onClose,
  hasEditAccess,
}: {
  review: AdminProductReview;
  busy: boolean;
  onStatus: (status: AdminReviewStatus) => void;
  onDelete: () => void;
  onCustomer: () => void;
  onClose: () => void;
  hasEditAccess: boolean;
}) {
  const StatusIcon = statusMeta[review.status]?.icon || Eye;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#DCEBFF] bg-white shadow-sm">
      <div className="border-b border-[#DCEBFF] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#0B1F3A]">Chi tiết đánh giá</h2>
            <p className="mt-1 text-xs font-bold text-slate-400">#{review.id} • {formatDateTime(review.createdAt)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black ${statusMeta[review.status]?.className}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusMeta[review.status]?.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#DCEBFF] bg-white text-slate-500 transition hover:bg-[#EEF6FF] hover:text-[#0057E7]"
              aria-label="Đóng chi tiết đánh giá"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-[#F6FAFF] p-4">
          <Stars value={review.rating} size={18} />
          <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-relaxed text-[#0B1F3A]">{clampText(review.content)}</p>
          {review.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {review.images.map((image) => (
                <img key={image} src={image} alt="Ảnh đánh giá" className="aspect-square rounded-xl border border-[#DCEBFF] object-cover" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <InfoBlock icon={<Package className="h-4 w-4" />} title="Sản phẩm">
          <div className="flex gap-3">
            <img src={review.productImage || "/assets/logo/logo.webp"} alt={review.productName || "Sản phẩm"} className="h-14 w-14 shrink-0 rounded-xl border border-[#DCEBFF] object-cover" />
            <div className="min-w-0">
              <Link to={`/admin/products/${review.productId}`} className="line-clamp-2 text-sm font-black text-[#0057E7] hover:underline">
                {review.productName || `Sản phẩm #${review.productId}`}
              </Link>
              <div className="mt-1 text-xs font-bold text-slate-500">
                {review.productReviewCount ?? 0} review • {Number(review.productRatingAverage || 0).toFixed(1)} sao
              </div>
            </div>
          </div>
        </InfoBlock>

        <InfoBlock icon={<UserRound className="h-4 w-4" />} title="Khách hàng">
          <button onClick={onCustomer} className="text-left text-sm font-black text-[#0057E7] hover:underline">
            {review.customerRawName || review.customerName}
          </button>
          <div className="mt-1 text-xs font-bold text-slate-500">{review.customerPhone || "Chưa có SĐT"} • {review.customerEmail || "Chưa có email"}</div>
        </InfoBlock>

        <InfoBlock icon={<ShoppingBag className="h-4 w-4" />} title="Nguồn đơn hàng">
          <div className="text-sm font-black text-[#0B1F3A]">{review.orderCode || `Đơn #${review.orderId}`}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-black text-green-700">
              {review.verifiedPurchase ? "Đã mua hàng" : "Chưa xác minh"}
            </span>
            <span className="rounded-full bg-[#EEF6FF] px-2 py-0.5 text-[11px] font-black text-[#0057E7]">
              {review.orderStatus || "completed"}
            </span>
          </div>
        </InfoBlock>

        {hasEditAccess && (
          <div className="grid gap-2">
            <button
              disabled={busy || review.status === "published"}
              onClick={() => onStatus("published")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-black text-white transition hover:bg-green-700 disabled:opacity-45"
            >
              <CheckCircle2 className="h-4 w-4" />
              Hiển thị review
            </button>
            <button
              disabled={busy || review.status === "hidden"}
              onClick={() => onStatus("hidden")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-45"
            >
              <EyeOff className="h-4 w-4" />
              Ẩn khỏi sản phẩm
            </button>
            <button
              disabled={busy}
              onClick={onDelete}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-45"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xóa review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#DCEBFF] bg-[#F6FAFF] p-4">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-400">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}
