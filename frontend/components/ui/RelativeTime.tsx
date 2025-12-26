'use client';

import { formatRelativeTime } from '@/lib/utils';
import { useEffect, useState } from 'react';

// ===========================================
// RelativeTime 组件
// 显示相对时间的组件，会自动更新
// ===========================================

interface RelativeTimeProps {
  date: string | Date;
  locale?: string;
  className?: string;
}

export default function RelativeTime({
  date,
  locale = 'zh',
  className = '',
}: RelativeTimeProps) {
  const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(date, locale));

  useEffect(() => {
    const updateTime = () => {
      setRelativeTime(formatRelativeTime(date, locale));
    };

    // 立即更新一次
    updateTime();

    // 计算时间差，根据时间差决定更新频率
    const now = new Date();
    const targetDate = new Date(date);
    const diff = now.getTime() - targetDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    // 如果超过30天，不需要频繁更新（每小时更新一次）
    // 如果超过7天，每10分钟更新一次
    // 如果超过1天，每5分钟更新一次
    // 否则每分钟更新一次
    let interval: number;
    if (days > 30) {
      interval = 60 * 60 * 1000; // 1小时
    } else if (days > 7) {
      interval = 10 * 60 * 1000; // 10分钟
    } else if (days > 1) {
      interval = 5 * 60 * 1000; // 5分钟
    } else {
      interval = 60 * 1000; // 1分钟
    }

    const timer = setInterval(updateTime, interval);

    return () => clearInterval(timer);
  }, [date, locale]);

  return <span className={className}>{relativeTime}</span>;
}

