// ===========================================
// 博客详情页
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Tag } from '@/components/ui';
import { publicApi } from '@/lib/api';
import CommentSection from '@/components/comment/CommentSection';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  view_count: number;
  tags: { id: number; name: string; slug: string; color: string }[];
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  try {
    const res = await publicApi.posts.get(params.slug);
    const post: Post = res.data;
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.cover_image ? [post.cover_image] : [],
      },
    };
  } catch {
    return { title: 'Post Not Found' };
  }
}

export default async function BlogDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations('blog');

  let post: Post | null = null;

  try {
    const res = await publicApi.posts.get(slug);
    post = res.data;
  } catch (error) {
    notFound();
  }

  if (!post) {
    notFound();
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
      <article className="max-w-3xl mx-auto px-4">
        {/* 返回链接 */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center text-gray-400 hover:text-primary-400 transition-colors mb-8"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToList')}
        </Link>

        {/* 封面图 */}
        {post.cover_image && (
          <div className="w-full h-64 md:h-80 overflow-hidden rounded-2xl mb-8">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 标题 */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{post.title}</h1>

        {/* 元信息 */}
        <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
          <span>{formatDate(post.published_at)}</span>
          <span>·</span>
          <span>{post.view_count} {t('views')}</span>
          {post.tags && post.tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
                    <Tag color={tag.color}>{tag.name}</Tag>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 文章内容 */}
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* 分割线 */}
        <hr className="border-dark-700 my-12" />

        {/* 评论区 */}
        <CommentSection postId={post.id} locale={locale} />
      </article>
    </main>
  );
}

