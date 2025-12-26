// ===========================================
// 留言板页
// ===========================================

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CommentSection from '@/components/comment/CommentSection';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('guestbook');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function GuestbookPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('guestbook');

  return (
    <main className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
        </div>

        {/* 留言区 */}
        <CommentSection isGuestbook locale={locale} />
      </div>
    </main>
  );
}

