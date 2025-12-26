// ===========================================
// 博客列表页
// ===========================================

import { Empty, Tag } from '@/components/ui';
import { Post, publicApi } from '@/lib/api';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blog');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function BlogPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string; tag?: string };
}) {
  const t = await getTranslations('blog');
  const page = parseInt(searchParams.page || '1');
  const tag = searchParams.tag;

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen">
      <div className="container-content py-12">
        {/* 页面标题 */}
        <section className="text-center py-12 animate-fade-up mb-12">
          <h1 className="text-3xl font-bold text-text-accent mb-4">{t('title')}</h1>
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

        {/* 文章列表 */}
        {posts.length > 0 ? (
          <div>
            {posts.map((post, index) => (
              <div key={post.id}>
                {index > 0 && <div className="h-px border-t border-dashed border-border/50 my-2"></div>}
                <Link href={`/${locale}/blog/${post.slug}`} className="block">
                  <div className="group py-2 px-4 -mx-4 rounded-lg bg-bg-secondary/0 hover:bg-bg-secondary/30 transition-all duration-300">
                    <div className="flex gap-6">
                      {post.cover_image && (
                        <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-text-accent mb-2 group-hover:text-primary-400 transition-colors line-clamp-1">
                          {post.title}
                        </h2>
                        <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-text-secondary">
                          <span>{formatDate(post.published_at || '')}</span>
                          <span className="text-border">·</span>
                          <span>{post.view_count} {t('views')}</span>
                          {post.tags && post.tags.length > 0 && (
                            <>
                              <span className="text-border">·</span>
                              <div className="flex gap-2">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <Tag key={tag.id} color={tag.color} size="sm">{tag.name}</Tag>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <Empty title={t('noPosts')} />
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
    </main>
  );
}

