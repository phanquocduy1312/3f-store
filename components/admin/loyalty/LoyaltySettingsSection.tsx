import { useEffect, useState } from "react";
import { 
  Calculator, 
  Coins, 
  HelpCircle, 
  Loader2, 
  Plus, 
  RefreshCcw, 
  Save, 
  Settings 
} from "lucide-react";
import { ToastContainer, useToast } from "@/components/ui/toast-notification";
import { API_BASE_URL } from "@/src/config/api";

type RoundingMode = "floor" | "round" | "ceil";

export interface LoyaltyRule {
  id: number;
  name: string;
  source: string;
  moneyPerPoint: number;
  roundingMode: RoundingMode;
  minOrderAmount: number;
  maxPointsPerOrder: number | null;
  multiplier: number;
  isActive: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface LoyaltySettingsSectionProps {
  onActiveRuleLoaded?: (rule: LoyaltyRule | null) => void;
  hideTitle?: boolean;
}

export function LoyaltySettingsSection({
  onActiveRuleLoaded,
  hideTitle = false,
}: LoyaltySettingsSectionProps) {
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [activeRule, setActiveRule] = useState<LoyaltyRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState("Quy tắc Shopee");
  const [moneyPerPoint, setMoneyPerPoint] = useState(10000);
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("floor");
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxPointsPerOrder, setMaxPointsPerOrder] = useState<number | "">("");
  const [multiplier, setMultiplier] = useState(1.0);
  const [isActive, setIsActive] = useState(true);
  
