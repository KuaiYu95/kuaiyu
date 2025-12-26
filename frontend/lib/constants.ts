// ===========================================
// 全局常量
// 统一管理前端项目中使用的所有常量
// ===========================================

// API 配置
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kcat.site';

// 网站信息
export const SITE_NAME = '快鱼博客';
export const SITE_DESCRIPTION = '一个关于技术与生活的个人博客';
export const SITE_AUTHOR = '快鱼';

// 分页配置
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// 内容配置
export const EXCERPT_MAX_LENGTH = 200;
export const LIFE_PREVIEW_LENGTH = 300;
export const DEFAULT_REPLY_LIMIT = 3;

// 图片配置
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 动画配置
export const ANIMATION_DURATION = 0.3;
export const STAGGER_DELAY = 0.1;

// 路由路径
export const ROUTES = {
  HOME: '/',
  BLOG: '/blog',
  BLOG_DETAIL: (slug: string) => `/blog/${slug}`,
  LIFE: '/life',
  LIFE_DETAIL: (id: number | string) => `/life/${id}`,
  ARCHIVE: '/archive',
  CATEGORIES: '/categories',
  CATEGORIES_TAG: (slug: string) => `/categories/${slug}`,
  GUESTBOOK: '/guestbook',
} as const;

// 导航菜单
export const NAV_ITEMS = [
  { key: 'blog', href: ROUTES.BLOG },
  { key: 'life', href: ROUTES.LIFE },
  { key: 'archive', href: ROUTES.ARCHIVE },
  { key: 'category', href: ROUTES.CATEGORIES },
  { key: 'guestbook', href: ROUTES.GUESTBOOK },
] as const;

// 语言配置
export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh';

// 本地存储键
export const STORAGE_KEYS = {
  COMMENT_USER: 'kuaiyu_comment_user',
  THEME: 'kuaiyu_theme',
  LOCALE: 'kuaiyu_locale',
} as const;

// 评论状态
export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SPAM: 'spam',
} as const;

// 文章状态
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

// 断点配置
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

