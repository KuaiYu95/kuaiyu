const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化配置
  images: {
    domains: ['localhost'],
    remotePatterns: [
      // 腾讯云 COS - 支持所有地域
      {
        protocol: 'https',
        hostname: '*.cos.ap-shanghai.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '*.cos.ap-guangzhou.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '*.cos.ap-beijing.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '*.cos.ap-chengdu.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '*.cos.ap-chongqing.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '*.cos.ap-nanjing.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '*.cos.ap-singapore.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '*.cos.ap-hongkong.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '*.cos.na-siliconvalley.myqcloud.com',
      },
      {
        protocol: 'https',
        hostname: '*.cos.na-ashburn.myqcloud.com',
      },
    ],
    // 图片优化配置
    formats: ['image/avif', 'image/webp'],
    // 如果优化失败，允许回退到原始图片
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // 严格模式
  reactStrictMode: true,
  // 输出配置
  output: 'standalone',
};

module.exports = withNextIntl(nextConfig);

