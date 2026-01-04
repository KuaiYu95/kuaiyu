import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 颜色配置 - 极简暗黑风格
      colors: {
        // 背景色
        bg: {
          primary: '#141414',
          secondary: '#1f1f1f',
          hover: '#252525',
        },
        // 文字色
        text: {
          primary: '#e5e5e5',
          secondary: '#a0a0a0',
          accent: '#ffffff',
          link: '#60a5fa',
        },
        // 强调色
        accent: {
          primary: '#60a5fa',
          secondary: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
        // 边框色
        border: {
          DEFAULT: '#2a2a2a',
          hover: '#3a3a3a',
        },
      },
      // 字体
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      // 最大宽度
      maxWidth: {
        content: '800px',
      },
      // 动画
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

