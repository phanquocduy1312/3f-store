"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Search, User, ArrowRight, Loader2, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { getBlogPosts, type BlogPost } from "@/src/api/blogApi";

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const categories = ["Tất cả", "Dinh dưỡng", "Chăm sóc", "Sức khỏe", "Vệ sinh", "Phụ kiện"];

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPosts = async (currentPage: number, searchKeyword: string) => {
    setIsLoading(true);
    try {
      // If a category other than "Tất cả" is selected, we filter by category
      const queryKeyword = selectedCategory !== "Tất cả" ? `${selectedCategory} ${searchKeyword}`.trim() : searchKeyword;
      const res = await getBlogPosts(currentPage, limit, queryKeyword);
      if (res.success && res.data) {
        setPosts(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page, searchQuery);
  }, [page, searchQuery, selectedCategory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQ(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(val);
      setPage(1);
    }, 400);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatDate = (dateStr: string) => {
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

  // Determine category badge color
  const getCategoryColor = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("dinh dưỡng") || lower.includes("thức ăn")) return "bg-orange-50 text-orange-600 border-orange-100";
    if (lower.includes("vệ sinh") || lower.includes("cát")) return "bg-blue-50 text-blue-600 border-blue-100";
    if (lower.includes("sức khỏe") || lower.includes("bệnh")) return "bg-red-50 text-red-600 border-red-100";
    if (lower.includes("phụ kiện") || lower.includes("chuồng")) return "bg-purple-50 text-purple-600 border-purple-100";
    return "bg-forest/5 text-forest border-forest/10";
  };

  // Guess category based on title/summary
  const getGuessedCategory = (post: BlogPost) => {
    const txt = (post.title + " " + (post.summary || "")).toLowerCase();
    if (txt.includes("ăn") || txt.includes("dinh dưỡng") || txt.includes("pate") || txt.includes("hạt")) return "Dinh dưỡng";
    if (txt.includes("cát") || txt.includes("vệ sinh") || txt.includes("khử mùi")) return "Vệ sinh";
    if (txt.includes("bệnh") || txt.includes("sức khỏe") || txt.includes("viêm tai") || txt.includes("rụng lông")) return "Sức khỏe";
    if (txt.includes("chuồng") || txt.includes("đồ chơi") || txt.includes("phụ kiện")) return "Phụ kiện";
    return "Chăm sóc";
  };

  return (
    <div className="min-h-screen bg-cream/30 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-xs font-semibold text-ink/50 sm:text-sm">
          <Link to="/" className="transition hover:text-forest">Trang chủ</Link>
          <span>/</span>
          <span className="text-forest">Tin tức & Hướng dẫn</span>
        </nav>

        {/* Title Header Section */}
        <div className="relative mb-8 sm:mb-12 overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-forest/10 bg-gradient-to-br from-forest to-forest-dark p-6 sm:p-12 text-cream shadow-[0_15px_40px_rgba(41,76,38,0.15)]">
          <div className="pointer-events-none absolute -right-16 -top-16 opacity-10">
            <BookOpen size={240} className="rotate-12" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cream/90 backdrop-blur-sm">
              <Sparkles size={13} className="animate-pulse" /> Góc chia sẻ
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Cẩm nang thú cưng
            </h1>
            <p className="mt-4 text-sm font-medium text-cream/80 sm:text-base leading-relaxed">
              Tổng hợp những kiến thức nuôi dạy chó mèo bổ ích, kinh nghiệm chăm sóc sức khỏe, chế độ dinh dưỡng chuẩn khoa học giúp boss luôn khỏe mạnh.
            </p>
          </div>
        </div>

        {/* Filtering & Search Bar */}
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Categories Tab list */}
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-black border transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-forest border-forest text-white shadow-md shadow-forest/10"
                    : "bg-white border-forest/8 text-ink/75 hover:bg-forest/5 hover:border-forest/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full shrink-0 lg:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={q}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm bài viết..."
              className="h-11 w-full rounded-full border border-forest/12 bg-white pl-10 pr-4 text-xs font-semibold outline-none transition placeholder:text-ink/35 focus:border-forest focus:ring-2 focus:ring-forest/5"
            />
          </div>
        </div>

        {/* Loading Indicator / Skeletons */}
        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="animate-pulse flex flex-col overflow-hidden rounded-[1.5rem] border border-forest/5 bg-white p-3">
                <div className="aspect-[4/3] w-full rounded-xl bg-forest/5" />
                <div className="mt-4 flex-1 space-y-3 px-1">
                  <div className="h-4 w-20 rounded bg-forest/5" />
                  <div className="h-5 w-full rounded bg-forest/5" />
                  <div className="h-12 w-full rounded bg-forest/5" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-forest/15 bg-white py-16 text-center">
            <AlertCircle size={48} className="text-forest/30" />
            <h3 className="mt-4 text-base font-black text-ink">Không tìm thấy bài viết nào</h3>
            <p className="mt-1.5 text-xs text-ink/40 font-semibold max-w-sm">
              Rất tiếc, không tìm thấy bài viết phù hợp với tìm kiếm của bạn. Hãy thử từ khóa khác nhé.
            </p>
          </div>
        ) : (
          /* Blog Grid */
          <div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {posts.map((post) => {
                const guessedCat = getGuessedCategory(post);
                const badgeStyle = getCategoryColor(guessedCat);
                const imageSrc = post.thumbnail_url || "/assets/images/cat-food.webp";
                
                return (
                  <article
                    key={post.id}
                    className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-forest/8 bg-white p-3 shadow-[0_4px_25px_rgba(0,0,0,0.015)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(41,76,38,0.06)]"
                  >
                    <Link to={`/tin-tuc/${post.slug}`} className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-cream/10">
                      <img
                        src={imageSrc}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/images/cat-food.webp";
                        }}
                      />
                    </Link>

                    <div className="mt-4 flex flex-1 flex-col px-1">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1 rounded bg-forest/5 px-2 py-0.5 text-[10px] font-bold text-forest">
                          <CalendarDays size={10} />
                          {formatDate(post.published_at)}
                        </div>
                        <div className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold ${badgeStyle}`}>
                          {guessedCat}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="mt-3 text-sm font-black leading-[20px] text-ink line-clamp-2 transition hover:text-forest">
                        <Link to={`/tin-tuc/${post.slug}`} title={post.title}>
                          {post.title}
                        </Link>
                      </h3>

                      {/* Summary */}
                      <p className="mt-2 text-[13px] leading-relaxed text-ink/60 line-clamp-3 font-medium">
                        {post.summary || "Thông tin hữu ích giúp nuôi dưỡng và chăm sóc thú cưng của bạn toàn diện nhất..."}
                      </p>

                      {/* Read More button */}
                      <div className="mt-4 mt-auto pt-2">
                        <Link
                          to={`/tin-tuc/${post.slug}`}
                          className="inline-flex items-center gap-1.5 text-[13px] font-black text-forest transition hover:text-forest-dark"
                        >
                          Đọc thêm <ArrowRight size={14} strokeWidth={2.5} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-forest/10 bg-white text-xs font-bold text-ink/70 transition hover:bg-forest/5 disabled:opacity-50 disabled:hover:bg-white"
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-xs font-black transition-all ${
                        page === pNum
                          ? "bg-forest text-white shadow-sm"
                          : "border border-forest/10 bg-white text-ink/75 hover:bg-forest/5"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-forest/10 bg-white text-xs font-bold text-ink/70 transition hover:bg-forest/5 disabled:opacity-50 disabled:hover:bg-white"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
