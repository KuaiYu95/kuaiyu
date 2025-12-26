// ===========================================
// 认证状态管理
// ===========================================

import { create } from 'zustand';
import { STORAGE_KEYS } from '@/lib/constants';
import type { User } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
}

// 从 localStorage 恢复状态
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, refreshToken: null, isAuthenticated: false };
  }
  
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  const user = userStr ? JSON.parse(userStr) : null;
  
  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  
  setAuth: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },
  
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
  
  updateUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user });
  },
}));

