// ===========================================
// 阅读量计数器组件
// 用于在文章页面加载时增加阅读量
// ===========================================

'use client';

import { useEffect } from 'react';
import { postApi } from '@/lib/api';

interface ViewCounterProps {
  postId: number;
}

export default function ViewCounter({ postId }: ViewCounterProps) {
  useEffect(() => {
    // 使用 sessionStorage 防止同一会话重复计数
    const viewedKey = `viewed_post_${postId}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasViewed) {
      postApi.incrementViews(postId).then(() => {
        sessionStorage.setItem(viewedKey, 'true');
      }).catch(() => {
        // 静默失败
      });
    }
  }, [postId]);

  return null;
}

