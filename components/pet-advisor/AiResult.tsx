import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Share2, MessageCircle, ShoppingBag, ExternalLink } from "lucide-react";
import { AiResultData } from "./mockAiResult";
import { getProductById } from "@/data/store";
import { Link } from "react-router-dom";

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
      {result.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-[12px] p-3 rounded-xl flex items-start gap-2 leading-relaxed">
          <span className="shrink-0 text-red-500 font-bold">⚠️</span>
          <span>{result.error}</span>
        </div>
      )}

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

      {/* Recommended products list */}
      <div className="space-y-2">
        <h5 className="text-[14px] font-bold text-ink">Sản phẩm khuyên dùng cho bé:</h5>
        <div className="space-y-3">
          {result.recommended_products?.map((item, idx) => {
            const product = getProductById(item.id);
            if (!product) return null;
            return (
              <Link to={`/product/${product.id}`} key={idx} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-forest/30 transition-all flex gap-3 items-start group block cursor-pointer">
                <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative group-hover:border-forest/30 transition-colors">
                  <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-0 left-0 bg-forest text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-br-lg z-10">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h6 className="text-[13px] font-bold text-ink leading-snug line-clamp-2 group-hover:text-forest transition-colors">
                      {product.name}
                    </h6>
                  </div>
                  <div className="text-[12px] font-black text-[#ED4546] mt-0.5">
                    {product.price}
                  </div>
                  <div className="text-[12px] text-ink-soft mt-1.5 leading-relaxed bg-cream-soft p-2 rounded-lg border border-gray-50">
                    <span className="font-semibold text-forest">💡 Ưu điểm: </span>
                    {item.reason}
                  </div>
                </div>
              </Link>
            );
          })}
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
