'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ===========================================
// Empty 组件
// 空状态组件
// ===========================================

interface EmptyProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function Empty({
  icon,
  title = '暂无数据',
  description,
  action,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      {icon || (
        <svg
          className="h-16 w-16 text-text-secondary mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )}
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}

