'use client';

import { ContributionDay, ContributionItem, contributionApi } from '@/lib/api';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface ContributionCalendarProps {
  type: 'post' | 'life' | 'all';
  year?: number;
  locale: string;
  className?: string;
}

export default function ContributionCalendar({
  type,
  year,
  locale,
  className = '',
}: ContributionCalendarProps) {
  const t = useTranslations('contribution');
  const [data, setData] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLDivElement | null>(null);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [squareSize, setSquareSize] = useState(12);

  useEffect(() => {
    fetchData();
  }, [type, year]);

  useEffect(() => {
    const calculateSquareSize = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const weeksCount = 53;
      const gap = 4;
      const totalGaps = weeksCount - 1;

      const availableWidth = containerWidth - totalGaps * gap;
      const calculatedSize = availableWidth / weeksCount;

      const size = Math.max(8, calculatedSize);
      setSquareSize(size);
    };
    const timer = setTimeout(calculateSquareSize, 0);
    calculateSquareSize();
    window.addEventListener('resize', calculateSquareSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateSquareSize);
    };
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await contributionApi.getCalendar({
        type,
        year: year || new Date().getFullYear(),
      });
      setData(res.data?.days || []);
    } catch (error) {
      console.error('Failed to fetch contribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateYearDays = (targetYear: number) => {
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);
    const days: { date: Date; contribution: ContributionDay | null }[] = [];

    const dataMap = new Map<string, ContributionDay>();
    data.forEach((day) => {
      dataMap.set(day.date, day);
    });

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      days.push({
        date: new Date(currentDate),
        contribution: dataMap.get(dateKey) || null,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const getDayStyle = (day: ContributionDay | null): React.CSSProperties => {
    if (!day || day.count === 0) {
      return { backgroundColor: '#1a1a1a' };
    }

    const intensity = Math.min(day.count, 4);
    const opacity = 0.6 + intensity * 0.1;

    if (type === 'all') {
      if (day.type === 'both') {
        return {
          background: `linear-gradient(135deg, rgba(59, 130, 246, ${opacity}) 0%, rgba(168, 85, 247, ${opacity}) 100%)`,
        };
      } else if (day.type === 'post') {
        return {
          backgroundColor: `rgba(59, 130, 246, ${opacity})`,
        };
      } else if (day.type === 'life') {
        return {
          backgroundColor: `rgba(168, 85, 247, ${opacity})`,
        };
      }
    } else if (type === 'post') {
      return {
        backgroundColor: `rgba(59, 130, 246, ${opacity})`,
      };
    } else if (type === 'life') {
      return {
        backgroundColor: `rgba(168, 85, 247, ${opacity})`,
      };
    }

    return { backgroundColor: '#1a1a1a' };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, day: ContributionDay | null, dateStr: string | null) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8
    });

    if (day && day.count > 0) {
      setHoveredDay(day);
      setHoveredDate(null);
    } else if (dateStr) {
      setHoveredDay(null);
      setHoveredDate(dateStr);
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
    setHoveredDate(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, day: ContributionDay | null) => {
    if (day && day.count > 0) {
      e.stopPropagation();
      setSelectedDay(day);
      setSelectedElement(e.currentTarget);
      setHoveredDay(null);
    } else {
      setSelectedDay(null);
      setSelectedElement(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        selectedElement &&
        !selectedElement.contains(event.target as Node)
      ) {
        setSelectedDay(null);
        setSelectedElement(null);
      }
    };

    if (selectedDay) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedDay, selectedElement]);

  const generateLink = (item: ContributionItem) => {
    if (item.type === 'post' && item.slug) {
      return `/${locale}/blog/${item.slug}`;
    } else if (item.type === 'life') {
      return `/${locale}/life/${item.id}`;
    }
    return '#';
  };

  const targetYear = year || new Date().getFullYear();
  const yearDays = generateYearDays(targetYear);

  const weeks: { date: Date; contribution: ContributionDay | null }[][] = [];
  let currentWeek: { date: Date; contribution: ContributionDay | null }[] = [];

  const firstDay = yearDays[0].date;
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: new Date(0), contribution: null });
  }

  yearDays.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: new Date(0), contribution: null });
    }
    weeks.push(currentWeek);
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-text-secondary">加载中...</div>
      </div>
    );
  }

  const getPopoverPosition = () => {
    if (!selectedElement) return { top: 0, left: 0 };

    const rect = selectedElement.getBoundingClientRect();
    const popoverWidth = 320;
    const popoverHeight = 300;
    const spacing = 8;

    let top = rect.bottom + spacing;
    let left = rect.left;

    if (left + popoverWidth > window.innerWidth) {
      left = rect.right - popoverWidth;
    }

    if (top + popoverHeight > window.innerHeight) {
      top = rect.top - popoverHeight - spacing;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - popoverHeight - 8));

    return { top, left };
  };

  const popoverPosition = selectedDay ? getPopoverPosition() : { top: 0, left: 0 };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div className="flex gap-1 w-full pb-4">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
            {week.map((day, dayIndex) => {
              const isEmpty = day.date.getTime() === 0;
              const style = getDayStyle(day.contribution);
              const isSelected = selectedDay?.date === day.contribution?.date;
              const dateStr = isEmpty ? null : day.date.toISOString().split('T')[0];

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  ref={(el) => {
                    if (isSelected && el) {
                      setSelectedElement(el);
                    }
                  }}
                  className={`rounded-sm transition-all duration-200 ${isEmpty ? 'opacity-0' : ''
                    } ${day.contribution && day.contribution.count > 0
                      ? 'hover:opacity-80 cursor-pointer'
                      : !isEmpty
                        ? 'hover:opacity-80'
                        : ''
                    }`}
                  style={{
                    ...(isEmpty ? {} : style),
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

      {!selectedDay && (hoveredDay || hoveredDate) && (
        <div
          className="fixed z-40 bg-bg-secondary border border-border rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none w-[140px]"
          style={{
            left: `${Math.max(8, Math.min(hoverPosition.x - 70, window.innerWidth - 148))}px`,
            top: `${hoverPosition.y}px`,
          }}
        >
          {hoveredDay && hoveredDay.count > 0 ? (
            <>
              <div className="text-text-accent font-medium mb-1">{hoveredDay.date}</div>
              <div className="space-y-0.5">
                {type === 'all' && (
                  <>
                    {hoveredDay.posts.length > 0 && (
                      <div className="text-primary-400">
                        {t('posts')} ({hoveredDay.posts.length})
                      </div>
                    )}
                    {hoveredDay.life_records.length > 0 && (
                      <div className="text-primary-400">
                        {t('lifeRecords')} ({hoveredDay.life_records.length})
                      </div>
                    )}
                  </>
                )}
                {type === 'post' && hoveredDay.posts.length > 0 && (
                  <div className="text-primary-400">
                    {t('posts')} ({hoveredDay.posts.length})
                  </div>
                )}
                {type === 'life' && hoveredDay.life_records.length > 0 && (
                  <div className="text-primary-400">
                    {t('lifeRecords')} ({hoveredDay.life_records.length})
                  </div>
                )}
              </div>
            </>
          ) : hoveredDate ? (
            <div className="text-text-accent font-medium">{hoveredDate}</div>
          ) : null}
        </div>
      )}

      {selectedDay && selectedDay.count > 0 && (
        <div
          ref={popoverRef}
          className="fixed z-50 bg-bg-secondary border border-border rounded-lg shadow-xl p-4 min-w-[280px] max-w-[400px]"
          style={{
            left: `${popoverPosition.left}px`,
            top: `${popoverPosition.top}px`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-text-accent">
              {selectedDay.date} · {selectedDay.count} {t('records')}
            </div>
            <button
              onClick={() => {
                setSelectedDay(null);
                setSelectedElement(null);
              }}
              className="text-text-secondary hover:text-text-accent transition-colors"
              aria-label={t('close')}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {selectedDay.posts.length > 0 && (
              <div>
                {type === 'all' && (
                  <div className="text-xs text-primary-400 mb-1 font-medium">
                    {t('posts')}
                  </div>
                )}
                {selectedDay.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={generateLink(post)}
                    className="block text-xs text-text-secondary hover:text-primary-400 py-1 px-2 rounded hover:bg-dark-700 transition-colors"
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedElement(null);
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
                    href={generateLink(life)}
                    className="block text-xs text-text-secondary hover:text-accent-primary py-1 px-2 rounded hover:bg-dark-700 transition-colors"
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedElement(null);
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

