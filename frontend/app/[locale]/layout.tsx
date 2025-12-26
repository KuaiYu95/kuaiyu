import { ReactNode } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { configApi } from '@/lib/api';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import '@/app/globals.css';

// ===========================================
// 根布局
// ===========================================

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // 验证语言
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 获取消息
  const messages = await getMessages();

  // 获取配置
  let config = null;
  try {
    const res = await configApi.get();
    config = res.data;
  } catch {
    // 使用默认配置
  }

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer config={config} locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// 生成静态参数
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

