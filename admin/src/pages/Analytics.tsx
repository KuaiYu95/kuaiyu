// ===========================================
// 统计分析页面
// ===========================================

import { analyticsApi, type Overview } from '@/lib/api';
import { Article, Person, TrendingUp, Visibility } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [visits, setVisits] = useState<{ date: string; pv: number; uv: number }[]>([]);
  const [popular, setPopular] = useState<{ id: number; title: string; view_count: number }[]>([]);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, visitsRes, popularRes] = await Promise.all([
          analyticsApi.overview(),
          analyticsApi.visits(),
          analyticsApi.popular(),
        ]);
        setOverview(overviewRes.data);
        setVisits(visitsRes.data);
        setPopular(popularRes.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    {
      label: '总访问量',
      value: overview?.total_pv || 0,
      subLabel: `今日 ${overview?.today_pv || 0}`,
      icon: <Visibility />,
      color: '#60a5fa',
    },
    {
      label: '总访客数',
      value: overview?.total_uv || 0,
      subLabel: `今日 ${overview?.today_uv || 0}`,
      icon: <Person />,
      color: '#34d399',
    },
    {
      label: '文章数',
      value: overview?.post_count || 0,
      subLabel: '博客 + 生活',
      icon: <Article />,
      color: '#a78bfa',
    },
    {
      label: '评论数',
      value: overview?.comment_count || 0,
      subLabel: '所有评论',
      icon: <TrendingUp />,
      color: '#f472b6',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        统计分析
      </Typography>

      {/* 数据卡片 */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper
              sx={{
                p: 3,
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
              elevation={0}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${card.color}20`,
                  color: card.color,
                }}
              >
                {card.icon}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {card.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.subLabel}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 访问趋势 */}
      <Paper sx={{ p: 3, mb: 4, border: 1, borderColor: 'divider' }} elevation={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            访问趋势
          </Typography>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, v) => v && setTimeRange(v)}
            size="small"
          >
            <ToggleButton value="7d">7天</ToggleButton>
            <ToggleButton value="30d">30天</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={visits}>
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="pv"
              name="访问量"
              stroke="#60a5fa"
              fillOpacity={1}
              fill="url(#colorPv)"
            />
            <Area
              type="monotone"
              dataKey="uv"
              name="访客数"
              stroke="#34d399"
              fillOpacity={1}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      {/* 热门文章 */}
      <Paper sx={{ p: 3, border: 1, borderColor: 'divider' }} elevation={0}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          热门文章
        </Typography>
        {popular.length > 0 ? (
          <Box>
            {popular.map((post, index) => (
              <Box
                key={post.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1.5,
                  borderBottom: index < popular.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: index < 3 ? 'primary.main' : 'grey.700',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    fontSize: 12,
                  }}
                >
                  {index + 1}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {post.view_count} 阅读
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">暂无数据</Typography>
        )}
      </Paper>
    </Box>
  );
}
