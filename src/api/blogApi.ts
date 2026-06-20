import { buildApiUrl } from "@/src/config/api";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnail_url: string | null;
  author: string;
  published_at: string;
  created_at: string;
  updated_at?: string | null;
}

export interface BlogListResponse {
  success: boolean;
  data: {
    items: BlogPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface BlogDetailResponse {
  success: boolean;
  data: BlogPost;
  message?: string;
}

/**
 * Fetch paginated blog posts.
 */
export async function getBlogPosts(page = 1, limit = 10, q = ""): Promise<BlogListResponse> {
  try {
    const url = new URL(buildApiUrl("/api/blog-posts"));
    url.searchParams.append("page", String(page));
    url.searchParams.append("limit", String(limit));
    if (q) {
      url.searchParams.append("q", q);
    }
    const res = await fetch(url.toString(), { method: "GET" });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error("Error fetching blog posts:", err);
    return { success: false, data: { items: [], total: 0, page, limit, totalPages: 0 }, message: err.message };
  }
}

/**
 * Fetch detailed blog post by slug.
 */
export async function getBlogPostDetail(slug: string): Promise<BlogDetailResponse> {
  try {
    const url = buildApiUrl(`/api/blog-posts/${slug}`);
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error(`Error fetching blog post ${slug}:`, err);
    throw err;
  }
}
