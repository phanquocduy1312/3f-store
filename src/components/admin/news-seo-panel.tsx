import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, BarChart3, Globe } from "lucide-react";

interface NewsSeoPanelProps {
  title: string;
  seoTitle: string;
  summary: string;
  seoDescription: string;
  content: string;
  keywords: string;
  slug: string;
  thumbnailAlt: string;
  onScoreChange?: (score: number) => void;
}

export function NewsSeoPanel({
  title = "", seoTitle = "", summary = "", seoDescription = "",
  content = "", keywords = "", slug = "", thumbnailAlt = "", onScoreChange
}: NewsSeoPanelProps) {
  
  const getPlainText = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const plainText = getPlainText(content);
  const words = getWordCount(plainText);
  const displayTitle = seoTitle || title;
  const displayDesc = seoDescription || summary;
  const kw = keywords.split(",")[0]?.trim() || "";

  const headingCheck = (() => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    return doc.querySelectorAll("h2, h3").length >= 2;
  })();

  const internalLinkCheck = (() => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    const links = doc.querySelectorAll("a");
    let ok = false;
    links.forEach(a => {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("/") || href.includes("3fstore") || href.includes("localhost") || href.includes("vercel.app")) ok = true;
    });
    return ok;
  })();

  const keywordChecks = (() => {
    if (!kw) return { inTitle: false, inDesc: false, inSlug: false, density: 0 };
    const kwLower = kw.toLowerCase();
    const matches = (plainText.toLowerCase().match(new RegExp(kwLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "g")) || []).length;
    const density = words > 0 ? (matches / words) * 100 : 0;
    return {
      inTitle: displayTitle.toLowerCase().includes(kwLower),
      inDesc: displayDesc.toLowerCase().includes(kwLower),
      inSlug: slug.toLowerCase().includes(kwLower),
      density
    };
  })();

  // Define audits and scores
  const scoreAudits = [
    { label: "Tiêu đề SEO (15đ)", max: 15, score: displayTitle.length >= 40 && displayTitle.length <= 65 ? 15 : (displayTitle.length > 0 ? 8 : 0), desc: "Khuyên dùng 40-65 ký tự.", detail: `${displayTitle.length} ký tự` },
    { label: "Mô tả Meta (15đ)", max: 15, score: displayDesc.length >= 110 && displayDesc.length <= 160 ? 15 : (displayDesc.length > 0 ? 8 : 0), desc: "Khuyên dùng 110-160 ký tự.", detail: `${displayDesc.length} ký tự` },
    { label: "Định dạng Slug (10đ)", max: 10, score: slug && /^[a-z0-9-]+$/.test(slug) ? 10 : 0, desc: "Slug hợp lệ (chữ thường, không dấu, nối bằng gạch ngang).", detail: slug ? (/^[a-z0-9-]+$/.test(slug) ? "Hợp lệ" : "Chưa chuẩn") : "Trống" },
    { label: "Độ dài nội dung (20đ)", max: 20, score: words >= 600 ? 20 : (words >= 300 ? 12 : 0), desc: "Nội dung chất lượng nên từ 300 - 600 từ trở lên.", detail: `${words} từ` },
    { label: "Tiêu đề con H2/H3 (10đ)", max: 10, score: headingCheck ? 10 : 0, desc: "Bài viết cần ít nhất 2 tiêu đề H2 hoặc H3.", detail: headingCheck ? "Đủ số lượng" : "Cần thêm tiêu đề con" },
    { label: "Thẻ ALT ảnh (10đ)", max: 10, score: !!thumbnailAlt.trim() ? 10 : 0, desc: "Ảnh đại diện bắt buộc cần thẻ mô tả alt cho SEO.", detail: thumbnailAlt.trim() ? "OK" : "Trống" },
    { label: "Liên kết nội bộ (10đ)", max: 10, score: internalLinkCheck ? 10 : 0, desc: "Cần tối thiểu 1 liên kết nội bộ trỏ về 3F Store.", detail: internalLinkCheck ? "OK" : "Thiếu liên kết" },
    { label: "Từ khóa chính (10đ)", max: 10, score: (keywordChecks.inTitle || keywordChecks.inSlug) ? 10 : 0, desc: "Từ khóa chính nên xuất hiện ở tiêu đề và slug bài viết.", detail: kw ? ((keywordChecks.inTitle && keywordChecks.inSlug) ? "Đầy đủ" : "Chưa tối ưu") : "Thiếu từ khóa" }
  ];

  const totalScore = scoreAudits.reduce((acc, curr) => acc + curr.score, 0);

  useEffect(() => {
    onScoreChange?.(totalScore);
  }, [totalScore]);

  const getLabel = (val: number) => {
    if (val >= 80) return "Tốt";
    if (val >= 50) return "Ổn";
    return "Cần tối ưu";
  };

  const getBadgeColor = (val: number) => {
    if (val >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (val >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
      <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
        <BarChart3 size={14} className="text-slate-500" /> Phân tích SEO bài viết
      </h3>

      <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm chất lượng SEO</span>
          <p className="text-[11px] font-bold text-slate-700 mt-1 leading-snug">
            {kw ? `Từ khóa: "${kw}"` : "Nhập từ khóa chính để kiểm tra"}
          </p>
        </div>
        <div className={`flex flex-col items-center justify-center shrink-0 h-14 w-20 rounded-xl border text-center font-bold ${getBadgeColor(totalScore)}`}>
          <span className="text-xl font-extrabold leading-none">{totalScore}</span>
          <span className="text-[8px] font-extrabold uppercase mt-1 leading-none tracking-wider">{getLabel(totalScore)}</span>
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {scoreAudits.map((item, idx) => (
          <li key={idx} className="py-2.5 flex items-start gap-2 text-left">
            {item.score === item.max ? (
              <CheckCircle2 size={14} className="mt-0.5 text-emerald-600 shrink-0" />
            ) : item.score > 0 ? (
              <AlertTriangle size={14} className="mt-0.5 text-amber-500 shrink-0" />
            ) : (
              <XCircle size={14} className="mt-0.5 text-rose-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">{item.label}</span>
                <span className={item.score === item.max ? "text-emerald-600" : item.score > 0 ? "text-amber-600" : "text-rose-500"}>
                  {item.detail}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Google Preview Snippet */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Globe size={11} /> Google Snippet Preview</h4>
        <div className="bg-[#fcfcfc] border border-slate-200 p-4 rounded-xl text-left space-y-1 font-sans shadow-sm select-none">
          <div className="text-[11px] text-[#202124] flex items-center gap-1 truncate">
            <span>https://3f-store.vercel.app</span>
            <span className="text-slate-400 font-semibold">/tin-tuc/{slug || "slug-bai-viet"}</span>
          </div>
          <div className="text-base text-[#1a0dab] font-medium leading-tight hover:underline cursor-pointer truncate">
            {displayTitle || "Tiêu đề bài viết hiển thị ở đây"}
          </div>
          <div className="text-[12.5px] text-[#4d5156] leading-relaxed line-clamp-2">
            {displayDesc || "Vui lòng nhập mô tả Meta hoặc phần trích dẫn để xem mô tả hiển thị..."}
          </div>
        </div>
        <p className="text-[9px] text-slate-400 font-semibold italic leading-snug">
          * Google có thể tự thay đổi tiêu đề/mô tả hiển thị tùy truy vấn.
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[9px] text-slate-400 font-semibold leading-relaxed">
        💡 <strong>Gợi ý:</strong> Điểm SEO là gợi ý nội bộ, không đảm bảo thứ hạng Google.
      </div>
    </div>
  );
}
