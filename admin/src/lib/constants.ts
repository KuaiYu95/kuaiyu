// ===========================================
// 后台管理常量
// ===========================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 存储键
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'kuaiyu_access_token',
  REFRESH_TOKEN: 'kuaiyu_refresh_token',
  USER: 'kuaiyu_user',
} as const;

// 路由
export const ROUTES = {
  LOGIN: '/login',
  ANALYTICS: '/',
  POSTS: '/posts',
  POST_NEW: '/posts/new',
  POST_EDIT: (id: number | string) => `/posts/${id}`,
  LIFE: '/life',
  LIFE_NEW: '/life/new',
  LIFE_EDIT: (id: number | string) => `/life/${id}`,
  COMMENTS: '/comments',
  TAGS: '/tags',
} as const;

// 侧边栏菜单
export const MENU_ITEMS = [
  { key: 'analytics', path: ROUTES.ANALYTICS, icon: 'Analytics', label: '统计分析' },
  { key: 'posts', path: ROUTES.POSTS, icon: 'Article', label: '博客管理' },
  { key: 'life', path: ROUTES.LIFE, icon: 'PhotoCamera', label: '生活记录' },
  { key: 'comments', path: ROUTES.COMMENTS, icon: 'Comment', label: '评论管理' },
  { key: 'tags', path: ROUTES.TAGS, icon: 'Label', label: '标签管理' },
] as const;

// 状态
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SPAM: 'spam',
} as const;

// 状态标签
export const STATUS_LABELS = {
  draft: { label: '草稿', color: 'warning' },
  published: { label: '已发布', color: 'success' },
  pending: { label: '待审核', color: 'warning' },
  approved: { label: '已通过', color: 'success' },
  spam: { label: '垃圾', color: 'error' },
} as const;

