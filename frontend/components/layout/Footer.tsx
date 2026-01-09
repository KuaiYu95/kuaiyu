'use client';

import SafeImage from '@/components/ui/SafeImage';
import { SiteConfig } from '@/lib/api';
import { DEFAULT_CONFIG } from '@/lib/config';
import { useTranslations } from 'next-intl';

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
    <footer className="w-full border-t border-border bg-bg-secondary mt-auto pt-8">
      <div className="container-content py-12">
        <div className="flex flex-col items-center md:items-start md:flex-row gap-8">
          {/* 左侧信息 */}
          <div className="flex items-center gap-4 text-center md:text-left">
            {config?.site_logo && (
              <div className="relative w-12 h-12 flex-shrink-0">
                <SafeImage
                  src={config.site_logo}
                  alt={config.site_name || ''}
                  fill
                  loading="eager"
                  sizes="48px"
                  className="object-cover rounded-full"
                />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-text-accent mb-1">
                {config?.site_name}
              </h3>
              <p className="text-xs text-text-secondary max-w-xs">
                {t('siteDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* 全宽分隔线 */}
      <div className="border-t border-border mt-8 pt-2 pb-2" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}>
        <div className="container-content text-center">
          <p className="text-xs text-text-secondary flex items-center justify-center gap-2 flex-wrap">
            <span>
              {t('copyright', {
                year: currentYear,
                name: config?.site_name || 'Yu.kuai',
              })}
            </span>
            <span className="text-text-tertiary">|</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary"
            >
              {DEFAULT_CONFIG.site_icp}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

