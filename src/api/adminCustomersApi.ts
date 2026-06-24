import { buildApiUrl, handleAuthStatus } from '../config/api';

export interface AdminCustomerListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: 'active' | 'blocked' | 'all';
  phoneVerified?: 'yes' | 'no' | 'all';
  hasOrders?: 'yes' | 'no' | 'all';
  tier?: 'Member' | 'Silver' | 'Gold' | 'Diamond' | 'all';
}

async function fetchWithAuth(path: string, options?: RequestInit) {
  const url = buildApiUrl(path);
  const token = localStorage.getItem('admin_token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(options?.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(options?.headers || {})
    }
  });

  if (response.status === 401 || response.status === 403) {
    handleAuthStatus(response.status);
    throw new Error('Unauthorized');
  }
  return response;
}

export const adminCustomersApi = {
  async getList(params: AdminCustomerListParams) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const response = await fetchWithAuth(`/api/admin/customers?${searchParams.toString()}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getDetail(id: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateStatus(id: number, status: 'active' | 'blocked', reason: string) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async getOrders(id: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/orders`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getPoints(id: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/points`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getAddresses(id: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/addresses`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getVouchers(id: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/vouchers`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getPets(id: number) {
    try {
      const response = await fetchWithAuth(`/api/admin/customers/${id}/pets`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error("Failed to fetch pets:", error);
      return [];
    }
  },

  async getSessions(id: number) {
    try {
      const response = await fetchWithAuth(`/api/admin/customers/${id}/sessions`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      return [];
    }
  },

  exportCsvUrl(params: AdminCustomerListParams): string {
    const url = buildApiUrl('/api/admin/customers/export-csv');
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return `${url}?${searchParams.toString()}`;
  },

  async exportCsvBlob(params: AdminCustomerListParams): Promise<Blob> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const response = await fetchWithAuth(`/api/admin/customers/export-csv?${searchParams.toString()}`);
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },

  async getNotes(id: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/notes`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createNote(id: number, note: string) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async deleteNote(id: number, noteId: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/notes/${noteId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async getTags(id: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/tags`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async assignTag(id: number, tagData: { tag_id?: number, new_tag_name?: string, new_tag_color?: string }) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/tags`, {
      method: 'POST',
      body: JSON.stringify(tagData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async removeTag(id: number, tagId: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/tags/${tagId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async adjustPoints(id: number, points: number, reason: string) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/adjust-points`, {
      method: 'POST',
      body: JSON.stringify({ points, reason })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async revokeAllSessions(id: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/revoke-sessions`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async getTimeline(id: number) {
    const response = await fetchWithAuth(`/api/admin/customers/${id}/timeline`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};
