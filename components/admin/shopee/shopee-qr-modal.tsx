import React, { useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Copy, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShopeeQrModalProps {
  url: string;
  onClose: () => void;
}

/**
 * Modal hiển thị QR code dẫn đến trang tích điểm Shopee 3F Club.
 * Sales có thể tải ảnh QR về rồi gửi qua Zalo cho khách hàng.
 */
export function ShopeeQrModal({ url, onClose }: ShopeeQrModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Download QR as PNG
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Create a decorated canvas: logo area + padding + branding
    const padding = 32;
    const brandingHeight = 72;
    const size = canvas.width;
    const totalW = size + padding * 2;
    const totalH = size + padding * 2 + brandingHeight;

    const offscreen = document.createElement("canvas");
    offscreen.width = totalW;
    offscreen.height = totalH;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, totalW, totalH);

    // Top accent bar
    ctx.fillStyle = "#0057E7";
    ctx.fillRect(0, 0, totalW, 6);

    // QR code
    ctx.drawImage(canvas, padding, padding + 6);

    // Bottom branding strip
    ctx.fillStyle = "#F6FAFF";
    ctx.fillRect(0, size + padding * 2 + 6, totalW, brandingHeight - 6);

    // Divider line
    ctx.strokeStyle = "#DCEBFF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, size + padding * 2 + 6);
    ctx.lineTo(totalW, size + padding * 2 + 6);
    ctx.stroke();

    // Brand text
    ctx.fillStyle = "#0B1F3A";
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("3F Club — Tích điểm Shopee", totalW / 2, size + padding * 2 + 34);

    ctx.fillStyle = "#64748B";
    ctx.font = "500 12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Quét QR để gửi đơn và nhận điểm thưởng", totalW / 2, size + padding * 2 + 56);

    // Trigger download
    const link = document.createElement("a");
    link.download = "3fclub-tich-diem-shopee-qr.png";
    link.href = offscreen.toDataURL("image/png", 1.0);
    link.click();

    toast.success("Đã tải ảnh QR thành công!");
  }, []);

  // Copy URL to clipboard
  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Đã sao chép link tích điểm!");
    }).catch(() => {
      toast.error("Không sao chép được. Vui lòng copy thủ công.");
    });
  }, [url]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-[28px] shadow-2xl shadow-blue-900/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DCEBFF] bg-gradient-to-r from-[#0057E7] to-[#2563EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <QrCode size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-white leading-tight">Mã QR Tích điểm Shopee</h2>
              <p className="text-[11px] text-blue-100 font-medium">Chia sẻ cho khách qua Zalo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* QR Code area */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          {/* QR wrapper with logo overlay */}
          <div
            ref={canvasRef}
            className="relative p-3 bg-white rounded-2xl border-2 border-[#DCEBFF] shadow-[0_8px_32px_rgba(0,87,231,0.08)]"
          >
            <QRCodeCanvas
              value={url}
              size={220}
              level="M"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#0B1F3A"
              imageSettings={{
                src: "/favicon.ico",
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
          </div>

          {/* URL preview */}
          <div className="w-full mt-4 px-3 py-2.5 bg-[#F6FAFF] rounded-xl border border-[#DCEBFF] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0057E7] shrink-0 animate-pulse" />
            <p className="text-[11px] font-semibold text-[#0057E7] truncate flex-1">{url}</p>
          </div>

          {/* Instruction */}
          <p className="mt-3 text-center text-[12px] font-medium text-[#64748B] leading-relaxed">
            Khách hàng quét QR → điền thông tin đơn Shopee → gửi yêu cầu tích điểm tự động
          </p>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 flex flex-col gap-2.5">
          {/* Primary: Download */}
          <button
            onClick={handleDownload}
            className="w-full h-12 flex items-center justify-center gap-2.5 bg-[#0057E7] hover:bg-[#0046b8] active:scale-[0.98] text-white font-black text-[14px] rounded-2xl transition-all duration-150 shadow-lg shadow-blue-600/20"
          >
            <Download size={18} />
            Tải ảnh QR về (PNG)
          </button>

          {/* Secondary: Copy URL */}
          <button
            onClick={handleCopyUrl}
            className="w-full h-11 flex items-center justify-center gap-2 bg-[#F6FAFF] hover:bg-[#EEF6FF] active:scale-[0.98] text-[#0057E7] font-bold text-[13px] rounded-2xl border border-[#DCEBFF] transition-all duration-150"
          >
            <Copy size={15} />
            Sao chép link tích điểm
          </button>
        </div>

        {/* Footer tip */}
        <div className="px-5 pb-4">
          <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <Share2 size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
              <strong>Tip Sale:</strong> Tải ảnh QR → Gửi ảnh qua Zalo cho khách → Khách quét và tự điền thông tin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
