'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface OutlineItem {
  id: string;
  year: number;
  month: number;
  label: string;
  count: number;
}

interface ArchiveOutlineProps {
  items: OutlineItem[];
}

export default function ArchiveOutline({ items }: ArchiveOutlineProps) {
  const t = useTranslations('archive');
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // 偏移量，提前激活

      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始检查

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // 顶部偏移
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // 按年份分组
  const groupedByYear = items.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = [];
    }
    acc[item.year].push(item);
    return acc;
  }, {} as Record<number, OutlineItem[]>);

  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-20 w-full max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary-500/30 scrollbar-track-transparent hover:scrollbar-thumb-primary-500/50">
      <div className="bg-bg-secondary/50 backdrop-blur-sm border border-border/30 rounded-lg p-4 shadow-lg">
        <div className="text-xs font-semibold text-text-secondary mb-4 uppercase tracking-wider">
          {t('outline')}
        </div>
        <nav className="space-y-3">
          {sortedYears.map((year) => (
            <div key={year} className="mb-4 last:mb-0">
              <div className="text-sm font-semibold text-primary-400 mb-2 px-1">{year}</div>
              <div className="ml-2 space-y-0.5">
                {groupedByYear[year].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`relative flex items-center justify-between w-full text-left text-xs py-1.5 px-2 rounded transition-all duration-200 ${activeId === item.id
                      ? 'text-primary-400 bg-primary-500/20'
                      : 'text-text-secondary hover:text-text-accent hover:bg-bg-secondary/50'
                      }`}
                  >
                    {activeId === item.id && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-primary-500 rounded-full bg-text-accent" />
                    )}
                    <span>{item.label}</span>
                    <span className="text-text-secondary text-xs font-normal">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

