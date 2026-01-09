// ===========================================
// 分类/标签页
// ===========================================

import labelAnimation from '@/assets/icons/system-regular-146-label-hover-label.json';
import { Card, Lottie } from '@/components/ui';
import { publicApi, Tag } from '@/lib/api';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('categories');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
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
    <div className="container-content py-12">
      {/* 页面标题 */}
      <section className="text-center py-12 animate-fade-up pb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Lottie
            animationData={labelAnimation}
            width={24}
            height={24}
            autoplay={true}
          />
          <h1 className="text-3xl font-bold text-text-accent">{t('title')}</h1>
        </div>
        <p className="text-text-secondary">
          {t('totalTags', { count: tags.length })}
        </p>
      </section>

      {/* 标签列表 */}
      {tags.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tags.map((tag) => (
            <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
              <Card className="group hover:border-primary-500/50 transition-all duration-300 flex items-center justify-between bg-bg-secondary/50 backdrop-blur-sm">
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
  );
}

