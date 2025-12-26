// ===========================================
// 分类/标签页
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, Empty } from '@/components/ui';
import { publicApi } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('categories');
  return {
    title: t('title'),
    description: t('description'),
  };
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  post_count: number;
}

export default async function CategoriesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('categories');

  let tags: Tag[] = [];

  try {
    const res = await publicApi.tags.list();
    tags = res.data || [];
  } catch (error) {
    console.error('Failed to fetch tags:', error);
  }

  // 计算最大文章数用于计算字体大小
  const maxCount = Math.max(...tags.map((t) => t.post_count || 0), 1);

  const getFontSize = (count: number) => {
    const minSize = 14;
    const maxSize = 32;
    const ratio = (count || 0) / maxCount;
    return minSize + ratio * (maxSize - minSize);
  };

  return (
    <main className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-gray-400">
            {t('totalTags', { count: tags.length })}
          </p>
        </div>

        {/* 标签云 */}
        {tags.length > 0 ? (
          <Card className="p-8">
            <div className="flex flex-wrap justify-center gap-4">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/${locale}/blog?tag=${tag.slug}`}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-110"
                  style={{
                    fontSize: getFontSize(tag.post_count || 0),
                    backgroundColor: `${tag.color}20`,
                    color: tag.color || '#60a5fa',
                  }}
                >
                  <span className="group-hover:underline">{tag.name}</span>
                  <span
                    className="text-xs opacity-60"
                    style={{ fontSize: 12 }}
                  >
                    ({tag.post_count || 0})
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        ) : (
          <Empty message={t('noTags')} />
        )}

        {/* 标签列表 */}
        {tags.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            {tags.map((tag) => (
              <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
                <Card className="group hover:border-primary-500/50 transition-all duration-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color || '#60a5fa' }}
                    />
                    <span className="text-white group-hover:text-primary-400 transition-colors">
                      {tag.name}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {tag.post_count || 0} {t('posts')}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

