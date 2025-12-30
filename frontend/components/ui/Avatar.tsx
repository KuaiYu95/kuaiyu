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
  isAdmin?: boolean; // 是否为管理员
}

export default function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  className,
  isAdmin = false,
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

  // 根据名字选择默认头像（从 avatars 文件夹中选择）
  const getDefaultAvatar = (name?: string) => {
    // avatars 文件夹中有 20 个头像（1.jpg 到 20.png）
    const avatarCount = 20;
    if (!name) {
      return '/assets/avatars/1.jpg';
    }
    // 根据名字的第一个字符生成索引，确保相同名字总是选择同一个头像
    const index = (name.charCodeAt(0) % avatarCount) + 1;
    // 根据索引选择对应的头像文件
    const avatarFiles = [
      '1.jpg', '2.jpg', '3.jpeg', '4.jpg', '5.jpg',
      '6.jpeg', '7.jpg', '8.jpg', '9.jpeg', '10.jpeg',
      '11.jpeg', '12.jpg', '13.jpg', '14.jpg', '15.jpeg',
      '16.jpg', '17.jpeg', '18.jpg', '19.jpeg', '20.png',
    ];
    return `/assets/avatars/${avatarFiles[index - 1]}`;
  };

  // 如果是管理员，使用 logo
  if (isAdmin) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-bg-hover',
          sizes[size],
          className
        )}
      >
        <SafeImage
          src="/logo.png"
          alt={alt || 'Admin'}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover"
        />
      </div>
    );
  }

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

  // 没有提供 src 时，使用默认头像
  const defaultAvatarSrc = getDefaultAvatar(name);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-bg-hover',
        sizes[size],
        className
      )}
    >
      <SafeImage
        src={defaultAvatarSrc}
        alt={alt || name || 'Avatar'}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="object-cover"
      />
    </div>
  );
}

