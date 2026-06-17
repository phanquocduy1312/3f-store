import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  getMembershipTiers,
  previewMembershipTier,
  saveMembershipTier,
  setMembershipTierActive,
  type MembershipTier,
} from "@/src/services/loyaltyProductionApi";
import { ToastContainer, useToast } from "@/components/ui/toast-notification";

type TierFormState = {
  name: string;
  minPoints: string;
  multiplier: string;
  color: string;
  benefits: string;
  isActive: boolean;
};

type TierFormErrors = Partial<Record<keyof TierFormState, string>>;

type PreviewState = {
  name: string;
  minPoints: number;
  multiplier: number;
  color: string;
  benefits: string[];
  isActive: boolean;
};

type ConfirmState = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  onConfirm: () => Promise<void> | void;
} | null;

const DEFAULT_TIER_SET = [
  {
    name: "Silver",
    minPoints: 0,
    multiplier: 1,
    color: "#94A3B8",
    benefits: "Hạng mặc định cho khách hàng mới.\nTích điểm theo hệ số x1.",
    isActive: 1,
  },
  {
    name: "Gold",
    minPoints: 5000,
    multiplier: 1.2,
    color: "#F59E0B",
    benefits: "Tích điểm x1.2 khi mua hàng.\nƯu tiên đổi quà trong các chương trình 3F Club.",
    isActive: 1,
  },
  {
    name: "Platinum",
    minPoints: 15000,
    multiplier: 1.5,
    color: "#06B6D4",
    benefits: "Tích điểm x1.5 khi mua hàng.\nƯu tiên nhận quà và ưu đãi đặc biệt từ 3F Store.",
    isActive: 1,
  },
];

const INITIAL_FORM: TierFormState = {
  name: "",
  minPoints: "0",
  multiplier: "1",
  color: "#F59E0B",
  benefits: "",
  isActive: true,
};

const COLOR_SWATCHES = [
  "#94A3B8",
  "#F59E0B",
  "#06B6D4",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F97316",
  "#64748B",
];

