'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * 安全的图片组件，如果 Next.js Image 优化失败，自动回退到普通 img 标签
 * 对于外部 COS URL，直接使用普通 img 标签以避免优化服务的问题
 */
export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
  sizes,
  loading,
}: SafeImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [imgError, setImgError] = useState(false);

  // 如果是外部 URL（COS），直接使用普通 img 标签
  // 或者如果已经出错，也使用普通 img 标签
  if (useFallback || imgError || (src.startsWith('http') && src.includes('cos'))) {
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          onError={() => setImgError(true)}
        />
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      loading={loading}
      onError={() => setUseFallback(true)}
    />
  );
}

