// ===========================================
// API 请求封装
// ===========================================

import { useAuthStore } from '@/store/auth';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';

// ===========================================
// Axios 实例
// ===========================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 尝试使用 refresh token 刷新 access token
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/api/admin/refresh`, {
            refresh_token: refreshToken,
          });

          const newAccessToken = refreshResponse.data.data.access_token;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

          // 更新 store 中的 accessToken
          useAuthStore.getState().updateAccessToken(newAccessToken);

          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // 刷新失败，清除认证信息并跳转登录
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // 没有 refresh token，直接跳转登录
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===========================================
// 类型定义
// ===========================================

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PagedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  last_login: string | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  status: string;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface LifeRecord {
  id: number;
  content: string;
  cover_image: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug?: string; // 已废弃，不再使用
  description?: string; // 已废弃，不再使用
  color: string;
  post_count?: number;
}

export interface Comment {
  id: number;
  comment_type?: 'post' | 'life' | 'guestbook';
  target_id?: number | null;
  post_id: number | null; // 向后兼容
  life_record_id: number | null; // 向后兼容
  parent_id: number | null;
  nickname: string;
  email: string;
  avatar: string;
  website: string;
  content: string;
  is_admin: boolean;
  is_pinned: boolean;
  status: string;
  ip_address: string;
  created_at: string;
  post_title?: string;
  life_title?: string;
}

export interface Overview {
  total_pv: number;
  today_pv: number;
  avg_pv_30_days: number; // 过去30天平均PV
  total_uv: number;
  today_uv: number;
  avg_uv_30_days: number; // 过去30天平均UV
  post_count: number;
  life_count: number;
  comment_count: number;
  tag_count: number;
}

// ===========================================
// API 方法
// ===========================================

// 认证
export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post<any, ApiResponse<{ access_token: string; refresh_token: string; user: User }>>('/api/admin/login', data),
  logout: () => api.post('/api/admin/logout'),
  me: () => api.get<any, ApiResponse<User>>('/api/admin/me'),
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/api/admin/change-password', data),
};

// 文章
export const postApi = {
  list: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<any, ApiResponse<PagedData<Post>>>('/api/admin/posts', { params }),
  get: (id: number) => api.get<any, ApiResponse<Post>>(`/api/admin/posts/${id}`),
  create: (data: Partial<Post> & { tag_ids?: number[] }) =>
    api.post<any, ApiResponse<Post>>('/api/admin/posts', data),
  update: (id: number, data: Partial<Post> & { tag_ids?: number[] }) =>
    api.put<any, ApiResponse<Post>>(`/api/admin/posts/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/posts/${id}`),
};

// 生活记录
export const lifeApi = {
  list: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<any, ApiResponse<PagedData<LifeRecord>>>('/api/admin/life', { params }),
  get: (id: number) => api.get<any, ApiResponse<LifeRecord>>(`/api/admin/life/${id}`),
  create: (data: Partial<LifeRecord>) =>
    api.post<any, ApiResponse<LifeRecord>>('/api/admin/life', data),
  update: (id: number, data: Partial<LifeRecord>) =>
    api.put<any, ApiResponse<LifeRecord>>(`/api/admin/life/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/life/${id}`),
};

// 标签
export const tagApi = {
  list: () => api.get<any, ApiResponse<Tag[]>>('/api/admin/tags'),
  create: (data: Partial<Tag>) => api.post<any, ApiResponse<Tag>>('/api/admin/tags', data),
  update: (id: number, data: Partial<Tag>) =>
    api.put<any, ApiResponse<Tag>>(`/api/admin/tags/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/tags/${id}`),
};

// 评论
export const commentApi = {
  list: (params?: { page?: number; limit?: number; status?: string; is_pinned?: boolean }) =>
    api.get<any, ApiResponse<PagedData<Comment>>>('/api/admin/comments', { params }),
  updateStatus: (id: number, status: string) =>
    api.put(`/api/admin/comments/${id}`, { status }),
  togglePin: (id: number) =>
    api.post(`/api/admin/comments/${id}/toggle-pin`),
  delete: (id: number) => api.delete(`/api/admin/comments/${id}`),
  reply: (id: number, content: string) =>
    api.post(`/api/admin/comments/${id}/reply`, { content }),
};

// 上传
export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<any, ApiResponse<{ url: string; filename: string; size: number }>>(
      '/api/admin/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};

// 热门内容类型
export interface PopularContentVO {
  id: number;
  title: string;
  content?: string; // 生活记录的内容
  view_count: number;
  published_at: string | null;
}

// 博客阅读量统计
export interface PostViewStatsVO {
  post_id: number;
  title: string;
  view_count: number;
}

// 统计
export const analyticsApi = {
  overview: () => api.get<any, ApiResponse<Overview>>('/api/admin/analytics/overview'),
  visits: () => api.get<any, ApiResponse<{ date: string; pv: number; uv: number }[]>>('/api/admin/analytics/visits'),
  popular: () => api.get<any, ApiResponse<{ posts: PopularContentVO[]; lifes: PopularContentVO[] }>>('/api/admin/analytics/popular'),
  postViewStats: () => api.get<any, ApiResponse<PostViewStatsVO[]>>('/api/admin/analytics/post-view-stats'),
  charts: (chartType: string) =>
    api.get<any, ApiResponse<any>>('/api/admin/analytics/charts', { params: { chart_type: chartType } }),
};

// ===========================================
// 账单相关类型
// ===========================================

export interface Bill {
  id: number;
  type: 'expense' | 'income';
  category_id: number;
  amount: number;
  desc: string;
  date: string;
  period_type: 'month' | 'year';
  is_consumed: boolean;
  has_charge_back: boolean;
  charge_back_amount: number;
  refund: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  key: string;
  created_at: string;
  bill_count?: number;
}

export interface BillStatistics {
  total_expense: number;
  total_income: number;
  month_expense: number;
  month_income: number;
  year_expense: number;
  year_income: number;
  expense_by_category: Record<string, number>;
  income_by_category: Record<string, number>;
}

export interface BillTrendData {
  date: string;
  expense: number;
  income: number;
}

export interface BillListParams {
  page?: number;
  limit?: number;
  type?: 'expense' | 'income';
  category_id?: number;
  start_date?: string;
  end_date?: string;
  period_type?: 'month' | 'year';
  is_consumed?: boolean;
  has_charge_back?: boolean;
}

export interface CreateBillRequest {
  type: 'expense' | 'income';
  category_id: number;
  amount: number;
  desc?: string;
  date: string;
  period_type?: 'month' | 'year';
  is_consumed?: boolean;
  has_charge_back?: boolean;
  charge_back_amount?: number;
}

export interface UpdateBillRequest {
  type?: 'expense' | 'income';
  category_id?: number;
  amount?: number;
  desc?: string;
  date?: string;
  period_type?: 'month' | 'year';
  is_consumed?: boolean;
  has_charge_back?: boolean;
  charge_back_amount?: number;
}

export interface CreateCategoryRequest {
  name: string;
  key: string;
}

export interface StatisticsParams {
  start_date?: string;
  end_date?: string;
  type?: 'expense' | 'income';
}

// ===========================================
// 账单 API
// ===========================================

export interface BillTrendData {
  date: string;
  expense: number;
  income: number;
}

export interface CategoryRankingItem {
  category_name: string;
  total: number;
}

export const billApi = {
  list: (params?: BillListParams) =>
    api.get<any, ApiResponse<PagedData<Bill>>>('/api/admin/bills', { params }),
  get: (id: number) => api.get<any, ApiResponse<Bill>>(`/api/admin/bills/${id}`),
  create: (data: CreateBillRequest) =>
    api.post<any, ApiResponse<Bill>>('/api/admin/bills', data),
  update: (id: number, data: UpdateBillRequest) =>
    api.put<any, ApiResponse<Bill>>(`/api/admin/bills/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/bills/${id}`),
  refund: (id: number, amount: number) =>
    api.post<any, ApiResponse<Bill>>(`/api/admin/bills/${id}/refund`, { amount }),
  chargeBack: (id: number, amount: number) =>
    api.post<any, ApiResponse<Bill>>(`/api/admin/bills/${id}/charge-back`, { amount }),
  statistics: (params?: StatisticsParams) =>
    api.get<any, ApiResponse<BillStatistics>>('/api/admin/bills/statistics', { params }),
  dailyTrend: () => api.get<any, ApiResponse<BillTrendData[]>>('/api/admin/bills/trends/daily'),
  monthlyTrend: () => api.get<any, ApiResponse<BillTrendData[]>>('/api/admin/bills/trends/monthly'),
  categoryRanking: () => api.get<any, ApiResponse<CategoryRankingItem[]>>('/api/admin/bills/trends/category-ranking'),
};

// ===========================================
// 分类 API
// ===========================================

export const categoryApi = {
  list: () => api.get<any, ApiResponse<Category[]>>('/api/admin/categories'),
  create: (data: CreateCategoryRequest) =>
    api.post<any, ApiResponse<Category>>('/api/admin/categories', data),
  delete: (id: number) => api.delete(`/api/admin/categories/${id}`),
};

export default api;