export function MembershipTiersSection() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingTier, setIsCheckingTier] = useState(false);
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<TierFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<TierFormErrors>({});
  const [checkInput, setCheckInput] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checkError, setCheckError] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const { toast, toasts, removeToast } = useToast();

  const visibleTiers = useMemo(
    () =>
      [...tiers]
        .filter((tier) => tier.name?.trim().toLowerCase() !== "diamond")
        .sort((a, b) => Number(a.min_points) - Number(b.min_points)),
    [tiers],
  );

  const tierNames = useMemo(
    () => visibleTiers.map((tier) => tier.name.trim().toLowerCase()),
    [visibleTiers],
  );

  const modalPreview = useMemo<PreviewState>(() => {
    const previewName = form.name.trim() || "Tên hạng";
    const minPoints = Number(form.minPoints) || 0;
    const multiplier = Number(form.multiplier) || 1;
    const color = isHexColor(form.color) ? form.color : "#CBD5E1";
    const benefits = splitEditableBenefits(form.benefits);

    return {
      name: previewName,
      minPoints,
      multiplier,
      color,
      benefits,
      isActive: form.isActive,
    };
  }, [form]);

  const loadTiers = async () => {
    setIsLoading(true);
    try {
      const result = await getMembershipTiers();
      setTiers(result.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Không tải được hạng thành viên.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

  const resetModal = () => {
    setEditingTier(null);
    setForm(INITIAL_FORM);
    setErrors({});
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingTier(null);
    setForm(INITIAL_FORM);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (tier: MembershipTier) => {
    setEditingTier(tier);
    setForm({
      name: tier.name || "",
      minPoints: String(Number(tier.min_points) || 0),
      multiplier: String(Number(tier.multiplier) || 1),
      color: tier.color || "#F59E0B",
      benefits: tier.benefits || "",
      isActive: Number(tier.is_active) === 1,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleFieldChange = (field: keyof TierFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: TierFormErrors = {};
    const normalizedName = form.name.trim();
    const normalizedNameLower = normalizedName.toLowerCase();
    const minPoints = Number(form.minPoints);
    const multiplier = Number(form.multiplier);

    if (!normalizedName) {
      nextErrors.name = "Vui lòng nhập tên hạng thành viên.";
    } else if (normalizedNameLower === "diamond") {
      nextErrors.name = "3F Club không sử dụng hạng Diamond.";
    } else if (
      tierNames.includes(normalizedNameLower) &&
      editingTier?.name.trim().toLowerCase() !== normalizedNameLower
    ) {
      nextErrors.name = "Tên hạng đã tồn tại. Vui lòng dùng tên khác.";
    }

    if (form.minPoints.trim() === "") {
      nextErrors.minPoints = "Vui lòng nhập điểm tối thiểu.";
    } else if (!Number.isFinite(minPoints) || minPoints < 0) {
      nextErrors.minPoints = "Điểm tối thiểu phải lớn hơn hoặc bằng 0.";
    }

    if (form.multiplier.trim() === "") {
      nextErrors.multiplier = "Vui lòng nhập hệ số nhân điểm.";
    } else if (!Number.isFinite(multiplier) || multiplier < 1) {
      nextErrors.multiplier = "Hệ số nhân điểm phải lớn hơn hoặc bằng 1.";
    }

    if (!isHexColor(form.color)) {
      nextErrors.color = "Mã màu không hợp lệ. Ví dụ: #F59E0B";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveTier = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await saveMembershipTier({
        id: editingTier?.id,
        name: form.name.trim(),
        minPoints: Number(form.minPoints),
        multiplier: Number(form.multiplier),
        color: form.color,
        benefits: normalizeBenefits(form.benefits),
        isActive: form.isActive ? 1 : 0,
      });
      toast.success(editingTier ? "Đã cập nhật hạng thành viên." : "Đã tạo hạng thành viên.");
      resetModal();
      await loadTiers();
    } catch (err: any) {
      toast.error(err?.message || "Không lưu được hạng thành viên.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateDefaultSet = async () => {
    const existingNames = new Set(visibleTiers.map((tier) => tier.name.trim().toLowerCase()));
    const missingTiers = DEFAULT_TIER_SET.filter((tier) => !existingNames.has(tier.name.toLowerCase()));

    if (missingTiers.length === 0) {
      toast.warning("Bộ hạng mặc định đã tồn tại.");
      return;
    }

    setConfirmState({
      title: "Tạo bộ hạng mặc định",
      description: "Tạo bộ hạng mặc định Silver, Gold, Platinum?",
      confirmLabel: "Tạo bộ hạng",
      onConfirm: async () => {
        setIsSaving(true);
        try {
          for (const tier of missingTiers) {
            await saveMembershipTier(tier);
          }
          toast.success("Đã tạo bộ hạng mặc định.");
          await loadTiers();
        } catch (err: any) {
          toast.error(err?.message || "Không tạo được bộ hạng mặc định.");
        } finally {
          setIsSaving(false);
          setConfirmState(null);
        }
      },
    });
  };

  const handleToggleTier = (tier: MembershipTier) => {
    const isActive = Number(tier.is_active) === 1;
    setConfirmState({
      title: isActive ? "Tắt hạng thành viên" : "Kích hoạt hạng thành viên",
      description: isActive
        ? "Tắt hạng này? Khách sẽ không còn được xếp vào hạng này."
        : "Kích hoạt lại hạng này để khách hàng có thể được xếp hạng.",
      confirmLabel: isActive ? "Tắt hạng" : "Kích hoạt",
      tone: isActive ? "danger" : "primary",
      onConfirm: async () => {
        try {
          await setMembershipTierActive(tier.id, isActive ? 0 : 1);
          toast.success(isActive ? "Đã tắt hạng thành viên." : "Đã kích hoạt hạng thành viên.");
          await loadTiers();
        } catch (err: any) {
          toast.error(err?.message || "Không cập nhật được trạng thái hạng.");
        } finally {
          setConfirmState(null);
        }
      },
    });
  };

  const handleCheckTier = async () => {
    const value = checkInput.trim();
    if (!value) {
      setCheckError("Vui lòng nhập số điểm hoặc số điện thoại khách hàng.");
      setCheckResult(null);
      return;
    }

    setIsCheckingTier(true);
    setCheckError("");
    try {
      const payload =
        /^\d+$/.test(value) && value.length < 9
          ? { points: Number(value) }
          : { customerId: value };
      const result = await previewMembershipTier(payload);
      const data = result.data;

      if (!data || (!data.tier_name && !data.name && !data.tier)) {
        setCheckResult(null);
        setCheckError("Không tìm thấy khách hàng.");
      } else {
        setCheckResult(data);
      }
    } catch (err: any) {
      setCheckResult(null);
      setCheckError(err?.message || "Không tìm thấy khách hàng.");
    } finally {
      setIsCheckingTier(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
            <div className="border-b border-[#E8F1FF] px-5 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-[26px] font-black text-[#0B1F3A]">Hạng thành viên</h2>
                  <p className="mt-1 text-[14px] font-semibold text-[#64748B]">
                    Thiết lập hệ số nhân điểm cho từng nhóm khách hàng thân thiết.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCreateDefaultSet}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-[14px] font-bold text-[#0057E7] transition hover:bg-[#F7FBFF]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Tạo bộ hạng mặc định
                  </button>
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-4 text-[14px] font-bold text-white transition hover:bg-[#0048C7]"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm hạng
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center px-6 py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#0057E7]" />
              </div>
            ) : visibleTiers.length === 0 ? (
              <EmptyState onCreateDefaults={handleCreateDefaultSet} onCreateCustom={openCreateModal} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px]">
                    <thead>
                      <tr className="border-b border-[#E8F1FF] bg-[#FAFCFF] text-left text-[13px] font-black text-[#4B6385]">
                        <th className="px-5 py-4">Hạng</th>
                        <th className="px-4 py-4">Điểm tối thiểu</th>
                        <th className="px-4 py-4">Hệ số nhân điểm</th>
                        <th className="px-4 py-4">Màu</th>
                        <th className="px-4 py-4">Quyền lợi</th>
                        <th className="px-4 py-4">Trạng thái</th>
                        <th className="px-5 py-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF4FF]">
                      {visibleTiers.map((tier) => (
                        <tr key={tier.id} className="align-top">
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              <TierMedal color={tier.color || "#94A3B8"} />
                              <div>
                                <div className="text-[18px] font-black text-[#0B1F3A]">{tier.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5 text-[15px] font-bold text-[#0B1F3A]">
                            {formatPoints(Number(tier.min_points))}
                          </td>
                          <td className="px-4 py-5 text-[15px] font-bold text-[#0B1F3A]">
                            x{Number(tier.multiplier).toFixed(1)}
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-white shadow-[0_0_0_1px_rgba(148,163,184,0.22)]"
                                style={{ backgroundColor: tier.color || "#94A3B8" }}
                              />
                              <span className="text-[14px] font-bold text-[#4B6385]">
                                {(tier.color || "#94A3B8").toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <ul className="space-y-1 text-[14px] font-semibold leading-6 text-[#0B1F3A]">
                              {splitBenefits(tier.benefits).map((benefit, index) => (
                                <li key={`${tier.id}-${index}`} className="flex gap-2">
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-4 py-5">
                            <StatusBadge active={Number(tier.is_active) === 1} />
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex justify-end gap-2">
                              <IconButton
                                label="Sửa hạng"
                                icon={<Pencil className="h-4 w-4" />}
                                onClick={() => openEditModal(tier)}
                              />
                              <IconButton
                                label={Number(tier.is_active) === 1 ? "Tắt hạng" : "Kích hoạt hạng"}
                                icon={<Trash2 className="h-4 w-4" />}
                                onClick={() => handleToggleTier(tier)}
                                tone={Number(tier.is_active) === 1 ? "danger" : "neutral"}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-[#EEF4FF] px-5 py-4">
                  <div className="flex max-w-[420px] items-start gap-3 rounded-[18px] bg-[#F5F8FF] px-4 py-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-sm">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <p className="text-[14px] font-semibold leading-6 text-[#4B6385]">
                      Thứ tự ưu tiên: Platinum &gt; Gold &gt; Silver. Khách hàng sẽ được xếp vào hạng cao nhất mà họ đạt được.
                    </p>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-[24px] border border-[#DCEBFF] bg-white p-5 shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
            <h3 className="text-[18px] font-black text-[#0B1F3A]">Kiểm tra hạng khách hàng</h3>
            <p className="mt-2 text-[14px] font-semibold leading-6 text-[#64748B]">
              Nhập số điểm hoặc SĐT để kiểm tra hạng hiện tại của khách hàng.
            </p>

            <div className="mt-5 space-y-3">
              <input
                value={checkInput}
                onChange={(e) => {
                  setCheckInput(e.target.value);
                  setCheckError("");
                }}
                placeholder="Số điểm hoặc SĐT khách hàng"
                className="h-11 w-full rounded-2xl border border-[#DCEBFF] px-4 text-[14px] font-semibold text-[#0B1F3A] outline-none transition focus:border-[#B7D2FF] focus:ring-4 focus:ring-[#EAF2FF]"
              />
              <button
                type="button"
                onClick={handleCheckTier}
                disabled={isCheckingTier}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#0057E7] px-4 text-[14px] font-bold text-white transition hover:bg-[#0048C7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingTier && <Loader2 className="h-4 w-4 animate-spin" />}
                Kiểm tra
              </button>
            </div>

            <div className="mt-6 border-t border-[#EEF4FF] pt-5">
              <div className="text-[14px] font-black text-[#4B6385]">Kết quả</div>

              {checkError ? (
                <div className="mt-4 rounded-[18px] border border-[#FECACA] bg-[#FFF5F5] px-4 py-3 text-[14px] font-semibold text-[#B42318]">
                  {checkError}
                </div>
              ) : checkResult ? (
                <CheckerResultCard result={checkResult} />
              ) : (
                <div className="mt-4 rounded-[18px] border border-dashed border-[#DCEBFF] bg-[#FAFCFF] px-4 py-5 text-[14px] font-semibold text-[#8AA1C2]">
                  Nhập số điểm hoặc SĐT để xem khách hiện đang thuộc hạng nào.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#DCEBFF] bg-white p-5 shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
            <h3 className="text-[18px] font-black text-[#0B1F3A]">Cách hoạt động</h3>
            <p className="mt-3 text-[14px] font-semibold leading-6 text-[#64748B]">
              Điểm tích lũy khi mua hàng sẽ được nhân với hệ số của hạng hiện tại.
            </p>
            <div className="mt-4 rounded-[18px] bg-[#F6F9FF] px-4 py-4 text-[14px] font-semibold leading-6 text-[#4B6385]">
              Khách hàng Gold có hệ số x1.2. Đơn hàng được 100 điểm gốc sẽ nhận 120 điểm.
            </div>
            <button
              type="button"
              onClick={() => toast.warning("Hướng dẫn chi tiết sẽ được bổ sung ở bước tiếp theo.")}
              className="mt-4 inline-flex items-center gap-1 text-[14px] font-bold text-[#2563EB] transition hover:text-[#0B4DD8]"
            >
              Xem hướng dẫn chi tiết
              <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        </div>
      </div>

      {isModalOpen && (
        <TierModal
          editingTier={editingTier}
          form={form}
          errors={errors}
          preview={modalPreview}
          isSaving={isSaving}
          onChange={handleFieldChange}
          onClose={resetModal}
          onSave={handleSaveTier}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          description={confirmState.description}
          confirmLabel={confirmState.confirmLabel}
          tone={confirmState.tone}
          busy={isSaving}
          onClose={() => setConfirmState(null)}
          onConfirm={confirmState.onConfirm}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

function EmptyState({
  onCreateDefaults,
  onCreateCustom,
}: {
  onCreateDefaults: () => void;
  onCreateCustom: () => void;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF6FF] text-[#2563EB] shadow-[0_10px_30px_rgba(37,99,235,0.12)]">
        <Award className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-[24px] font-black text-[#0B1F3A]">Chưa có hạng thành viên</h3>
      <p className="mx-auto mt-3 max-w-[560px] text-[15px] font-semibold leading-7 text-[#64748B]">
        Tạo 3 hạng Silver, Gold, Platinum để phân nhóm khách hàng thân thiết.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCreateDefaults}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-5 text-[14px] font-bold text-[#0057E7] transition hover:bg-[#F7FBFF]"
        >
          <Sparkles className="h-4 w-4" />
          Tạo bộ hạng mặc định
        </button>
        <button
          type="button"
          onClick={onCreateCustom}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white transition hover:bg-[#0048C7]"
        >
          <Plus className="h-4 w-4" />
          Tạo hạng tùy chỉnh
        </button>
      </div>
    </div>
  );
}

function TierModal({
  editingTier,
  form,
  errors,
  preview,
  isSaving,
  onChange,
  onClose,
  onSave,
}: {
  editingTier: MembershipTier | null;
  form: TierFormState;
  errors: TierFormErrors;
  preview: PreviewState;
  isSaving: boolean;
  onChange: (field: keyof TierFormState, value: string | boolean) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06152B]/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-80px)] w-[min(1000px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(6,21,43,0.24)]">
        <div className="shrink-0 border-b border-[#EAF2FF] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[24px] font-black text-[#0B1F3A]">
                {editingTier ? "Cập nhật hạng thành viên" : "Thêm hạng thành viên"}
              </h3>
              <p className="mt-1 text-[14px] font-semibold text-[#64748B]">
                Thiết lập tên hạng, điểm tối thiểu, hệ số và quyền lợi dành cho khách hàng.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[#64748B] transition hover:bg-[#F4F8FF]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.9fr)]">
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Tên hạng *"
                  error={errors.name}
                  helper="Tên hiển thị của hạng thành viên."
                  input={
                    <input
                      value={form.name}
                      onChange={(e) => onChange("name", e.target.value)}
                      placeholder="Ví dụ: Gold"
                      className={inputClassName(errors.name)}
                    />
                  }
                />

                <Field
                  label="Điểm tối thiểu *"
                  error={errors.minPoints}
                  helper="Khách đạt từ số điểm này sẽ thuộc hạng này."
                  input={
                    <input
                      type="number"
                      min="0"
                      value={form.minPoints}
                      onChange={(e) => onChange("minPoints", e.target.value)}
                      placeholder="Ví dụ: 5000"
                      className={inputClassName(errors.minPoints)}
                    />
                  }
                />

                <Field
                  label="Hệ số nhân điểm *"
                  error={errors.multiplier}
                  helper="Khi khách tích điểm, điểm nhận được sẽ nhân với hệ số này."
                  input={
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={form.multiplier}
                      onChange={(e) => onChange("multiplier", e.target.value)}
                      placeholder="Ví dụ: 1.2"
                      className={inputClassName(errors.multiplier)}
                    />
                  }
                />

                <Field
                  label="Màu hạng *"
                  error={errors.color}
                  input={
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div
                          className="h-12 w-14 shrink-0 rounded-2xl border border-[#DCEBFF] shadow-inner"
                          style={{ backgroundColor: isHexColor(form.color) ? form.color : "#F3F6FB" }}
                        />
                        <input
                          value={form.color}
                          onChange={(e) => onChange("color", e.target.value.toUpperCase())}
                          placeholder="#F59E0B"
                          className={`${inputClassName(errors.color)} flex-1`}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_SWATCHES.map((color) => {
                          const selected = form.color.toUpperCase() === color;
                          return (
                            <button
                              key={color}
                              type="button"
                              title={color}
                              onClick={() => onChange("color", color)}
                              className={`h-9 w-9 rounded-xl border-2 transition ${
                                selected ? "border-[#0B1F3A] ring-4 ring-[#EAF2FF]" : "border-white hover:border-[#DCEBFF]"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  }
                />

                <div className="md:col-span-2">
                  <Field
                    label="Quyền lợi"
                    helper="Mỗi dòng là một quyền lợi, sẽ hiển thị thành danh sách."
                    input={
                      <textarea
                        value={form.benefits}
                        onChange={(e) => onChange("benefits", e.target.value)}
                        placeholder={"Ví dụ:\nTích điểm x1.2 khi mua hàng\nƯu tiên đổi quà\nNhận ưu đãi sinh nhật"}
                        rows={5}
                        className="min-h-[130px] w-full resize-none rounded-2xl border border-[#DCEBFF] bg-white px-4 py-3 text-[14px] font-semibold text-[#0B1F3A] outline-none transition focus:border-[#B7D2FF] focus:ring-4 focus:ring-[#EAF2FF]"
                      />
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Field
                    label="Kích hoạt"
                    helper="Hạng này sẽ được áp dụng cho khách hàng."
                    input={
                      <label className="mt-1 inline-flex cursor-pointer items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onChange("isActive", !form.isActive)}
                          className={`relative h-9 w-16 rounded-full transition ${
                            form.isActive ? "bg-[#0057E7]" : "bg-[#D9E6FB]"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-sm transition ${
                              form.isActive ? "left-8" : "left-1"
                            }`}
                          />
                        </button>
                        <span className="text-[15px] font-bold text-[#0B1F3A]">Kích hoạt hạng này</span>
                      </label>
                    }
                  />
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-0 lg:self-start">
              <div className="rounded-[24px] border border-[#E8F1FF] bg-[#FCFDFF] p-5 shadow-[0_8px_24px_rgba(6,43,95,0.04)]">
                <div className="text-[14px] font-black uppercase tracking-[0.04em] text-[#64748B]">Xem trước</div>
                <div className="mt-4 rounded-[22px] border border-[#E8F1FF] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <TierMedal color={preview.color} large />
                    <div className="min-w-0">
                      <div className="truncate text-[18px] font-black text-[#0B1F3A]">{preview.name}</div>
                      <div className="mt-1 text-[14px] font-semibold text-[#64748B]">
                        Điểm tối thiểu: {formatPoints(preview.minPoints)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#FFF3D8] px-3 py-1 text-[13px] font-black text-[#D97706]">
                      Hệ số: x{preview.multiplier.toFixed(1)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[13px] font-black ${
                        preview.isActive ? "bg-[#E8FFF0] text-[#16A34A]" : "bg-[#F2F4F7] text-[#667085]"
                      }`}
                    >
                      {preview.isActive ? "Kích hoạt" : "Tạm tắt"}
                    </span>
                  </div>

                  <ul className="mt-5 space-y-2 text-[14px] font-semibold leading-6 text-[#0B1F3A]">
                    {preview.benefits.length > 0 ? (
                      preview.benefits.map((benefit, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: preview.color }} />
                          <span>{benefit}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[#8AA1C2]">Quyền lợi sẽ hiển thị tại đây khi bạn nhập nội dung.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#EAF2FF] bg-white px-6 py-5">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl border border-[#DCEBFF] px-5 text-[14px] font-bold text-[#64748B] transition hover:bg-[#F8FBFF]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white transition hover:bg-[#0048C7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu hạng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  tone = "primary",
  busy,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#06152B]/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(6,21,43,0.24)]">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              tone === "danger" ? "bg-[#FFF1F2] text-[#E11D48]" : "bg-[#EEF6FF] text-[#2563EB]"
            }`}
          >
            {tone === "danger" ? <ShieldAlert className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-[20px] font-black text-[#0B1F3A]">{title}</h4>
            <p className="mt-2 text-[14px] font-semibold leading-6 text-[#64748B]">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-[#DCEBFF] px-5 text-[14px] font-bold text-[#64748B] transition hover:bg-[#F8FBFF]"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConfirm()}
            className={`inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-[14px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              tone === "danger" ? "bg-[#E11D48] hover:bg-[#C0103A]" : "bg-[#0057E7] hover:bg-[#0048C7]"
            }`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckerResultCard({ result }: { result: any }) {
  const tierName = result.tier_name || result.name || result.tier?.name || "Chưa có hạng";
  const multiplier = Number(result.multiplier || result.tier?.multiplier || 1);
  const currentPoints = Number(
    result.current_points ??
      result.points ??
      result.total_points ??
      result.customer_points ??
      0,
  );
  const color = result.color || result.tier?.color || "#F59E0B";

  return (
    <div className="mt-4 rounded-[20px] border border-[#F8E7BF] bg-[#FFFDF7] p-4">
      <div className="flex items-center gap-3">
        <TierMedal color={color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="truncate text-[20px] font-black text-[#0B1F3A]">{tierName}</div>
            <span className="rounded-full bg-[#FFF3D8] px-3 py-1 text-[13px] font-black text-[#D97706]">
              x{multiplier.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-[14px] font-semibold text-[#4B6385]">
        <div className="flex items-center justify-between gap-4">
          <span>Điểm hiện tại</span>
          <span className="font-black text-[#0B1F3A]">{formatPoints(currentPoints)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Hệ số nhân điểm</span>
          <span className="font-black text-[#0B1F3A]">x{multiplier.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

function TierMedal({ color, large = false }: { color: string; large?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)] ${
        large ? "h-14 w-14" : "h-9 w-9"
      }`}
      style={{ background: `linear-gradient(135deg, ${color}, ${mixColor(color, "#ffffff", 0.2)})` }}
    >
      <Award className={large ? "h-7 w-7" : "h-[18px] w-[18px]"} />
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[13px] font-black ${
        active ? "bg-[#E8FFF0] text-[#16A34A]" : "bg-[#F2F4F7] text-[#667085]"
      }`}
    >
      {active ? "Kích hoạt" : "Tạm tắt"}
    </span>
  );
}

function IconButton({
  label,
  icon,
  onClick,
  tone = "neutral",
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
        tone === "danger"
          ? "border-[#FECACA] text-[#F04438] hover:bg-[#FFF5F5]"
          : "border-[#DCEBFF] text-[#2563EB] hover:bg-[#F7FBFF]"
      }`}
    >
      {icon}
    </button>
  );
}

function Field({
  label,
  input,
  helper,
  error,
}: {
  label: string;
  input: ReactNode;
  helper?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[14px] font-black text-[#0B1F3A]">{label}</div>
      {input}
      {error ? (
        <div className="mt-2 text-[13px] font-semibold text-[#D92D20]">{error}</div>
      ) : helper ? (
        <div className="mt-2 text-[13px] font-semibold leading-5 text-[#8AA1C2]">{helper}</div>
      ) : null}
    </label>
  );
}

function inputClassName(error?: string) {
  return `h-12 w-full rounded-2xl border px-4 text-[14px] font-semibold text-[#0B1F3A] outline-none transition focus:ring-4 ${
    error
      ? "border-[#FCA5A5] bg-[#FFF5F5] focus:border-[#FCA5A5] focus:ring-[#FEE2E2]"
      : "border-[#DCEBFF] bg-white focus:border-[#B7D2FF] focus:ring-[#EAF2FF]"
  }`;
}

function splitBenefits(benefits?: string | null) {
  const rows = (benefits || "")
    .split(/\r?\n/)
    .map((item) => item.replace(/^[\-\u2022]\s*/, "").trim())
    .filter(Boolean);
  return rows.length > 0 ? rows : ["Chưa có mô tả quyền lợi."];
}

function splitEditableBenefits(benefits?: string | null) {
  return (benefits || "")
    .split(/\r?\n/)
    .map((item) => item.replace(/^[\-\u2022]\s*/, "").trim())
    .filter(Boolean);
}

function normalizeBenefits(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.replace(/^[\-\u2022]\s*/, "").trim())
    .filter(Boolean)
    .join("\n");
}

function isHexColor(value: string) {
  return /^#([0-9A-Fa-f]{6})$/.test(value.trim());
}

function formatPoints(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")} điểm`;
}

function mixColor(hex: string, mixWith: string, weight: number) {
  const base = hex.replace("#", "");
  const mix = mixWith.replace("#", "");
  const amount = Math.max(0, Math.min(1, weight));

  const baseRgb = [0, 2, 4].map((index) => parseInt(base.slice(index, index + 2), 16));
  const mixRgb = [0, 2, 4].map((index) => parseInt(mix.slice(index, index + 2), 16));

  const result = baseRgb.map((value, index) =>
    Math.round(value + (mixRgb[index] - value) * amount)
      .toString(16)
      .padStart(2, "0"),
  );

  return `#${result.join("")}`;
}
