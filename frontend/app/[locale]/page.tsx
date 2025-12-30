import ContributionCalendar from '@/components/contribution/ContributionCalendar';
import SafeImage from '@/components/ui/SafeImage';
import { DEFAULT_CONFIG } from '@/lib/config';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

// ===========================================
// 首页
// ===========================================

export const metadata: Metadata = {
  title: '首页',
};

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);
  const t = await getTranslations('home');

  // 使用写死的配置
  const config = DEFAULT_CONFIG;

  return (
    <div className="container-content pt-12 pb-0 space-y-16">
      {/* 首屏区域 */}
      <section className="text-center py-12 animate-fade-up">
        {config.site_logo && (
          <div className="relative w-28 h-28 mx-auto mb-6">
            <SafeImage
              src={config.site_logo}
              alt={config.site_name || '头像'}
              fill
              className="object-cover rounded-full ring-4 ring-border hover:ring-accent-primary transition-all duration-300 hover:scale-105"
              priority
            />
          </div>
        )}
        <h1 className="text-3xl font-bold text-text-accent mb-4">
          {config.site_name || 'Yu.kuai'}
        </h1>
      </section>

      {/* 贡献日历 */}
      <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <ContributionCalendar type="all" locale={locale} />
      </section>
    </div>
  );
}
