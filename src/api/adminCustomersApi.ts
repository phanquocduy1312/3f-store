import { buildApiUrl } from '../config/api';

export interface AdminCustomerListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: 'active' | 'blocked' | 'all';
  phoneVerified?: 'yes' | 'no' | 'all';
  hasOrders?: 'yes' | 'no' | 'all';
  tier?: 'Silver' | 'Gold' | 'Platinum' | 'all';
}

export const adminCustomersApi = {
  async getList(params: AdminCustomerListParams) {
    const url = buildApiUrl('/api/admin/customers');
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${url}?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getDetail(id: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateStatus(id: number, status: 'active' | 'blocked', reason: string) {
    const url = buildApiUrl(`/api/admin/customers/${id}/status`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, reason })
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async getOrders(id: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/orders`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getPoints(id: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/points`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getAddresses(id: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/addresses`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getVouchers(id: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/vouchers`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getPets(id: number) {
    try {
      const url = buildApiUrl(`/api/admin/customers/${id}/pets`);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
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
      const url = buildApiUrl(`/api/admin/customers/${id}/sessions`);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      return [];
    }
  },

  // ==========================================
  // PHASE 1.2: CSKH ACTIONS & TOOLS
  // ==========================================

  exportCsvUrl(params: AdminCustomerListParams): string {
    const url = buildApiUrl('/api/admin/customers/export-csv');
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    // For direct link download, we pass token in query since browsers don't send auth headers on simple links
    // Actually, passing token in URL is a security risk. A better way is fetching Blob and creating ObjectURL.
    return `${url}?${searchParams.toString()}`;
  },

  async exportCsvBlob(params: AdminCustomerListParams): Promise<Blob> {
    const url = buildApiUrl('/api/admin/customers/export-csv');
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${url}?${searchParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },

  async getNotes(id: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/notes`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createNote(id: number, note: string) {
    const url = buildApiUrl(`/api/admin/customers/${id}/notes`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async deleteNote(id: number, noteId: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/notes/${noteId}`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async getTags(id: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/tags`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async assignTag(id: number, tagData: { tag_id?: number, new_tag_name?: string, new_tag_color?: string }) {
    const url = buildApiUrl(`/api/admin/customers/${id}/tags`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(tagData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async removeTag(id: number, tagId: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/tags/${tagId}`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async adjustPoints(id: number, points: number, reason: string) {
    const url = buildApiUrl(`/api/admin/customers/${id}/adjust-points`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ points, reason })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async revokeAllSessions(id: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/revoke-sessions`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async getTimeline(id: number) {
    const url = buildApiUrl(`/api/admin/customers/${id}/timeline`);
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};
