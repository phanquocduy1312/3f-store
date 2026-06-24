import { buildApiUrl, handleAuthStatus } from "@/src/config/api";

export type AdminPetAdvisorParams = {
  page?: number;
  limit?: number;
  q?: string;
  species?: "all" | "cat" | "dog" | "other";
};

export async function getAdminPetAdvisorConsultations(params: AdminPetAdvisorParams = {}) {
  const url = buildApiUrl("/api/admin/pet-advisor/consultations");
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const token = localStorage.getItem("admin_token");
  const response = await fetch(`${url}?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    handleAuthStatus(response.status);
    throw new Error("Unauthorized");
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.message || "Không tải được dữ liệu AI Pet Advisor");
  return data.data;
}

export async function getAdminPetAdvisorConsultationDetail(id: number) {
  const url = buildApiUrl("/api/admin/pet-advisor/consultations/detail");
  const token = localStorage.getItem("admin_token");
  const response = await fetch(`${url}?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    handleAuthStatus(response.status);
    throw new Error("Unauthorized");
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.message || "Không tải được chi tiết tư vấn");
  return data.data;
}
