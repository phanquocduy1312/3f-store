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
  }
};
