'use client';

import arrowLeftAnimation from '@/assets/icons/system-regular-507-arrow-left-hover-pinch.json';
import { Lottie } from '@/components/ui';
import Link from 'next/link';
import { useState } from 'react';

interface BackButtonProps {
  href: string;
  text: string;
}

export default function BackButton({ href, text }: BackButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="inline-flex items-center text-gray-400 hover:text-primary-400 transition-colors mb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Lottie
        animationData={arrowLeftAnimation}
        width={22.4}
        height={22.4}
        loop={isHovered}
        autoplay={true}
        key={isHovered ? 'hover' : 'normal'}
      />
      <div className="ml-2" style={{ lineHeight: 1 }}>
        {text}
      </div>
    </Link>
  );
}