  // Preview Calculator State
  const [previewAmount, setPreviewAmount] = useState<number | "">("");
  const [previewResult, setPreviewResult] = useState<{
    points: number;
    amount: number;
    rule: LoyaltyRule | null;
  } | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const { toasts, toast, removeToast } = useToast();

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/loyalty/point-rules`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRules(data.data);
        const active = data.data.find((r: LoyaltyRule) => r.isActive === 1 && r.source === "shopee");
        if (active) {
          setActiveRule(active);
          setName(active.name);
          setMoneyPerPoint(active.moneyPerPoint);
          setRoundingMode(active.roundingMode);
          setMinOrderAmount(active.minOrderAmount);
          setMaxPointsPerOrder(active.maxPointsPerOrder !== null ? active.maxPointsPerOrder : "");
          setMultiplier(active.multiplier);
          setIsActive(active.isActive === 1);
          if (onActiveRuleLoaded) {
            onActiveRuleLoaded(active);
          }
        } else {
          setActiveRule(null);
          if (onActiveRuleLoaded) {
            onActiveRuleLoaded(null);
          }
        }
      }
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách quy tắc:", err);
      toast.error("Không thể tải danh sách quy tắc điểm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        source: "shopee",
        moneyPerPoint,
        roundingMode,
        minOrderAmount,
        maxPointsPerOrder: maxPointsPerOrder === "" ? null : Number(maxPointsPerOrder),
        multiplier,
        isActive: isActive ? 1 : 0
      };

      let url = `${API_BASE_URL}/api/admin/loyalty/point-rules`;

      if (activeRule) {
        url = `${API_BASE_URL}/api/admin/loyalty/point-rules/update`;
        Object.assign(payload, { id: activeRule.id });
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(activeRule ? "Cập nhật cấu hình điểm thành công!" : "Tạo quy tắc tích điểm thành công!");
        await fetchRules();
      } else {
        toast.error(data.message || "Không thể lưu cấu hình.");
      }
    } catch (err: any) {
      console.error("Lỗi khi lưu cấu hình điểm:", err);
      toast.error("Có lỗi xảy ra khi gửi yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateRule = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn tắt kích hoạt quy tắc này?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/loyalty/point-rules/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã tắt kích hoạt quy tắc thành công.");
        await fetchRules();
      } else {
        toast.error(data.message || "Lỗi tắt kích hoạt.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không gửi được yêu cầu.");
    }
  };

  const handleCreateNewActiveRule = async () => {
    setActiveRule(null);
    setName("Quy tắc Shopee mới");
    setMoneyPerPoint(10000);
    setRoundingMode("floor");
    setMinOrderAmount(0);
    setMaxPointsPerOrder("");
    setMultiplier(1.0);
    setIsActive(true);
    toast.success("Đã chuyển sang chế độ tạo quy tắc mới.");
  };

  const handleCalculatePreview = async () => {
    if (previewAmount === "" || Number(previewAmount) <= 0) {
      toast.warning("Vui lòng nhập số tiền đơn hàng hợp lệ.");
      return;
    }
    setIsPreviewing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/loyalty/calculate-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(previewAmount), source: "shopee" })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewResult(data.data);
      } else {
        toast.error(data.message || "Lỗi khi tính thử điểm.");
      }
    } catch (err) {
      console.error("Lỗi preview tính điểm:", err);
      toast.error("Không kết nối được API tính thử điểm.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="w-full space-y-6">
      {!hideTitle && (
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[30px] font-black text-[#0B1F3A]">Cấu hình tích điểm</h1>
            <p className="mt-1 text-[14px] text-[#64748B]">Thiết lập quy tắc quy đổi số tiền đơn hàng sang điểm tích lũy 3F Club</p>
          </div>
          {activeRule && (
            <button
              type="button"
              onClick={handleCreateNewActiveRule}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white transition hover:bg-[#003B7A] self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Tạo quy tắc mới
            </button>
          )}
        </section>
      )}

      {hideTitle && activeRule && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreateNewActiveRule}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white transition hover:bg-[#003B7A]"
          >
            <Plus className="h-4 w-4" />
            Tạo quy tắc mới
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Form Rule Config */}
        <form onSubmit={handleSaveRule} className="space-y-6 xl:col-span-7">
          <section className="rounded-[24px] border border-[#DCEBFF] bg-white p-6 shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
            <div className="flex items-center justify-between border-b border-[#EEF6FF] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF6FF] text-[#0057E7]">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[18px] font-black text-[#0B1F3A]">
                    {activeRule ? `Cập nhật: ${activeRule.name}` : "Tạo quy tắc tích điểm mới"}
                  </h2>
                  <p className="text-[12px] font-semibold text-[#64748B]">Cấu hình quy đổi điểm cho nguồn Shopee</p>
                </div>
              </div>
              {activeRule && (
                <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-black text-green-600 shrink-0">
                  Đang hoạt động
                </span>
              )}
            </div>

            <div className="mt-6 space-y-8">
              {/* Group 1: Cơ bản */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-black uppercase text-[#0B1F3A] flex items-center gap-2 border-b border-[#EEF6FF] pb-2">
                  1. Thông tin cơ bản
                </h3>
                <div>
                  <label className="block text-[12px] font-bold tracking-wide text-[#64748B]">Tên quy tắc</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Cấu hình quy đổi Shopee default"
                    className="mt-1.5 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-3 text-[14px] font-bold text-[#0B1F3A] transition focus:border-[#0057E7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057E7]/10"
                  />
                </div>
              </div>

              {/* Group 2: Tỉ lệ quy đổi */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-black uppercase text-[#0B1F3A] flex items-center gap-2 border-b border-[#EEF6FF] pb-2">
                  2. Công thức quy đổi
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-bold tracking-wide text-[#64748B]">
                      1 Điểm tương ứng số tiền (VND)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={moneyPerPoint}
                      onChange={(e) => setMoneyPerPoint(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-3 text-[14px] font-bold text-[#0B1F3A] transition focus:border-[#0057E7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057E7]/10"
                    />
                    <span className="mt-1.5 block text-[11px] font-medium text-[#64748B]">Ví dụ: 10000 đ = 1 điểm.</span>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold tracking-wide text-[#64748B]">Phương thức làm tròn</label>
                    <select
                      value={roundingMode}
                      onChange={(e) => setRoundingMode(e.target.value as RoundingMode)}
                      className="mt-1.5 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-3 text-[14px] font-bold text-[#0B1F3A] transition focus:border-[#0057E7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057E7]/10 cursor-pointer"
                    >
                      <option value="floor">Làm tròn xuống (ưu tiên)</option>
                      <option value="round">Làm tròn gần nhất</option>
                      <option value="ceil">Làm tròn lên</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Group 3: Điều kiện & Giới hạn */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-black uppercase text-[#0B1F3A] flex items-center gap-2 border-b border-[#EEF6FF] pb-2">
                  3. Điều kiện & Giới hạn
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-bold tracking-wide text-[#64748B]">Đơn tối thiểu (VND)</label>
                    <input
                      type="number"
                      min="0"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-3 text-[14px] font-bold text-[#0B1F3A] transition focus:border-[#0057E7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057E7]/10"
                    />
                    <span className="mt-1.5 block text-[11px] font-medium text-[#64748B]">Chỉ tính điểm khi tổng tiền {'>='} mức này.</span>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold tracking-wide text-[#64748B]">
                      Hệ số nhân (Multiplier)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={multiplier}
                      onChange={(e) => setMultiplier(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-3 text-[14px] font-bold text-[#0B1F3A] transition focus:border-[#0057E7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057E7]/10"
                    />
                    <span className="mt-1.5 block text-[11px] font-medium text-[#64748B]">Nhân đôi điểm = 2.0. Mặc định là 1.0.</span>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-bold tracking-wide text-[#64748B]">
                      Giới hạn điểm tối đa mỗi đơn (Để trống = Không giới hạn)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxPointsPerOrder}
                      onChange={(e) => setMaxPointsPerOrder(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Không giới hạn"
                      className="mt-1.5 w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] px-4 py-3 text-[14px] font-bold text-[#0B1F3A] transition focus:border-[#0057E7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057E7]/10"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="mt-6 rounded-xl bg-blue-50/50 p-4 border border-blue-100/50">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-5 w-5 rounded border-[#DCEBFF] text-[#0057E7] focus:ring-[#0057E7] cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-[14px] font-bold text-[#0B1F3A] cursor-pointer select-none">
                    Kích hoạt áp dụng quy tắc này ngay lập tức
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-end gap-3 border-t border-[#EEF6FF] pt-5">
                {activeRule && (
                  <button
                    type="button"
                    onClick={() => fetchRules()}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCEBFF] bg-white px-5 text-[14px] font-bold text-[#64748B] transition hover:bg-[#F8FBFF]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Hủy thay đổi
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0057E7] px-5 text-[14px] font-bold text-white shadow-[0_8px_18px_rgba(0,87,231,0.22)] transition hover:bg-[#003B7A] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Đang lưu...</>
                  ) : (
                    <><Save className="h-5 w-5" /> Lưu cấu hình</>
                  )}
                </button>
              </div>
            </div>
          </section>
        </form>

        {/* Calculator Preview */}
        <div className="space-y-6 xl:col-span-5">
          <section className="rounded-[24px] border border-[#DCEBFF] bg-white p-6 shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
            <div className="flex items-center gap-3 border-b border-[#EEF6FF] pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-black text-[#0B1F3A]">Bộ tính thử điểm</h2>
                <p className="text-[12px] font-semibold text-[#64748B]">Xem trước số điểm dựa trên cấu hình đang hoạt động</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-[0.03em] text-[#64748B]">Số tiền đơn hàng (VND)</label>
                <div className="relative mt-2">
                  <input
                    type="number"
                    value={previewAmount}
                    onChange={(e) => setPreviewAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Ví dụ: 20050000"
                    className="w-full rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] py-3.5 pl-4 pr-12 text-[15px] font-black text-[#0B1F3A] transition focus:border-[#0057E7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057E7]/10"
                  />
                  <span className="absolute right-4 top-3.5 text-[15px] font-bold text-[#94A3B8]">đ</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isPreviewing}
                onClick={handleCalculatePreview}
                className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-[#0057E7] text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(0,87,231,0.22)] transition hover:bg-[#003B7A] disabled:opacity-60"
              >
                {isPreviewing ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Đang tính...</>
                ) : (
                  "Tính thử điểm"
                )}
              </button>

              {previewResult !== null && (
                <div className="mt-6 rounded-xl border border-[#DCEBFF] bg-[#F8FBFF] p-5 space-y-4">
                  <div className="flex justify-between items-center text-[13px] font-semibold text-[#64748B]">
                    <span>Số tiền thử nghiệm:</span>
                    <span className="font-bold text-[#0B1F3A] text-[14px]">{formatVND(previewResult.amount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-[#EEF6FF] pt-4">
                    <span className="text-[13px] font-semibold text-[#64748B]">Điểm tích lũy dự kiến:</span>
                    <div className="flex items-center gap-1.5 text-xl font-black text-[#0057E7]">
                      <Coins className="h-6 w-6" />
                      <span>{previewResult.points} điểm</span>
                    </div>
                  </div>

                  {previewResult.rule ? (
                    <div className="border-t border-[#EEF6FF] pt-4 text-[12px] text-[#64748B] leading-relaxed">
                      <p className="font-bold text-[#0B1F3A] mb-1.5">Quy tắc đang áp dụng:</p>
                      <ul className="space-y-1 list-disc pl-4">
                        <li><span className="font-medium">Tên quy tắc:</span> {previewResult.rule.name}</li>
                        <li><span className="font-medium">Tỉ lệ quy đổi:</span> {formatVND(previewResult.rule.moneyPerPoint)} = 1 điểm</li>
                        <li><span className="font-medium">Cách làm tròn:</span> {previewResult.rule.roundingMode}</li>
                        {previewResult.rule.minOrderAmount > 0 && <li><span className="font-medium">Đơn tối thiểu:</span> {formatVND(previewResult.rule.minOrderAmount)}</li>}
                        {previewResult.rule.multiplier !== 1 && <li><span className="font-medium">Hệ số nhân:</span> x{previewResult.rule.multiplier}</li>}
                        {previewResult.rule.maxPointsPerOrder !== null && <li><span className="font-medium">Giới hạn tối đa:</span> {previewResult.rule.maxPointsPerOrder} điểm/đơn</li>}
                      </ul>
                    </div>
                  ) : (
                    <div className="border-t border-[#EEF6FF] pt-4 text-[12px] text-[#F59E0B] font-bold">
                      * Chưa có quy tắc cấu hình trong hệ thống, đang dùng quy tắc mặc định (10.000đ = 1 điểm, làm tròn xuống).
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Rules List History */}
      <section className="rounded-[24px] border border-[#DCEBFF] bg-white shadow-[0_8px_24px_rgba(6,43,95,0.06)] overflow-hidden">
        <div className="bg-[#F8FBFF] px-6 py-4 border-b border-[#EEF6FF]">
          <h3 className="text-[16px] font-black text-[#0B1F3A]">Lịch sử cấu hình quy tắc</h3>
          <p className="text-[12px] text-[#64748B] mt-0.5">Danh sách các quy tắc điểm đã được thiết lập</p>
        </div>

        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[960px] table-fixed text-left text-[13px] text-[#0B1F3A]">
            <thead className="bg-[#F8FBFF] text-[11px] font-black uppercase tracking-[0.04em] text-[#64748B] border-b border-[#EEF6FF]">
              <tr>
                <th className="w-[180px] px-6 py-3">Tên cấu hình</th>
                <th className="w-[100px] px-4 py-3">Nguồn</th>
                <th className="w-[140px] px-4 py-3">Tỉ lệ quy đổi</th>
                <th className="w-[110px] px-4 py-3">Làm tròn</th>
                <th className="w-[130px] px-4 py-3">Đơn tối thiểu</th>
                <th className="w-[110px] px-4 py-3">Giới hạn điểm</th>
                <th className="w-[90px] px-4 py-3">Hệ số nhân</th>
                <th className="w-[120px] px-4 py-3">Trạng thái</th>
                <th className="w-[100px] px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF6FF]">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-[#0057E7]" />
                      <span>Đang tải danh sách quy tắc...</span>
                    </div>
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-[#64748B]">
                    Chưa có quy tắc nào được cấu hình.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-[#F8FBFF]/50 transition h-14">
                    <td className="px-6 py-3 font-bold truncate">{rule.name}</td>
                    <td className="px-4 py-3 font-semibold uppercase text-[12px] text-[#64748B]">{rule.source}</td>
                    <td className="px-4 py-3 font-bold text-[#0057E7]">{formatVND(rule.moneyPerPoint)} = 1 điểm</td>
                    <td className="px-4 py-3 font-semibold capitalize text-[12px]">{rule.roundingMode}</td>
                    <td className="px-4 py-3 font-bold">{formatVND(rule.minOrderAmount)}</td>
                    <td className="px-4 py-3 font-semibold text-[#64748B]">
                      {rule.maxPointsPerOrder !== null ? `${rule.maxPointsPerOrder} điểm` : "Không giới hạn"}
                    </td>
                    <td className="px-4 py-3 font-bold">x{rule.multiplier.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          rule.isActive === 1
                            ? "bg-green-50 text-green-600"
                            : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        {rule.isActive === 1 ? "Hoạt động" : "Tắt áp dụng"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {rule.isActive === 1 ? (
                        <button
                          type="button"
                          onClick={() => handleDeactivateRule(rule.id)}
                          className="text-[12px] font-bold text-red-600 hover:text-red-800 transition"
                        >
                          Tắt áp dụng
                        </button>
                      ) : (
                        <span className="text-[12px] font-semibold text-slate-400">Không thao tác</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
