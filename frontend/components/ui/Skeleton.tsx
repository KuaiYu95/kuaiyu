'use client';

import { cn } from '@/lib/utils';

// ===========================================
// Skeleton 组件
// 骨架屏加载组件
// ===========================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export default function Skeleton({
  className,
  width,
  height,
  rounded = 'md',
}: SkeletonProps) {
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'skeleton',
        roundedStyles[rounded],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// 预设骨架屏组件
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-bg-secondary rounded-lg border border-border p-4 space-y-4">
      <Skeleton height={200} className="w-full" rounded="lg" />
      <Skeleton height={24} width="80%" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton height={24} width={60} rounded="full" />
        <Skeleton height={24} width={60} rounded="full" />
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} rounded="full" />;
}

