// ===========================================
// 博客统计卡片组件
// ===========================================

import { ArticleIcon, ContactsIcon, LabelIcon, PhotoCameraIcon, TrendingUpIcon, VisibilityIcon } from '@/components/icons';
import type { Overview } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StatCard, { type StatCardProps } from './StatCard';

interface BlogCardsProps {
  overview: Overview | null;
  calculateTrend: (current: number, average: number) => number;
}

export default function BlogCards({ overview, calculateTrend }: BlogCardsProps) {
  const navigate = useNavigate();

  const blogCards: StatCardProps[] = [
    {
      label: '总访问量',
      value: overview?.total_pv || 0,
      icon: <VisibilityIcon />,
      color: '#3b82f6',
      gradient: { start: '#60a5fa', end: '#2563eb' },
      trend: calculateTrend(overview?.today_pv || 0, overview?.avg_pv_30_days || 0),
      onClick: undefined,
    },
    {
      label: '文章数',
      value: overview?.post_count || 0,
      icon: <ArticleIcon />,
      color: '#8b5cf6',
      gradient: { start: '#a78bfa', end: '#7c3aed' },
      trend: 0,
      onClick: () => navigate(ROUTES.POSTS),
    },
    {
      label: '生活记录',
      value: overview?.life_count || 0,
      icon: <PhotoCameraIcon />,
      color: '#06b6d4',
      gradient: { start: '#22d3ee', end: '#0891b2' },
      trend: 0,
      onClick: () => navigate(ROUTES.LIFE),
    },
    {
      label: '总访客数',
      value: overview?.total_uv || 0,
      icon: <ContactsIcon />,
      color: '#6366f1',
      gradient: { start: '#818cf8', end: '#4f46e5' },
      trend: calculateTrend(overview?.today_uv || 0, overview?.avg_uv_30_days || 0),
      onClick: undefined,
    },
    {
      label: '评论数',
      value: overview?.comment_count || 0,
      icon: <TrendingUpIcon />,
      color: '#ec4899',
      gradient: { start: '#f472b6', end: '#db2777' },
      trend: 0,
      onClick: () => navigate(ROUTES.COMMENTS),
    },
    {
      label: '标签数',
      value: overview?.tag_count || 0,
      icon: <LabelIcon />,
      color: '#7c3aed',
      gradient: { start: '#9333ea', end: '#6d28d9' },
      trend: 0,
      onClick: () => navigate(ROUTES.TAGS),
    },
  ];

  return (
    <Grid container spacing={2} mb={2}>
      {blogCards.map((card, index) => {
        const isTotalPV = card.label === '总访问量'; // 
        const isTotalUV = card.label === '总访客数';
        let mobileOrder = index;
        if (isTotalPV) {
          mobileOrder = 0;
        } else if (isTotalUV) {
          mobileOrder = 1;
        } else if (index < 3) {
          mobileOrder = index + 2;
        } else {
          mobileOrder = index + 2;
        }

        return (
          <Grid
            item
            xs={6}
            md={4}
            key={card.label}
            sx={{
              order: { xs: mobileOrder, md: index }
            }}
          >
            <StatCard {...card} />
          </Grid>
        );
      })}
    </Grid>
  );
}

