"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CalendarDays, User, ArrowLeft, BookOpen, Loader2, ChevronRight, ArrowUp, ChevronDown } from "lucide-react";
import DOMPurify from "dompurify";
import { getBlogPostDetail, getBlogPosts, type BlogPost } from "@/src/api/blogApi";
import { SeoMetadata } from "@/src/components/blog/seo-metadata";
import { BlogToc, type HeadingItem } from "@/src/components/blog/blog-toc";
import { BlogShare } from "@/src/components/blog/blog-share";
import { toast } from "sonner";

export function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTocOpen, setIsTocOpen] = useState(false);

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
          setRecentPosts(res.data.items.filter(p => p.slug !== slug).slice(0, 4));
        }
      } catch (err) {
        console.error("Error loading recent posts:", err);
      }
    };

    loadPostDetail();
    loadRecentPosts();
  }, [slug]);

  const getEnrichedContentAndHeadings = (rawHtml: string) => {
    const headings: HeadingItem[] = [];
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, "text/html");

    // Auto-hide broken crawled images (404/DNS resolution failures)
    const imgElements = doc.querySelectorAll("img");
    imgElements.forEach((img) => {
      img.setAttribute("onerror", "this.style.display='none';");
    });

    const headingElements = doc.querySelectorAll("h2, h3");
    
    headingElements.forEach((el, index) => {
      const level = el.tagName.toLowerCase() === "h2" ? 2 : 3;
      const text = el.textContent || "";
      if (!text.trim()) return;
      
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") || `heading-${index}`;
      
      el.setAttribute("id", id);
      
      // Inject circular number badge matching Paddy's layout
      const headingNum = index + 1;
      el.innerHTML = `<span class="heading-number-badge">${headingNum}</span> ${el.innerHTML}`;
      
      headings.push({ id, text, level });
    });
    
    return {
      enrichedContent: doc.body.innerHTML,
      headings
    };
  };

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


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { enrichedContent, headings } = useMemo(() => {
    if (!post) return { enrichedContent: "", headings: [] };
    return getEnrichedContentAndHeadings(post.content);
  }, [post?.content]);

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

  return (
    <div className="min-h-screen bg-cream/20 pb-24 pt-8">
      {/* Dynamic SEO Injector */}
      <SeoMetadata post={post} />

      {/* Top Reading Progress Bar */}
      <ReadingProgressBar />

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

        {/* Main Content Layout - Premium 3-column System */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          
          {/* LEFT COLUMN: Table of Contents & Social Share (col-span-3) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 lg:sticky lg:top-[160px] h-fit">
            <BlogToc headings={headings} />
            <BlogShare title={post.title} />
          </aside>

          {/* MIDDLE COLUMN: Main Article (col-span-6) */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <article className="rounded-3xl border border-forest/8 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
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

              <h1 id="article-title" className="mt-4 text-2xl font-black leading-tight text-ink sm:text-3xl lg:text-4xl">
                {post.title}
              </h1>

              {post.summary && (
                <div className="mt-6 rounded-2xl border-l-4 border-forest bg-forest/5 p-4 text-sm font-semibold italic leading-relaxed text-ink/70">
                  {post.summary}
                </div>
              )}

              {/* Mobile Table of Contents (collapsible Accordion) */}
              {headings.length > 0 && (
                <div className="mt-6 block lg:hidden rounded-2xl border border-forest/10 bg-cream/5 p-4">
                  <button
                    onClick={() => setIsTocOpen(!isTocOpen)}
                    className="flex w-full items-center justify-between text-xs font-black text-ink uppercase tracking-wider"
                  >
                    <span className="flex items-center gap-2 text-forest">
                      <BookOpen size={14} />
                      Mục lục bài viết
                    </span>
                    <span className={`transform transition-transform duration-200 ${isTocOpen ? "rotate-180" : ""}`}>
                      <ChevronDown size={14} className="text-ink/65" />
                    </span>
                  </button>
                  {isTocOpen && (
                    <div className="mt-3 border-t border-forest/8 pt-3">
                      <BlogToc headings={headings} hideHeader={true} className="p-0 bg-transparent border-none shadow-none" />
                    </div>
                  )}
                </div>
              )}

              <hr className="my-8 border-forest/10" />

              <div 
                className="article-rich-content text-sm leading-relaxed text-ink/80 font-medium sm:text-base space-y-6"
                dangerouslySetInnerHTML={{ __html: enrichedContent }}
              />
            </article>

            {/* Mobile-only Sharing Widget */}
            <div className="block lg:hidden">
              <BlogShare title={post.title} />
            </div>

          </div>

          {/* RIGHT COLUMN: Vouchers & Trending List (col-span-3) */}
          <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-[160px] h-fit">
            

            {/* Trending / Recent Posts Card */}
            <div className="rounded-3xl border border-forest/8 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-black text-ink border-b border-forest/10 pb-4">
                <span role="img" aria-label="fire">🔥</span> Xu Hướng
              </h3>
              
              <div className="mt-4 divide-y divide-forest/5">
                {recentPosts.map((rPost) => (
                  <div key={rPost.id} className="py-3.5 first:pt-0 last:pb-0">
                    <Link to={`/tin-tuc/${rPost.slug}`} className="group flex gap-3">
                      <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-cream/10">
                        <img
                          src={rPost.thumbnail_url || "/assets/images/cat-food.webp"}
                          alt={rPost.thumbnail_alt || rPost.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/images/cat-food.webp";
                          }}
                        />
                      </div>
                      
                      <div className="flex flex-col justify-between min-w-0">
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

          </aside>
        </div>
      </div>

      {/* Floating Circular Progress Scroll-To-Top */}
      <ScrollToTopButton />

      {/* Styled inline custom CSS to format scraped html elements beautifully */}
      <style>{`
        .article-rich-content h2, .article-rich-content h3 {
          display: flex;
          align-items: center;
          color: #171A14;
          margin-top: 1.8rem;
          margin-bottom: 0.8rem;
        }
        .article-rich-content h2 {
          font-size: 1.25rem;
          font-weight: 900;
        }
        .article-rich-content h3 {
          font-size: 1.1rem;
          font-weight: 800;
        }
        .heading-number-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          min-width: 26px;
          border-radius: 50%;
          background-color: #0057E7;
          color: white;
          font-size: 12px;
          font-weight: 900;
          margin-right: 12px;
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

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setProgress((window.scrollY / totalHeight) * 100);
      } else {
        setProgress(0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className="fixed left-0 top-0 z-50 h-[3px] bg-gradient-to-r from-forest to-emerald-500" 
      style={{ width: `${progress}%` }}
    />
  );
}

function ScrollToTopButton() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-forest shadow-lg border border-forest/10 hover:scale-105 active:scale-95 transition-transform duration-200"
      title="Lên đầu trang"
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="24"
          cy="24"
          r="20"
          className="stroke-slate-100"
          strokeWidth="3"
          fill="transparent"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          className="stroke-forest"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={2 * Math.PI * 20}
          strokeDashoffset={2 * Math.PI * 20 * (1 - scrollProgress / 100)}
        />
      </svg>
      <ArrowUp size={16} className="relative z-10" />
    </button>
  );
}
