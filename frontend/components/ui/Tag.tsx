'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ===========================================
// Tag 组件
// 标签样式组件
// ===========================================

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  href?: string;
  color?: string;
  size?: 'sm' | 'md';
}

const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ className, href, color, size = 'sm', children, ...props }, ref) => {
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    const baseStyles = cn(
      'inline-flex items-center rounded-full',
      'bg-bg-hover text-text-secondary',
      'transition-all duration-200',
      'hover:text-text-primary hover:bg-border-hover hover:scale-105',
      sizes[size],
      className
    );

    const style = color
      ? { backgroundColor: `${color}20`, color }
      : undefined;

    if (href) {
      return (
        <Link href={href} className={baseStyles} style={style}>
          {children}
        </Link>
      );
    }

    return (
      <span ref={ref} className={baseStyles} style={style} {...props}>
        {children}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

export default Tag;

