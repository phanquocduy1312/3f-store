import { useState } from "react";
import { X } from "lucide-react";
import { rejectionReasons } from "@/lib/shopee-requests";
import type { ShopeePointRequest } from "@/types/shopee";

interface ShopeeActionModalProps {
  mode: "approve" | "reject" | null;
  request?: ShopeePointRequest;
  value: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ShopeeActionModal({
  mode,
  request,
  value,
  onValueChange,
  onClose,
  onConfirm,
}: ShopeeActionModalProps) {
  const [customReason, setCustomReason] = useState("");

  if (!mode || !request) {
    return null;
  }

  const isCustom = value === "Khác" || (!rejectionReasons.includes(value) && value !== "");
  const effectiveValue = isCustom ? customReason || "Khác" : value;

  const handleConfirm = () => {
    if (mode === "reject" && isCustom) {
      onValueChange(effectiveValue);
    }
    onConfirm();
  };

  const verifiedAmount = request.apiOrderAmount || request.customerInputAmount || 0;
  const expectedPoints = Math.floor(verifiedAmount / 10000);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#082B5F]/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-[#DCEBFF] bg-white p-6 shadow-[0_20px_70px_rgba(6,43,95,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[22px] font-black text-[#0B1F3A]">
              {mode === "approve" && "Duyệt và cộng điểm?"}
              {mode === "reject" && "Từ chối yêu cầu"}
            </h3>
            <p className="mt-2 text-[14px] text-[#64748B]">
              {mode === "approve" && (
                <>
                  <span className="block mb-1">
                    Đơn Shopee <strong>#{request.shopeeOrderCode}</strong> của <strong>{request.source === "guest" ? "Khách vãng lai" : "Thành viên"}</strong>.
                  </span>
                  SĐT nhận điểm: <strong>{request.phone}</strong><br />
                  Số tiền đã xác thực: <strong>{verifiedAmount.toLocaleString()}đ</strong><br />
                  Sẽ được duyệt và cộng <strong>{expectedPoints}</strong> điểm vào 3F Club.
                </>
              )}
              {mode === "reject" && "Chọn lý do từ chối để lưu vào lịch sử xử lý."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[#64748B] transition hover:bg-[#F6FAFF]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">
          {mode === "reject" ? (
            <div className="space-y-3">
              {rejectionReasons.map((reason) => (
                <div key={reason}>
                  <label
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#DCEBFF] px-4 py-3 text-[14px] font-semibold text-[#0B1F3A] transition hover:bg-[#F8FBFF]"
                  >
                    <input
                      type="radio"
                      name="reject-reason"
                      checked={value === reason || (reason === "Khác" && isCustom)}
                      onChange={() => onValueChange(reason)}
                      className="h-4 w-4 border-[#DCEBFF] text-[#0057E7]"
                    />
                    <span>{reason}</span>
                  </label>
                  {reason === "Khác" && (value === "Khác" || isCustom) && (
                    <div className="mt-2 pl-4">
                      <input
                        type="text"
                        placeholder="Nhập lý do từ chối khác..."
                        value={customReason}
                        onChange={(e) => {
                          setCustomReason(e.target.value);
                          onValueChange(e.target.value);
                        }}
                        className="w-full rounded-xl border border-[#DCEBFF] bg-[#F6FAFF] px-4 py-2.5 text-[13px] font-medium text-[#0B1F3A] placeholder:text-[#94A3B8] focus:border-[#0057E7] focus:bg-white focus:outline-none"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[20px] border border-[#DCEBFF] bg-[#F8FBFF] p-4 text-[14px] text-[#0B1F3A]">
              Điểm dự kiến sẽ được chuyển sang <strong>Điểm đã cộng</strong> sau khi xác nhận.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-[#DCEBFF] bg-white px-5 text-[14px] font-bold text-[#64748B] transition hover:bg-[#F6FAFF]"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={mode === "reject" && (!effectiveValue || effectiveValue.trim().length === 0)}
            onClick={handleConfirm}
            className="h-11 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white transition hover:bg-[#003B7A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
