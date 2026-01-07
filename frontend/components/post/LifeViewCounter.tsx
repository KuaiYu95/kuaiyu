// ===========================================
// 生活记录阅读量计数器组件
// 用于在生活记录详情页加载时增加阅读量
// ===========================================

'use client';

import { lifeApi } from '@/lib/api';
import { useEffect } from 'react';

interface LifeViewCounterProps {
  lifeId: number;
}

export default function LifeViewCounter({ lifeId }: LifeViewCounterProps) {
  useEffect(() => {
    // 使用 sessionStorage 防止同一会话重复计数
    const viewedKey = `viewed_life_${lifeId}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasViewed) {
      lifeApi.incrementViews(lifeId).then(() => {
        sessionStorage.setItem(viewedKey, 'true');
      }).catch(() => {
        // 静默失败
      });
    }
  }, [lifeId]);

  return null;
}

