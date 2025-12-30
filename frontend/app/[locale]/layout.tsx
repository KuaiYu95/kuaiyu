import '@/app/globals.css';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { locales } from '@/i18n';
import { DEFAULT_CONFIG } from '@/lib/config';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

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
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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

  // 启用静态渲染
  setRequestLocale(locale);

  // 获取消息
  const messages = await getMessages();

  // 使用写死的配置
  const config = DEFAULT_CONFIG;

  return (
    <html lang={locale} className="dark" style={{ backgroundColor: '#0a0a0a' }}>
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary" style={{ backgroundColor: '#0a0a0a' }}>
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} config={config} />
          <main className="flex-1 py-16" style={{ backgroundColor: '#0a0a0a' }}>
            {children}
          </main>
          <Footer config={config} locale={locale} />
          <ScrollToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// 生成静态参数
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

