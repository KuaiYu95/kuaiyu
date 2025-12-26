import { Card, Empty, Tag } from '@/components/ui';
import { commentApi, configApi, lifeApi, postApi, tagApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
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

  // 并行获取数据
  const [configRes, postsRes, lifeRes, tagsRes, commentsRes] = await Promise.allSettled([
    configApi.get(),
    postApi.recent(),
    lifeApi.list({ limit: 3 }),
    tagApi.list(),
    commentApi.list({}),
  ]);

  const config = configRes.status === 'fulfilled' ? configRes.value.data : null;
  const posts = postsRes.status === 'fulfilled' ? postsRes.value.data : [];
  const lifeRecords = lifeRes.status === 'fulfilled' ? lifeRes.value.data.items : [];
  const tags = tagsRes.status === 'fulfilled' ? tagsRes.value.data : [];
  const comments = commentsRes.status === 'fulfilled' ? commentsRes.value.data.slice(0, 5) : [];

  return (
    <div className="container-content py-12 space-y-16">
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-accent">{t('recentPosts')}</h2>
          <Link
            href={`/${locale}${ROUTES.BLOG}`}
            className="text-sm text-accent-primary hover:underline"
          >
            {tBlog('title')} →
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/${locale}${ROUTES.BLOG_DETAIL(post.slug)}`}>
                <Card className="flex gap-4 p-4">
                  {post.cover_image && (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-text-accent mb-1 truncate">
                      {post.title}
                    </h3>
                    <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span>{formatDate(post.published_at || post.created_at, locale)}</span>
                      <span>·</span>
                      <span>{post.view_count} {tBlog('views')}</span>
                      {post.tags && post.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <div className="flex gap-1">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Tag key={tag.id} size="sm">{tag.name}</Tag>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Empty title={tBlog('noPost')} />
        )}
      </section>

      {/* 近期生活 */}
      <section className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-accent">{t('recentLife')}</h2>
          <Link
            href={`/${locale}${ROUTES.LIFE}`}
            className="text-sm text-accent-primary hover:underline"
          >
            查看更多 →
          </Link>
        </div>

        {lifeRecords.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {lifeRecords.map((record) => (
              <Card key={record.id} className="p-4">
                {record.cover_image && (
                  <div className="relative aspect-video mb-3 -mx-4 -mt-4">
                    <Image
                      src={record.cover_image}
                      alt={record.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <h3 className="font-medium text-text-accent mb-2">{record.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-3">
                  {record.content}
                </p>
                <p className="text-xs text-text-secondary mt-2">
                  {formatDate(record.published_at || record.created_at, locale)}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Empty title="暂无生活记录" />
        )}
      </section>

      {/* 标签云 */}
      <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl font-bold text-text-accent mb-6">{t('tagCloud')}</h2>

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
      <section className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-accent">{t('recentComments')}</h2>
          <Link
            href={`/${locale}${ROUTES.GUESTBOOK}`}
            className="text-sm text-accent-primary hover:underline"
          >
            查看更多 →
          </Link>
        </div>

        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-white font-medium">
                    {comment.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-text-accent">{comment.nickname}</span>
                      {comment.website && (
                        <a
                          href={comment.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent-primary"
                        >
                          🔗
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">{comment.content}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {formatDate(comment.created_at, locale)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty title={tComment('noComment')} />
        )}
      </section>
    </div>
  );
}

