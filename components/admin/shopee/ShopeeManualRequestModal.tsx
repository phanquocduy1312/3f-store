import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Info,
  Loader2,
  ShoppingBag,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import type { ShopeePointRequest } from "@/types/shopee";

interface ShopeeManualRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newRequest: Omit<ShopeePointRequest, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  existingRequests: ShopeePointRequest[];
}

export function ShopeeManualRequestModal({
  open,
  onClose,
  onSubmit,
  existingRequests,
}: ShopeeManualRequestModalProps) {
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [zalo, setZalo] = useState("");

  const [shopeeOrderCode, setShopeeOrderCode] = useState("");
  const [orderAmount, setOrderAmount] = useState(0);
  const [orderAmountInput, setOrderAmountInput] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("2026-06-12"); // Default to local time June 12, 2026
  const [receivedFrom, setReceivedFrom] = useState<"zalo" | "facebook" | "hotline" | "internal" | "other">("zalo");

  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [internalNote, setInternalNote] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);

  // Focus field on mount
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Handle Clean/Dirty states for close confirmation
  const isDirty =
    phone !== "" ||
    customerName !== "" ||
    email !== "" ||
    zalo !== "" ||
    shopeeOrderCode !== "" ||
    orderAmountInput !== "" ||
    internalNote !== "" ||
    proofImage !== null;

  const handleCloseAttempt = () => {
    if (isDirty) {
      const confirmClose = window.confirm(
        "Bạn có muốn đóng? Dữ liệu chưa lưu sẽ bị mất."
      );
      if (!confirmClose) return;
    }
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setPhone("");
    setCustomerName("");
    setEmail("");
    setZalo("");
    setShopeeOrderCode("");
    setOrderAmount(0);
    setOrderAmountInput("");
    setPurchaseDate("2026-06-12");
    setReceivedFrom("zalo");
    setProofImage(null);
    if (proofImageUrl) {
      URL.revokeObjectURL(proofImageUrl);
      setProofImageUrl("");
    }
    setInternalNote("");
    setLoading(false);
  };

  // Keyboard accessibility: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseAttempt();
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isDirty]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (proofImageUrl) {
        URL.revokeObjectURL(proofImageUrl);
      }
    };
  }, [proofImageUrl]);

  // Input Handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const parsed = digits ? parseInt(digits, 10) : 0;
    setOrderAmount(parsed);
    setOrderAmountInput(parsed > 0 ? new Intl.NumberFormat("vi-VN").format(parsed) : "");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa là 5MB.");
      return;
    }

    if (proofImageUrl) {
      URL.revokeObjectURL(proofImageUrl);
    }

    setProofImage(file);
    setProofImageUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setProofImage(null);
    if (proofImageUrl) {
      URL.revokeObjectURL(proofImageUrl);
      setProofImageUrl("");
    }
  };

  // Validations
  const isPhoneValid = /^\d{9,11}$/.test(phone);
  const isOrderCodeValid = shopeeOrderCode.trim().length > 0;
  const isAmountValid = orderAmount > 0;
  const isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = isPhoneValid && isOrderCodeValid && isAmountValid && isEmailValid;

  const isDuplicateCode =
    shopeeOrderCode.trim().length > 0 &&
    existingRequests.some(
      (r) =>
        r.shopeeOrderCode.trim().toUpperCase() ===
        shopeeOrderCode.trim().toUpperCase()
    );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);

    // Simulate short network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      await onSubmit({
        customerName: customerName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        zalo: zalo.trim() || undefined,
        shopeeOrderCode: shopeeOrderCode.trim().toUpperCase(),
        customerInputAmount: orderAmount,
        orderImageUrl: proofImageUrl || undefined,
        apiChecked: false,
        apiCheckStatus: "not_checked",
        expectedPoints: Math.floor(orderAmount / 10000),
        status: "pending",
        verificationIssues: [],
        adminNote: internalNote.trim() || undefined,
        source: "manual_admin",
        receivedFrom,
      });

      toast.success("Đã tạo yêu cầu thủ công thành công.");
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi tạo yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (!open) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 z-50 bg-[#0B1F3A]/40 backdrop-blur-sm"
        onClick={handleCloseAttempt}
      />

      {/* Modal Container */}
      <div
        className="fixed left-0 top-0 z-50 flex h-full w-full max-h-none flex-col overflow-hidden bg-white md:fixed md:left-1/2 md:top-1/2 md:h-auto md:max-h-[calc(100vh-48px)] md:w-[min(980px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px] md:border md:border-[#DCEBFF] md:shadow-[0_24px_80px_rgba(6,43,95,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-5 border-b border-[#DCEBFF] bg-white flex items-start justify-between">
          <div className="min-w-0">
            <h2 className="text-[24px] font-black text-[#0B1F3A]">Tạo yêu cầu thủ công</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Dùng khi khách gửi mã đơn qua Zalo/Facebook/hotline hoặc khi nhân viên cần nhập giúp khách.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseAttempt}
            className="h-10 w-10 rounded-2xl border border-[#DCEBFF] bg-white text-[#64748B] hover:bg-[#F6FAFF] flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto admin-scrollbar px-6 py-5 bg-white">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Form Sections */}
              <div className="xl:col-span-8 space-y-6">
                {/* Section 1: Customer Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#0B1F3A]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF6FF] text-[#0057E7]">
                      <User className="h-4 w-4" />
                    </div>
                    <h3 className="text-[16px] font-black">1. Thông tin khách hàng</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-1.5">
                        Số điện thoại *
                      </label>
                      <div className="relative">
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="Nhập số điện thoại"
                          className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-sm text-[#0B1F3A] placeholder:text-[#94A3B8] focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100 outline-none w-full"
                          required
                        />
                      </div>
                      {phone.length > 0 && !isPhoneValid && (
                        <p className="text-xs text-[#EF3340] mt-1 font-semibold">
                          Số điện thoại phải từ 9 đến 11 số.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-1.5">
                        Tên khách hàng
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nhập tên khách hàng"
                        className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-sm text-[#0B1F3A] placeholder:text-[#94A3B8] focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100 outline-none w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-1.5">
                        Email
                      </label>
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email"
                        className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-sm text-[#0B1F3A] placeholder:text-[#94A3B8] focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100 outline-none w-full"
                      />
                      {email.length > 0 && !isEmailValid && (
                        <p className="text-xs text-[#EF3340] mt-1 font-semibold">
                          Định dạng email không hợp lệ.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-1.5">
                        Zalo
                      </label>
                      <input
                        type="text"
                        value={zalo}
                        onChange={(e) => setZalo(e.target.value)}
                        placeholder="Nhập Zalo (nếu có)"
                        className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-sm text-[#0B1F3A] placeholder:text-[#94A3B8] focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100 outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Shopee Order Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#0B1F3A]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF6FF] text-[#0057E7]">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <h3 className="text-[16px] font-black">2. Thông tin đơn Shopee</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-1.5">
                        Mã đơn Shopee *
                      </label>
                      <input
                        type="text"
                        value={shopeeOrderCode}
                        onChange={(e) => setShopeeOrderCode(e.target.value)}
                        placeholder="Nhập mã đơn Shopee"
                        className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-sm text-[#0B1F3A] placeholder:text-[#94A3B8] focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100 outline-none w-full"
                        required
                      />
                      {isDuplicateCode && (
                        <p className="text-xs text-orange-600 mt-1 font-semibold">
                          Mã đơn này đã tồn tại trong hệ thống. Vui lòng kiểm tra trước khi tạo.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-1.5">
                        Tổng tiền đơn *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={orderAmountInput}
                          onChange={handleAmountChange}
                          placeholder="Nhập tổng tiền đơn (VNĐ)"
                          className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-sm text-[#0B1F3A] placeholder:text-[#94A3B8] focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100 outline-none w-full"
                          required
                        />
                      </div>
                      {orderAmountInput.length > 0 && !isAmountValid && (
                        <p className="text-xs text-[#EF3340] mt-1 font-semibold">
                          Tổng tiền phải lớn hơn 0đ.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-1.5">
                        Ngày mua
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="date"
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                          className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 pr-10 text-sm text-[#0B1F3A] placeholder:text-[#94A3B8] focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100 outline-none w-full"
                        />
                        <Calendar className="absolute right-4 h-4 w-4 text-[#64748B] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-1.5">
                        Nguồn tiếp nhận
                      </label>
                      <select
                        value={receivedFrom}
                        onChange={(e) => setReceivedFrom(e.target.value as any)}
                        className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-4 text-sm text-[#0B1F3A] focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100 outline-none w-full appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 16px center',
                          backgroundSize: '16px'
                        }}
                      >
                        <option value="zalo">Zalo</option>
                        <option value="facebook">Facebook</option>
                        <option value="hotline">Hotline</option>
                        <option value="internal">Nhập nội bộ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Proof image */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[16px] font-black text-[#0B1F3A]">
                      3. Minh chứng đơn hàng
                    </h3>
                    <p className="text-sm text-[#64748B]">Tải ảnh đơn hàng / phiếu giao hàng</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="w-full rounded-2xl border border-dashed border-[#BFD7FF] bg-[#F6FAFF] h-[150px] flex flex-col items-center justify-center relative cursor-pointer group hover:bg-[#EEF6FF] transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                      />
                      <UploadCloud className="h-8 w-8 text-[#0057E7] mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-semibold text-[#0B1F3A]">
                        Kéo thả ảnh vào đây hoặc
                      </p>
                      <span className="text-sm font-black text-[#0057E7] mt-1">
                        [Chọn ảnh]
                      </span>
                    </div>

                    {proofImage && (
                      <div className="flex items-center gap-3 rounded-2xl border border-[#DCEBFF] bg-white p-3 relative w-full md:w-auto min-w-[260px] max-w-full">
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                          <img
                            src={proofImageUrl}
                            alt="Proof Thumbnail"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 pr-6">
                          <p className="text-[14px] font-black text-[#0B1F3A] truncate">
                            {proofImage.name}
                          </p>
                          <p className="text-[12px] text-[#64748B] mt-0.5">
                            {formatBytes(proofImage.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-slate-100 border border-[#DCEBFF] flex items-center justify-center text-[#64748B] hover:bg-red-50 hover:text-[#EF3340] transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] text-[#64748B]">Hỗ trợ: JPG, PNG, WEBP (tối đa 5MB)</p>
                </div>

                {/* Section 4: Internal notes */}
                <div className="space-y-4">
                  <h3 className="text-[16px] font-black text-[#0B1F3A]">
                    4. Ghi chú nội bộ
                  </h3>
                  <div className="relative">
                    <textarea
                      maxLength={500}
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Nhập ghi chú nội bộ (nếu có)"
                      className="min-h-[92px] rounded-2xl border border-[#DCEBFF] bg-white px-4 py-3 text-sm text-[#0B1F3A] placeholder:text-[#94A3B8] focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100 outline-none w-full resize-none"
                    />
                    <div className="text-right text-xs text-[#64748B] mt-1 font-semibold">
                      {internalNote.length}/500
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Informative Side Card */}
              <div className="xl:col-span-4 xl:sticky xl:top-0 self-start">
                <div className="rounded-[24px] border border-[#DCEBFF] bg-gradient-to-b from-[#F6FAFF] to-white p-5 space-y-4">
                  <div className="flex items-center gap-2 text-[#0057E7]">
                    <Info className="h-5 w-5 shrink-0" />
                    <span className="font-black text-[#0B1F3A] text-[15px]">Hệ thống sẽ tự động</span>
                  </div>
                  <ul className="space-y-3.5 text-[13px] text-[#0B1F3A] font-semibold">
                    <li className="flex items-center justify-between gap-2">
                      <span className="text-[#64748B]">Tạo yêu cầu ở trạng thái:</span>
                      <span className="rounded-full bg-blue-50 text-[#0057E7] px-2.5 py-0.5 text-[11px] font-bold">
                        pending
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span className="text-[#64748B]">Ước tính điểm:</span>
                      <span className="font-bold text-[#0B1F3A]">Tổng tiền / 10.000</span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span className="text-[#64748B]">Đánh dấu nguồn:</span>
                      <span className="rounded-full bg-[#EEF6FF] text-[#003B7A] px-2.5 py-0.5 text-[11px] font-bold">
                        manual_admin
                      </span>
                    </li>
                    <li className="text-[#64748B] text-[12px] font-medium pt-1 border-t border-[#DCEBFF]">
                      • Chờ đối chiếu API Shopee
                    </li>
                  </ul>

                  <div className="rounded-2xl border border-dashed border-[#BFD7FF] bg-white p-4 flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5 shrink-0">💡</span>
                    <p className="text-[13px] font-semibold text-[#64748B] leading-relaxed">
                      {orderAmount > 0 ? (
                        <>
                          Ví dụ: đơn{" "}
                          <span className="font-bold text-[#0B1F3A]">
                            {new Intl.NumberFormat("vi-VN").format(orderAmount)}đ
                          </span>{" "}
                          sẽ được dự kiến{" "}
                          <span className="font-bold text-[#0057E7]">
                            {Math.floor(orderAmount / 10000)} điểm
                          </span>
                          .
                        </>
                      ) : (
                        "Nhập tổng tiền để hệ thống ước tính điểm."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[#DCEBFF] bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCloseAttempt}
            disabled={loading}
            className="h-11 px-5 rounded-2xl border border-[#DCEBFF] bg-white text-[#0057E7] font-bold hover:bg-[#F6FAFF] transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={!isFormValid || loading}
            className="h-11 px-6 rounded-2xl bg-[#0057E7] text-white font-black hover:bg-[#003B7A] shadow-[0_8px_18px_rgba(0,87,231,0.22)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            + Tạo yêu cầu
          </button>
        </div>
      </div>
    </>
  );
}
