import React, { useState, useEffect } from "react";
import { X, Save, Upload, Calendar, User as UserIcon, Settings, BarChart2 } from "lucide-react";
import { TiptapEditor } from "./tiptap-editor";
import { BlogSeoAssistant } from "./blog-seo-assistant";

interface BlogEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  onImageUpload: (file: File) => Promise<string>;
}

export function BlogEditor({ isOpen, onClose, onSave, initialData, onImageUpload }: BlogEditorProps) {
  const [formData, setFormData] = useState({
    id: null as number | null,
    title: "",
    slug: "",
    summary: "",
    content: "",
    thumbnail_url: "",
    thumbnail_alt: "",
    author: "Admin",
    published_at: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    status: "published" as "draft" | "published" | "scheduled",
    seo_score: 0,
  });

  const [activeTab, setActiveTab] = useState<"config" | "seo">("config");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id ?? null,
        title: initialData.title ?? "",
        slug: initialData.slug ?? "",
        summary: initialData.summary ?? "",
        content: initialData.content ?? "",
        thumbnail_url: initialData.thumbnail_url ?? "",
        thumbnail_alt: initialData.thumbnail_alt ?? "",
        author: initialData.author ?? "Admin",
        published_at: initialData.published_at ? initialData.published_at.slice(0, 16).replace(" ", "T") : "",
        seo_title: initialData.seo_title ?? "",
        seo_description: initialData.seo_description ?? "",
        seo_keywords: initialData.seo_keywords ?? "",
        status: (initialData.status as "draft" | "published" | "scheduled") ?? "published",
        seo_score: initialData.seo_score ?? 0,
      });
    } else {
      setFormData({
        id: null,
        title: "",
        slug: "",
        summary: "",
        content: "",
        thumbnail_url: "",
        thumbnail_alt: "",
        author: "Admin",
        published_at: new Date().toISOString().slice(0, 16),
        seo_title: "",
        seo_description: "",
        seo_keywords: "",
        status: "published",
        seo_score: 0,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: string, val: any) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "title" && !initialData) {
        // Auto-generate clean URL slug
        next.slug = val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return next;
    });
  };

  const handleSlugChange = (val: string) => {
    // Force clean lowercase alphanumeric slug formatting
    const clean = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
    handleChange("slug", clean);
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image types
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc WEBP");
        return;
      }
      try {
        const url = await onImageUpload(file);
        handleChange("thumbnail_url", url);
        // Suggest alt text based on post title if empty
        if (!formData.thumbnail_alt && formData.title) {
          handleChange("thumbnail_alt", `Ảnh đại diện bài viết: ${formData.title}`);
        }
      } catch (err: any) {
        alert("Lỗi tải ảnh đại diện: " + err.message);
      }
    }
  };

  const handleSaveWithStatus = async (statusOverride?: "draft" | "published") => {
    setIsSaving(true);
    const postPayload = {
      ...formData,
      status: statusOverride || formData.status,
    };
    try {
      await onSave(postPayload);
      onClose();
    } catch (err: any) {
      alert("Lỗi lưu bài viết: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleScoreChange = (score: number) => {
    setFormData((prev) => (prev.seo_score === score ? prev : { ...prev, seo_score: score }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-0 sm:p-4 backdrop-blur-sm">
      <div className="relative flex flex-col w-full h-full sm:h-[95vh] max-w-6xl bg-white border border-slate-200 sm:rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white shrink-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {formData.id ? "Chỉnh sửa bài viết" : "Viết bài mới"}
            </h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
              formData.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              formData.status === "scheduled" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
              "bg-slate-100 text-slate-600 border-slate-300"
            }`}>
              {formData.status === "published" ? "Đã xuất bản" :
               formData.status === "scheduled" ? "Đã lên lịch" : "Bản nháp"}
            </span>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Editor Body Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Writing Area (Left Column) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
            {/* Title Input */}
            <div className="space-y-1">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                required
                className="w-full text-2xl font-black text-slate-800 placeholder-slate-300 border-b border-transparent hover:border-slate-100 focus:border-slate-200 outline-none pb-2 transition"
              />
            </div>

            {/* Slug configuration row */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-100">
              <span className="shrink-0 text-slate-400">Đường dẫn: https://3f-store.vercel.app/news/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="slug-bai-viet"
                className="flex-1 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:text-slate-800 outline-none py-0.5 text-[11px] font-bold"
              />
            </div>

            {/* Thumbnail Block */}
            <div className="border border-slate-200 rounded-xl p-4 bg-[#FAFAFA] space-y-3">
              <span className="block text-xs font-bold text-slate-500">Hình ảnh đại diện bài viết</span>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-40 h-28 border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                  {formData.thumbnail_url ? (
                    <img src={formData.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">Chưa có ảnh</span>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.thumbnail_url}
                      onChange={(e) => handleChange("thumbnail_url", e.target.value)}
                      className="flex-1 h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none transition"
                      placeholder="Nhập link ảnh (URL)..."
                    />
                    <label className="flex h-10 items-center justify-center gap-1.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition">
                      <Upload size={13} /> Tải file
                      <input type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.thumbnail_alt}
                      onChange={(e) => handleChange("thumbnail_alt", e.target.value)}
                      className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none transition"
                      placeholder="Nhập mô tả ảnh Alt đại diện (tốt cho SEO)..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tóm tắt ngắn (Summary) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tóm tắt bài viết</label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
                rows={2}
                className="w-full p-4 border border-slate-200 rounded-xl text-xs font-semibold focus:border-slate-400 outline-none transition resize-none"
                placeholder="Đoạn mô tả ngắn thu hút người đọc khi hiển thị ở trang danh sách..."
              />
            </div>

            {/* TipTap content editor */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nội dung chi tiết</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-400 transition">
                <TiptapEditor value={formData.content} onChange={(val) => handleChange("content", val)} onImageUpload={onImageUpload} />
              </div>
            </div>
          </div>

          {/* Right Configuration Sidebar */}
          <aside className="w-80 border-l border-slate-200 bg-[#FCFCFC] flex flex-col h-full shrink-0">
            {/* Sidebar Tab Bar */}
            <div className="flex border-b border-slate-200 bg-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("config")}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
                  activeTab === "config"
                    ? "border-slate-800 text-slate-800 bg-white"
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50/50"
                }`}
              >
                <Settings size={13} />
                Cấu hình
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
                  activeTab === "seo"
                    ? "border-slate-800 text-slate-800 bg-white"
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50/50"
                }`}
              >
                <BarChart2 size={13} />
                SEO Audit
              </button>
            </div>

            {/* Sidebar Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
              {activeTab === "config" ? (
                <>
                  {/* Status Dropdown */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái xuất bản</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none transition cursor-pointer"
                    >
                      <option value="draft">Bản nháp (Draft)</option>
                      <option value="published">Đã xuất bản (Published)</option>
                      <option value="scheduled">Đã lên lịch (Scheduled)</option>
                    </select>
                  </div>

                  {/* Author Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tác giả</label>
                    <div className="relative">
                      <UserIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => handleChange("author", e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none transition"
                        placeholder="Admin"
                      />
                    </div>
                  </div>

                  {/* Publish Date Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày xuất bản</label>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="datetime-local"
                        value={formData.published_at}
                        onChange={(e) => handleChange("published_at", e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none transition"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Focus Keywords */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Từ khóa chính</label>
                    <input
                      type="text"
                      value={formData.seo_keywords}
                      onChange={(e) => handleChange("seo_keywords", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none transition"
                      placeholder="chăm sóc mèo con, thức ăn chó..."
                    />
                  </div>

                  {/* Meta Title */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề SEO</label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => handleChange("seo_title", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none transition"
                      placeholder="Tự động theo tiêu đề chính"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả SEO</label>
                    <textarea
                      value={formData.seo_description}
                      onChange={(e) => handleChange("seo_description", e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none transition resize-none"
                      placeholder="Tự động theo tóm tắt bài viết"
                    />
                  </div>

                  {/* SEO Live Audit checklist */}
                  <BlogSeoAssistant
                    title={formData.title}
                    seoTitle={formData.seo_title}
                    summary={formData.summary}
                    seoDescription={formData.seo_description}
                    content={formData.content}
                    keywords={formData.seo_keywords}
                    slug={formData.slug}
                    thumbnailUrl={formData.thumbnail_url}
                    thumbnailAlt={formData.thumbnail_alt}
                    onScoreChange={handleScoreChange}
                  />
                </>
              )}
            </div>
          </aside>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 bg-white shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-10 px-5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            Hủy
          </button>
          
          <button
            type="button"
            onClick={() => handleSaveWithStatus("draft")}
            disabled={isSaving}
            className="h-10 px-5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Lưu nháp
          </button>

          <button
            type="button"
            onClick={() => handleSaveWithStatus()}
            disabled={isSaving}
            className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
          >
            <Save size={14} />
            {isSaving ? "Đang lưu..." : "Lưu bài viết"}
          </button>
        </div>

      </div>
    </div>
  );
}
