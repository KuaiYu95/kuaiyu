// ===========================================
// 博客详情页
// ===========================================

import CommentSection from '@/components/comment/CommentSection';
import PostMeta from '@/components/post/PostMeta';
import ViewCounter from '@/components/post/ViewCounter';
import { Tag } from '@/components/ui';
import { Post, publicApi } from '@/lib/api';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import BackButton from './BackButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await publicApi.posts.get(slug);
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
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
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

  return (
    <main className="min-h-screen py-2">
      {/* 阅读量计数器（同时记录页面访问） */}
      <ViewCounter postId={post.id} />

      <article className="max-w-3xl mx-auto">
        {/* 返回链接 */}
        <BackButton href={`/${locale}/blog`} text={t('backToList')} />

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
          <PostMeta
            date={post.published_at || post.created_at}
            viewCount={post.view_count}
            viewsText={t('views')}
            locale={locale}
          />
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
                  <Tag color={tag.color}>{tag.name}</Tag>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 文章内容 */}
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* 分割线 */}
        <hr className="border-border my-12" />

        {/* 评论区 */}
        <CommentSection postId={post.id} locale={locale} />
      </article>
    </main>
  );
}

