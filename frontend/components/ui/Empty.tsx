'use client';

import mailAnimation from '@/assets/icons/system-regular-190-mail-envelope-open-hover-mail-open.json';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import Lottie from './Lottie';

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
        'flex flex-col items-center justify-center py-12 text-center text-gray-400',
        className
      )}
    >
      {icon || (
        <div className="mb-2">
          <Lottie
            animationData={mailAnimation}
            width={32}
            height={32}
            autoplay={true}
          />
        </div>
      )}
      <h3 className="text-base font-medium mb-2">{title}</h3>
      {description && (
        <p className="text-sm max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}

