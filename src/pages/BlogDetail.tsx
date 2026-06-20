"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CalendarDays, User, ArrowLeft, BookOpen, Loader2, MessageSquare, ChevronRight } from "lucide-react";
import DOMPurify from "dompurify";
import { getBlogPostDetail, getBlogPosts, type BlogPost } from "@/src/api/blogApi";

export function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadPostDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getBlogPostDetail(slug);
        if (res.success && res.data) {
          setPost(res.data);
        } else {
          setError("Không tìm thấy bài viết.");
        }
      } catch (err: any) {
        console.error("Error loading blog details:", err);
        setError("Lỗi tải chi tiết bài viết. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    const loadRecentPosts = async () => {
      try {
        const res = await getBlogPosts(1, 5);
        if (res.success && res.data) {
          // Filter out the current post
          setRecentPosts(res.data.items.filter(p => p.slug !== slug).slice(0, 4));
        }
      } catch (err) {
        console.error("Error loading recent posts:", err);
      }
    };

    loadPostDetail();
    loadRecentPosts();
  }, [slug]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream/20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-forest" />
          <span className="text-sm font-black text-ink/70">Đang tải nội dung...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-ink">{error || "Bài viết không tồn tại"}</h2>
        <p className="mt-2 text-sm text-ink/50 font-semibold">Bài viết bạn yêu cầu không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link to="/tin-tuc" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-forest-dark">
          <ArrowLeft size={16} /> Quay lại tin tức
        </Link>
      </div>
    );
  }

  // Sanitize the HTML content to render safely
  const cleanContent = DOMPurify.sanitize(post.content);

  return (
    <div className="min-h-screen bg-cream/20 pb-24 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-ink/50 sm:text-sm">
          <Link to="/" className="transition hover:text-forest">Trang chủ</Link>
          <ChevronRight size={14} className="text-ink/30" />
          <Link to="/tin-tuc" className="transition hover:text-forest">Tin tức</Link>
          <ChevronRight size={14} className="text-ink/30" />
          <span className="text-forest line-clamp-1 max-w-[200px] sm:max-w-xs">{post.title}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate("/tin-tuc")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-forest/10 bg-white px-4 py-2 text-xs font-black text-forest shadow-sm transition hover:bg-forest/5"
        >
          <ArrowLeft size={14} strokeWidth={2.5} /> Quay lại danh sách
        </button>

        {/* Main Content Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Main Article Container */}
          <article className="rounded-3xl border border-forest/8 bg-white p-6 shadow-sm sm:p-8 lg:col-span-8 lg:p-10">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-black text-ink/40">
              <span className="inline-flex items-center gap-1 text-forest bg-forest/5 px-2.5 py-1 rounded">
                <CalendarDays size={13} />
                {formatDate(post.published_at)}
              </span>
              <span className="inline-flex items-center gap-1 bg-ink/5 px-2.5 py-1 rounded">
                <User size={13} />
                Tác giả: {post.author || "Admin"}
              </span>
            </div>

            {/* H1 Title */}
            <h1 className="mt-4 text-2xl font-black leading-tight text-ink sm:text-3xl lg:text-4xl">
              {post.title}
            </h1>

            {/* Summary Block */}
            {post.summary && (
              <div className="mt-6 rounded-2xl border-l-4 border-forest bg-forest/5 p-4 text-sm font-semibold italic leading-relaxed text-ink/70">
                {post.summary}
              </div>
            )}

            {/* Divider */}
            <hr className="my-8 border-forest/10" />

            {/* Article Content Rich HTML Container */}
            {/* Scoped CSS styling for native Sapo content HTML */}
            <div 
              className="article-rich-content text-sm leading-relaxed text-ink/80 font-medium sm:text-base space-y-6"
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />

          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            
            {/* Recent Posts Widget */}
            <div className="rounded-3xl border border-forest/8 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-black text-ink border-b border-forest/10 pb-4">
                <BookOpen size={18} className="text-forest" /> Bài viết mới nhất
              </h3>
              
              <div className="mt-4 divide-y divide-forest/5">
                {recentPosts.map((rPost) => (
                  <div key={rPost.id} className="py-3.5 first:pt-0 last:pb-0">
                    <Link to={`/tin-tuc/${rPost.slug}`} className="group flex gap-3">
                      {/* Image Thumbnail */}
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-cream/10">
                        <img
                          src={rPost.thumbnail_url || "/assets/images/cat-food.webp"}
                          alt={rPost.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/images/cat-food.webp";
                          }}
                        />
                      </div>
                      
                      {/* Title & Date */}
                      <div className="flex flex-col justify-between">
                        <h4 className="text-xs font-black leading-snug text-ink line-clamp-2 transition group-hover:text-forest">
                          {rPost.title}
                        </h4>
                        <span className="text-[10px] font-bold text-ink/40 mt-1">
                          {formatDate(rPost.published_at)}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Helper Promotion Widget */}
            <div className="relative overflow-hidden rounded-3xl border border-forest/10 bg-gradient-to-br from-forest to-forest-dark p-6 text-cream shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-wider text-cream/90">Chăm sóc thú cưng</h4>
              <p className="mt-2 text-xs leading-relaxed text-cream/70 font-semibold">
                Bạn cần tìm sản phẩm dinh dưỡng, vệ sinh hay phụ kiện tốt nhất cho boss yêu? Ghé ngay gian hàng của 3F Store.
              </p>
              <Link to="/products" className="mt-4 inline-flex items-center gap-1 text-xs font-black text-white hover:underline">
                Xem sản phẩm ngay <ChevronRight size={14} />
              </Link>
            </div>

          </aside>

        </div>

      </div>

      {/* Styled inline custom CSS to format scraped html elements beautifully */}
      <style>{`
        .article-rich-content h2 {
          font-size: 1.25rem;
          font-weight: 900;
          color: #171A14;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .article-rich-content h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #171A14;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .article-rich-content p {
          margin-bottom: 1.25rem;
          color: rgba(23, 26, 20, 0.8);
          line-height: 1.7;
        }
        .article-rich-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 1.5rem auto;
          display: block;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        }
        .article-rich-content ul, .article-rich-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
          list-style-type: disc;
        }
        .article-rich-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .article-rich-content strong {
          color: #171A14;
          font-weight: 700;
        }
        .article-rich-content .postImages, .article-rich-content div[align="center"] {
          text-align: center;
          margin: 1.5rem 0;
        }
        .article-rich-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .article-rich-content th, .article-rich-content td {
          border: 1px solid rgba(41, 76, 38, 0.1);
          padding: 0.75rem;
          text-align: left;
        }
        .article-rich-content th {
          background-color: rgba(41, 76, 38, 0.03);
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}
