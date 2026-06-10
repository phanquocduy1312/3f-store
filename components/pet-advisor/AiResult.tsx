import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Share2, MessageCircle, ShoppingBag, ExternalLink } from "lucide-react";
import { AiResultData } from "./mockAiResult";

interface AiResultProps {
  result: AiResultData;
  onExploreProducts: () => void;
  onConsultAgent: () => void;
  onShareZalo: () => void;
}

export function AiResult({ result, onExploreProducts, onConsultAgent, onShareZalo }: AiResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.voucher_code || "3F30K");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-5 text-left max-h-[500px] overflow-y-auto pr-1"
    >
      <div>
        <span className="bg-forest-soft text-forest text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-forest-muted">
          Kết Quả Phân Tích
        </span>
        <h4 className="text-[20px] font-black text-ink mt-2">
          🎉 KẾT QUẢ CHO BÉ
        </h4>
        <p className="text-ink-soft text-[13px] bg-cream-soft p-3 rounded-xl border border-gray-100 mt-2 font-medium leading-relaxed">
          {result.summary}
        </p>
      </div>

      {/* Main Advice */}
      <div className="space-y-1">
        <h5 className="text-[14px] font-bold text-ink">Lời khuyên từ 3F AI:</h5>
        <p className="text-ink-soft text-[13.5px] leading-relaxed">
          {result.advice}
        </p>
      </div>

      {/* Recommended groups list */}
      <div className="space-y-2">
        <h5 className="text-[14px] font-bold text-ink">Nhóm sản phẩm khuyên dùng:</h5>
        <div className="space-y-2">
          {result.recommended_groups.map((group, idx) => (
            <div key={idx} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[13.5px] font-black text-forest flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span>{group.group}</span>
              </div>
              <p className="text-[12.5px] text-ink-soft mt-1 leading-normal ml-6">
                {group.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Care tips */}
      <div className="p-3.5 bg-yellow-50/50 border border-yellow-100 rounded-xl space-y-1.5">
        <h5 className="text-[13px] font-bold text-yellow-800">Mẹo nhỏ từ chuyên gia:</h5>
        <ul className="list-disc pl-4 space-y-1 text-[12px] text-yellow-900/80 leading-relaxed font-medium">
          {result.care_tips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Voucher */}
      <div className="bg-[#ED4546]/5 border-2 border-dashed border-[#ED4546]/20 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-[#ED4546] font-bold block uppercase tracking-wider">
            Voucher của anh/chị
          </span>
          <span className="text-[20px] font-black text-ink tracking-wider">
            {result.voucher_code}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="bg-[#ED4546] hover:bg-[#d93839] text-white py-2 px-4 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-[#ED4546]/10 text-xs font-bold shrink-0"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? "Đã copy" : "Copy mã"}</span>
        </button>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={onExploreProducts}
          className="w-full bg-forest hover:bg-forest-dark text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-forest/10 transition-all text-sm"
        >
          <ShoppingBag size={16} />
          <span>Xem sản phẩm phù hợp</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onShareZalo}
            className="bg-[#0068FF] hover:bg-[#0057d6] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
          >
            <Share2 size={14} />
            <span>Gửi qua Zalo</span>
          </button>
          
          <button
            onClick={onConsultAgent}
            className="bg-white hover:bg-cream-soft border-2 border-gray-200 text-ink font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
          >
            <MessageCircle size={14} className="text-forest" />
            <span>Nhờ nhân viên</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
