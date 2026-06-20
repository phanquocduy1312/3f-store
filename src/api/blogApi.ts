import { buildApiUrl } from "@/src/config/api";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnail_url: string | null;
  thumbnail_alt?: string | null;
  author: string;
  status?: "draft" | "published" | "scheduled";
  published_at: string;
  created_at: string;
  updated_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  view_count?: number;
  seo_score?: number;
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

function getAdminHeaders(): Record<string, string> {
  const token = localStorage.getItem("admin_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
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

/**
 * Fetch all posts for Admin (can support query params).
 */
export async function adminGetBlogPosts(page = 1, limit = 100, q = ""): Promise<BlogListResponse> {
  try {
    const url = new URL(buildApiUrl("/api/blog-posts"));
    url.searchParams.append("page", String(page));
    url.searchParams.append("limit", String(limit));
    if (q) {
      url.searchParams.append("q", q);
    }
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: getAdminHeaders()
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error("Error fetching admin blog posts:", err);
    return { success: false, data: { items: [], total: 0, page, limit, totalPages: 0 }, message: err.message };
  }
}

/**
 * Create a new blog post.
 */
export async function adminCreateBlogPost(data: any): Promise<{ success: boolean; message?: string; id?: number }> {
  try {
    const res = await fetch(buildApiUrl("/api/admin/blog-posts"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAdminHeaders()
      },
      body: JSON.stringify(data)
    });
    return res.json();
  } catch (err: any) {
    console.error("Error creating blog post:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Update an existing blog post.
 */
export async function adminUpdateBlogPost(id: number, data: any): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/blog-posts/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAdminHeaders()
      },
      body: JSON.stringify(data)
    });
    return res.json();
  } catch (err: any) {
    console.error("Error updating blog post:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Delete a blog post.
 */
export async function adminDeleteBlogPost(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/blog-posts/${id}`), {
      method: "DELETE",
      headers: getAdminHeaders()
    });
    return res.json();
  } catch (err: any) {
    console.error("Error deleting blog post:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Upload an image for the rich text editor/thumbnail.
 */
export async function adminUploadBlogImage(file: File): Promise<{ success: boolean; message?: string; url: string }> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(buildApiUrl("/api/admin/blog-posts/upload"), {
      method: "POST",
      headers: getAdminHeaders(),
      body: formData
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error("Error uploading blog image:", err);
    throw err;
  }
}

/**
 * Trigger Sapo web crawling.
 */
export async function adminCrawlBlogPosts(): Promise<{ success: boolean; message?: string; scrapedCount?: number; log?: string[] }> {
  try {
    const res = await fetch(buildApiUrl("/api/admin/blog-posts/crawl"), {
      method: "GET",
      headers: getAdminHeaders()
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error("Error triggering blog posts crawl:", err);
    return { success: false, message: err.message };
  }
}

