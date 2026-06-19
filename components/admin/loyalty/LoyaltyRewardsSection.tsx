import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Edit2,
  FileSpreadsheet,
  Gift,
  ImageIcon,
  Loader2,
  Package2,
  Plus,
  Power,
  Search,
  Ticket,
  Upload,
  X,
} from "lucide-react";
import {
  createLoyaltyReward,
  getAdminLoyaltyRewardDetail,
  getAdminLoyaltyRewards,
  importRewardVouchers,
  toggleLoyaltyRewardActive,
  updateLoyaltyReward,
  uploadLoyaltyRewardImage,
  type LoyaltyReward,
  type RewardVoucherItem,
} from "@/src/services/loyaltyRewardsApi";
import { buildImageUrl } from "@/src/config/api";
import { ToastContainer, useToast } from "@/components/ui/toast-notification";

type RewardFormState = {
  name: string;
  rewardType: LoyaltyReward["rewardType"];
  description: string;
  pointsRequired: string;
  rewardValue: string;
  imageUrl: string;
  sku: string;
  stockQuantity: string;
  reservedStock: string;
  weight: string;
  dimensions: string;
  limitPerCustomer: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

type RewardFormErrors = Partial<Record<keyof RewardFormState, string>>;

const rewardTypeLabels: Record<LoyaltyReward["rewardType"], string> = {
  voucher: "Voucher",
  physical_gift: "Quà vật lý",
  free_shipping: "Miễn phí vận chuyển",
  discount_code: "Mã giảm giá",
  manual_reward: "Quà thủ công",
};

const initialForm: RewardFormState = {
  name: "",
  rewardType: "voucher",
  description: "",
  pointsRequired: "500",
  rewardValue: "50000",
  imageUrl: "",
  sku: "",
  stockQuantity: "",
  reservedStock: "",
  weight: "",
  dimensions: "",
  limitPerCustomer: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

export function LoyaltyRewardsSection() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);
  const [form, setForm] = useState<RewardFormState>(initialForm);
  const [errors, setErrors] = useState<RewardFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [voucherCodes, setVoucherCodes] = useState<RewardVoucherItem[]>([]);
  const [voucherSingleCode, setVoucherSingleCode] = useState("");
  const [voucherBulkCodes, setVoucherBulkCodes] = useState("");
  const [voucherExpiredAt, setVoucherExpiredAt] = useState("");
  const [isImportingVoucher, setIsImportingVoucher] = useState(false);
  const { toast, toasts, removeToast } = useToast();

  const loadRewards = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminLoyaltyRewards({
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
        search: search || undefined,
      });
      setRewards(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Không tải được danh sách quà tặng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, [statusFilter, typeFilter, search]);

  const rewardStats = useMemo(
    () => ({
      total: rewards.length,
      active: rewards.filter((reward) => reward.isActive === 1).length,
      vouchers: rewards.filter((reward) => reward.rewardType === "voucher").length,
    }),
    [rewards],
  );

  const currentVoucherStats = useMemo(() => {
    const source = voucherCodes;
    return {
      totalCodes: source.length,
      availableCodes: source.filter((item) => item.status === "available").length,
      assignedCodes: source.filter((item) => item.status === "assigned").length,
      usedCodes: source.filter((item) => item.status === "used").length,
      expiredCodes: source.filter((item) => item.status === "expired").length,
    };
  }, [voucherCodes]);

  const previewUrl = form.imageUrl ? buildImageUrl(form.imageUrl) : "";
  const isVoucherReward = form.rewardType === "voucher";

  const resetModalState = () => {
    setEditingRewardId(null);
    setForm(initialForm);
    setErrors({});
    setPreviewFailed(false);
    setVoucherCodes([]);
    setVoucherSingleCode("");
    setVoucherBulkCodes("");
    setVoucherExpiredAt("");
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingRewardId(null);
    setForm(initialForm);
    setErrors({});
    setPreviewFailed(false);
    setVoucherCodes([]);
    setVoucherSingleCode("");
    setVoucherBulkCodes("");
    setVoucherExpiredAt("");
    setIsModalOpen(true);
  };

  const openEditModal = async (reward: LoyaltyReward) => {
    setIsModalOpen(true);
    setEditingRewardId(reward.id);
    setErrors({});
    setPreviewFailed(false);
    setVoucherSingleCode("");
    setVoucherBulkCodes("");
    setVoucherExpiredAt("");
    setVoucherCodes([]);

    try {
      const detail = await getAdminLoyaltyRewardDetail(reward.id);
      const full = detail.data;
      setForm({
        name: full.name,
        rewardType: full.rewardType,
        description: full.description || "",
        pointsRequired: String(full.pointsRequired || 0),
        rewardValue: full.rewardValue !== null ? String(full.rewardValue) : "",
        imageUrl: full.imageUrl || "",
        sku: full.sku || "",
        stockQuantity: full.stockQuantity !== null ? String(full.stockQuantity) : "",
        reservedStock: full.reservedStock !== undefined && full.reservedStock !== null ? String(full.reservedStock) : "",
        weight: full.weight !== undefined && full.weight !== null ? String(full.weight) : "",
        dimensions: full.dimensions || "",
        limitPerCustomer: full.limitPerCustomer !== null ? String(full.limitPerCustomer) : "",
        startsAt: full.startsAt ? full.startsAt.substring(0, 16).replace(" ", "T") : "",
        endsAt: full.endsAt ? full.endsAt.substring(0, 16).replace(" ", "T") : "",
        isActive: full.isActive === 1,
      });
      setVoucherCodes(full.vouchers || []);
    } catch (err: any) {
      toast.error(err?.message || "Không tải được chi tiết quà tặng.");
      resetModalState();
    }
  };

  const handleFieldChange = (field: keyof RewardFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value as never }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setPreviewFailed(false);
    try {
      const res = await uploadLoyaltyRewardImage(file);
      handleFieldChange("imageUrl", res.data.imageUrl);
      toast.success("Tải ảnh quà tặng thành công.");
    } catch (err: any) {
      toast.error(err?.message || "Tải ảnh thất bại.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleVoucherCsv = async (file: File) => {
    const text = await file.text();
    setVoucherBulkCodes((prev) => [prev.trim(), text.trim()].filter(Boolean).join("\n"));
  };

  const validateForm = () => {
    const nextErrors: RewardFormErrors = {};
    const pointsRequired = Number(form.pointsRequired);
    const rewardValue = form.rewardValue === "" ? null : Number(form.rewardValue);
    const stockQuantity = form.stockQuantity === "" ? null : Number(form.stockQuantity);
    const limitPerCustomer = form.limitPerCustomer === "" ? null : Number(form.limitPerCustomer);

    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên quà tặng.";
    if (!Number.isFinite(pointsRequired) || pointsRequired <= 0) {
      nextErrors.pointsRequired = "Điểm yêu cầu phải lớn hơn 0.";
    }
    if (rewardValue !== null && (!Number.isFinite(rewardValue) || rewardValue < 0)) {
      nextErrors.rewardValue = "Giá trị quà tặng phải lớn hơn hoặc bằng 0.";
    }
    if (stockQuantity !== null && (!Number.isFinite(stockQuantity) || stockQuantity < 0)) {
      nextErrors.stockQuantity = "Số lượng tồn phải lớn hơn hoặc bằng 0.";
    }
    if (limitPerCustomer !== null && (!Number.isFinite(limitPerCustomer) || limitPerCustomer < 1)) {
      nextErrors.limitPerCustomer = "Giới hạn mỗi khách phải lớn hơn hoặc bằng 1.";
    }
    if (form.endsAt && form.startsAt && form.endsAt < form.startsAt) {
      nextErrors.endsAt = "Ngày kết thúc phải sau ngày bắt đầu.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const parseVoucherCodes = (text: string) =>
    text
      .split(/\r?\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);

  const importVoucherCodes = async (rewardId: number, codes: string[]) => {
    if (codes.length === 0) return;

    setIsImportingVoucher(true);
    try {
      const res = await importRewardVouchers({
        rewardId,
        voucherValue: form.rewardValue === "" ? "" : Number(form.rewardValue),
        expiredAt: voucherExpiredAt ? `${voucherExpiredAt}:00` : null,
        codes,
      });
      if (res.data.duplicates && res.data.duplicates.length > 0) {
        toast.warning(`Đã thêm ${res.data.created} mã, bỏ qua ${res.data.skipped} mã trùng.`);
      } else {
        toast.success(`Đã import ${res.data.created} mã voucher.`);
      }
      const detail = await getAdminLoyaltyRewardDetail(rewardId);
      setVoucherCodes(detail.data.vouchers || []);
      setVoucherSingleCode("");
      setVoucherBulkCodes("");
    } catch (err: any) {
      toast.error(err?.message || "Không import được voucher.");
      throw err;
    } finally {
      setIsImportingVoucher(false);
    }
  };

  const handleSaveReward = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      rewardType: form.rewardType,
      imageUrl: form.imageUrl.trim() || null,
      pointsRequired: Number(form.pointsRequired),
      rewardValue: form.rewardValue === "" ? null : Number(form.rewardValue),
      sku: form.sku.trim() || null,
      stockQuantity: form.stockQuantity === "" ? null : Number(form.stockQuantity),
      stock: form.stockQuantity === "" ? null : Number(form.stockQuantity),
      reservedStock: form.reservedStock === "" ? 0 : Number(form.reservedStock),
      weight: form.weight === "" ? null : Number(form.weight),
      dimensions: form.dimensions.trim() || null,
      limitPerCustomer: form.limitPerCustomer === "" ? null : Number(form.limitPerCustomer),
      isActive: form.isActive ? 1 : 0,
      startsAt: form.startsAt ? `${form.startsAt.replace("T", " ")}:00` : null,
      endsAt: form.endsAt ? `${form.endsAt.replace("T", " ")}:00` : null,
    };

    setIsSubmitting(true);
    try {
      let rewardId = editingRewardId;
      if (editingRewardId) {
        await updateLoyaltyReward({ id: editingRewardId, ...payload });
        toast.success("Đã cập nhật quà tặng.");
      } else {
        const created = await createLoyaltyReward(payload);
        rewardId = created.id;
        toast.success("Đã tạo quà tặng mới.");
      }

      if (rewardId && isVoucherReward) {
        const draftCodes = [...parseVoucherCodes(voucherSingleCode), ...parseVoucherCodes(voucherBulkCodes)];
        if (draftCodes.length > 0) {
          await importVoucherCodes(rewardId, draftCodes);
        }
      }

      resetModalState();
      await loadRewards();
    } catch (err: any) {
      toast.error(err?.message || "Không lưu được quà tặng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (reward: LoyaltyReward) => {
    try {
      await toggleLoyaltyRewardActive(reward.id, reward.isActive === 1 ? 0 : 1);
      toast.success(reward.isActive === 1 ? `Đã tắt quà "${reward.name}".` : `Đã kích hoạt quà "${reward.name}".`);
      await loadRewards();
    } catch (err: any) {
      toast.error(err?.message || "Không cập nhật được trạng thái quà.");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <section className="rounded-[24px] border border-[#DCEBFF] bg-white p-5 shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-[24px] font-black text-[#0B1F3A]">Danh sách quà</h2>
              <p className="mt-1 text-[14px] font-semibold text-[#64748B]">
                Thiết lập quà đổi điểm, voucher và tồn kho áp dụng cho 3F Club.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white transition hover:bg-[#003B7A]"
            >
              <Plus className="h-4 w-4" />
              Tạo quà mới
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(searchDraft.trim());
              }}
              className="relative"
            >
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Tìm theo tên quà tặng..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="h-11 w-full rounded-2xl border border-[#DCEBFF] bg-white py-2.5 pl-10 pr-4 text-[14px] font-semibold text-[#0B1F3A] placeholder-[#94A3B8] outline-none transition focus:border-[#0057E7]"
              />
            </form>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-[14px] font-semibold text-[#0B1F3A] outline-none"
            >
              <option value="all">Tất cả loại quà</option>
              {Object.entries(rewardTypeLabels).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-[14px] font-semibold text-[#0B1F3A] outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatsCard label="Tổng quà" value={rewardStats.total} />
          <StatsCard label="Đang hoạt động" value={rewardStats.active} />
          <StatsCard label="Quà dạng voucher" value={rewardStats.vouchers} />
        </div>

        <section className="overflow-hidden rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-[13px]">
              <thead className="border-b border-[#EEF6FF] bg-[#F8FBFF] text-[11px] font-black uppercase tracking-[0.04em] text-[#64748B]">
                <tr>
                  <th className="px-6 py-3">Tên quà tặng</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Điểm yêu cầu</th>
                  <th className="px-4 py-3">Giá trị</th>
                  <th className="px-4 py-3">Tồn kho</th>
                  <th className="px-4 py-3">Giới hạn/khách</th>
                  <th className="px-4 py-3">Voucher</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hiệu lực</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF6FF]">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#0057E7]" />
                    </td>
                  </tr>
                ) : rewards.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyRewardState onCreate={openCreateModal} />
                    </td>
                  </tr>
                ) : (
                  rewards.map((reward) => (
                    <tr key={reward.id} className="align-top hover:bg-[#F8FBFF]/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {(() => {
                            let imgUrl = reward.imageUrl ? buildImageUrl(reward.imageUrl) : "";
                            if (!imgUrl) {
                              if (reward.name.toLowerCase().includes("vận chuyển")) {
                                imgUrl = "/assets/rewards/free_shipping.png";
                              } else if (reward.name.toLowerCase().includes("petq") || reward.rewardType === "physical_gift") {
                                imgUrl = "/assets/rewards/pet_soup.png";
                              } else if (reward.rewardType === "voucher" || reward.name.toLowerCase().includes("voucher")) {
                                imgUrl = "/assets/rewards/voucher_50k.png";
                              }
                            }
                            return imgUrl ? (
                              <img
                                src={imgUrl}
                                alt=""
                                className="h-11 w-11 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F7FD] text-[#8AA1C2]">
                                <Gift className="h-5 w-5" />
                              </div>
                            );
                          })()}
                          <div>
                            <div className="font-black text-[#0B1F3A]">{reward.name}</div>
                            <div className="mt-1 line-clamp-2 max-w-[260px] text-[12px] font-semibold text-[#64748B]">
                              {reward.description || "Chưa có mô tả quà tặng."}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#4B6385]">{rewardTypeLabels[reward.rewardType]}</td>
                      <td className="px-4 py-4 font-black text-[#0057E7]">{reward.pointsRequired.toLocaleString("vi-VN")} điểm</td>
                      <td className="px-4 py-4 font-bold text-[#0B1F3A]">
                        {reward.rewardValue !== null ? `${reward.rewardValue.toLocaleString("vi-VN")}đ` : "—"}
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#4B6385]">
                        {reward.stockQuantity !== null ? reward.stockQuantity.toLocaleString("vi-VN") : "Vô hạn"}
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#4B6385]">
                        {reward.limitPerCustomer !== null ? `${reward.limitPerCustomer} lần` : "Không giới hạn"}
                      </td>
                      <td className="px-4 py-4">
                        {reward.rewardType === "voucher" ? (
                          <div className="space-y-1 text-[12px] font-semibold text-[#4B6385]">
                            <div>Tổng: {reward.voucherStats?.totalCodes ?? 0}</div>
                            <div>Có thể cấp: {reward.voucherStats?.availableCodes ?? 0}</div>
                          </div>
                        ) : (
                          <span className="text-[12px] font-semibold text-[#8AA1C2]">Không áp dụng</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[12px] font-black ${
                            reward.isActive === 1 ? "bg-[#E8FFF0] text-[#16A34A]" : "bg-[#FFF1F2] text-[#E11D48]"
                          }`}
                        >
                          {reward.isActive === 1 ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[12px] font-semibold leading-5 text-[#64748B]">
                        {reward.startsAt || reward.endsAt ? (
                          <>
                            {reward.startsAt && <div>Từ: {formatDateTime(reward.startsAt)}</div>}
                            {reward.endsAt && <div>Đến: {formatDateTime(reward.endsAt)}</div>}
                          </>
                        ) : (
                          "Không giới hạn"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <SmallIconButton label="Sửa" onClick={() => openEditModal(reward)}>
                            <Edit2 className="h-4 w-4" />
                          </SmallIconButton>
                          <SmallIconButton label="Bật/tắt" onClick={() => handleToggleActive(reward)}>
                            <Power className="h-4 w-4" />
                          </SmallIconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <RewardModal
          editingRewardId={editingRewardId}
          form={form}
          errors={errors}
          previewUrl={previewUrl}
          previewFailed={previewFailed}
          isUploadingImage={isUploadingImage}
          isSubmitting={isSubmitting}
          isVoucherReward={isVoucherReward}
          voucherCodes={voucherCodes}
          voucherSingleCode={voucherSingleCode}
          voucherBulkCodes={voucherBulkCodes}
          voucherExpiredAt={voucherExpiredAt}
          voucherStats={currentVoucherStats}
          isImportingVoucher={isImportingVoucher}
          onClose={resetModalState}
          onSave={handleSaveReward}
          onFieldChange={handleFieldChange}
          onImageUpload={handleUploadImage}
          onImageUrlChange={(value) => {
            handleFieldChange("imageUrl", value);
            setPreviewFailed(false);
          }}
          onSingleCodeChange={setVoucherSingleCode}
          onBulkCodesChange={setVoucherBulkCodes}
          onVoucherExpiredAtChange={setVoucherExpiredAt}
          onVoucherCsv={handleVoucherCsv}
          onImportCodes={async () => {
            if (!editingRewardId) {
              toast.warning("Lưu quà trước khi import mã voucher.");
              return;
            }
            const codes = [...parseVoucherCodes(voucherSingleCode), ...parseVoucherCodes(voucherBulkCodes)];
            if (codes.length === 0) {
              toast.warning("Nhập ít nhất một mã voucher.");
              return;
            }
            await importVoucherCodes(editingRewardId, codes);
          }}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

function RewardModal(props: {
  editingRewardId: number | null;
  form: RewardFormState;
  errors: RewardFormErrors;
  previewUrl: string;
  previewFailed: boolean;
  isUploadingImage: boolean;
  isSubmitting: boolean;
  isVoucherReward: boolean;
  voucherCodes: RewardVoucherItem[];
  voucherSingleCode: string;
  voucherBulkCodes: string;
  voucherExpiredAt: string;
  voucherStats: {
    totalCodes: number;
    availableCodes: number;
    assignedCodes: number;
    usedCodes: number;
    expiredCodes: number;
  };
  isImportingVoucher: boolean;
  onClose: () => void;
  onSave: (event: React.FormEvent) => void;
  onFieldChange: (field: keyof RewardFormState, value: string | boolean) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlChange: (value: string) => void;
  onSingleCodeChange: (value: string) => void;
  onBulkCodesChange: (value: string) => void;
  onVoucherExpiredAtChange: (value: string) => void;
  onVoucherCsv: (file: File) => void;
  onImportCodes: () => Promise<void>;
}) {
  const {
    editingRewardId,
    form,
    errors,
    previewUrl,
    previewFailed,
    isUploadingImage,
    isSubmitting,
    isVoucherReward,
    voucherCodes,
    voucherSingleCode,
    voucherBulkCodes,
    voucherExpiredAt,
    voucherStats,
    isImportingVoucher,
    onClose,
    onSave,
    onFieldChange,
    onImageUpload,
    onImageUrlChange,
    onSingleCodeChange,
    onBulkCodesChange,
    onVoucherExpiredAtChange,
    onVoucherCsv,
    onImportCodes,
  } = props;

  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06152B]/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-80px)] w-[min(960px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-[#DCEBFF] bg-white shadow-[0_24px_80px_rgba(6,21,43,0.24)]">
        <div className="shrink-0 border-b border-[#EAF2FF] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[24px] font-black text-[#0B1F3A]">
                {editingRewardId ? "Cập nhật quà tặng" : "Tạo quà tặng mới"}
              </h3>
              <p className="mt-1 text-[14px] font-semibold text-[#64748B]">
                Thiết lập thông tin quà, điểm đổi, tồn kho và mã voucher nếu có.
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

        <form onSubmit={onSave} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              <Section title="Thông tin cơ bản">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Tên quà tặng *" error={errors.name}>
                    <input
                      value={form.name}
                      onChange={(e) => onFieldChange("name", e.target.value)}
                      placeholder="Nhập tên quà tặng..."
                      className={inputClassName(errors.name)}
                    />
                  </FormField>
                  <FormField label="Loại quà tặng *">
                    <select
                      value={form.rewardType}
                      onChange={(e) => onFieldChange("rewardType", e.target.value as RewardFormState["rewardType"])}
                      className={inputClassName()}
                    >
                      {Object.entries(rewardTypeLabels).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField label="Mô tả quà tặng">
                      <textarea
                        value={form.description}
                        onChange={(e) => onFieldChange("description", e.target.value)}
                        rows={3}
                        placeholder="Mô tả chi tiết về quà tặng..."
                        className="min-h-[108px] w-full rounded-2xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-3 text-[14px] font-semibold text-[#0B1F3A] outline-none transition focus:border-[#0057E7] focus:bg-white"
                      />
                    </FormField>
                  </div>
                  <FormField label="Điểm yêu cầu *" error={errors.pointsRequired}>
                    <input
                      type="number"
                      value={form.pointsRequired}
                      onChange={(e) => onFieldChange("pointsRequired", e.target.value)}
                      placeholder="Ví dụ: 500"
                      className={inputClassName(errors.pointsRequired)}
                    />
                  </FormField>
                  <FormField label="Giá trị voucher / quà tặng" error={errors.rewardValue}>
                    <input
                      type="number"
                      value={form.rewardValue}
                      onChange={(e) => onFieldChange("rewardValue", e.target.value)}
                      placeholder="Ví dụ: 50000"
                      className={inputClassName(errors.rewardValue)}
                    />
                  </FormField>
                </div>
              </Section>

              <Section title="Ảnh quà tặng">
                <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#DCEBFF] bg-[#F8FBFF] text-center text-[13px] font-bold text-[#94A3B8]">
                    {previewUrl && !previewFailed ? (
                      <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto h-6 w-6" />
                        <div>Chưa có ảnh</div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl bg-[#0057E7] px-4 text-[14px] font-bold text-white transition hover:bg-[#003B7A]">
                      {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isUploadingImage ? "Đang tải ảnh..." : "Upload ảnh"}
                      <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
                    </label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => onImageUrlChange(e.target.value)}
                      placeholder="Hoặc nhập URL ảnh thủ công"
                      className={inputClassName()}
                    />
                  </div>
                </div>
              </Section>

              <Section title="Tồn kho & giới hạn">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="SKU">
                    <input value={form.sku} onChange={(e) => onFieldChange("sku", e.target.value)} className={inputClassName()} />
                  </FormField>
                  <FormField label="Số lượng tồn">
                    <input
                      type="number"
                      value={form.stockQuantity}
                      onChange={(e) => onFieldChange("stockQuantity", e.target.value)}
                      placeholder="Trống = vô hạn"
                      className={inputClassName(errors.stockQuantity)}
                    />
                  </FormField>
                  <FormField label="Tồn đã giữ">
                    <input
                      type="number"
                      value={form.reservedStock}
                      onChange={(e) => onFieldChange("reservedStock", e.target.value)}
                      className={inputClassName()}
                    />
                  </FormField>
                  <FormField label="Khối lượng">
                    <input value={form.weight} onChange={(e) => onFieldChange("weight", e.target.value)} className={inputClassName()} />
                  </FormField>
                  <FormField label="Kích thước">
                    <input value={form.dimensions} onChange={(e) => onFieldChange("dimensions", e.target.value)} className={inputClassName()} />
                  </FormField>
                  <FormField label="Giới hạn mỗi khách" error={errors.limitPerCustomer}>
                    <input
                      type="number"
                      value={form.limitPerCustomer}
                      onChange={(e) => onFieldChange("limitPerCustomer", e.target.value)}
                      placeholder="Trống = không giới hạn"
                      className={inputClassName(errors.limitPerCustomer)}
                    />
                  </FormField>
                </div>
              </Section>

              {isVoucherReward && (
                <Section title="Mã voucher">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <StatsCard label="Tổng mã" value={voucherStats.totalCodes} />
                    <StatsCard label="Có thể cấp" value={voucherStats.availableCodes} />
                    <StatsCard label="Đã cấp" value={voucherStats.assignedCodes} />
                    <StatsCard label="Đã dùng" value={voucherStats.usedCodes} />
                    <StatsCard label="Hết hạn" value={voucherStats.expiredCodes} />
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <FormField label="Nhập 1 mã voucher">
                      <div className="flex gap-2">
                        <input
                          value={voucherSingleCode}
                          onChange={(e) => onSingleCodeChange(e.target.value)}
                          placeholder="WELCOME50"
                          className={`${inputClassName()} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() => void onImportCodes()}
                          disabled={isImportingVoucher}
                          className="h-12 rounded-2xl bg-[#0057E7] px-4 text-[14px] font-bold text-white disabled:opacity-60"
                        >
                          Thêm mã
                        </button>
                      </div>
                    </FormField>

                    <FormField label="Hạn dùng voucher">
                      <input
                        type="datetime-local"
                        value={voucherExpiredAt}
                        onChange={(e) => onVoucherExpiredAtChange(e.target.value)}
                        className={inputClassName()}
                      />
                    </FormField>
                  </div>

                  <div className="mt-4 rounded-[20px] border border-[#DCEBFF] bg-[#F8FBFF] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-[16px] font-black text-[#0B1F3A]">Import nhiều mã voucher</div>
                        <div className="mt-1 text-[13px] font-semibold text-[#64748B]">
                          Mỗi dòng một mã. Có thể dán trực tiếp hoặc upload CSV.
                        </div>
                      </div>
                      <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-[13px] font-bold text-[#0057E7]">
                        <FileSpreadsheet className="h-4 w-4" />
                        Upload CSV
                        <input
                          type="file"
                          accept=".csv,text/csv,text/plain"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && void onVoucherCsv(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <textarea
                      value={voucherBulkCodes}
                      onChange={(e) => onBulkCodesChange(e.target.value)}
                      rows={5}
                      placeholder={"WELCOME50\nWELCOME51\nWELCOME52"}
                      className="mt-4 min-h-[140px] w-full rounded-2xl border border-[#DCEBFF] bg-white px-4 py-3 text-[14px] font-semibold text-[#0B1F3A] outline-none transition focus:border-[#0057E7]"
                    />
                    <button
                      type="button"
                      onClick={() => void onImportCodes()}
                      disabled={isImportingVoucher}
                      className="mt-3 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white disabled:opacity-60"
                    >
                      {isImportingVoucher && <Loader2 className="h-4 w-4 animate-spin" />}
                      Import danh sách mã
                    </button>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[20px] border border-[#DCEBFF]">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[860px] text-left text-[13px]">
                        <thead className="bg-[#F8FBFF] text-[11px] font-black uppercase tracking-[0.04em] text-[#64748B]">
                          <tr>
                            <th className="px-4 py-3">Mã voucher</th>
                            <th className="px-4 py-3">Giá trị</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Khách được cấp</th>
                            <th className="px-4 py-3">Ngày cấp</th>
                            <th className="px-4 py-3">Hạn dùng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EEF6FF]">
                          {voucherCodes.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-[#8AA1C2]">
                                Chưa có mã voucher cho quà này.
                              </td>
                            </tr>
                          ) : (
                            voucherCodes.map((voucher) => (
                              <tr key={voucher.id}>
                                <td className="px-4 py-3 font-black text-[#0057E7]">{voucher.voucher_code}</td>
                                <td className="px-4 py-3 font-semibold">
                                  {voucher.voucher_value !== null ? `${voucher.voucher_value.toLocaleString("vi-VN")}đ` : "—"}
                                </td>
                                <td className="px-4 py-3">{voucherStatusLabel(voucher.status)}</td>
                                <td className="px-4 py-3">{voucher.assigned_customer_id || "—"}</td>
                                <td className="px-4 py-3">{formatDateTime(voucher.assigned_at)}</td>
                                <td className="px-4 py-3">{formatDateTime(voucher.expired_at)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Section>
              )}

              <Section title="Hiệu lực & trạng thái">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Ngày bắt đầu">
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => onFieldChange("startsAt", e.target.value)}
                      className={inputClassName()}
                    />
                  </FormField>
                  <FormField label="Ngày kết thúc" error={errors.endsAt}>
                    <input
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(e) => onFieldChange("endsAt", e.target.value)}
                      className={inputClassName(errors.endsAt)}
                    />
                  </FormField>
                </div>

                <label className="mt-4 inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => onFieldChange("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-[#DCEBFF] text-[#0057E7]"
                  />
                  <span className="text-[14px] font-bold text-[#0B1F3A]">Kích hoạt đổi quà ngay lập tức</span>
                </label>
              </Section>
            </div>
          </div>

          <div className="shrink-0 border-t border-[#EAF2FF] bg-white px-6 py-5">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-2xl border border-[#DCEBFF] px-5 text-[14px] font-bold text-[#64748B]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage || isImportingVoucher}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white disabled:opacity-60"
              >
                {(isSubmitting || isUploadingImage) && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingRewardId ? "Lưu cấu hình" : "Tạo quà"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyRewardState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#0057E7]">
        <Gift className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-[20px] font-black text-[#0B1F3A]">Chưa có quà đổi điểm</h3>
      <p className="mx-auto mt-2 max-w-xl text-[14px] font-semibold leading-6 text-[#64748B]">
        Tạo quà đầu tiên để khách hàng có thể dùng điểm 3F Club đổi voucher hoặc quà tặng.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white"
      >
        <Plus className="h-4 w-4" />Tạo quà mới
      </button>
    </div>
  );
}

function StatsCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4">
      <div className="text-[12px] font-bold text-[#64748B]">{label}</div>
      <div className="mt-1 text-[22px] font-black text-[#0B1F3A]">{value.toLocaleString("vi-VN")}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[#EAF2FF] bg-[#FCFDFF] p-5">
      <h4 className="text-[18px] font-black text-[#0B1F3A]">{title}</h4>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FormField({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[13px] font-black text-[#0B1F3A]">{label}</div>
      {children}
      {error && <div className="mt-2 text-[12px] font-semibold text-[#E11D48]">{error}</div>}
    </label>
  );
}

function SmallIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCEBFF] bg-white text-[#2563EB] transition hover:bg-[#F6FAFF]"
    >
      {children}
    </button>
  );
}

function inputClassName(error?: string) {
  return `h-12 w-full rounded-2xl border bg-[#F6FAFF] px-4 text-[14px] font-semibold text-[#0B1F3A] outline-none transition focus:bg-white ${
    error ? "border-[#FCA5A5] focus:border-[#E11D48]" : "border-[#DCEBFF] focus:border-[#0057E7]"
  }`;
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

function voucherStatusLabel(status: RewardVoucherItem["status"]) {
  const labels = {
    available: "Có thể cấp",
    assigned: "Đã cấp",
    used: "Đã dùng",
    expired: "Hết hạn",
  };
  return labels[status] || status;
}
