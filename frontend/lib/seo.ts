// ===========================================
// SEO 工具函数
// 生成 Meta 标签和结构化数据
// ===========================================

import { Metadata } from 'next';
import { LifeRecord, Post } from './api';
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './constants';

// ===========================================
// Metadata 生成
// ===========================================

interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

/**
 * 生成页面 Metadata
 */
export function generateMetadata(params: PageMetadata): Metadata {
  const {
    title,
    description = SITE_DESCRIPTION,
    keywords = [],
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author = SITE_AUTHOR,
    noindex = false,
  } = params;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const ogImage = image || `${SITE_URL}/og-image.png`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
      locale: 'zh_CN',
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        'zh-CN': `${SITE_URL}/zh${url || ''}`,
        'en-US': `${SITE_URL}/en${url || ''}`,
      },
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

/**
 * 生成文章 Metadata
 */
export function generatePostMetadata(post: Post, locale: string = 'zh'): Metadata {
  return generateMetadata({
    title: post.title,
    description: post.excerpt,
    keywords: post.tags?.map((tag) => tag.name) || [],
    image: post.cover_image,
    url: `/${locale}/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.published_at || undefined,
    modifiedTime: post.created_at,
  });
}

/**
 * 生成生活记录 Metadata
 */
export function generateLifeMetadata(record: LifeRecord, locale: string = 'zh'): Metadata {
  return generateMetadata({
    title: record.title,
    description: record.content.slice(0, 160),
    image: record.cover_image,
    url: `/${locale}/life/${record.id}`,
    type: 'article',
    publishedTime: record.published_at || undefined,
  });
}

// ===========================================
// JSON-LD 结构化数据
// ===========================================

/**
 * 生成网站 JSON-LD
 */
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
    },
  };
}

/**
 * 生成文章 JSON-LD
 */
export function generateArticleJsonLd(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image,
    datePublished: post.published_at,
    dateModified: post.created_at,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

/**
 * 生成面包屑 JSON-LD
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * 生成博客 JSON-LD
 */
export function generateBlogJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
    },
  };
}

