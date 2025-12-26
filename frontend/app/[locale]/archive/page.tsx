// ===========================================
// 归档页
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Empty } from '@/components/ui';
import { publicApi } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('archive');
  return {
    title: t('title'),
    description: t('description'),
  };
}

interface Post {
  id: number;
  title: string;
  slug: string;
  published_at: string;
}

export default async function ArchivePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('archive');

  let posts: Post[] = [];

  try {
    const res = await publicApi.posts.list({ limit: 1000 });
    posts = res.data?.items || [];
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }

  // 按年月分组
  const groupedByYearMonth = posts.reduce((acc, post) => {
    const date = new Date(post.published_at);
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

  return (
    <main className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-gray-400">
            {t('totalPosts', { count: posts.length })}
          </p>
        </div>

        {/* 归档列表 */}
        {posts.length > 0 ? (
          <div className="space-y-12">
            {sortedKeys.map((key) => {
              const group = groupedByYearMonth[key];
              return (
                <div key={key}>
                  {/* 年月标题 */}
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="text-primary-400">{group.year}</span>
                    <span className="mx-2 text-gray-600">/</span>
                    <span>{formatMonth(group.month)}</span>
                    <span className="ml-3 text-sm text-gray-500">({group.posts.length})</span>
                  </h2>

                  {/* 文章列表 */}
                  <ul className="space-y-3 ml-4 border-l border-dark-700 pl-6">
                    {group.posts.map((post) => (
                      <li key={post.id} className="relative">
                        <div className="absolute -left-[29px] w-3 h-3 bg-dark-800 border-2 border-primary-500 rounded-full" />
                        <Link
                          href={`/${locale}/blog/${post.slug}`}
                          className="group flex items-center gap-4"
                        >
                          <span className="text-gray-500 text-sm font-mono">
                            {formatDay(post.published_at)}
                          </span>
                          <span className="text-gray-300 group-hover:text-primary-400 transition-colors">
                            {post.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty message={t('noPosts')} />
        )}
      </div>
    </main>
  );
}

