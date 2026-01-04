// ===========================================
// 博客文章列表项组件
// ===========================================

'use client';

import { Tag } from '@/components/ui';
import SafeImage from '@/components/ui/SafeImage';
import { Post } from '@/lib/api';
import Link from 'next/link';
import PostMeta from './PostMeta';

interface BlogPostItemProps {
  post: Post;
  locale: string;
  href: string;
  showIndex?: number;
  viewsText: string;
}

export default function BlogPostItem({
  post,
  locale,
  href,
  showIndex,
  viewsText,
}: BlogPostItemProps) {
  return (
    <div>
      {showIndex !== undefined && showIndex > 0 && (
        <div className="h-px border-t border-dashed border-border/50 my-2"></div>
      )}
      <Link href={href} className="block">
        <div className="group py-2 px-4 -mx-4 rounded-lg bg-bg-secondary/0 hover:bg-bg-secondary/30 transition-all duration-300">
          <div className="flex gap-6">
            {post.cover_image && (
              <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                <SafeImage
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  sizes="128px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-text-accent mb-2 group-hover:text-primary-400 transition-colors line-clamp-1">
                {post.title}
              </h3>
              <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <PostMeta
                  date={post.published_at || post.created_at}
                  viewCount={post.view_count}
                  viewsText={viewsText}
                  locale={locale}
                />
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Tag key={tag.id} color={tag.color} size="sm">
                        {tag.name}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

