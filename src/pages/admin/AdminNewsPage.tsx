import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { 
  adminGetBlogPosts, 
  adminUpdateBlogPost, 
  adminDeleteBlogPost, 
  adminUploadBlogImage, 
  adminCrawlBlogPosts,
  type BlogPost 
} from "@/src/api/blogApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, Eye, RefreshCw, FileText, Sparkles, CheckSquare, ChevronLeft, ChevronRight, MoreHorizontal, EyeOff, AlertCircle } from "lucide-react";

export function AdminNewsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return true;
  });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [search, setSearch] = useState("");
  const [seoFilter, setSeoFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("updated_at");

  useEffect(() => {
    setCurrentPage(1);
  }, [search, seoFilter, selectedCategory, selectedSort]);

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
      const res = await adminGetBlogPosts(1, 200, search, selectedCategory, selectedSort);
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
  }, [search, selectedCategory, selectedSort]);

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

  // handleSave is now handled in AdminNewsEditorPage

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



  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const nextStatus = (post.status === "published" ? "draft" : "published") as "draft" | "published";
      const updated = {
        ...post,
        status: nextStatus,
      };
      const res = await adminUpdateBlogPost(post.id, updated);
      if (res.success) {
        toast.success(nextStatus === "published" ? "Đã xuất bản bài viết!" : "Đã chuyển bài viết về bản nháp!");
        loadData();
      } else {
        toast.error(res.message || "Lỗi cập nhật trạng thái");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
    }
  };

  // handleImageUpload is now handled in AdminNewsEditorPage

  const calculateSeoScore = (post: BlogPost): number => {
    let score = 0;
    const displayTitle = post.seo_title || post.title || "";
    const displayDesc = post.seo_description || post.summary || "";
    const slug = post.slug || "";
    const content = post.content || "";
    const keyword = (post.seo_keywords || "").split(",")[0]?.trim();
    const thumbnailAlt = post.thumbnail_alt || "";

    const plainText = content.replace(/<[^>]*>/g, "");
    const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;

    // 1. Title Audit (20 pts)
    if (displayTitle.length >= 45 && displayTitle.length <= 65) score += 20;
    else if (displayTitle.length > 0) score += 10;

    // 2. Meta Desc Audit (20 pts)
    if (displayDesc.length >= 110 && displayDesc.length <= 170) score += 20;
    else if (displayDesc.length > 0) score += 10;

    // 3. Slug Audit (20 pts)
    if (slug && /^[a-z0-9-]+$/.test(slug)) {
      score += 20;
    }

    // 4. Keyword Audit (20 pts)
    if (keyword) {
      const inTitle = displayTitle.toLowerCase().includes(keyword.toLowerCase());
      const inDesc = displayDesc.toLowerCase().includes(keyword.toLowerCase());
      const inSlug = slug.toLowerCase().includes(keyword.toLowerCase());
      if (inTitle && inDesc && inSlug) score += 20;
      else if (inTitle || inDesc || inSlug) score += 10;
    }

    // 5. Content Quality & Alts (20 pts)
    const headingsCount = (content.match(/<h2|<h3/gi) || []).length;
    if (words >= 500) score += 5;
    else if (words >= 250) score += 2;
    if (headingsCount >= 2) score += 5;
    if (thumbnailAlt.trim()) score += 5;
    
    // Check internal links
    const hasInternalLink = /href="(\/|https?:\/\/(localhost|3fstore|vercel\.app))/i.test(content);
    if (hasInternalLink) score += 5;

    return Math.min(score, 100);
  };

  const totalViews = posts.reduce((acc, p) => acc + (p.view_count || 0), 0);
  const publishedCount = posts.filter(p => (p.status || "published") === "published").length;
  const needsOptCount = posts.filter(p => calculateSeoScore(p) < 50).length;

  const filteredPosts = posts.filter(post => {
    if (seoFilter === "published") return (post.status || "published") === "published";
    if (seoFilter === "draft") return post.status === "draft";
    if (seoFilter === "scheduled") return post.status === "scheduled";
    if (seoFilter === "needs_opt") return calculateSeoScore(post) < 50;
    return true;
  });

  const totalItems = filteredPosts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        activeMenu="Quản lý Tin tức" 
        setActiveMenu={() => {}} 
      />

      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={`min-h-screen flex flex-col overflow-x-hidden transition-all duration-300 ${
        sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"
      }`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="flex-1 px-4 sm:px-6 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#0B1F3A]">
                Quản lý tin tức
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                Quản lý bài viết, SEO, lịch xuất bản và nội dung tư vấn thú cưng
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCrawl}
                disabled={crawling}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#082B5F] bg-[#EEF6FF] hover:bg-[#DCEBFF] rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${crawling ? "animate-spin" : ""}`} />
                Đồng bộ bài viết
              </button>
              
              <button
                onClick={() => navigate("/admin/news/new")}
                className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-[#0057E7] hover:bg-[#0047C4] shadow-[0_6px_20px_rgba(0,87,231,0.25)] hover:shadow-none rounded-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Viết bài mới
              </button>
            </div>
          </div>

          {/* Premium stats dashboard metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Tổng bài viết</p>
                <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">{posts.length}</h3>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Sapo & Biên tập</p>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Eye size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Tổng lượt xem</p>
                <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">{totalViews.toLocaleString("vi-VN")}</h3>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Lượt đọc trực tiếp</p>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-green-600 shrink-0">
                <CheckSquare size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Đã xuất bản</p>
                <h3 className="text-lg font-black text-[#0B1F3A] mt-0.5">{publishedCount}</h3>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Hiển thị trên website</p>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.04)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#64748B] truncate">Cần tối ưu SEO</p>
                <h3 className="text-lg font-black text-rose-600 mt-0.5">{needsOptCount}</h3>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Điểm SEO dưới 50</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex border-b border-[#DCEBFF] w-full sm:w-auto -mb-px overflow-x-auto whitespace-nowrap scrollbar-none">
              <button
                onClick={() => setSeoFilter("all")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  seoFilter === "all"
                    ? "border-[#0057E7] text-[#0057E7] font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Tất cả ({posts.length})
              </button>
              <button
                onClick={() => setSeoFilter("published")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  seoFilter === "published"
                    ? "border-[#0057E7] text-[#0057E7] font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Đã xuất bản ({posts.filter(p => (p.status || "published") === "published").length})
              </button>
              <button
                onClick={() => setSeoFilter("draft")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  seoFilter === "draft"
                    ? "border-[#0057E7] text-[#0057E7] font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Bản nháp ({posts.filter(p => p.status === "draft").length})
              </button>
              <button
                onClick={() => setSeoFilter("scheduled")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  seoFilter === "scheduled"
                    ? "border-[#0057E7] text-[#0057E7] font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Đã lên lịch ({posts.filter(p => p.status === "scheduled").length})
              </button>
              <button
                onClick={() => setSeoFilter("needs_opt")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  seoFilter === "needs_opt"
                    ? "border-rose-600 text-rose-600 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Cần tối ưu SEO ({posts.filter(p => calculateSeoScore(p) < 50).length})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 bg-white border border-[#DCEBFF] rounded-xl text-xs font-bold focus:border-[#0057E7] focus:outline-none transition cursor-pointer text-[#0B1F3A] shadow-sm"
              >
                <option value="">Tất cả danh mục</option>
                <option value="Chăm sóc mèo">Chăm sóc mèo</option>
                <option value="Chăm sóc chó">Chăm sóc chó</option>
                <option value="Dinh dưỡng thú cưng">Dinh dưỡng thú cưng</option>
                <option value="Sức khỏe thú cưng">Sức khỏe thú cưng</option>
                <option value="Huấn luyện & hành vi">Huấn luyện & hành vi</option>
                <option value="Sản phẩm & đánh giá">Sản phẩm & đánh giá</option>
                <option value="Khuyến mãi / Thông báo">Khuyến mãi / Thông báo</option>
                <option value="Tin tức 3F Store">Tin tức 3F Store</option>
              </select>

              {/* Sort selector */}
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="h-9 px-3 bg-white border border-[#DCEBFF] rounded-xl text-xs font-bold focus:border-[#0057E7] focus:outline-none transition cursor-pointer text-[#0B1F3A] shadow-sm"
              >
                <option value="updated_at">Mới cập nhật</option>
                <option value="published_at">Ngày xuất bản</option>
                <option value="views">Lượt xem</option>
                <option value="seo_score">Điểm SEO thấp nhất</option>
              </select>

              {/* Search box */}
              <div className="relative w-full sm:w-48">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm tiêu đề..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="w-full h-9 pl-9 pr-3 bg-white border border-[#DCEBFF] rounded-xl text-xs font-bold outline-none focus:border-[#0057E7] focus:ring-1 focus:ring-[#0057E7] transition text-[#0B1F3A] placeholder-slate-400 shadow-sm" 
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DCEBFF] rounded-2xl shadow-[0_10px_35px_rgba(6,43,95,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-[#DCEBFF] text-xs font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Bài viết</th>
                    <th className="px-6 py-4 text-center">Loại tin</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-center">SEO</th>
                    <th className="px-6 py-4 text-center">Lượt xem</th>
                    <th className="px-6 py-4">Xuất bản</th>
                    <th className="px-6 py-4">Cập nhật</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-[#0B1F3A]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0057E7] border-t-transparent"></div>
                          <span className="text-xs font-medium">Đang tải danh sách bài viết...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedPosts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <FileText size={32} className="text-slate-300" />
                          <span className="text-xs font-bold text-slate-600">Chưa có bài viết nào.</span>
                          <button
                            onClick={() => navigate("/admin/news/new")}
                            className="mt-2 text-xs font-bold text-[#0057E7] hover:underline"
                          >
                            Viết bài đầu tiên
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPosts.map((post) => {
                      const score = calculateSeoScore(post);
                      return (
                        <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-3 max-w-sm">
                            <div className="flex items-start gap-4">
                              {post.thumbnail_url ? (
                                <img 
                                  src={post.thumbnail_url} 
                                  alt={post.thumbnail_alt || ""} 
                                  className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0 shadow-sm" 
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
                                  onClick={() => navigate(`/admin/news/${post.id}/edit`)}
                                  className="text-xs font-black text-slate-800 hover:text-blue-600 text-left line-clamp-1 leading-snug tracking-tight focus:outline-none"
                                >
                                  {post.title}
                                </button>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-400 font-semibold">/{post.slug}</span>
                                  <span className="text-[9px] text-slate-300">•</span>
                                  <span className="text-[10px] text-slate-400 font-bold">{post.author || "Admin"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-100 w-fit max-w-[160px] truncate">
                              {post.category || "Tin tức 3F Store"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black border tracking-wider ${
                              post.status === "published" ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" :
                              post.status === "scheduled" ? "bg-indigo-50 text-indigo-600 border-indigo-200/50" :
                              "bg-slate-100 text-slate-450 border-slate-200/50"
                            }`}>
                              {post.status === "published" ? "Đã xuất bản" :
                               post.status === "scheduled" ? "Đã lên lịch" : "Bản nháp"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black border tracking-wider ${
                              score >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" :
                              score >= 50 ? "bg-amber-50 text-amber-600 border-amber-200/50" :
                              "bg-red-50 text-red-650 border-red-200/50"
                            }`}>
                              {score} · {score >= 80 ? "Tốt" : score >= 50 ? "Ổn" : "Cần tối ưu"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center font-bold text-[#0B1F3A] text-sm">
                            {post.view_count || 0}
                          </td>
                          <td className="px-6 py-3 text-[10px] font-semibold text-slate-450">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td className="px-6 py-3 text-[10px] font-semibold text-slate-450">
                            {post.updated_at ? new Date(post.updated_at).toLocaleDateString("vi-VN") : (post.created_at ? new Date(post.created_at).toLocaleDateString("vi-VN") : "—")}
                          </td>
                          <td className="px-6 py-3 text-right relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)}
                              className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-[#EEF6FF] text-slate-500 hover:text-[#0057E7] border border-slate-200 flex items-center justify-center transition-all duration-200"
                            >
                              <MoreHorizontal size={15} />
                            </button>
                            
                            {activeDropdown === post.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                                <div className="absolute right-6 mt-1 w-36 bg-white border border-[#DCEBFF] rounded-xl shadow-[0_10px_30px_rgba(6,43,95,0.08)] py-1.5 z-20 text-left">
                                  <button
                                    onClick={() => {
                                      navigate(`/admin/news/${post.id}/edit`);
                                      setActiveDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition text-left"
                                  >
                                    <Edit2 size={12} />
                                    Sửa bài
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleTogglePublish(post);
                                      setActiveDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition text-left"
                                  >
                                    {post.status === "published" ? (
                                      <>
                                        <EyeOff size={12} />
                                        Ẩn bài viết
                                      </>
                                    ) : (
                                      <>
                                        <Eye size={12} />
                                        Xuất bản
                                      </>
                                    )}
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    onClick={() => {
                                      handleDelete(post.id);
                                      setActiveDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-bold text-red-650 hover:bg-red-50 transition text-left"
                                  >
                                    <Trash2 size={12} />
                                    Xóa bài
                                  </button>
                                </div>
                              </>
                            )}
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
              <div className="px-6 py-4 bg-slate-50 border-t border-[#DCEBFF] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-400">
                  Hiển thị <span className="text-slate-700">{startIndex + 1}</span>–
                  <span className="text-slate-700">{endIndex}</span> trong tổng số{" "}
                  <span className="text-slate-700">{totalItems}</span> bài viết
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={activePage === 1}
                    className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm"
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
                            ? "bg-[#0057E7] text-white border border-[#0057E7]"
                            : "border border-slate-200 bg-white text-[#0B1F3A] hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={activePage === totalPages}
                    className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="h-14 bg-white border-t border-[#DCEBFF] px-4 sm:px-6 flex items-center justify-between text-[11px] sm:text-[12px] text-slate-400 font-semibold shrink-0">
          <span>© 2026 3F Store Admin. Tất cả quyền được bảo lưu.</span>
          <span>Phiên bản 1.0.0</span>
        </footer>
      </div>

    </div>
  );
}
