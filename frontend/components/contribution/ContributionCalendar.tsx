'use client';

import { ContributionDay, ContributionItem, contributionApi } from '@/lib/api';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ContributionCalendarProps {
  type: 'post' | 'life' | 'all';
  locale: string;
  className?: string;
}

export default function ContributionCalendar({
  type,
  locale,
  className = '',
}: ContributionCalendarProps) {
  const t = useTranslations('contribution');
  const [data, setData] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null);
  const [selectedElementRect, setSelectedElementRect] = useState<DOMRect | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ day: ContributionDay | null; date: string | null; x: number; y: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [squareSize, setSquareSize] = useState(12);

  // 计算最近365天的日期范围
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    startDate.setHours(0, 0, 0, 0);
    return { startDate, today, currentYear: today.getFullYear(), startYear: startDate.getFullYear() };
  }, []);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const years = dateRange.startYear === dateRange.currentYear
          ? [dateRange.currentYear]
          : [dateRange.startYear, dateRange.currentYear];

        const results = await Promise.all(
          years.map(year => contributionApi.getCalendar({ type, year }))
        );

        const allDays = results.flatMap(res => res.data?.days || []);
        const filtered = allDays
          .filter(day => {
            const dayDate = new Date(day.date);
            return dayDate >= dateRange.startDate && dayDate <= dateRange.today;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setData(filtered);
      } catch (error) {
        console.error('Failed to fetch contribution data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, dateRange]);

  // 计算方块大小
  useEffect(() => {
    const calculateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const weeks = 53;
      const gap = 4;
      setSquareSize(Math.max(8, (width - (weeks - 1) * gap) / weeks));
    };
    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [data]);

  // 生成365天的数据
  const days = useMemo(() => {
    const dataMap = new Map(data.map(d => [d.date, d]));
    const result: { date: Date; contribution: ContributionDay | null }[] = [];
    const current = new Date(dateRange.startDate);

    while (current <= dateRange.today) {
      const dateKey = current.toISOString().split('T')[0];
      result.push({
        date: new Date(current),
        contribution: dataMap.get(dateKey) || null,
      });
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [data, dateRange]);

  // 生成周数组
  const weeks = useMemo(() => {
    if (days.length === 0) return [];
    const result: typeof days[] = [];
    const firstDayOfWeek = days[0].date.getDay();
    const paddedDays = [
      ...Array(firstDayOfWeek).fill(null).map(() => ({ date: new Date(0), contribution: null })),
      ...days,
    ];

    for (let i = 0; i < paddedDays.length; i += 7) {
      const week = paddedDays.slice(i, i + 7);
      while (week.length < 7) {
        week.push({ date: new Date(0), contribution: null });
      }
      result.push(week);
    }
    return result;
  }, [days]);

  // 获取样式
  const getStyle = (day: ContributionDay | null): React.CSSProperties => {
    if (!day || day.count === 0) return { backgroundColor: '#1a1a1a' };

    const opacity = 0.2 + Math.min(day.count, 4) * 0.05;
    const colors = {
      post: `rgba(37, 99, 235, ${opacity})`,
      life: `rgba(147, 51, 234, ${opacity})`,
      both: `linear-gradient(135deg, rgba(37, 99, 235, ${opacity}) 0%, rgba(147, 51, 234, ${opacity}) 100%)`,
    };

    if (type === 'all' && day.type === 'both') {
      return { background: colors.both };
    }
    const color = type === 'all' ? colors[day.type as keyof typeof colors] : colors[type];
    return { backgroundColor: color || colors.post };
  };

  // 生成链接
  const getLink = (item: ContributionItem) => {
    if (item.type === 'post' && item.slug) return `/${locale}/blog/${item.slug}`;
    if (item.type === 'life') return `/${locale}/life/${item.id}`;
    return '#';
  };

  // 处理鼠标事件
  const handleMouseEnter = (e: React.MouseEvent, day: ContributionDay | null, dateStr: string | null) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverInfo({
      day: day && day.count > 0 ? day : null,
      date: dateStr,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  };

  const handleMouseLeave = () => setHoverInfo(null);

  const handleClick = (e: React.MouseEvent, day: ContributionDay | null) => {
    if (day && day.count > 0) {
      setSelectedDay(day);
      setSelectedElementRect(e.currentTarget.getBoundingClientRect());
    } else {
      setSelectedDay(null);
      setSelectedElementRect(null);
    }
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSelectedDay(null);
        setSelectedElementRect(null);
      }
    };
    if (selectedDay) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedDay]);

  // Popover 位置
  const popoverPos = useMemo(() => {
    if (!selectedDay || !selectedElementRect) return { top: 0, left: 0 };

    const popoverWidth = 320;
    const popoverHeight = 300;
    const spacing = 8;

    let left = selectedElementRect.left;
    let top = selectedElementRect.bottom + spacing;

    // 如果右侧超出，调整到左侧
    if (left + popoverWidth > window.innerWidth) {
      left = selectedElementRect.right - popoverWidth;
    }

    // 如果下方超出，显示在上方
    if (top + popoverHeight > window.innerHeight) {
      top = selectedElementRect.top - popoverHeight - spacing;
    }

    // 确保不超出视窗边界
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - popoverHeight - 8));

    return { top, left };
  }, [selectedDay, selectedElementRect]);

  if (loading || days.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-text-secondary">加载中...</div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div className="flex gap-1 w-full pb-4">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
            {week.map((day, dayIndex) => {
              const isEmpty = day.date.getTime() === 0;
              const dateStr = isEmpty ? null : day.date.toISOString().split('T')[0];
              const isSelected = selectedDay?.date === day.contribution?.date;

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`rounded-sm transition-all duration-200 ${isEmpty ? 'opacity-0' : (day.contribution && day.contribution.count > 0) ? 'hover:opacity-80 cursor-pointer' : 'hover:opacity-80'
                    }`}
                  style={{
                    ...(isEmpty ? {} : getStyle(day.contribution)),
                    width: `${squareSize}px`,
                    height: `${squareSize}px`,
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, day.contribution, dateStr)}
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => handleClick(e, day.contribution)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Hover 提示 */}
      {!selectedDay && hoverInfo && (hoverInfo.day || hoverInfo.date) && (
        <div
          className="fixed z-40 bg-bg-secondary border border-border rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none w-[140px]"
          style={{
            left: `${Math.max(8, Math.min(hoverInfo.x - 70, window.innerWidth - 148))}px`,
            top: `${hoverInfo.y}px`,
          }}
        >
          {hoverInfo.day ? (
            <>
              <div className="text-text-accent font-medium mb-1">{hoverInfo.day.date}</div>
              <div className="space-y-0.5">
                {type === 'all' && (
                  <>
                    {hoverInfo.day.posts.length > 0 && (
                      <div className="text-primary-400">{t('posts')} ({hoverInfo.day.posts.length})</div>
                    )}
                    {hoverInfo.day.life_records.length > 0 && (
                      <div className="text-primary-400">{t('lifeRecords')} ({hoverInfo.day.life_records.length})</div>
                    )}
                  </>
                )}
                {type === 'post' && hoverInfo.day.posts.length > 0 && (
                  <div className="text-primary-400">{t('posts')} ({hoverInfo.day.posts.length})</div>
                )}
                {type === 'life' && hoverInfo.day.life_records.length > 0 && (
                  <div className="text-primary-400">{t('lifeRecords')} ({hoverInfo.day.life_records.length})</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-text-accent font-medium">{hoverInfo.date}</div>
          )}
        </div>
      )}

      {/* 选中详情弹窗 */}
      {selectedDay && selectedDay.count > 0 && (
        <div
          ref={popoverRef}
          className="fixed z-50 bg-bg-secondary border border-border rounded-lg shadow-xl p-4 min-w-[280px] max-w-[400px]"
          style={{ left: `${popoverPos.left}px`, top: `${popoverPos.top}px` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-text-accent">
              {selectedDay.date} · {selectedDay.count} {t('records')}
            </div>
            <button
              onClick={() => {
                setSelectedDay(null);
                setSelectedElementRect(null);
              }}
              className="text-text-secondary hover:text-text-accent transition-colors"
              aria-label={t('close')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {selectedDay.posts.length > 0 && (
              <div>
                {type === 'all' && <div className="text-xs text-primary-400 mb-1 font-medium">{t('posts')}</div>}
                {selectedDay.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={getLink(post)}
                    className="block text-xs text-text-secondary hover:text-primary-400 py-1 px-2 rounded hover:bg-dark-700 transition-colors"
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedElementRect(null);
                    }}
                  >
                    {post.title}
                  </Link>
                ))}
              </div>
            )}
            {selectedDay.life_records.length > 0 && (
              <div>
                {type === 'all' && (
                  <div className={`text-xs text-primary-400 mb-1 font-medium ${selectedDay.posts.length > 0 ? 'mt-2' : ''}`}>
                    {t('lifeRecords')}
                  </div>
                )}
                {selectedDay.life_records.map((life) => (
                  <Link
                    key={life.id}
                    href={getLink(life)}
                    className="block text-xs text-text-secondary hover:text-accent-primary py-1 px-2 rounded hover:bg-dark-700 transition-colors"
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedElementRect(null);
                    }}
                  >
                    {life.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
