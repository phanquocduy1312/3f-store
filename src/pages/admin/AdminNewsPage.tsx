import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { 
  adminGetBlogPosts, 
  adminCreateBlogPost, 
  adminUpdateBlogPost, 
  adminDeleteBlogPost, 
  adminUploadBlogImage, 
  adminCrawlBlogPosts,
  type BlogPost 
} from "@/src/api/blogApi";
import { BlogEditor } from "@/src/components/admin/blog-editor";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, Eye, RefreshCw, FileText, Sparkles, CheckSquare, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export function AdminNewsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return true;
  });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [seoFilter, setSeoFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, seoFilter]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminGetBlogPosts(1, 100, search);
      if (res.success) {
        setPosts(res.data.items || []);
      } else {
        toast.error("Không thể tải danh sách bài viết");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleCrawl = async () => {
    if (crawling) return;
    setCrawling(true);
    const toastId = toast.loading("Đang đồng bộ dữ liệu từ 3fstore.vn...");
    try {
      const res = await adminCrawlBlogPosts();
      if (res.success) {
        toast.success(`Đồng bộ thành công! Đã thêm/cập nhật ${res.scrapedCount || 0} bài viết.`, { id: toastId });
        loadData();
      } else {
        toast.error(res.message || "Lỗi đồng bộ dữ liệu", { id: toastId });
      }
    } catch (err) {
      toast.error("Lỗi đồng bộ dữ liệu", { id: toastId });
    } finally {
      setCrawling(false);
    }
  };

  const handleSave = async (formData: any) => {
    const isEdit = !!formData.id;
    try {
      const res = isEdit 
        ? await adminUpdateBlogPost(formData.id, formData)
        : await adminCreateBlogPost(formData);
      
      if (res.success) {
        toast.success(isEdit ? "Cập nhật bài viết thành công" : "Tạo bài viết thành công");
        loadData();
      } else {
        toast.error(res.message || "Lỗi lưu bài viết");
        throw new Error(res.message);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      const res = await adminDeleteBlogPost(id);
      if (res.success) {
        toast.success("Xóa bài viết thành công");
        loadData();
      } else {
        toast.error(res.message || "Lỗi xóa bài viết");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleImageUpload = async (file: File) => {
    const res = await adminUploadBlogImage(file);
    if (res.success) return res.url;
    throw new Error(res.message || "Lỗi tải ảnh lên");
  };

  const calculateSeoScore = (post: BlogPost): number => {
    let score = 0;
    const title = post.seo_title || post.title || "";
    const desc = post.seo_description || post.summary || "";
    const content = post.content || "";
    const kw = (post.seo_keywords || "").split(",")[0]?.trim();

    const plainText = content.replace(/<[^>]*>/g, "");
    const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    
    if (words >= 500) score += 20;
    else if (words >= 250) score += 10;
    if (title.length >= 45 && title.length <= 65) score += 20;
    else if (title.length > 0) score += 10;
    if (desc.length >= 110 && desc.length <= 170) score += 20;
    else if (desc.length > 0) score += 10;

    if (kw) {
      const kwLower = kw.toLowerCase();
      if (title.toLowerCase().includes(kwLower)) score += 15;
      if (desc.toLowerCase().includes(kwLower)) score += 15;
      const count = (plainText.match(new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "gi")) || []).length;
      if (words > 0 && (count / words) * 100 >= 0.8) score += 10;
    }
    return Math.min(score, 100);
  };

  const totalViews = posts.reduce((acc, p) => acc + (p.view_count || 0), 0);
  const avgSeoScore = posts.length > 0
    ? Math.round(posts.reduce((acc, p) => acc + calculateSeoScore(p), 0) / posts.length)
    : 0;
  const excellentSeoCount = posts.filter(p => calculateSeoScore(p) >= 80).length;

  const filteredPosts = posts.filter(post => {
    if (seoFilter === "excellent") return calculateSeoScore(post) >= 80;
    if (seoFilter === "needs_opt") return calculateSeoScore(post) < 50;
    if (seoFilter === "high_views") return (post.view_count || 0) >= 15;
    return true;
  });

  const totalItems = filteredPosts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans relative">
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        activeMenu="Quản lý Tin tức" 
        setActiveMenu={() => {}} 
      />

      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"
      }`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Tòa soạn & Biên tập tin
              </h1>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Soạn thảo nội dung cẩm nang, tối ưu hóa công cụ tìm kiếm SEO và theo dõi lượt đọc bài viết.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleCrawl}
                disabled={crawling}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                <RefreshCw size={13} className={crawling ? "animate-spin" : ""} />
                Đồng bộ bài viết
              </button>
              
              <button
                onClick={() => { setEditingPost(null); setIsEditorOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition"
              >
                <Plus size={14} />
                Viết bài mới
              </button>
            </div>
          </div>

          {/* Premium stats dashboard metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 hover:border-slate-200 transition-all rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng bài viết</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1.5 group-hover:scale-105 origin-left transition-transform duration-200">{posts.length}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Đồng bộ từ Sapo</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:rotate-6 transition-transform">
                <FileText size={18} />
              </div>
            </div>

            <div className="bg-white border border-slate-100 hover:border-slate-200 transition-all rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lượt xem tích lũy</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1.5 group-hover:scale-105 origin-left transition-transform duration-200">{totalViews.toLocaleString("vi-VN")}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Lượt đọc trực tiếp</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:rotate-6 transition-transform">
                <Eye size={18} />
              </div>
            </div>

            <div className="bg-white border border-slate-100 hover:border-slate-200 transition-all rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Điểm SEO trung bình</p>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <h3 className="text-2xl font-black text-slate-800 group-hover:scale-105 origin-left transition-transform duration-200">{avgSeoScore}</h3>
                  <span className="text-xs text-slate-400 font-bold">/100</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Điểm tối ưu hóa</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:rotate-6 transition-transform">
                <Sparkles size={18} />
              </div>
            </div>

            <div className="bg-white border border-slate-100 hover:border-slate-200 transition-all rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SEO tốt (&ge;80)</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1.5 group-hover:scale-105 origin-left transition-transform duration-200">{excellentSeoCount}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Sẵn sàng index</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:rotate-6 transition-transform">
                <CheckSquare size={18} />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex border-b border-slate-100 w-full sm:w-auto -mb-px">
              <button
                onClick={() => setSeoFilter("all")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  seoFilter === "all"
                    ? "border-slate-900 text-slate-900 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Tất cả ({posts.length})
              </button>
              <button
                onClick={() => setSeoFilter("excellent")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  seoFilter === "excellent"
                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                SEO tốt ({posts.filter(p => calculateSeoScore(p) >= 80).length})
              </button>
              <button
                onClick={() => setSeoFilter("needs_opt")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  seoFilter === "needs_opt"
                    ? "border-rose-600 text-rose-600 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Cần tối ưu ({posts.filter(p => calculateSeoScore(p) < 50).length})
              </button>
              <button
                onClick={() => setSeoFilter("high_views")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  seoFilter === "high_views"
                    ? "border-indigo-600 text-indigo-600 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Đọc nhiều ({posts.filter(p => (p.view_count || 0) >= 15).length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm tiêu đề..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400 transition" 
              />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Bài viết</th>
                    <th className="px-6 py-3.5 text-center">Lượt xem</th>
                    <th className="px-6 py-3.5 text-center">Điểm SEO</th>
                    <th className="px-6 py-3.5">Xuất bản</th>
                    <th className="px-6 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent"></div>
                          <span className="text-xs font-medium">Đang tải danh sách bài viết...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
                        Không tìm thấy bài viết nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedPosts.map((post) => {
                      const score = calculateSeoScore(post);
                      return (
                        <tr key={post.id} className="hover:bg-slate-50/40 transition-colors group">
                          <td className="px-6 py-4 max-w-sm">
                            <div className="flex items-start gap-4">
                              {post.thumbnail_url ? (
                                <img 
                                  src={post.thumbnail_url} 
                                  alt="" 
                                  className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0 shadow-sm" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/assets/images/cat-food.webp";
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 border border-slate-200">
                                  <FileText size={18} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <button 
                                  onClick={() => { setEditingPost(post); setIsEditorOpen(true); }}
                                  className="text-sm font-semibold text-slate-900 hover:text-blue-600 text-left line-clamp-1 leading-snug tracking-tight focus:outline-none"
                                >
                                  {post.title}
                                </button>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-400 font-medium">/{post.slug}</span>
                                  <span className="text-[9px] text-slate-300">•</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{post.author || "Admin"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xs font-semibold text-slate-800">
                              {post.view_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border tracking-wider ${
                                score >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                score >= 50 ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-rose-50 text-rose-700 border-rose-100"
                              }`}>
                                {score}/100 {score >= 80 ? "Tốt" : score >= 50 ? "Khá" : "Yếu"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-slate-600">
                                {post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Bản nháp"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-4 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              <a 
                                href={`/tin-tuc/${post.slug}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition"
                              >
                                Xem
                                <ExternalLink size={12} />
                              </a>
                              <button 
                                onClick={() => { setEditingPost(post); setIsEditorOpen(true); }} 
                                className="text-blue-500 hover:text-blue-700 transition"
                              >
                                Sửa
                              </button>
                              <button 
                                onClick={() => handleDelete(post.id)} 
                                className="text-red-500 hover:text-red-700 transition"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                <span className="text-[11px] font-semibold text-slate-400">
                  Hiển thị <span className="text-slate-700">{startIndex + 1}</span>–
                  <span className="text-slate-700">{endIndex}</span> trong tổng số{" "}
                  <span className="text-slate-700">{totalItems}</span> bài viết
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={activePage === 1}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 min-w-8 px-2 rounded-lg text-xs font-bold transition shadow-sm ${
                          activePage === pageNum
                            ? "bg-slate-900 text-white border border-slate-900"
                            : "border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={activePage === totalPages}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <BlogEditor isOpen={isEditorOpen} onClose={() => { setIsEditorOpen(false); setEditingPost(null); }} onSave={handleSave} initialData={editingPost} onImageUpload={handleImageUpload} />
    </div>
  );
}
