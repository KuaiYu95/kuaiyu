'use client';

import { LOCALES, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// ===========================================
// Header 组件
// 导航栏组件
// ===========================================

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const tLang = useTranslations('language');
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-bg-primary/80 backdrop-blur-lg border-b border-border'
          : 'bg-transparent'
      )}
    >
      <nav className="container-content">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-xl font-bold text-text-accent hover:text-accent-primary transition-colors"
          >
            Yu.kuai
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className={cn(
                  'relative text-sm font-medium transition-colors',
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
          <div className="hidden md:flex items-center gap-2">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={getLanguageLink(l)}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
                  l === locale
                    ? 'bg-accent-primary text-bg-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {tLang(l)}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-bg-secondary border-l border-border md:hidden"
            >
              <div className="flex flex-col h-full p-6">
                <button
                  className="self-end p-2 text-text-primary mb-6"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex flex-col gap-4">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.key}
                      href={`/${locale}${item.href}`}
                      className={cn(
                        'text-lg font-medium py-2 border-b border-border transition-colors',
                        isActive(item.href)
                          ? 'text-accent-primary border-accent-primary'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t(item.key)}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto flex gap-2">
                  {LOCALES.map((l) => (
                    <Link
                      key={l}
                      href={getLanguageLink(l)}
                      className={cn(
                        'flex-1 py-2 text-center text-sm rounded transition-colors',
                        l === locale
                          ? 'bg-accent-primary text-bg-primary'
                          : 'bg-bg-hover text-text-secondary'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {tLang(l)}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

