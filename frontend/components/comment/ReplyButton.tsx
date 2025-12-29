'use client';

import crossAnimation from '@/assets/icons/system-regular-29-cross-hover-cross-1.json';
import replyAnimation from '@/assets/icons/system-regular-97-reply-hover-reply.json';
import { Lottie } from '@/components/ui';
import { useState } from 'react';

interface ReplyButtonProps {
  isActive: boolean;
  replyText: string;
  cancelText: string;
  onClick: () => void;
}

export default function ReplyButton({
  isActive,
  replyText,
  cancelText,
  onClick,
}: ReplyButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-400 transition-colors"
      style={{ lineHeight: 1 }}
    >
      <Lottie
        animationData={isActive ? crossAnimation : replyAnimation}
        width={16}
        height={16}
        loop={isHovered}
        autoplay={true}
        key={isActive ? 'cancel' : 'reply'}
      />
      <span>{isActive ? cancelText : replyText}</span>
    </button>
  );
}

