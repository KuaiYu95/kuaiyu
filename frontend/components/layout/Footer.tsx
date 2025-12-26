'use client';

import { SiteConfig } from '@/lib/api';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

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
    <footer className="border-t border-border bg-bg-secondary mt-auto pt-8">
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
              {config?.footer_left_name || config?.site_name || 'Yu.kuai'}
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
          {config?.footer_right_categories &&
            Array.isArray(config.footer_right_categories) &&
            config.footer_right_categories.length > 0 && (
              <div className="flex-1 flex flex-wrap justify-end gap-x-24 gap-y-8 md:pl-12">
                {config.footer_right_categories
                  .filter((cat) => cat && cat.category)
                  .map((category, index) => (
                    <div key={index} className="text-right">
                      <h4 className="text-sm font-semibold text-text-accent mb-3">
                        {category.category}
                      </h4>
                      {category.links && Array.isArray(category.links) && category.links.length > 0 && (
                        <ul className="space-y-2">
                          {category.links
                            .filter((link) => link && link.url && link.title)
                            .map((link, linkIndex) => (
                              <li key={linkIndex}>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
                                >
                                  {link.title}
                                </a>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            )}
        </div>
        <div className="mt-8 pt-2 pb-2 border-t border-border text-center">
          <p className="text-xs text-text-secondary">
            {t('copyright', {
              year: currentYear,
              name: config?.site_name || 'Yu.kuai',
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}

