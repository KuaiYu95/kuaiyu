'use client';

import { cn } from '@/lib/utils';
import Lottie from 'lottie-react';
import { CSSProperties, useEffect, useRef } from 'react';

// ===========================================
// Lottie 动画组件
// 封装 lottie-react，方便在项目中使用
// ===========================================

interface LottieProps {
  /**
   * Lottie 动画数据（JSON 对象）
   */
  animationData: unknown;
  /**
   * 宽度（默认：auto）
   */
  width?: number | string;
  /**
   * 高度（默认：auto）
   */
  height?: number | string;
  /**
   * 是否循环播放（默认：true）
   */
  loop?: boolean | number;
  /**
   * 是否自动播放（默认：true）
   */
  autoplay?: boolean;
  /**
   * 播放速度（默认：0.5，1 为正常速度，小于 1 为慢速，大于 1 为快速）
   */
  speed?: number;
  /**
   * 自定义样式
   */
  style?: CSSProperties;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 动画播放完成回调
   */
  onComplete?: () => void;
  /**
   * 动画循环完成回调
   */
  onLoopComplete?: () => void;
}

export default function LottieAnimation({
  animationData,
  width = 'auto',
  height = 'auto',
  loop = false,
  autoplay = true,
  speed = 0.5,
  style,
  className,
  onComplete,
  onLoopComplete,
}: LottieProps) {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  return (
    <div
      className={cn('inline-block', className)}
      style={{ width, height, ...style }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
        onComplete={onComplete}
        onLoopComplete={onLoopComplete}
      />
    </div>
  );
}
