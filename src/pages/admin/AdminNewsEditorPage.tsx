import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Save, Globe, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { adminGetBlogPosts, adminGetBlogPostDetail, adminCreateBlogPost, adminUpdateBlogPost, adminUploadBlogImage, type BlogPost } from "@/src/api/blogApi";
import { TiptapEditor } from "@/src/components/admin/tiptap-editor";
import { NewsEditorSidebar } from "@/src/components/admin/news-editor-sidebar";
import { NewsSeoPanel } from "@/src/components/admin/news-seo-panel";

export function AdminNewsEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");

  // Editor states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailAlt, setThumbnailAlt] = useState("");
  const [category, setCategory] = useState("");
  const [tocEnabled, setTocEnabled] = useState(true);
  const [tocTitle, setTocTitle] = useState("Mục lục bài viết");
  const [author, setAuthor] = useState("Admin");
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString());
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">("draft");
  const [seoScore, setSeoScore] = useState(0);

  // Load existing post data if in edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetchPost = async () => {
      try {
        const res = await adminGetBlogPostDetail(Number(id));
        if (res.success && res.data) {
          const post = res.data;
          setTitle(post.title || "");
          setSlug(post.slug || "");
          setContent(post.content || "");
          setSummary(post.summary || "");
          setSeoTitle(post.seo_title || "");
          setSeoDescription(post.seo_description || "");
          setSeoKeywords(post.seo_keywords || "");
          setThumbnailUrl(post.thumbnail_url || "");
          setThumbnailAlt(post.thumbnail_alt || "");
          setCategory(post.category || "");
          setTocEnabled(post.toc_enabled === 1 || post.toc_enabled === true);
          setTocTitle(post.toc_title || "Mục lục bài viết");
          setAuthor(post.author || "Admin");
          setPublishedAt(post.published_at || new Date().toISOString());
          setStatus(post.status || "draft");
          setSeoScore(post.seo_score || 0);
        } else {
          toast.error(res.message || "Không tìm thấy bài viết");
          navigate("/admin/news");
        }
      } catch (err) {
        toast.error("Lỗi tải thông tin bài viết");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, isEdit, navigate]);

  // Autosave to localStorage
  useEffect(() => {
    if (loading) return;
    const saveTimer = setTimeout(() => {
      const data = { title, content, summary, category, author };
      localStorage.setItem("3f_blog_autosave", JSON.stringify(data));
      setLastSaved(new Date().toLocaleTimeString("vi-VN"));
    }, 3000);
    return () => clearTimeout(saveTimer);
  }, [title, content, summary, category, author, loading]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-"));
  };

  const handleImageUpload = async (file: File) => {
    const res = await adminUploadBlogImage(file);
    if (res.success) return res.url;
    throw new Error(res.message || "Lỗi tải ảnh lên");
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Chỉ chấp nhận file định dạng JPG, PNG hoặc WEBP");
        return;
      }
      try {
        const url = await handleImageUpload(file);
        setThumbnailUrl(url);
        toast.success("Tải ảnh đại diện thành công");
      } catch (err: any) {
        toast.error(err.message || "Lỗi tải ảnh đại diện");
      }
    }
  };

  const handleSave = async (targetStatus: "draft" | "published" | "scheduled") => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.error("Vui lòng điền đầy đủ Tiêu đề, Slug và Nội dung bài viết.");
      return;
    }
    if (!category) {
      toast.error("Vui lòng chọn loại tin / chuyên mục bài viết.");
      return;
    }

    setSaving(true);
    const postData = {
      title, slug, content, summary, seo_title: seoTitle, seo_description: seoDescription, seo_keywords: seoKeywords,
      thumbnail_url: thumbnailUrl, thumbnail_alt: thumbnailAlt, category, toc_enabled: tocEnabled ? 1 : 0, toc_title: tocTitle,
      author, published_at: publishedAt, status: targetStatus, seo_score: seoScore
    };

    try {
      const res = isEdit 
        ? await adminUpdateBlogPost(Number(id), postData)
        : await adminCreateBlogPost(postData);

      if (res.success) {
        toast.success(isEdit ? "Cập nhật bài viết thành công" : "Tạo bài viết thành công");
        localStorage.removeItem("3f_blog_autosave");
        navigate("/admin/news");
      } else {
        toast.error(res.message || "Lỗi khi lưu bài viết");
      }
    } catch (err) {
      toast.error("Lỗi lưu trữ bài viết");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-800" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/news")} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold truncate max-w-[200px] sm:max-w-sm md:max-w-md">{title || "Bài viết mới"}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                status === "published" ? "bg-emerald-800/80 border-emerald-700 text-emerald-200" :
                status === "scheduled" ? "bg-indigo-800/80 border-indigo-700 text-indigo-200" :
                "bg-slate-800/80 border-slate-700 text-slate-300"
              }`}>{status === "published" ? "Đã xuất bản" : status === "scheduled" ? "Đã lên lịch" : "Bản nháp"}</span>
              {lastSaved && <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1"><CheckCircle size={10} /> Đã tự động lưu {lastSaved}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleSave("draft")} disabled={saving} className="px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg shadow-sm transition inline-flex items-center gap-1.5 disabled:opacity-50">
            <Save size={13} /> Lưu nháp
          </button>
          <button onClick={() => handleSave(new Date(publishedAt).getTime() > Date.now() ? "scheduled" : "published")} disabled={saving} className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition inline-flex items-center gap-1.5 disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />} {isEdit ? "Cập nhật" : (new Date(publishedAt).getTime() > Date.now() ? "Lên lịch" : "Xuất bản")}
          </button>
        </div>
      </header>

      {/* Editor Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main editor area */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <input type="text" placeholder="Nhập tiêu đề bài viết..." value={title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full text-lg font-bold text-slate-800 border-b border-slate-200 pb-3 outline-none placeholder:text-slate-300 focus:border-slate-400 transition" />
            
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-500">Đường dẫn:</span>
              <span>https://3f-store.vercel.app/tin-tuc/</span>
              <input type="text" value={slug} onChange={(e) => handleSlugChange(e.target.value)} className="border-b border-transparent hover:border-slate-200 focus:border-slate-400 text-slate-700 font-bold outline-none bg-transparent transition px-1 py-0.5" />
            </div>
            
            <TiptapEditor value={content} onChange={setContent} onImageUpload={handleImageUpload} />
          </div>

          {/* Excerpt, SEO settings and Analysis panel */}
          <NewsSeoPanel
            title={title}
            seoTitle={seoTitle}
            onSeoTitleChange={setSeoTitle}
            summary={summary}
            onSummaryChange={setSummary}
            seoDescription={seoDescription}
            onSeoDescriptionChange={setSeoDescription}
            content={content}
            keywords={seoKeywords}
            onKeywordsChange={setSeoKeywords}
            slug={slug}
            thumbnailAlt={thumbnailAlt}
            onScoreChange={setSeoScore}
          />
        </section>

        {/* Right settings sidebar */}
        <aside className="space-y-6">
          <NewsEditorSidebar
            category={category} onCategoryChange={setCategory}
            thumbnailUrl={thumbnailUrl} thumbnailAlt={thumbnailAlt}
            onThumbnailSelect={handleThumbnailSelect} onThumbnailUrlChange={setThumbnailUrl}
            onThumbnailAltChange={setThumbnailAlt} onRemoveThumbnail={() => setThumbnailUrl("")}
            tocEnabled={tocEnabled} onTocEnabledChange={setTocEnabled}
            tocTitle={tocTitle} onTocTitleChange={setTocTitle}
            author={author} onAuthorChange={setAuthor}
            publishedAt={publishedAt} onPublishedAtChange={setPublishedAt}
            status={status} onStatusChange={setStatus}
          />
        </aside>
      </main>
    </div>
  );
}
export default AdminNewsEditorPage;
