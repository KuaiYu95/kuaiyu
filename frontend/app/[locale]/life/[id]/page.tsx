// ===========================================
// 生活记录详情页
// ===========================================

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { publicApi } from '@/lib/api';
import CommentSection from '@/components/comment/CommentSection';

interface LifeRecord {
  id: number;
  content: string;
  cover_image: string;
  published_at: string;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const res = await publicApi.life.get(parseInt(params.id));
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
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
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
          href={`/${locale}/life`}
          className="inline-flex items-center text-gray-400 hover:text-primary-400 transition-colors mb-8"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToList')}
        </Link>

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

        {/* 日期 */}
        <div className="text-gray-400 text-sm mb-8">
          {formatDate(record.published_at)}
        </div>

        {/* 内容 */}
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {record.content}
          </ReactMarkdown>
        </div>

        {/* 分割线 */}
        <hr className="border-dark-700 my-12" />

        {/* 评论区 */}
        <CommentSection lifeRecordId={record.id} locale={locale} />
      </article>
    </main>
  );
}

