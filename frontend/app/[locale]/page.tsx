import ContributionCalendar from '@/components/contribution/ContributionCalendar';
import { configApi } from '@/lib/api';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

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
  const t = await getTranslations('home');

  let config = null;
  try {
    const res = await configApi.get();
    config = res.data;
  } catch (error) {
    console.error('Failed to fetch config:', error);
  }

  return (
    <div className="container-content pt-12 pb-0 space-y-16">
      {/* 首屏区域 */}
      <section className="text-center py-12 animate-fade-up">
        {config?.home_avatar && (
          <div className="relative w-28 h-28 mx-auto mb-6">
            <Image
              src={config.home_avatar}
              alt={config.home_nickname || '头像'}
              fill
              className="object-cover rounded-full ring-4 ring-border hover:ring-accent-primary transition-all duration-300 hover:scale-105"
              priority
            />
          </div>
        )}
        <h1 className="text-3xl font-bold text-text-accent mb-4">
          {config?.home_nickname || 'Yu.kuai'}
        </h1>
        {config?.home_about && (
          <div
            className="max-w-lg mx-auto text-text-secondary markdown-content"
            dangerouslySetInnerHTML={{ __html: config.home_about }}
          />
        )}
      </section>

      {/* 贡献日历 */}
      <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <ContributionCalendar type="all" locale={locale} />
      </section>
    </div>
  );
}
