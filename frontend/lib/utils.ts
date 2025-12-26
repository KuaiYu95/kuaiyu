// ===========================================
// 工具函数
// 提供常用的工具方法
// ===========================================

import { clsx, type ClassValue } from 'clsx';

// ===========================================
// 样式工具
// ===========================================

/**
 * 合并 class 名称
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ===========================================
// 日期工具
// ===========================================

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, locale: string = 'zh'): string {
  const d = new Date(date);
  
  if (locale === 'zh') {
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string | Date, locale: string = 'zh'): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (locale === 'zh') {
    if (days > 30) return formatDate(date, locale);
    if (days > 0) return `${days} 天前`;
    if (hours > 0) return `${hours} 小时前`;
    if (minutes > 0) return `${minutes} 分钟前`;
    return '刚刚';
  }
  
  if (days > 30) return formatDate(date, locale);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

// ===========================================
// 字符串工具
// ===========================================

/**
 * 截断字符串
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * 生成随机 ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// ===========================================
// 存储工具
// ===========================================

/**
 * 获取本地存储
 */
export function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 设置本地存储
 */
export function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 忽略错误
  }
}

/**
 * 移除本地存储
 */
export function removeStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch {
    // 忽略错误
  }
}

// ===========================================
// URL 工具
// ===========================================

/**
 * 构建查询字符串
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * 解析查询字符串
 */
export function parseQueryString(query: string): Record<string, string> {
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

// ===========================================
// 验证工具
// ===========================================

/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ===========================================
// 设备检测
// ===========================================

/**
 * 是否为移动设备
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * 是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ===========================================
// 滚动工具
// ===========================================

/**
 * 滚动到顶部
 */
export function scrollToTop(smooth: boolean = true): void {
  if (typeof window === 'undefined') return;
  
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * 滚动到元素
 */
export function scrollToElement(element: HTMLElement, offset: number = 0): void {
  if (typeof window === 'undefined') return;
  
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  
  window.scrollTo({
    top,
    behavior: 'smooth',
  });
}

