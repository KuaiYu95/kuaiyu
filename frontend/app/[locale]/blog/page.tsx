// ===========================================
// 博客列表页
// ===========================================

import articleAnimation from '@/assets/icons/system-regular-14-article-hover-article.json';
import ContributionCalendar from '@/components/contribution/ContributionCalendar';
import BlogPostItem from '@/components/post/BlogPostItem';
import { Empty, Lottie, Tag } from '@/components/ui';
import { Post, publicApi } from '@/lib/api';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  const page = parseInt(resolvedSearchParams.page || '1');
  const tag = resolvedSearchParams.tag;

  let posts: Post[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const res = await publicApi.posts.list({ page, limit: 10, tag });
    posts = res.data?.items || [];
    total = res.data?.pagination?.total || 0;
    totalPages = res.data?.pagination?.totalPages || 1;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }

  return (
    <div className="container-content py-12">
      {/* 页面标题 */}
      <section className="text-center pt-12 pb-4 animate-fade-up">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Lottie
            animationData={articleAnimation}
            width={24}
            height={24}
            autoplay={true}
          />
          <h1 className="text-3xl font-bold text-text-accent">{t('title')}</h1>
        </div>
        <p className="text-text-secondary">{t('description')}</p>
        {tag && (
          <div className="mt-4">
            <span className="text-gray-500">{t('filterByTag')}: </span>
            <Tag>{tag}</Tag>
            <Link href={`/${locale}/blog`} className="ml-2 text-primary-400 hover:underline">
              {t('clearFilter')}
            </Link>
          </div>
        )}
      </section>

      {/* 贡献日历 */}
      <section className="animate-fade-up mb-4" style={{ animationDelay: '0.1s' }}>
        <ContributionCalendar type="post" locale={locale} />
      </section>

      {/* 文章列表 */}
      {posts.length > 0 ? (
        <div>
          {posts.map((post, index) => (
            <BlogPostItem
              key={post.id}
              post={post}
              locale={locale}
              href={`/${locale}/blog/${post.slug}`}
              showIndex={index}
              viewsText={t('views')}
            />
          ))}
        </div>
      ) : (
        <Empty text={t('noPosts')} />
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {page > 1 && (
            <Link
              href={`/${locale}/blog?page=${page - 1}${tag ? `&tag=${tag}` : ''}`}
              className="px-4 py-2 bg-dark-800 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors"
            >
              {t('prevPage')}
            </Link>
          )}
          <span className="px-4 py-2 text-gray-400">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/${locale}/blog?page=${page + 1}${tag ? `&tag=${tag}` : ''}`}
              className="px-4 py-2 bg-dark-800 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors"
            >
              {t('nextPage')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

