// ===========================================
// 归档页
// ===========================================

import calendarAnimation from '@/assets/icons/system-regular-23-calendar-hover-calendar.json';
import { Empty, Lottie } from '@/components/ui';
import { ArchiveYear, Post, publicApi } from '@/lib/api';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import ArchiveOutline from './ArchiveOutline';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('archive');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('archive');

  let posts: Post[] = [];

  try {
    const res = await publicApi.archive.list();
    const archiveYears = res.data || [];
    posts = archiveYears.flatMap((year: ArchiveYear) => year.posts || []);
  } catch (error) {
    console.error('Failed to fetch archive:', error);
  }

  // 按年月分组
  const groupedByYearMonth = posts.reduce((acc, post) => {
    const date = new Date(post.published_at || post.created_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = { year, month, posts: [] };
    }
    acc[key].posts.push(post);
    return acc;
  }, {} as Record<string, { year: number; month: number; posts: Post[] }>);

  const sortedKeys = Object.keys(groupedByYearMonth).sort((a, b) => b.localeCompare(a));

  const formatMonth = (month: number) => {
    const months = locale === 'zh'
      ? ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const formatDay = (date: string) => {
    return new Date(date).getDate().toString().padStart(2, '0');
  };

  // 生成大纲数据
  const outlineItems = sortedKeys.map((key) => {
    const group = groupedByYearMonth[key];
    return {
      id: `archive-${key}`,
      year: group.year,
      month: group.month,
      label: formatMonth(group.month),
      count: group.posts.length,
    };
  });

  return (
    <div className="container-content py-12">
      {/* 页面标题 */}
      <section className="text-center py-12 animate-fade-up pb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Lottie
            animationData={calendarAnimation}
            width={24}
            height={24}
            autoplay={true}
          />
          <h1 className="text-3xl font-bold text-text-accent">{t('title')}</h1>
        </div>
        <p className="text-text-secondary">
          {t('totalPosts', { count: posts.length })}
        </p>
      </section>

      {/* 归档列表 */}
      {posts.length > 0 ? (
        <div className="relative lg:flex lg:gap-8">
          {/* 左侧列表内容 */}
          <div className="relative flex-1">
            {/* 时间线 */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/40 via-primary-500/20 to-transparent" />

            <div className="space-y-8">
              {sortedKeys.map((key) => {
                const group = groupedByYearMonth[key];
                return (
                  <div key={key} id={`archive-${key}`} className="relative scroll-mt-24">
                    {/* 年月标题 */}
                    <div className="relative flex items-center mb-4">
                      <div className="absolute left-0 w-3 h-3 -translate-x-[5px] bg-primary-500 rounded-full border-2 border-dark-900 z-10 shadow-lg shadow-primary-500/30" />
                      <h2 className="ml-8 text-lg font-semibold text-text-accent flex items-center gap-3">
                        <span className="text-primary-400">{group.year}</span>
                        <span className="text-text-secondary">/</span>
                        <span>{formatMonth(group.month)}</span>
                        <span className="text-text-secondary text-sm font-normal">
                          ({group.posts.length})
                        </span>
                      </h2>
                    </div>

                    {/* 文章列表 */}
                    <ul className="ml-8 space-y-2">
                      {group.posts.map((post) => (
                        <li key={post.id} className="group">
                          <Link
                            href={`/${locale}/blog/${post.slug}`}
                            className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded hover:bg-bg-secondary/30 transition-colors"
                          >
                            <span className="text-xs text-text-secondary min-w-[30px]">
                              {formatDay(post.published_at || post.created_at)}
                            </span>
                            <span className="relative text-text-accent group-hover:text-primary-400 transition-colors line-clamp-1">
                              {post.title}
                              <span className="absolute bottom-0 left-0 h-px bg-white transition-all duration-500 ease-out w-0 group-hover:w-full" />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
          {/* 右侧大纲导航 */}
          <div className="hidden lg:block lg:w-48 lg:flex-shrink-0">
            <ArchiveOutline items={outlineItems} />
          </div>
        </div>
      ) : (
        <Empty text={t('noPosts')} />
      )}
    </div>
  );
}

