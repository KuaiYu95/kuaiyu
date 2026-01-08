'use client';

import languageAnimation from '@/assets/icons/system-regular-145-language-hover-language.json';
import { Lottie } from '@/components/ui';
import { SiteConfig } from '@/lib/api';
import { LOCALES, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// ===========================================
// Header 组件
// 导航栏组件
// ===========================================

interface HeaderProps {
  locale: string;
  config?: SiteConfig;
}

export default function Header({ locale, config }: HeaderProps) {
  const t = useTranslations('nav');
  const tLang = useTranslations('language');
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isLangHovered, setIsLangHovered] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 点击外部关闭语言菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangMenuOpen]);


  // 获取语言切换链接
  const getLanguageLink = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    return `/${newLocale}${pathWithoutLocale || ''}`;
  };

  // 检查是否为当前路由
  const isActive = (href: string) => {
    const currentPath = pathname.replace(`/${locale}`, '') || '/';
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border',
        isScrolled
          ? 'bg-bg-primary/80 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="container-content">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-xl font-bold text-text-accent hover:text-accent-primary transition-colors"
          >
            {/* {config?.site_logo ? (
              <div className="relative w-8 h-8">
                <SafeImage
                  src={config.site_logo}
                  alt={config.site_name || 'Logo'}
                  fill
                  loading="eager"
                  sizes="32px"
                  className="object-contain"
                />
              </div>
            ) : null} */}
            <span>{config?.site_name || 'Yu.kuai'}</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className={cn(
                  'relative text-xs md:text-sm font-medium transition-colors whitespace-nowrap',
                  isActive(item.href)
                    ? 'text-accent-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {t(item.key)}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent-primary"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center">
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                onMouseEnter={() => setIsLangHovered(true)}
                onMouseLeave={() => setIsLangHovered(false)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  'hover:bg-bg-hover text-text-secondary hover:text-text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-primary',
                  isLangMenuOpen && 'bg-bg-hover text-text-primary'
                )}
                style={{ lineHeight: 1 }}
                aria-label="切换语言"
              >
                <Lottie
                  key={isLangHovered ? 'hover' : 'normal'}
                  animationData={languageAnimation}
                  width={20}
                  height={20}
                  loop={isLangHovered}
                  autoplay={true}
                />
              </button>

              {/* Language Dropdown */}
              <AnimatePresence>
                {isLangMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 -z-10"
                      onClick={() => setIsLangMenuOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-32 bg-bg-secondary border border-border rounded-lg shadow-lg overflow-hidden"
                    >
                      {LOCALES.map((l) => (
                        <Link
                          key={l}
                          href={getLanguageLink(l)}
                          onClick={() => setIsLangMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                            l === locale
                              ? 'bg-accent-primary/10 text-accent-primary font-medium'
                              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                          )}
                        >
                          {l === locale && (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span>{tLang(l)}</span>
                        </Link>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </nav>
    </header>
  );
}

