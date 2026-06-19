import { buildApiUrl } from '../config/api';

export interface DashboardKpiCardData {
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface DashboardStatsResponse {
  revenue: DashboardKpiCardData;
  orders: DashboardKpiCardData;
  pending: DashboardKpiCardData;
  shipping: DashboardKpiCardData;
  newCustomers: DashboardKpiCardData;
  points: DashboardKpiCardData;
}

export interface RevenueChartItem {
  name: string;
  'Doanh thu': number;
  'Đơn hàng': number;
}

export interface TaskQueueData {
  shopeePending: number;
  shopeeOverdue: number;
  ordersPending: number;
  productsLowStock: number;
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
    throw new Error('Unauthorized');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Lỗi bất ngờ xảy ra');
  }

  return data.data;
}

export const adminDashboardApi = {
  async getStats(): Promise<DashboardStatsResponse> {
    const url = buildApiUrl('/api/admin/dashboard/stats');
    return fetchWithAuth(url);
  },

  async getRevenueChart(days: number = 7): Promise<RevenueChartItem[]> {
    const url = buildApiUrl(`/api/admin/dashboard/revenue-chart?days=${days}`);
    return fetchWithAuth(url);
  },

  async getTaskQueue(): Promise<TaskQueueData> {
    const url = buildApiUrl('/api/admin/dashboard/task-queue');
    return fetchWithAuth(url);
  }
};
