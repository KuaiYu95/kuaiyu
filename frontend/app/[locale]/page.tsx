import BlogPostItem from '@/components/post/BlogPostItem';
import { Empty, RelativeTime, Tag } from '@/components/ui';
import { commentApi, configApi, lifeApi, postApi, tagApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

// ===========================================
// 首页
// ===========================================

export const metadata: Metadata = {
  title: '首页',
};

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const t = await getTranslations('home');
  const tBlog = await getTranslations('blog');
  const tComment = await getTranslations('comment');
  const tLife = await getTranslations('life');
  const tGuestbook = await getTranslations('guestbook');
  // 并行获取数据
  const [configRes, postsRes, lifeRes, tagsRes, commentsRes] = await Promise.allSettled([
    configApi.get(),
    postApi.recent(),
    lifeApi.list({ limit: 3 }),
    tagApi.list(),
    commentApi.list({ comment_type: 'guestbook' }), // 只获取留言板的评论
  ]);

  const config = configRes.status === 'fulfilled' ? configRes.value.data : null;
  const posts = postsRes.status === 'fulfilled' ? postsRes.value.data : [];
  const lifeRecords = lifeRes.status === 'fulfilled' ? lifeRes.value.data.items : [];
  const tags = tagsRes.status === 'fulfilled' ? tagsRes.value.data : [];
  const comments = commentsRes.status === 'fulfilled' ? commentsRes.value.data.slice(0, 5) : [];

  return (
    <div className="container-content pt-12 pb-0 space-y-16">
      {/* 首屏区域 */}
      <section className="text-center py-12 animate-fade-up">
        {config?.home_avatar && (
          <div className="relative w-28 h-28 mx-auto mb-6">
            <Image
              src={config.home_avatar}
              alt={config.home_nickname || '头像'}
              fill
              className="object-cover rounded-full ring-4 ring-border hover:ring-accent-primary transition-all duration-300 hover:scale-105"
              priority
            />
          </div>
        )}
        <h1 className="text-3xl font-bold text-text-accent mb-4">
          {config?.home_nickname || 'Yu.kuai'}
        </h1>
        {config?.home_about && (
          <div
            className="max-w-lg mx-auto text-text-secondary markdown-content"
            dangerouslySetInnerHTML={{ __html: config.home_about }}
          />
        )}
      </section>

      {/* 近期博客 */}
      <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-6 relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-text-accent rounded-full"></div>
          <h2 className="text-xl font-bold text-text-accent">{t('recentPosts')}</h2>
          <Link
            href={`/${locale}${ROUTES.BLOG}`}
            className="text-sm text-accent-primary hover:underline"
          >
            {tBlog('title')} →
          </Link>
        </div>

        {posts.length > 0 ? (
          <div>
            {posts.map((post, index) => (
              <BlogPostItem
                key={post.id}
                post={post}
                locale={locale}
                href={`/${locale}${ROUTES.BLOG_DETAIL(post.slug)}`}
                showIndex={index}
                viewsText={tBlog('views')}
                RelativeTime={RelativeTime}
              />
            ))}
          </div>
        ) : (
          <Empty title={tBlog('noPost')} />
        )}
      </section>

      {/* 近期生活 */}
      <section className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-6 relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-text-accent rounded-full"></div>
          <h2 className="text-xl font-bold text-text-accent">{t('recentLife')}</h2>
          <Link
            href={`/${locale}${ROUTES.LIFE}`}
            className="text-sm text-accent-primary hover:underline"
          >
            {tLife('title')} →
          </Link>
        </div>

        {lifeRecords.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {lifeRecords.map((record) => (
              <Link key={record.id} href={`/${locale}/life/${record.id}`} className="group block">
                {record.cover_image && (
                  <div className="relative aspect-video overflow-hidden rounded-lg mb-3">
                    <Image
                      src={record.cover_image}
                      alt={record.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-text-accent mb-3 group-hover:text-primary-400 transition-colors line-clamp-1">
                    {record.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed mb-4">
                    {record.content}
                  </p>
                  <p className="text-xs text-text-secondary">
                    <RelativeTime date={record.published_at || record.created_at} locale={locale} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty title="暂无生活记录" />
        )}
      </section>

      {/* 标签云 */}
      <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="relative mb-6">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-text-accent rounded-full"></div>
          <h2 className="text-xl font-bold text-text-accent">{t('tagCloud')}</h2>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tag
                key={tag.id}
                href={`/${locale}/blog?tag=${tag.slug}`}
                color={tag.color}
                size="md"
              >
                {tag.name}
                {tag.post_count !== undefined && (
                  <span className="ml-1 opacity-60">({tag.post_count})</span>
                )}
              </Tag>
            ))}
          </div>
        ) : (
          <Empty title="暂无标签" />
        )}
      </section>

      {/* 近期留言 */}
      <section className="animate-fade-up pb-12" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6 relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-text-accent rounded-full"></div>
          <h2 className="text-xl font-bold text-text-accent">{t('recentComments')}</h2>
          <Link
            href={`/${locale}${ROUTES.GUESTBOOK}`}
            className="text-sm text-accent-primary hover:underline"
          >
            {tGuestbook('title')} →
          </Link>
        </div>

        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="pb-4 border-b border-border/50 last:border-0">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-md">
                    {comment.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-text-accent">{comment.nickname}</span>
                      {comment.website && (
                        <a
                          href={comment.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent-primary hover:underline"
                        >
                          🔗
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-2">
                      {comment.content}
                    </p>
                    <p className="text-xs text-text-secondary">
                      <RelativeTime date={comment.created_at} locale={locale} />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty title={tComment('noComment')} />
        )}
      </section>
    </div>
  );
}
