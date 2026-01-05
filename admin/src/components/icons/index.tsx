// ===========================================
// Lottie 图标组件
// 将 MUI 图标替换为 Lottie 动画图标
// ===========================================

import Lottie from '@/components/Lottie';
import { Box, SxProps, Theme } from '@mui/material';
import { useState } from 'react';

// 导入图标数据
import cameraAnimation from '@/assets/icons/system-regular-123-camera-hover-camera-1.json';
import articleAnimation from '@/assets/icons/system-regular-14-article-hover-article.json';
import labelAnimation from '@/assets/icons/system-regular-146-label-hover-label.json';
import trendingDownAnimation from '@/assets/icons/system-regular-159-trending-down-hover-trend-down.json';
import trendingUpAnimation from '@/assets/icons/system-regular-160-trending-up-hover-trend-up.json';
import upgradeAnimation from '@/assets/icons/system-regular-163-upgrade-hover-upgrade.json';
import contactsAnimation from '@/assets/icons/system-regular-187-contacts-hover-contacts.json';
import forumAnimation from '@/assets/icons/system-regular-192-forum-hover-forum.json';
import calendarAnimation from '@/assets/icons/system-regular-23-calendar-hover-calendar.json';
import crossAnimation from '@/assets/icons/system-regular-29-cross-hover-cross-1.json';
import checkAnimation from '@/assets/icons/system-regular-31-check-hover-pinch.json';
import trashAnimation from '@/assets/icons/system-regular-39-trash-hover-trash-empty.json';
import chatAnimation from '@/assets/icons/system-regular-47-chat-hover-chat.json';
import walletAnimation from '@/assets/icons/system-regular-5-wallet-hover-wallet.json';
import fileAnimation from '@/assets/icons/system-regular-50-file-hover-file-1.json';
import arrowLeftAnimation from '@/assets/icons/system-regular-507-arrow-left-hover-pinch.json';
import clockAnimation from '@/assets/icons/system-regular-67-clock-hover-clock.json';
import visibilityAnimation from '@/assets/icons/system-regular-92-visability-hover-pinch.json';
import replyAnimation from '@/assets/icons/system-regular-97-reply-hover-reply.json';

interface IconProps {
  size?: number;
  sx?: SxProps<Theme>;
  hover?: boolean;
  color?: string;
  hoverColor?: string;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const defaultSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
}

// 日历图标
export function CalendarIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={calendarAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 检查图标
export function CheckIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={checkAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 可见性/眼睛图标
export function VisibilityIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={visibilityAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 回复图标
export function ReplyIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={replyAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 关闭/删除图标
export function CloseIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={crossAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 左箭头/返回图标
export function ArrowBackIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={arrowLeftAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 文章图标
export function ArticleIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={articleAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 标签图标
export function LabelIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={labelAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 相机图标
export function PhotoCameraIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={cameraAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 聊天图标
export function ChatIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={chatAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 时钟图标
export function ClockIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={clockAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 联系人/用户图标
export function ContactsIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={contactsAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 趋势上升图标
export function TrendingUpIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={trendingUpAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 趋势下降图标
export function TrendingDownIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={trendingDownAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 垃圾桶/删除图标
export function TrashIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={trashAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 升级/置顶图标
export function UpgradeIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={upgradeAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 文件图标
export function FileIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={fileAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 论坛图标
export function ForumIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={forumAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}

// 钱包图标
export function WalletIcon({ size = 24, sx, hover = false, color, title = '', onClick, hoverColor }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ ...defaultSx, ...sx }}
      title={title}
      onClick={onClick}
    >
      <Lottie
        animationData={walletAnimation}
        width={size}
        height={size}
        loop={hover ? isHovered : false}
        autoplay={true}
        key={hover && isHovered ? 'hover' : 'normal'}
        color={hover && isHovered ? (hoverColor || color) : color}
        sx={sx}
      />
    </Box>
  );
}