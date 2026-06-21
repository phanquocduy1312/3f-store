import React from "react";
import { Image as ImageIcon, Trash2, Calendar, User, List } from "lucide-react";

interface SidebarProps {
  category: string;
  onCategoryChange: (val: string) => void;
  thumbnailUrl: string;
  thumbnailAlt: string;
  onThumbnailSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onThumbnailUrlChange: (val: string) => void;
  onThumbnailAltChange: (val: string) => void;
  onRemoveThumbnail: () => void;
  tocEnabled: boolean;
  onTocEnabledChange: (val: boolean) => void;
  tocTitle: string;
  onTocTitleChange: (val: string) => void;
  author: string;
  onAuthorChange: (val: string) => void;
  publishedAt: string;
  onPublishedAtChange: (val: string) => void;
  status: "draft" | "published" | "scheduled";
  onStatusChange: (val: "draft" | "published" | "scheduled") => void;
}

export const BLOG_CATEGORIES = [
  "Chăm sóc mèo",
  "Chăm sóc chó",
  "Dinh dưỡng thú cưng",
  "Sức khỏe thú cưng",
  "Huấn luyện & hành vi",
  "Sản phẩm & đánh giá",
  "Khuyến mãi / Thông báo",
  "Tin tức 3F Store"
];

export function NewsEditorSidebar({
  category, onCategoryChange,
  thumbnailUrl, thumbnailAlt, onThumbnailSelect, onThumbnailUrlChange, onThumbnailAltChange, onRemoveThumbnail,
  tocEnabled, onTocEnabledChange, tocTitle, onTocTitleChange,
  author, onAuthorChange,
  publishedAt, onPublishedAtChange,
  status, onStatusChange
}: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* Category Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
          <List size={14} className="text-slate-500" /> Chuyên mục bài viết <span className="text-rose-500 font-black">*</span>
        </h3>
        <div className="mt-3">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:border-slate-400 outline-none transition cursor-pointer text-slate-700 shadow-sm"
          >
            <option value="">-- Chọn chuyên mục --</option>
            {BLOG_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 font-semibold mt-2">
            Chọn chuyên mục phù hợp giúp độc giả dễ tìm thấy bài viết.
          </p>
        </div>
      </div>

      {/* Featured Image Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon size={14} className="text-slate-500" /> Ảnh đại diện (Featured Image)
        </h3>
        <div className="mt-4 space-y-3.5">
          {thumbnailUrl ? (
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-36 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onRemoveThumbnail}
                  className="p-2 bg-white text-rose-600 rounded-lg shadow-md hover:scale-105 transition"
                  title="Xóa hình ảnh"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer">
              <ImageIcon size={28} className="text-slate-300" />
              <span className="text-[11px] font-bold text-slate-500 mt-2">Chọn file ảnh đại diện</span>
              <input type="file" accept="image/*" onChange={onThumbnailSelect} className="hidden" />
            </label>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hoặc nhập URL ảnh:</label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={thumbnailUrl}
              onChange={(e) => onThumbnailUrlChange(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400 transition shadow-sm text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả ảnh (Alt Text):</label>
            <input
              type="text"
              placeholder="Mô tả cho Google SEO..."
              value={thumbnailAlt}
              onChange={(e) => onThumbnailAltChange(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400 transition shadow-sm text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Table of Contents Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
          <List size={14} className="text-slate-500" /> Mục lục bài viết (TOC)
        </h3>
        <div className="mt-3.5 space-y-4">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={tocEnabled}
              onChange={(e) => onTocEnabledChange(e.target.checked)}
              className="h-4 w-4 text-slate-900 border-slate-200 rounded focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700">Bật mục lục tự động</span>
          </label>

          {tocEnabled && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề mục lục:</label>
              <input
                type="text"
                placeholder="Mục lục bài viết"
                value={tocTitle}
                onChange={(e) => onTocTitleChange(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400 transition shadow-sm text-slate-700"
              />
            </div>
          )}
        </div>
      </div>

      {/* Publish Settings (Scheduled/Date/Author) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left space-y-4">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
          <Calendar size={14} className="text-slate-500" /> Lịch & Biên tác giả
        </h3>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><User size={12} /> Tác giả biên tập:</label>
          <input
            type="text"
            placeholder="Admin"
            value={author}
            onChange={(e) => onAuthorChange(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400 transition shadow-sm text-slate-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12} /> Ngày xuất bản:</label>
          <input
            type="datetime-local"
            value={publishedAt ? publishedAt.substring(0, 16) : ""}
            onChange={(e) => {
              const val = e.target.value;
              onPublishedAtChange(val ? new Date(val).toISOString() : "");
              
              // Automatically switch to scheduled if published date is in the future
              if (val && new Date(val).getTime() > Date.now()) {
                onStatusChange("scheduled");
              } else if (status === "scheduled") {
                onStatusChange("published");
              }
            }}
            className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400 transition shadow-sm text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
