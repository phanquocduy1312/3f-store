import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Share2, MessageCircle, ShoppingBag, ShoppingCart, Ticket, PawPrint, Truck, Gift, Bone, Sparkles, CheckCircle2 } from "lucide-react";
import { AiResultData } from "./mockAiResult";
import { getProductById } from "@/data/store";
import { Link, useNavigate } from "react-router-dom";
import { addToCart, parsePriceString } from "@/lib/cartHelper";
import { mapApiProduct } from "@/src/api/productsApi";
import { getAiAdvisorVoucher, type PublicVoucher } from "@/src/api/vouchersApi";

const iconsMap = {
  ticket: Ticket,
  paw: PawPrint,
  truck: Truck,
  gift: Gift,
  bone: Bone,
  sparkles: Sparkles,
};

const voucherThemeClasses: Record<string, { color: string; bgLight: string; textDark: string }> = {
  sky: { color: "from-sky-400 to-sky-600", bgLight: "bg-sky-50", textDark: "text-sky-700" },
  indigo: { color: "from-blue-400 to-indigo-500", bgLight: "bg-blue-50", textDark: "text-indigo-700" },
  amber: { color: "from-amber-400 to-orange-500", bgLight: "bg-amber-50", textDark: "text-orange-700" },
  rose: { color: "from-rose-400 to-pink-500", bgLight: "bg-rose-50", textDark: "text-rose-700" },
  violet: { color: "from-violet-400 to-purple-600", bgLight: "bg-violet-50", textDark: "text-purple-700" },
  teal: { color: "from-teal-400 to-cyan-600", bgLight: "bg-teal-50", textDark: "text-cyan-700" },
  red: { color: "from-red-400 to-rose-500", bgLight: "bg-red-50", textDark: "text-red-700" },
};

interface AiResultProps {
  result: AiResultData;
  onExploreProducts: () => void;
  onConsultAgent: () => void;
  onShareZalo: () => void;
  onClose?: () => void;
  onRestart?: () => void;
  onCopyVoucher?: () => void;
}

