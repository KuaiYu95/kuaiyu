'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SiteConfig } from '@/lib/api';

// ===========================================
// Footer 组件
// 页脚组件
// ===========================================

interface FooterProps {
  config?: SiteConfig;
  locale: string;
}

export default function Footer({ config, locale }: FooterProps) {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary mt-auto">
      <div className="container-content py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧信息 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {config?.footer_left_image && (
              <div className="relative w-16 h-16 mb-4">
                <Image
                  src={config.footer_left_image}
                  alt={config.footer_left_name || ''}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )}
            <h3 className="text-lg font-bold text-text-accent mb-2">
              {config?.footer_left_name || config?.site_name || '快鱼'}
            </h3>
            <p className="text-sm text-text-secondary max-w-xs">
              {config?.footer_left_description || '一个热爱技术的开发者'}
            </p>
            {config?.site_icp && (
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-xs text-text-secondary hover:text-text-primary"
              >
                {config.site_icp}
              </a>
            )}
          </div>

          {/* 右侧链接 */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6 md:pl-12">
            {config?.footer_right_links?.categories?.map((category, index) => (
              <div key={index}>
                <h4 className="text-sm font-semibold text-text-accent mb-3">
                  {category.name}
                </h4>
                <ul className="space-y-2">
                  {category.links?.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-text-secondary">
            {t('copyright', {
              year: currentYear,
              name: config?.site_name || '快鱼',
            })}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {t('poweredBy')}{' '}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:underline"
            >
              Next.js
            </a>
            {' & '}
            <a
              href="https://go.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:underline"
            >
              Go
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

