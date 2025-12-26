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
    <main className="min-h-screen">
      <div className="container-content py-12">
        {/* 页面标题 */}
        <section className="text-center py-12 animate-fade-up mb-12">
          <h1 className="text-3xl font-bold text-text-accent mb-4">{t('title')}</h1>
          <p className="text-text-secondary">{t('description')}</p>
        </section>

        {/* 留言区 */}
        <CommentSection isGuestbook locale={locale} />
      </div>
    </main>
  );
}

