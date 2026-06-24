import { buildApiUrl, handleAuthStatus } from '../config/api';

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: string; // e.g., 'order_created', 'shopee_request', 'review_created'
  reference_type: string | null;
  reference_id: string | null;
  is_read: number;
  created_at: string;
}

async function fetchWithAuth(url: string, method = 'GET', body?: any) {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 401 || response.status === 403) {
    handleAuthStatus(response.status);
    throw new Error('Unauthorized');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Lỗi bất ngờ xảy ra');
  }

  return data;
}

export const adminNotificationsApi = {
  async getNotifications(limit: number = 50): Promise<AdminNotification[]> {
    const url = buildApiUrl(`/api/admin/notifications?limit=${limit}`);
    const res = await fetchWithAuth(url);
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const url = buildApiUrl('/api/admin/notifications/unread-count');
    const res = await fetchWithAuth(url);
    return res.count;
  },

  async markAsRead(id?: number): Promise<void> {
    const url = buildApiUrl('/api/admin/notifications/mark-read');
    await fetchWithAuth(url, 'POST', id !== undefined ? { id } : {});
  },

  async delete(id: number): Promise<void> {
    const url = buildApiUrl('/api/admin/notifications/delete');
    await fetchWithAuth(url, 'POST', { id });
  }
};
