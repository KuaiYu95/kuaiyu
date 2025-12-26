// ===========================================
// 仪表盘页面
// ===========================================

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Skeleton,
} from '@mui/material';
import {
  Visibility,
  Article,
  PhotoCamera,
  Comment,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi, type Overview } from '@/lib/api';

// 颜色
const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [visits, setVisits] = useState<{ date: string; pv: number; uv: number }[]>([]);
  const [popular, setPopular] = useState<{ id: number; title: string; view_count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, visitsRes, popularRes] = await Promise.all([
          analyticsApi.overview(),
          analyticsApi.visits(),
          analyticsApi.popular(),
        ]);
        setOverview(overviewRes.data);
        setVisits(visitsRes.data || []);
        setPopular(popularRes.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 统计卡片
  const StatCard = ({
    icon,
    label,
    value,
    subValue,
    trend,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    subValue?: string;
    trend?: 'up' | 'down';
  }) => (
    <Paper sx={{ p: 3, border: 1, borderColor: 'divider' }} elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.main', color: 'white', mr: 2 }}>
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight="bold">
        {loading ? <Skeleton width={80} /> : value.toLocaleString()}
      </Typography>
      {subValue && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {trend === 'up' && <TrendingUp fontSize="small" color="success" />}
          {trend === 'down' && <TrendingDown fontSize="small" color="error" />}
          <Typography variant="caption" color="text.secondary" ml={0.5}>
            {subValue}
          </Typography>
        </Box>
      )}
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        仪表盘
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Visibility />}
            label="总访问量"
            value={overview?.total_pv || 0}
            subValue={`今日 ${overview?.today_pv || 0}`}
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Article />}
            label="文章数"
            value={overview?.post_count || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PhotoCamera />}
            label="生活记录"
            value={overview?.life_count || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Comment />}
            label="评论数"
            value={overview?.comment_count || 0}
          />
        </Grid>
      </Grid>

      {/* 图表 */}
      <Grid container spacing={3}>
        {/* 访问趋势 */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, border: 1, borderColor: 'divider' }} elevation={0}>
            <Typography variant="h6" mb={2}>
              访问趋势
            </Typography>
            <Box sx={{ height: 300 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visits}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="date" stroke="#a0a0a0" fontSize={12} />
                    <YAxis stroke="#a0a0a0" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pv"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={false}
                      name="PV"
                    />
                    <Line
                      type="monotone"
                      dataKey="uv"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={false}
                      name="UV"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* 热门文章 */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, border: 1, borderColor: 'divider', height: '100%' }} elevation={0}>
            <Typography variant="h6" mb={2}>
              热门文章
            </Typography>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={40} sx={{ mb: 1 }} />
              ))
            ) : (
              <Box>
                {popular.slice(0, 10).map((item, index) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < popular.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: index < 3 ? 'primary.main' : 'action.hover',
                        color: index < 3 ? 'primary.contrastText' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        mr: 2,
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.view_count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

