'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ===========================================
// Card 组件
// 统一的卡片样式组件
// ===========================================

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, padding = 'md', children, ...props }, ref) => {
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-secondary rounded-lg border border-border',
          'transition-all duration-300',
          hoverable && 'hover:-translate-y-1 hover:border-border-hover hover:shadow-lg hover:shadow-black/20',
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

