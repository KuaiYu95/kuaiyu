// ===========================================
// 留言板页
// ===========================================

import forumAnimation from '@/assets/icons/system-regular-192-forum-hover-forum.json';
import CommentSection from '@/components/comment/CommentSection';
import { Lottie } from '@/components/ui';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('guestbook');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function GuestbookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('guestbook');

  return (
    <div className="container-content py-12">
      {/* 页面标题 */}
      <section className="text-center py-12 animate-fade-up pb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Lottie
            animationData={forumAnimation}
            width={24}
            height={24}
            autoplay={true}
          />
          <h1 className="text-3xl font-bold text-text-accent">{t('title')}</h1>
        </div>
        <p className="text-text-secondary">{t('description')}</p>
      </section>

      {/* 留言区 */}
      <CommentSection isGuestbook locale={locale} />
    </div>
  );
}

