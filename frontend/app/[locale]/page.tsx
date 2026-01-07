import ContributionCalendar from '@/components/contribution/ContributionCalendar';
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
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  // 使用写死的配置
  const config = DEFAULT_CONFIG;

  return (
    <div className="container-content pt-12 pb-0">
      {/* 贡献日历 */}
      <section className="animate-fade-up py-12" style={{ animationDelay: '0.1s' }}>
        <ContributionCalendar type="all" locale={locale} />
      </section>
    </div>
  );
}
