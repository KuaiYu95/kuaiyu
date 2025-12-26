const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化配置
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cos.*.myqcloud.com',
      },
    ],
  },
  // 严格模式
  reactStrictMode: true,
  // 输出配置
  output: 'standalone',
};

module.exports = withNextIntl(nextConfig);

