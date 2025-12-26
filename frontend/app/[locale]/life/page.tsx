// ===========================================
// 生活记录列表页
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, Empty } from '@/components/ui';
import { publicApi } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('life');
  return {
    title: t('title'),
    description: t('description'),
  };
}

interface LifeRecord {
  id: number;
  title: string;
  content: string;
  cover_image: string;
  published_at: string;
}

export default async function LifePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('life');

  let records: LifeRecord[] = [];

  try {
    const res = await publicApi.life.list({ limit: 50 });
    records = res.data?.items || [];
  } catch (error) {
    console.error('Failed to fetch life records:', error);
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 按年份分组
  const groupedByYear = records.reduce((acc, record) => {
    const year = new Date(record.published_at).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(record);
    return acc;
  }, {} as Record<number, LifeRecord[]>);

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <main className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
        </div>

        {/* 时间线 */}
        {records.length > 0 ? (
          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-dark-700" />

            {years.map((year) => (
              <div key={year} className="mb-12">
                {/* 年份 */}
                <div className="relative flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center z-10">
                    <span className="text-primary-400 font-bold">{year}</span>
                  </div>
                </div>

                {/* 该年的记录 */}
                <div className="ml-16 space-y-6">
                  {groupedByYear[Number(year)].map((record) => (
                    <Link key={record.id} href={`/${locale}/life/${record.id}`}>
                      <Card className="group hover:border-primary-500/50 transition-all duration-300">
                        <div className="flex gap-4">
                          {record.cover_image && (
                            <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                              <img
                                src={record.cover_image}
                                alt={record.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors mb-2">
                              {record.title}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {record.content.replace(/[#*`]/g, '').slice(0, 100)}...
                            </p>
                            <div className="text-gray-500 text-xs mt-2">
                              {formatDate(record.published_at)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty message={t('noRecords')} />
        )}
      </div>
    </main>
  );
}

