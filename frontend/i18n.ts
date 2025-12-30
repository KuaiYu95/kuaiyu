import { getRequestConfig } from 'next-intl/server';

export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh';

export default getRequestConfig(async ({ requestLocale }) => {
  // 使用 await requestLocale 获取 locale（next-intl 3.22+）
  let locale = await requestLocale;

  // 如果 requestLocale 不可用，回退到默认 locale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

