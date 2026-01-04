// ===========================================
// Lordicon 动画组件
// 封装 @lordicon/react，方便在项目中使用
// ===========================================

import { Player } from '@lordicon/react';
import { Box, SxProps, Theme } from '@mui/material';
import { CSSProperties, useEffect, useRef } from 'react';

interface LottieProps {
  /**
   * Lordicon 动画数据（JSON 对象）
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
   * 是否循环播放（默认：false）
   */
  loop?: boolean | number;
  /**
   * 是否自动播放（默认：true）
   */
  autoplay?: boolean;
  /**
   * 播放速度（默认：1，1 为正常速度，小于 1 为慢速，大于 1 为快速）
   */
  speed?: number;
  /**
   * 自定义样式
   */
  style?: CSSProperties;
  /**
   * MUI sx 样式
   */
  sx?: SxProps<Theme>;
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
  speed = 1,
  style,
  sx,
  onComplete,
  onLoopComplete,
}: LottieProps) {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (playerRef.current && autoplay) {
      playerRef.current?.playFromBeginning();
    }
  }, [autoplay]);

  useEffect(() => {
    if (playerRef.current && speed !== undefined) {
      // Lordicon 的 speed 属性
      playerRef.current?.setSpeed?.(speed);
    }
  }, [speed]);

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    if (onLoopComplete) {
      onLoopComplete();
    }
    if (loop && playerRef.current) {
      playerRef.current?.playFromBeginning();
    }
  };

  const sizeValue = typeof width === 'number' ? width : typeof height === 'number' ? height : 24;

  return (
    <Box
      sx={{
        display: 'inline-block',
        width,
        height,
        ...sx,
      }}
      style={style}
    >
      <Player
        ref={playerRef}
        icon={animationData}
        size={sizeValue}
        onComplete={handleComplete}
      />
    </Box>
  );
}

