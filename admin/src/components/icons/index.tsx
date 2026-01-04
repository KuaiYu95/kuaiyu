// ===========================================
// Lottie 图标组件
// 将 MUI 图标替换为 Lottie 动画图标
// ===========================================

import Lottie from '@/components/Lottie';
import { Box, SxProps, Theme } from '@mui/material';
import { useState } from 'react';

// 导入图标数据
import cameraAnimation from '../../assets/icons/system-regular-123-camera-hover-camera-1.json';
import articleAnimation from '../../assets/icons/system-regular-14-article-hover-article.json';
import labelAnimation from '../../assets/icons/system-regular-146-label-hover-label.json';
import calendarAnimation from '../../assets/icons/system-regular-23-calendar-hover-calendar.json';
import crossAnimation from '../../assets/icons/system-regular-29-cross-hover-cross-1.json';
import chatAnimation from '../../assets/icons/system-regular-47-chat-hover-chat.json';
import arrowLeftAnimation from '../../assets/icons/system-regular-507-arrow-left-hover-pinch.json';
import clockAnimation from '../../assets/icons/system-regular-67-clock-hover-clock.json';
import visibilityAnimation from '../../assets/icons/system-regular-92-visability-hover-pinch.json';
import replyAnimation from '../../assets/icons/system-regular-97-reply-hover-reply.json';

interface IconProps {
  size?: number;
  sx?: SxProps<Theme>;
  hover?: boolean;
  color?: string;
}

// 日历图标
export function CalendarIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={calendarAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

// 可见性/眼睛图标
export function VisibilityIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={visibilityAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

// 回复图标
export function ReplyIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={replyAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

// 关闭/删除图标
export function CloseIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={crossAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

// 左箭头/返回图标
export function ArrowBackIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={arrowLeftAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

// 文章图标
export function ArticleIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={articleAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

// 标签图标
export function LabelIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={labelAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

// 相机图标
export function PhotoCameraIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={cameraAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

// 聊天图标
export function ChatIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={chatAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

// 时钟图标
export function ClockIcon({ size = 24, sx, hover = false, color }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={sx}
    >
      <Lottie
        animationData={clockAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        sx={{ color }}
      />
    </Box>
  );
}

