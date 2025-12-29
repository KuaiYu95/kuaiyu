'use client';

import SafeImage from '@/components/ui/SafeImage';
import { cn } from '@/lib/utils';

// ===========================================
// Avatar 组件
// 头像组件
// ===========================================

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  className,
}: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-20 w-20 text-xl',
  };

  const imageSizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 80,
  };

  // 获取名字首字母
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // 根据名字生成背景色
  const getBackgroundColor = (name?: string) => {
    if (!name) return '#60a5fa';
    const colors = [
      '#60a5fa', // blue
      '#34d399', // green
      '#a78bfa', // purple
      '#f472b6', // pink
      '#fbbf24', // yellow
      '#fb923c', // orange
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (src) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-bg-hover',
          sizes[size],
          className
        )}
      >
        <SafeImage
          src={src}
          alt={alt}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-medium text-white',
        sizes[size],
        className
      )}
      style={{ backgroundColor: getBackgroundColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}

