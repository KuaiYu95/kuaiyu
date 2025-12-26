// ===========================================
// 博客列表页
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, Tag, Empty } from '@/components/ui';
import { publicApi } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blog');
  return {
    title: t('title'),
    description: t('description'),
  };
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  view_count: number;
  tags: { id: number; name: string; slug: string; color: string }[];
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
    <main className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
          {tag && (
            <div className="mt-4">
              <span className="text-gray-500">{t('filterByTag')}: </span>
              <Tag>{tag}</Tag>
              <Link href={`/${locale}/blog`} className="ml-2 text-primary-400 hover:underline">
                {t('clearFilter')}
              </Link>
            </div>
          )}
        </div>

        {/* 文章列表 */}
        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                <Card className="group hover:border-primary-500/50 transition-all duration-300">
                  <div className="flex gap-6">
                    {/* 封面图 */}
                    {post.cover_image && (
                      <div className="w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-white group-hover:text-primary-400 transition-colors mb-2 line-clamp-1">
                        {post.title}
                      </h2>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {post.tags?.slice(0, 3).map((tag) => (
                            <Tag key={tag.id} color={tag.color}>
                              {tag.name}
                            </Tag>
                          ))}
                        </div>
                        <div className="text-gray-500 text-sm">
                          <span>{formatDate(post.published_at)}</span>
                          <span className="mx-2">·</span>
                          <span>{post.view_count} {t('views')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Empty message={t('noPosts')} />
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