export function AiResult({ 
  result, 
  onExploreProducts, 
  onConsultAgent, 
  onShareZalo, 
  onClose, 
  onRestart,
  onCopyVoucher
}: AiResultProps) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number | string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [voucherData, setVoucherData] = useState<PublicVoucher | null>(null);

  useEffect(() => {
    getAiAdvisorVoucher()
      .then((res) => {
        if (res.success && res.data) {
          setVoucherData(res.data);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy voucher tư vấn AI", err);
      });
  }, []);

  useEffect(() => {
    if (result.recommended_products) {
      setSelectedProductIds(new Set(result.recommended_products.map(p => p.id)));
    }
  }, [result]);

  const handleCopy = () => {
    const code = voucherData?.code || result.voucher_code || "3F30K";
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (onCopyVoucher) onCopyVoucher();
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleProduct = (id: number | string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedProducts = result.recommended_products
    ?.map(item => item.product ? mapApiProduct(item.product) : getProductById(item.id))
    .filter((p): p is NonNullable<typeof p> => p != null && selectedProductIds.has(p.id)) || [];

  const totalPrice = selectedProducts.reduce((sum, p) => sum + parsePriceString(p.price), 0);
  const formattedTotalPrice = totalPrice.toLocaleString("vi-VN") + "đ";

  const handleAddToCart = (buyNow = false) => {
    if (selectedProducts.length === 0) return;
    
    selectedProducts.forEach(p => {
      addToCart({
        id: String(p.id),
        productId: String(p.backendId ?? p.sourceProductId ?? p.id),
        name: p.name,
        image: p.image,
        price: parsePriceString(p.price),
        variant: "Mặc định"
      }, 1);
    });

    if (buyNow) {
      if (onClose) onClose();
      navigate("/cart");
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Group products into saving, balanced, premium
  const productsByGroup = {
    saving: [] as typeof result.recommended_products,
    balanced: [] as typeof result.recommended_products,
    premium: [] as typeof result.recommended_products,
  };

  result.recommended_products?.forEach(item => {
    const group = item.group || "balanced";
    if (productsByGroup[group]) {
      productsByGroup[group].push(item);
    } else {
      productsByGroup.balanced.push(item);
    }
  });

  const renderProductGroupSection = (
    title: string,
    desc: string,
    items: typeof result.recommended_products,
    badgeText?: string
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1">
          <div>
            <h6 className="text-[13px] font-extrabold text-ink flex items-center gap-1.5">
              {title}
              {badgeText && (
                <span className="bg-forest text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                  {badgeText}
                </span>
              )}
            </h6>
            <p className="text-[11px] text-ink-soft">{desc}</p>
          </div>
        </div>
        
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const product = item.product ? mapApiProduct(item.product) : getProductById(item.id);
            if (!product) return null;
            const isSelected = selectedProductIds.has(item.id);

            return (
              <div 
                key={idx} 
                onClick={() => toggleProduct(item.id)}
                className={`p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all flex gap-3 items-start cursor-pointer select-none group ${
                  isSelected ? 'border-forest ring-1 ring-forest bg-forest-soft/10' : 'border-gray-100 hover:border-forest/30'
                }`}
              >
                <div className="pt-1 shrink-0">
                  <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-forest border-forest text-white' : 'border-gray-300'
                  }`}>
                     {isSelected && <Check size={14} className="stroke-[3]" />}
                  </div>
                </div>
                
                <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative transition-colors" onClick={e => e.stopPropagation()}>
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </Link>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${product.id}`} onClick={e => e.stopPropagation()} className="text-[13px] font-bold text-ink leading-snug line-clamp-2 hover:text-forest transition-colors">
                      {product.name}
                    </Link>
                  </div>
                  <div className="text-[12px] font-black text-[#ED4546] mt-0.5">
                    {product.price}
                  </div>
                  <div className="text-[12px] text-ink-soft mt-1.5 leading-relaxed bg-white/60 p-2 rounded-lg border border-gray-50 space-y-1">
                    <div>
                      <span className="font-semibold text-forest">💡 Ưu điểm: </span>
                      {item.reason}
                    </div>
                    {(item.matched_need || item.budget_fit) && (
                      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-dashed border-gray-100 mt-1.5">
                        {item.matched_need?.map((need, nIdx) => (
                          <span key={nIdx} className="bg-yellow-50 text-yellow-800 border border-yellow-100 text-[9px] font-black px-1.5 py-0.5 rounded">
                            {need}
                          </span>
                        ))}
                        {item.budget_fit && (
                          <span className="bg-gray-50 text-gray-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-gray-100">
                            {item.budget_fit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col h-full max-h-[500px] relative"
    >
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 pb-4">
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
          
          {/* Block 1: Chuyên gia đã hiểu bé như thế nào */}
          <div className="bg-blue-50/60 border border-blue-100/80 p-4 rounded-2xl space-y-2 mt-3 text-left">
            <h5 className="text-[13px] font-bold text-blue-900 flex items-center gap-1.5">
              <span>🧠</span> Chuyên gia đã hiểu bé như thế nào?
            </h5>
            <p className="text-blue-950 text-[13px] font-medium leading-relaxed">
              {result.summary}
            </p>
            {result.detected_needs && result.detected_needs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.detected_needs.map((need, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {need}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Block 2: Phân tích ngân sách thực tế */}
          {result.budget_analysis && (
            <div className="bg-cream-soft/60 border border-gray-100 p-4 rounded-2xl space-y-2.5 mt-3 text-left">
              <h5 className="text-[13px] font-bold text-ink flex items-center gap-1.5">
                <span>📊</span> Phân tích ngân sách thực tế
              </h5>
              <div className="grid grid-cols-2 gap-2 text-[12px] text-ink-soft font-medium">
                <div>Mỗi lần mua: <strong className="text-ink">{result.budget_analysis.purchase_amount_label}</strong></div>
                <div>Dùng trong: <strong className="text-ink">{result.budget_analysis.usage_duration_label}</strong></div>
                <div className="col-span-2 pt-1.5 border-t border-dashed border-gray-200 mt-1 flex items-center justify-between">
                  <span>Ngân sách ước tính:</span>
                  <span className="text-[14px] font-black text-forest">~{result.budget_analysis.monthly_budget.toLocaleString("vi-VN")}đ/tháng</span>
                </div>
                <div className="col-span-2 flex items-center justify-between mt-1">
                  <span>Phân khúc phù hợp:</span>
                  <span className="bg-forest-soft text-forest text-[10px] font-black px-2.5 py-0.5 rounded-full border border-forest-muted">
                    {result.budget_analysis.budget_segment}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-ink-soft leading-normal italic">
                * {result.budget_analysis.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Main Advice */}
        <div className="space-y-1 text-left">
          <h5 className="text-[14px] font-bold text-ink">Lời khuyên từ chuyên gia 3F:</h5>
          <p className="text-ink-soft text-[13.5px] leading-relaxed font-medium">
            {result.advice}
          </p>
        </div>

        {/* Recommended products list (Grouped) */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h5 className="text-[14px] font-bold text-ink">Sản phẩm khuyên dùng cho bé:</h5>
            <span className="text-[11px] text-ink-soft">Chọn để mua nhanh</span>
          </div>

          <div className="space-y-4">
            {renderProductGroupSection(
              "Gói tiết kiệm", 
              "Phù hợp nếu muốn tối ưu chi phí.", 
              productsByGroup.saving
            )}

            {renderProductGroupSection(
              "Gói cân bằng", 
              "Cân đối giữa chất lượng và ngân sách.", 
              productsByGroup.balanced,
              "3F đề xuất"
            )}

            {renderProductGroupSection(
              "Gói tốt hơn cho bé", 
              "Phù hợp nếu muốn nâng cấp chăm sóc lâu dài.", 
              productsByGroup.premium
            )}
          </div>
        </div>

        {/* Care tips */}
        <div className="p-3.5 bg-yellow-50/50 border border-yellow-100 rounded-xl space-y-1.5 text-left">
          <h5 className="text-[13px] font-bold text-yellow-800">Mẹo nhỏ từ chuyên gia:</h5>
          <ul className="list-disc pl-4 space-y-1 text-[12px] text-yellow-900/80 leading-relaxed font-semibold">
            {result.care_tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Warning if exists */}
        {result.warning && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-left">
            <p className="text-[12.5px] font-bold text-red-800 leading-relaxed">
              {result.warning}
            </p>
          </div>
        )}

        {/* Voucher */}
        {voucherData && (() => {
          const voucherTitle = voucherData.title;
          const voucherDescription = voucherData.description || "";
          const voucherLabel = voucherData.label || "TƯ VẤN AI";
          const voucherBadge = voucherData.badgeText || "AI Voucher";
          const voucherTheme = voucherThemeClasses[voucherData.themeColor || "red"] || voucherThemeClasses.red;
          const VoucherIcon = iconsMap[(voucherData.iconKey || "sparkles") as keyof typeof iconsMap] || Sparkles;

          return (
            <div className="group relative flex h-[115px] w-full overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_16px_32px_rgba(16,133,79,0.12)] sm:h-[140px] sm:rounded-[1.25rem] sm:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              {/* Left Block */}
              <div className={`relative flex w-[48px] shrink-0 flex-col items-center justify-center bg-gradient-to-br ${voucherTheme.color} text-white sm:w-[110px]`}>
                <div className="absolute inset-0 hidden overflow-hidden opacity-20 sm:block">
                  <PawPrint className="absolute -left-2 -top-2 h-10 w-10 rotate-12" />
                  <PawPrint className="absolute -bottom-3 -right-2 h-[30px] w-[30px] -rotate-12" />
                </div>
                <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 shadow-sm backdrop-blur-md sm:h-12 sm:w-12">
                  <VoucherIcon className="h-3.5 w-3.5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                </div>
                <div className="relative z-10 mt-3 hidden text-center text-[10px] font-black uppercase tracking-widest text-white/90 sm:block">
                  {voucherLabel}
                </div>
              </div>

              {/* Circle notches - matches background of dialog (white) */}
              <div className="absolute left-[42px] -top-2 z-10 h-4 w-4 rounded-full bg-white shadow-inner sm:left-[104px] sm:-top-3 sm:h-6 sm:w-6" />
              <div className="absolute left-[42px] -bottom-2 z-10 h-4 w-4 rounded-full bg-white shadow-inner sm:left-[104px] sm:-bottom-3 sm:h-6 sm:w-6" />
              <div className="absolute bottom-0 left-[47px] top-0 border-l-[2px] border-dashed border-white/40 sm:left-[109px] sm:border-l-[3px]" />

              {/* Right Block */}
              <div className="relative flex min-w-0 flex-1 flex-col justify-between p-2.5 pl-3 sm:p-4 sm:pl-6 text-left">
                <VoucherIcon className={`absolute right-1 top-1 h-10 w-10 opacity-[0.03] sm:right-4 sm:top-4 sm:h-20 sm:w-20 ${voucherTheme.textDark}`} />
                <div>
                  <h3 className={`text-[12px] font-black leading-none tracking-tight sm:text-[1.35rem] ${voucherTheme.textDark}`}>
                    {voucherTitle}
                  </h3>
                  <p className="mt-1 line-clamp-2 pr-1 text-[9px] font-medium leading-[1.3] text-ink/70 sm:mt-1.5 sm:pr-2 sm:text-[13px] sm:leading-snug">
                    {voucherDescription}
                  </p>
                </div>

                <div className="mt-1 flex w-full flex-col items-start gap-1.5 sm:mt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-bold sm:px-2.5 sm:py-1 sm:text-[10px] ${voucherTheme.bgLight} ${voucherTheme.textDark}`}>
                    {voucherBadge}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`relative z-20 flex h-5 w-full items-center justify-center rounded-full px-2 text-[8px] font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 sm:h-8 sm:w-auto sm:px-4 sm:text-[11px] ${
                      copied ? "bg-sky-500 text-white" : "bg-ink text-white"
                    }`}
                    title="Copy voucher"
                  >
                    {copied ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                    {copied ? "ĐÃ COPY" : "COPY MÃ"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Other CTAs */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onShareZalo}
            className="bg-[#0068FF] hover:bg-[#0057d6] text-white font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[11px] sm:text-xs"
          >
            <Share2 size={14} />
            <span>Gửi qua Zalo</span>
          </button>

          <button
            onClick={onConsultAgent}
            className="bg-white hover:bg-cream-soft border-2 border-gray-200 text-ink font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[11px] sm:text-xs"
          >
            <MessageCircle size={14} className="text-forest" />
            <span>Nhờ nhân viên</span>
          </button>
          
          {onRestart && (
            <button
              onClick={onRestart}
              className="bg-gray-100 hover:bg-gray-200 text-ink-soft font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[11px] sm:text-xs"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <span>Làm lại</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 bg-white border-t border-gray-100 pt-3 relative z-20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-ink-soft">Tổng {selectedProducts.length} sản phẩm:</span>
            <span className="text-[16px] md:text-[18px] font-black text-[#ED4546] leading-none mt-0.5">{formattedTotalPrice}</span>
          </div>
          <div className="flex gap-2">
            <button 
              disabled={selectedProducts.length === 0}
              onClick={() => handleAddToCart(false)}
              className="flex items-center justify-center w-20 h-11 md:w-20 md:h-12 shrink-0 rounded-xl bg-forest-soft font-black text-forest transition hover:bg-forest/20 disabled:opacity-50"
              title="Thêm vào giỏ"
            >
              <ShoppingCart size={20} strokeWidth={2.5} /> 
            </button>
            <button 
              disabled={selectedProducts.length === 0}
              onClick={() => handleAddToCart(true)}
              className="flex items-center justify-center rounded-xl bg-forest px-4 md:px-8 py-2.5 md:py-3 text-[13px] md:text-[14px] font-black text-white shadow-md shadow-forest/20 transition hover:bg-forest-dark disabled:opacity-50"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-white shadow-xl animate-fade-in text-[13px]">
          <Check size={16} strokeWidth={3} />
          <span className="font-bold whitespace-nowrap">Đã thêm vào giỏ!</span>
        </div>
      )}
    </motion.div>
  );
}
