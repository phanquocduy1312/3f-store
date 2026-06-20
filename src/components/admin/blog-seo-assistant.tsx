import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, BarChart3 } from "lucide-react";

interface BlogSeoAssistantProps {
  title: string;
  seoTitle: string;
  summary: string;
  seoDescription: string;
  content: string;
  keywords: string;
  slug: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  onScoreChange?: (score: number) => void;
}

export function BlogSeoAssistant({
  title = "",
  seoTitle = "",
  summary = "",
  seoDescription = "",
  content = "",
  keywords = "",
  slug = "",
  thumbnailUrl = "",
  thumbnailAlt = "",
  onScoreChange,
}: BlogSeoAssistantProps) {
  // Helpers
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
  
  const focusKeywords = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const keyword = focusKeywords[0] || "";

  const headingsCount = (() => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    return doc.querySelectorAll("h2, h3").length;
  })();

  // Auditing checks
  const checks = [
    {
      id: "title-len",
      label: "Độ dài tiêu đề",
      desc: "Độ dài lý tưởng từ 45-65 ký tự để hiển thị tốt nhất trên kết quả tìm kiếm.",
      status: displayTitle.length >= 45 && displayTitle.length <= 65 ? "pass" : displayTitle.length > 0 ? "warn" : "fail",
      detail: `${displayTitle.length} ký tự`,
    },
    {
      id: "desc-len",
      label: "Độ dài mô tả Meta",
      desc: "Độ dài khuyến nghị từ 120-160 ký tự để mô tả snippet không bị cắt.",
      status: displayDesc.length >= 110 && displayDesc.length <= 170 ? "pass" : displayDesc.length > 0 ? "warn" : "fail",
      detail: `${displayDesc.length} ký tự`,
    },
    {
      id: "slug-format",
      label: "Định dạng tĩnh (Slug)",
      desc: "Slug viết thường, không dấu, ngăn cách bằng dấu gạch ngang (không có ký tự lạ/emoji).",
      status: slug && /^[a-z0-9-]+$/.test(slug) ? "pass" : "fail",
      detail: slug ? (/^[a-z0-9-]+$/.test(slug) ? "Hợp lệ" : "Chưa chuẩn") : "Trống",
    },
    {
      id: "kw-presence",
      label: "Mật độ từ khóa chính",
      desc: "Từ khóa chính nên xuất hiện tự nhiên trong tiêu đề, slug và meta description.",
      status: (() => {
        if (!keyword) return "fail";
        const inTitle = displayTitle.toLowerCase().includes(keyword.toLowerCase());
        const inDesc = displayDesc.toLowerCase().includes(keyword.toLowerCase());
        const inSlug = slug.toLowerCase().includes(keyword.toLowerCase());
        if (inTitle && inDesc && inSlug) return "pass";
        if (inTitle || inDesc || inSlug) return "warn";
        return "fail";
      })(),
      detail: (() => {
        if (!keyword) return "Chưa nhập";
        const inTitle = displayTitle.toLowerCase().includes(keyword.toLowerCase());
        const inDesc = displayDesc.toLowerCase().includes(keyword.toLowerCase());
        const inSlug = slug.toLowerCase().includes(keyword.toLowerCase());
        const matches = [inTitle ? "Tiêu đề" : "", inDesc ? "Mô tả" : "", inSlug ? "Slug" : ""].filter(Boolean);
        return matches.length > 0 ? `${matches.length}/3 chỗ` : "Chưa có";
      })(),
    },
    {
      id: "word-count",
      label: "Độ dài bài viết",
      desc: "Bài chia sẻ, cẩm nang chất lượng tối thiểu nên từ 500 từ để cung cấp đủ giá trị.",
      status: words >= 500 ? "pass" : words >= 250 ? "warn" : "fail",
      detail: `${words} từ`,
    },
    {
      id: "headings-structure",
      label: "Tiêu đề con (H2, H3)",
      desc: "Bài viết nên có ít nhất 2 headings con để cấu trúc bài rõ ràng.",
      status: headingsCount >= 2 ? "pass" : headingsCount > 0 ? "warn" : "fail",
      detail: `${headingsCount} headings`,
    },
    {
      id: "images-alt",
      label: "Thẻ mô tả ảnh (Alt)",
      desc: "Hình ảnh đại diện và ảnh bài viết nên có thuộc tính Alt mô tả ngữ cảnh ảnh.",
      status: (() => {
        const hasThumbAlt = !!thumbnailAlt.trim();
        const contentImgs = new DOMParser().parseFromString(content, "text/html").querySelectorAll("img");
        let contentImgsOk = true;
        contentImgs.forEach(img => {
          if (!img.getAttribute("alt")?.trim()) contentImgsOk = false;
        });
        if (hasThumbAlt && (contentImgs.length === 0 || contentImgsOk)) return "pass";
        if (hasThumbAlt || contentImgsOk) return "warn";
        return "fail";
      })(),
      detail: (() => {
        const hasThumbAlt = !!thumbnailAlt.trim();
        return hasThumbAlt ? "Đại diện OK" : "Thiếu Alt";
      })(),
    },
    {
      id: "internal-links",
      label: "Liên kết nội bộ (Internal Links)",
      desc: "Nên thêm liên kết trỏ tới sản phẩm/danh mục 3F Store.",
      status: (() => {
        const doc = new DOMParser().parseFromString(content, "text/html");
        const links = doc.querySelectorAll("a");
        let hasInternal = false;
        links.forEach(a => {
          const href = a.getAttribute("href") || "";
          if (href.startsWith("/") || href.includes("3fstore") || href.includes("localhost") || href.includes("vercel.app")) {
            hasInternal = true;
          }
        });
        return hasInternal ? "pass" : "fail";
      })(),
      detail: (() => {
        const doc = new DOMParser().parseFromString(content, "text/html");
        return `${doc.querySelectorAll("a").length} liên kết`;
      })(),
    }
  ];

  // Calculate score
  const score = Math.round(
    (checks.reduce((acc, curr) => {
      if (curr.status === "pass") return acc + 100;
      if (curr.status === "warn") return acc + 50;
      return acc;
    }, 0) /
      (checks.length * 100)) *
      100
  );

  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(score);
    }
  }, [score, onScoreChange]);

  const getScoreBadgeText = (val: number) => {
    if (val >= 80) return "Đủ tiêu chí SEO cơ bản";
    if (val >= 50) return "Ổn";
    return "Cần tối ưu";
  };

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-700 border-emerald-100 bg-emerald-50";
    if (val >= 50) return "text-amber-700 border-amber-100 bg-amber-50";
    return "text-red-700 border-red-100 bg-red-50";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left">
      <h3 className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">
        <BarChart3 size={15} className="text-slate-600" /> Báo cáo chất lượng SEO
      </h3>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm SEO bài viết</span>
          <p className="text-[11px] font-medium text-slate-500 mt-1 leading-snug truncate">
            {keyword ? `Từ khóa: "${keyword}"` : "Nhập từ khóa chính để kiểm tra"}
          </p>
        </div>
        <div className={`flex flex-col items-center justify-center shrink-0 h-14 w-24 rounded-xl border text-center ${getScoreColor(score)}`}>
          <span className="text-lg font-black leading-none">{score}</span>
          <span className="text-[9px] font-black uppercase mt-1 leading-none tracking-wider">{getScoreBadgeText(score)}</span>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {checks.map((item) => (
          <li key={item.id} className="flex gap-2.5 items-start">
            {item.status === "pass" && <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />}
            {item.status === "warn" && <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />}
            {item.status === "fail" && <XCircle size={15} className="mt-0.5 shrink-0 text-red-500" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-bold text-slate-700 leading-snug">{item.label}</span>
                <span className={`text-[10px] font-black ${item.status === "pass" ? "text-emerald-700" : item.status === "warn" ? "text-amber-700" : "text-red-600"}`}>
                  {item.detail}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-semibold leading-normal mt-0.5">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Google Search Preview */}
      <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Xem trước trên Google</h4>
        <div className="bg-[#fcfcfc] border border-slate-200 p-4 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.01)] font-sans text-left space-y-1">
          <div className="text-[11px] text-[#202124] flex items-center gap-1 truncate">
            <span>https://3f-store.vercel.app</span>
            <span className="text-slate-400 font-semibold">/news/{slug || "slug-bai-viet"}</span>
          </div>
          <div className="text-[16px] text-[#1a0dab] font-medium leading-tight hover:underline cursor-pointer truncate">
            {displayTitle || "Tiêu đề bài viết hiển thị ở đây"}
          </div>
          <div className="text-[12.5px] text-[#4d5156] leading-relaxed break-words line-clamp-2">
            {displayDesc || "Vui lòng nhập mô tả Meta để kiểm tra hiển thị snippet..."}
          </div>
        </div>
        <p className="text-[9.5px] text-slate-400 font-semibold italic leading-relaxed">
          * Google có thể tự thay đổi tiêu đề/mô tả hiển thị tùy truy vấn tìm kiếm.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
          💡 <strong>Chú thích:</strong> Điểm SEO chỉ là gợi ý nội bộ dựa trên tiêu chí cơ bản của Google, không đảm bảo thứ hạng từ khóa.
        </p>
      </div>
    </div>
  );
}
