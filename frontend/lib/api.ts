// ===========================================
// API 请求封装
// 统一管理所有 API 调用
// ===========================================

import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL } from './constants';

// ===========================================
// Axios 实例
// ===========================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    console.error('API Error:', error);
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
  timestamp: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedData<T> {
  items: T[];
  pagination: Pagination;
}

// 文章类型
export interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt: string;
  cover_image: string;
  status: string;
  view_count: number;
  published_at: string | null;
  created_at: string;
  tags?: Tag[];
}

// 标签类型
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  post_count?: number;
}

// 生活记录类型
export interface LifeRecord {
  id: number;
  title: string;
  content: string;
  cover_image: string;
  status: string;
  published_at: string | null;
  created_at: string;
  has_more?: boolean;
}

// 评论类型
export interface Comment {
  id: number;
  post_id?: number;
  life_record_id?: number;
  parent_id?: number;
  nickname: string;
  avatar: string;
  website: string;
  content: string;
  is_admin: boolean;
  status: string;
  created_at: string;
  replies?: Comment[];
  reply_count?: number;
  has_more?: boolean;
}

// 配置类型
export interface SiteConfig {
  site_logo: string;
  site_name: string;
  site_icp: string;
  home_avatar: string;
  home_nickname: string;
  home_about: string;
  footer_left_image: string;
  footer_left_name: string;
  footer_left_description: string;
  footer_right_links: {
    categories: {
      name: string;
      links: { name: string; url: string }[];
    }[];
  };
}

// 归档类型
export interface ArchiveYear {
  year: number;
  posts: Post[];
}

// ===========================================
// API 方法
// ===========================================

// 文章相关
export const postApi = {
  // 获取文章列表
  list: (params?: { page?: number; limit?: number; tag?: string; search?: string }) =>
    api.get<any, ApiResponse<PagedData<Post>>>('/api/posts', { params }),

  // 获取文章详情
  getBySlug: (slug: string) =>
    api.get<any, ApiResponse<Post>>(`/api/posts/${slug}`),

  // 增加阅读量
  incrementViews: (id: number) =>
    api.post<any, ApiResponse<null>>(`/api/posts/${id}/views`),

  // 获取推荐文章
  featured: () =>
    api.get<any, ApiResponse<Post[]>>('/api/posts/featured'),

  // 获取最近文章
  recent: () =>
    api.get<any, ApiResponse<Post[]>>('/api/posts/recent'),
};

// 生活记录相关
export const lifeApi = {
  // 获取列表
  list: (params?: { page?: number; limit?: number }) =>
    api.get<any, ApiResponse<PagedData<LifeRecord>>>('/api/life', { params }),

  // 获取详情
  get: (id: number) =>
    api.get<any, ApiResponse<LifeRecord>>(`/api/life/${id}`),
};

// 标签相关
export const tagApi = {
  // 获取所有标签
  list: () =>
    api.get<any, ApiResponse<Tag[]>>('/api/tags'),

  // 获取标签详情及文章
  getBySlug: (slug: string, params?: { page?: number; limit?: number }) =>
    api.get<any, ApiResponse<{ tag: Tag; posts: Post[]; pagination: Pagination }>>(`/api/tags/${slug}`, { params }),
};

// 归档相关
export const archiveApi = {
  // 获取归档
  list: () =>
    api.get<any, ApiResponse<ArchiveYear[]>>('/api/archives'),
};

// 评论相关
export const commentApi = {
  // 获取评论列表
  list: (params?: { post_id?: number; life_record_id?: number }) =>
    api.get<any, ApiResponse<Comment[]>>('/api/comments', { params }),

  // 创建评论
  create: (data: {
    post_id?: number;
    life_record_id?: number;
    is_guestbook?: boolean;
    parent_id?: number;
    nickname: string;
    email: string;
    avatar?: string;
    website?: string;
    content: string;
  }) =>
    api.post<any, ApiResponse<{ id: number; status: string; message: string }>>('/api/comments', data),
};

// 配置相关
export const configApi = {
  // 获取配置
  get: () =>
    api.get<any, ApiResponse<SiteConfig>>('/api/config'),
};

// 埋点相关
export const analyticsApi = {
  // 记录页面访问
  pageView: (data: { page_type: string; page_id?: number; referer?: string }) =>
    api.post('/api/analytics/pageview', data).catch(() => {}), // 静默失败

  // 记录事件
  track: (data: { event_type: string; event_name: string; page_type?: string; page_id?: number; properties?: Record<string, any> }) =>
    api.post('/api/analytics/track', data).catch(() => {}), // 静默失败
};

// ===========================================
// 公共 API 导出（用于服务端组件）
// ===========================================

export const publicApi = {
  posts: {
    list: postApi.list,
    get: postApi.getBySlug,
    incrementViews: postApi.incrementViews,
  },
  life: {
    list: lifeApi.list,
    get: lifeApi.get,
  },
  tags: {
    list: tagApi.list,
  },
  comments: {
    list: (params?: { post_id?: number; life_record_id?: number; is_guestbook?: boolean; email?: string }) =>
      api.get<any, ApiResponse<Comment[]>>('/api/comments', { params }),
    create: commentApi.create,
  },
  config: configApi,
};

export default api;

