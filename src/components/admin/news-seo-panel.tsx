import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, BarChart3, Globe, FileText, Settings, Sparkles } from "lucide-react";

interface NewsSeoPanelProps {
  title: string;
  seoTitle: string;
  onSeoTitleChange: (val: string) => void;
  summary: string;
  onSummaryChange: (val: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (val: string) => void;
  content: string;
  keywords: string;
  onKeywordsChange: (val: string) => void;
  slug: string;
  thumbnailAlt: string;
  onScoreChange?: (score: number) => void;
}

export function NewsSeoPanel({
  title = "", seoTitle = "", onSeoTitleChange,
  summary = "", onSummaryChange,
  seoDescription = "", onSeoDescriptionChange,
  content = "", keywords = "", onKeywordsChange,
  slug = "", thumbnailAlt = "", onScoreChange
}: NewsSeoPanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "seo_config" | "seo_analysis">("summary");

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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm text-left overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition border-b-2 -mb-px ${
            activeTab === "summary"
              ? "border-slate-800 text-slate-800 bg-white"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          <FileText size={14} /> Tóm tắt bài viết
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo_config")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition border-b-2 -mb-px ${
            activeTab === "seo_config"
              ? "border-slate-800 text-slate-800 bg-white"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          <Settings size={14} /> Thiết lập SEO
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo_analysis")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition border-b-2 -mb-px ${
            activeTab === "seo_analysis"
              ? "border-slate-800 text-slate-800 bg-white"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          <BarChart3 size={14} /> Xem trước & Phân tích SEO
          <span className={`ml-1.5 px-1.5 py-0.5 text-[9px] font-black rounded-full border ${getBadgeColor(totalScore)}`}>
            {totalScore}
          </span>
        </button>
      </div>

      <div className="p-6">
        {/* Tab 1: Excerpt / Summary */}
        {activeTab === "summary" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-slate-500" /> Tóm tắt / Trích dẫn bài viết
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{summary.length} ký tự</span>
            </div>
            <textarea
              placeholder="Mô tả ngắn gọn nội dung bài viết hiển thị ở danh mục tin tức (Excerpt)..."
              value={summary}
              onChange={(e) => onSummaryChange(e.target.value)}
              className="w-full min-h-[140px] p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:border-slate-450 focus:bg-white outline-none transition shadow-inner leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              * Đây là đoạn văn ngắn mô tả bài viết, sẽ hiển thị ở trang chủ hoặc trang danh mục tin tức giúp thu hút độc giả click đọc tiếp.
            </p>
          </div>
        )}

        {/* Tab 2: SEO Config */}
        {activeTab === "seo_config" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Từ khóa chính (Focus Keyword)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: cát cho mèo, chăm sóc mèo..."
                  value={keywords}
                  onChange={(e) => onKeywordsChange(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400 focus:bg-white transition shadow-sm text-slate-700"
                />
                <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                  Từ khóa quan trọng nhất mà bài viết này muốn nhắm tới khi người dùng tìm kiếm trên Google.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiêu đề SEO (Meta Title)</label>
                  <span className={`text-[9px] font-bold ${displayTitle.length >= 40 && displayTitle.length <= 65 ? "text-emerald-600" : "text-slate-400"}`}>
                    {displayTitle.length} / 65 ký tự
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Mặc định sử dụng tiêu đề bài viết"
                  value={seoTitle}
                  onChange={(e) => onSeoTitleChange(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400 focus:bg-white transition shadow-sm text-slate-700"
                />
                <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                  Tiêu đề hiển thị trên kết quả tìm kiếm. Để trống sẽ tự động lấy tiêu đề bài viết.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả Meta (Meta Description)</label>
                <span className={`text-[9px] font-bold ${displayDesc.length >= 110 && displayDesc.length <= 160 ? "text-emerald-600" : "text-slate-400"}`}>
                  {displayDesc.length} / 160 ký tự
                </span>
              </div>
              <textarea
                placeholder="Mặc định sử dụng phần Tóm tắt bài viết..."
                value={seoDescription}
                onChange={(e) => onSeoDescriptionChange(e.target.value)}
                className="w-full min-h-[90px] p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:border-slate-450 focus:bg-white outline-none transition shadow-sm leading-relaxed"
              />
              <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                Đoạn mô tả ngắn hiển thị dưới tiêu đề trên Google. Để trống sẽ tự động lấy phần Tóm tắt bài viết.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: SEO Analysis & Google Preview */}
        {activeTab === "seo_analysis" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Checklist */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Các tiêu chí đánh giá SEO</h4>
              <ul className="divide-y divide-slate-100 overflow-y-auto max-h-[360px] pr-2">
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
            </div>

            {/* Right side: Google Preview */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={12} /> Google Snippet Preview
              </h4>
              <div className="bg-[#fcfcfc] border border-slate-200 p-4 rounded-xl text-left space-y-1 font-sans shadow-sm select-none">
                <div className="text-[11px] text-[#202124] flex items-center gap-1 truncate">
                  <span>https://3f-store.vercel.app</span>
                  <span className="text-slate-400 font-semibold">/tin-tuc/{slug || "slug-bai-viet"}</span>
                </div>
                <div className="text-base text-[#1a0dab] font-medium leading-tight hover:underline cursor-pointer truncate">
                  {displayTitle || "Tiêu đề bài viết hiển thị ở đây"}
                </div>
                <div className="text-[12.5px] text-[#4d5156] leading-relaxed line-clamp-3">
                  {displayDesc || "Vui lòng nhập mô tả Meta hoặc phần trích dẫn để xem mô tả hiển thị..."}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tình trạng chấm điểm</span>
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg border ${getBadgeColor(totalScore)}`}>
                    {getLabel(totalScore)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      totalScore >= 80 ? "bg-emerald-500" : totalScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${totalScore}%` }}
                  />
                </div>
              </div>
              
              <p className="text-[9.5px] text-slate-400 font-semibold italic leading-snug">
                * Đây là kết quả mô phỏng giao diện hiển thị trên thiết bị máy tính của Google.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default NewsSeoPanel;
