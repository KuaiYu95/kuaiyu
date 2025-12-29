'use client';

import clockAnimation from '@/assets/icons/system-regular-67-clock-hover-clock.json';
import visibilityAnimation from '@/assets/icons/system-regular-92-visability-hover-pinch.json';
import { Lottie, RelativeTime } from '@/components/ui';
import { useState } from 'react';

interface PostMetaProps {
  date: string;
  viewCount: number;
  viewsText: string;
  locale: string;
}

export default function PostMeta({
  date,
  viewCount,
  viewsText,
  locale,
}: PostMetaProps) {
  const [isClockHovered, setIsClockHovered] = useState(false);
  const [isVisibilityHovered, setIsVisibilityHovered] = useState(false);

  return (
    <>
      <div
        className="flex items-center gap-2"
        onMouseEnter={() => setIsClockHovered(true)}
        onMouseLeave={() => setIsClockHovered(false)}
      >
        <Lottie
          animationData={clockAnimation}
          width={16}
          height={16}
          loop={isClockHovered}
          autoplay={true}
          key={isClockHovered ? 'hover' : 'normal'}
        />
        <div style={{ lineHeight: 1 }}>
          <RelativeTime date={date} locale={locale} />
        </div>
      </div>
      <span>·</span>
      <div
        className="flex items-center gap-2"
        onMouseEnter={() => setIsVisibilityHovered(true)}
        onMouseLeave={() => setIsVisibilityHovered(false)}
      >
        <Lottie
          animationData={visibilityAnimation}
          width={16}
          height={16}
          loop={isVisibilityHovered}
          autoplay={true}
          key={isVisibilityHovered ? 'hover' : 'normal'}
        />
        <div style={{ lineHeight: 1 }}>
          <span>
            {viewCount} {viewsText}
          </span>
        </div>
      </div>
    </>
  );
}

