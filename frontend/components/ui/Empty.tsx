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
  text?: string;
  className?: string;
}

export default function Empty({
  icon,
  text = '暂无数据',
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1 text-gray-400',
        className
      )}
    >
      {icon || (
        <Lottie
          animationData={mailAnimation}
          width={16}
          height={16}
          autoplay={true}
          loop={true}
        />
      )}
      <span className="text-xs" style={{ fontSize: '12px' }}>
        {text}
      </span>
    </div>
  );
}

