// ===========================================
// 生活记录列表页
// ===========================================

import bulbAnimation from '@/assets/icons/system-regular-121-bulb-hover-bulb.json';
import ContributionCalendar from '@/components/contribution/ContributionCalendar';
import { Empty, Lottie, RelativeTime } from '@/components/ui';
import { LifeRecord, publicApi } from '@/lib/api';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('life');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LifePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('life');

  let records: LifeRecord[] = [];

  try {
    const res = await publicApi.life.list({ limit: 50 });
    records = res.data?.items || [];
  } catch (error) {
    console.error('Failed to fetch life records:', error);
  }

  // 按年份分组
  const groupedByYear = records.reduce((acc, record) => {
    const date = record.published_at || record.created_at;
    if (!date) return acc;
    const year = new Date(date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(record);
    return acc;
  }, {} as Record<number, LifeRecord[]>);

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <main className="min-h-screen">
      <div className="container-content py-12">
        {/* 页面标题 */}
        <section className="text-center pt-12 pb-4 animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lottie
              animationData={bulbAnimation}
              width={24}
              height={24}
              autoplay={true}
            />
            <h1 className="text-3xl font-bold text-text-accent">{t('title')}</h1>
          </div>
          <p className="text-text-secondary">{t('description')}</p>
        </section>

        {/* 贡献日历 */}
        <section className="animate-fade-up mb-12" style={{ animationDelay: '0.1s' }}>
          <ContributionCalendar type="life" locale={locale} />
        </section>

        {/* 时间线 */}
        {records.length > 0 ? (
          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-dark-700" />

            {years.map((year) => (
              <div key={year}>
                {/* 年份 */}
                <div className="relative flex items-center mb-6">
                  <div className="bg-primary-500/20 rounded-full z-10">
                    <span className="text-primary-400 font-bold">{year}</span>
                  </div>
                </div>

                {/* 该年的记录 */}
                <div>
                  {groupedByYear[Number(year)].map((record, index) => (
                    <Link key={record.id} href={`/${locale}/life/${record.id}`} className={index > 0 ? "block mt-6" : "block"}>
                      <div className="group border-b border-border/50 pb-6 transition-all duration-300">
                        <div className="flex gap-4">
                          {record.cover_image && (
                            <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                              <img
                                src={record.cover_image}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-secondary line-clamp-3 group-hover:text-text-accent transition-colors leading-relaxed">
                              {record.content.replace(/[#*`\n]/g, ' ').slice(0, 150)}
                            </p>
                            <div className="text-xs text-text-secondary mt-2">
                              <RelativeTime date={record.published_at || record.created_at} locale={locale} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty title={t('noRecords')} />
        )}
      </div>
    </main>
  );
}

