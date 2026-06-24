const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/3f-api/public";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

/**
 * Builds absolute API url.
 */
export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Builds absolute image url.
 */
export function buildImageUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Handles HTTP authentication status codes (such as 401 Unauthorized).
 */
export function handleAuthStatus(status: number) {
  if (status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_permissions");
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  }
}

