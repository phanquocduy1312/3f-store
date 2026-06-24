import { buildApiUrl } from '../config/api';

export interface kpiDetail {
  value: number;
  growth?: number;
  label: string;
}

export interface OverviewStatsData {
  kpis: {
    revenue: kpiDetail;
    orders: kpiDetail;
    aov: kpiDetail;
    cancelRate: kpiDetail;
    returnRate: kpiDetail;
  };
  funnel: Array<{ name: string; count: number }>;
  shippingMix: Array<{ name: string; value: number; revenue: number }>;
  paymentMix: Array<{ name: string; value: number; revenue: number }>;
  sourceMix: Array<{ name: string; value: number; revenue: number }>;
  timeline: Array<{ name: string; 'Doanh thu': number; 'Đơn hàng': number }>;
}

export interface ProductStatsData {
  categories: Array<{ id: number; category_name: string; revenue: number; quantity: number }>;
  topProducts: Array<{ product_id: number; name: string; image: string; sold: number; revenue: number }>;
  lowStock: Array<{ id: number; name: string; stock: number; out_of_stock: number }>;
}

export interface CustomerStatsData {
  tiers: Array<{ tier_name: string; tier_color: string; count: number }>;
  species: Array<{ name: string; value: number }>;
  petNeeds: Array<{ name: string; value: number }>;
  loyaltyTimeline: Array<{ date: string; earned: number; redeemed: number }>;
}

export interface MarketingStatsData {
  banners: Array<{ id: number; placement: string; title: string | null; image_url: string; views: number; clicks: number; ctr: number }>;
  vouchers: Array<{ code: string; name: string; discount_type: string; discount_value: number; usage_limit: number | null; used_count: number; is_active: number }>;
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

export const adminAnalyticsApi = {
  async getOverview(filter: string = '30_days'): Promise<OverviewStatsData> {
    const url = buildApiUrl(`/api/admin/analytics/overview?filter=${filter}`);
    return fetchWithAuth(url);
  },

  async getProducts(filter: string = '30_days'): Promise<ProductStatsData> {
    const url = buildApiUrl(`/api/admin/analytics/products?filter=${filter}`);
    return fetchWithAuth(url);
  },

  async getCustomers(): Promise<CustomerStatsData> {
    const url = buildApiUrl('/api/admin/analytics/customers');
    return fetchWithAuth(url);
  },

  async getMarketing(): Promise<MarketingStatsData> {
    const url = buildApiUrl('/api/admin/analytics/marketing');
    return fetchWithAuth(url);
  }
};
