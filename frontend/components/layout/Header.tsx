'use client';

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
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const tLang = useTranslations('language');
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-bg-primary/80 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300',
          isScrolled ? 'opacity-20' : 'opacity-0'
        )}
        style={{ backgroundColor: '#2a2a2a' }}
      />
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
          <div className="hidden md:flex items-center">
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  'hover:bg-bg-hover text-text-secondary hover:text-text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-primary',
                  isLangMenuOpen && 'bg-bg-hover text-text-primary'
                )}
                aria-label="切换语言"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
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

                <div className="mt-auto">
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-text-secondary mb-1">语言</div>
                    {LOCALES.map((l) => (
                      <Link
                        key={l}
                        href={getLanguageLink(l)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-colors',
                          l === locale
                            ? 'bg-accent-primary/10 text-accent-primary font-medium'
                            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
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
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

