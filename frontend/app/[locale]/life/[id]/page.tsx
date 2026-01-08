// ===========================================
// 生活记录详情页
// ===========================================

import CommentSection from '@/components/comment/CommentSection';
import LifeViewCounter from '@/components/post/LifeViewCounter';
import PostMeta from '@/components/post/PostMeta';
import { BackButton } from '@/components/ui';
import { LifeRecord, publicApi } from '@/lib/api';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await publicApi.life.get(parseInt(id));
    const record: LifeRecord = res.data;
    // 使用内容前30字作为标题
    const title = record.content.replace(/[#*`\n]/g, ' ').slice(0, 30) + '...';
    return {
      title,
      description: record.content.slice(0, 160),
    };
  } catch {
    return { title: 'Record Not Found' };
  }
}

export default async function LifeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('life');

  let record: LifeRecord | null = null;

  try {
    const res = await publicApi.life.get(parseInt(id));
    record = res.data;
  } catch (error) {
    notFound();
  }

  if (!record) {
    notFound();
  }

  return (
    <div>
      {/* 阅读量计数器 */}
      <LifeViewCounter lifeId={record.id} />

      <article className="max-w-3xl mx-auto px-4 md:px-0">
        {/* 返回链接 */}
        <BackButton href={`/${locale}/life`} text={t('backToList')} />

        {/* 封面图 */}
        {record.cover_image && (
          <div className="w-full h-64 md:h-80 overflow-hidden rounded-2xl mb-8">
            <img
              src={record.cover_image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 标题 */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">记录</h1>

        {/* 元信息 */}
        <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
          <PostMeta
            date={record.published_at || record.created_at}
            viewCount={record.view_count || 0}
            viewsText={t('views')}
            locale={locale}
          />
        </div>

        {/* 内容 */}
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {record.content}
          </ReactMarkdown>
        </div>

        {/* 分割线 */}
        <hr className="border-border my-4" />

        {/* 评论区 */}
        <CommentSection lifeRecordId={record.id} locale={locale} />
      </article>
    </div>
  );
}

