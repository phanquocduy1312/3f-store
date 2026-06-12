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
  if (!mode || !request) {
    return null;
  }

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
              {mode === "approve" &&
                `Đơn Shopee #${request.shopeeOrderCode} sẽ được duyệt và cộng ${request.expectedPoints} điểm vào tài khoản 3F Club của khách.`}
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
                <label
                  key={reason}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#DCEBFF] px-4 py-3 text-[14px] font-semibold text-[#0B1F3A] transition hover:bg-[#F8FBFF]"
                >
                  <input
                    type="radio"
                    name="reject-reason"
                    checked={value === reason}
                    onChange={() => onValueChange(reason)}
                    className="h-4 w-4 border-[#DCEBFF] text-[#0057E7]"
                  />
                  <span>{reason}</span>
                </label>
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
            disabled={mode === "reject" && value.trim().length === 0}
            onClick={onConfirm}
            className="h-11 rounded-2xl bg-[#0057E7] px-5 text-[14px] font-bold text-white transition hover:bg-[#003B7A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
