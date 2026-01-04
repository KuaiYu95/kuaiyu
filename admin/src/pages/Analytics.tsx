import { analyticsApi, type Overview, type PopularContentVO } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { ArrowUpward, Person, TrendingUp } from '@mui/icons-material';
import { ArticleIcon, LabelIcon, PhotoCameraIcon, VisibilityIcon } from '@/components/icons';
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const colors = {
  primary: '#667eea',
  secondary: '#34d399',
  accent: '#a78bfa',
  pink: '#f472b6',
  yellow: '#fbbf24',
  red: '#fb7185',
};

const gradientColors = [
  { start: '#667eea', end: '#764ba2' },
  { start: '#34d399', end: '#10b981' },
  { start: '#a78bfa', end: '#8b5cf6' },
  { start: '#f472b6', end: '#ec4899' },
];

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [visits, setVisits] = useState<{ date: string; pv: number; uv: number }[]>([]);
  const [popularPost, setPopularPost] = useState<PopularContentVO[]>([]);
  const [popularLife, setPopularLife] = useState<PopularContentVO[]>([]);

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
        setPopularPost(popularRes.data.posts);
        setPopularLife(popularRes.data.lifes);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const calculateTrend = (current: number, average: number) => {
    if (average === 0) return 0;
    return ((current - average) / average) * 100;
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}年前`;
    if (months > 0) return `${months}个月前`;
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  const statCards = [
    {
      label: '总访问量',
      value: overview?.total_pv || 0,
      todayValue: overview?.today_pv || 0,
      icon: <VisibilityIcon />,
      color: colors.primary,
      gradient: gradientColors[0],
      trend: calculateTrend(overview?.today_pv || 0, overview?.avg_pv_30_days || 0),
      onClick: undefined,
    },
    {
      label: '总访客数',
      value: overview?.total_uv || 0,
      todayValue: overview?.today_uv || 0,
      icon: <Person />,
      color: colors.secondary,
      gradient: gradientColors[1],
      trend: calculateTrend(overview?.today_uv || 0, overview?.avg_uv_30_days || 0),
      onClick: undefined,
    },
    {
      label: '文章数',
      value: overview?.post_count || 0,
      icon: <ArticleIcon />,
      color: colors.accent,
      gradient: gradientColors[2],
      trend: 0,
      onClick: () => navigate(ROUTES.POSTS),
    },
    {
      label: '生活记录',
      value: overview?.life_count || 0,
      icon: <PhotoCameraIcon />,
      color: colors.yellow,
      gradient: { start: '#fbbf24', end: '#f59e0b' },
      trend: 0,
      onClick: () => navigate(ROUTES.LIFE),
    },
    {
      label: '评论数',
      value: overview?.comment_count || 0,
      icon: <TrendingUp />,
      color: colors.pink,
      gradient: gradientColors[3],
      trend: 0,
      onClick: () => navigate(ROUTES.COMMENTS),
    },
    {
      label: '标签数',
      value: overview?.tag_count || 0,
      icon: <LabelIcon />,
      color: colors.accent,
      gradient: { start: '#8b5cf6', end: '#7c3aed' },
      trend: 0,
      onClick: () => navigate(ROUTES.TAGS),
    },
  ];

  const pieData = [
    { name: '博客文章', value: overview?.post_count || 0, color: colors.accent },
    { name: '生活记录', value: overview?.life_count || 0, color: colors.yellow },
    { name: '评论', value: overview?.comment_count || 0, color: colors.pink },
  ].filter((item) => item.value > 0);

  const maxPV = visits.length > 0 ? Math.max(...visits.map((v) => v.pv)) : 0;
  const maxUV = visits.length > 0 ? Math.max(...visits.map((v) => v.uv)) : 0;

  const pvDomain: [number, number] | undefined = maxPV > 0 ? [0, Math.ceil(maxPV * 1.2)] : undefined;
  const uvDomain: [number, number] | undefined = maxUV > 0 ? [0, Math.ceil(maxUV * 1.2)] : undefined;

  const todayPV = overview?.today_pv || 0;
  const todayUV = overview?.today_uv || 0;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Grid container spacing={2} mb={4}>
        {statCards.map((card) => (
          <Grid item xs={6} md={2} key={card.label}>
            <Paper
              onClick={card.onClick}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                background: `linear-gradient(135deg, ${card.gradient.start}15 0%, ${card.gradient.end}15 100%)`,
                border: `1px solid ${card.color}30`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: card.onClick ? 'pointer' : 'default',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0px 12px 24px ${card.color}40`,
                  borderColor: `${card.color}60`,
                },
              }}
              elevation={0}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -15,
                  right: -15,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${card.gradient.start}20 0%, ${card.gradient.end}20 100%)`,
                  opacity: 0.5,
                }}
              />
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${card.gradient.start} 0%, ${card.gradient.end} 100%)`,
                      color: 'white',
                      boxShadow: `0px 2px 8px ${card.color}50`,
                      flexShrink: 0,
                      '& svg': {
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      },
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    {card.todayValue !== undefined && (
                      <Typography
                        component="span"
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                          fontWeight: 500,
                          lineHeight: 1.2,
                        }}
                      >
                        {card.todayValue.toLocaleString()}/
                      </Typography>
                    )}
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        color: 'text.primary',
                        fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
                        lineHeight: 1.2,
                      }}
                    >
                      {card.value.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {card.label}
                  </Typography>
                  {card.trend !== 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.25,
                        color: card.trend > 0 ? colors.secondary : colors.red,
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        fontWeight: 600,
                      }}
                    >
                      <ArrowUpward
                        sx={{
                          fontSize: { xs: 10, sm: 12 },
                          transform: card.trend < 0 ? 'rotate(180deg)' : 'none',
                        }}
                      />
                      {Math.abs(card.trend).toFixed(1)}%
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} lg={6}>
          <ReactECharts
            style={{ height: '150px', width: '100%' }}
            option={{
              grid: {
                top: 5,
                right: 5,
                bottom: 5,
                left: 5,
                containLabel: false,
              },
              graphic: [
                {
                  type: 'text',
                  left: 10,
                  top: 10,
                  style: {
                    text: `访问量近 30 天最大值：${maxPV}，今日访问量：${todayPV}`,
                    fontSize: 11,
                    fontWeight: 'normal',
                    fill: colors.primary,
                    lineHeight: 16,
                  },
                },
              ],
              xAxis: {
                type: 'category',
                data: visits.map((v) => v.date),
                show: false,
                boundaryGap: false,
              },
              yAxis: {
                type: 'value',
                show: false,
                ...(pvDomain && { min: pvDomain[0], max: pvDomain[1] }),
              },
              tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderRadius: 8,
                textStyle: {
                  color: '#fff',
                },
                axisPointer: {
                  type: 'line',
                },
              },
              series: [
                {
                  name: '访问量',
                  type: 'line',
                  data: visits.map((v) => v.pv),
                  smooth: true,
                  symbol: 'none',
                  lineStyle: {
                    color: colors.primary,
                    width: 2,
                  },
                  areaStyle: {
                    color: {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: `${colors.primary}66` },
                        { offset: 1, color: `${colors.primary}00` },
                      ],
                    },
                  },
                },
              ],
            }}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ReactECharts
            style={{ height: '150px', width: '100%' }}
            option={{
              grid: {
                top: 5,
                right: 5,
                bottom: 5,
                left: 5,
                containLabel: false,
              },
              graphic: [
                {
                  type: 'text',
                  left: 10,
                  top: 10,
                  style: {
                    text: `访客数近 30 天最大值：${maxUV}，今日访客数：${todayUV}`,
                    fontSize: 11,
                    fontWeight: 'normal',
                    fill: colors.secondary,
                    lineHeight: 16,
                  },
                },
              ],
              xAxis: {
                type: 'category',
                data: visits.map((v) => v.date),
                show: false,
                boundaryGap: false,
              },
              yAxis: {
                type: 'value',
                show: false,
                ...(uvDomain && { min: uvDomain[0], max: uvDomain[1] }),
              },
              tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderRadius: 8,
                textStyle: {
                  color: '#fff',
                },
                axisPointer: {
                  type: 'line',
                },
              },
              series: [
                {
                  name: '访客数',
                  type: 'line',
                  data: visits.map((v) => v.uv),
                  smooth: true,
                  symbol: 'none',
                  lineStyle: {
                    color: colors.secondary,
                    width: 2,
                  },
                  areaStyle: {
                    color: {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: `${colors.secondary}66` },
                        { offset: 1, color: `${colors.secondary}00` },
                      ],
                    },
                  },
                },
              ],
            }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          {popularPost.length > 0 ? (
            <Box sx={{ flex: 1 }}>
              {popularPost.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    '&:not(:last-child)': {
                      mb: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 500,
                      color: index < 3 ? gradientColors[index].start : 'text.secondary',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}.
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatRelativeTime(item.published_at)}
                    </Typography>
                  </Box>
                  {item.view_count > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      🔥 {item.view_count.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" textAlign="center" fontSize={12}>暂无数据</Typography>
          )}
        </Grid>
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ReactECharts
              style={{ height: '100%', width: '100%' }}
              option={{
                tooltip: {
                  trigger: 'item',
                  backgroundColor: 'rgba(26, 26, 26, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  borderRadius: 8,
                  textStyle: {
                    color: '#fff',
                  },
                  formatter: (params: any) => {
                    return `${params.name}: ${params.value}`;
                  },
                },
                series: [
                  {
                    name: '内容类型分布',
                    type: 'pie',
                    radius: ['40%', '60%'],
                    center: ['50%', '50%'],
                    avoidLabelOverlap: false,
                    padAngle: 7.5,
                    itemStyle: {
                      borderRadius: 8,
                    },
                    label: {
                      show: true,
                      position: 'outside',
                      formatter: (params: any) => {
                        return `${params.name}: ${params.value}(${params.percent}%)`;
                      },
                      fontSize: 12,
                      fontWeight: 500,
                      distanceToLabelLine: 5,
                    },
                    labelLine: {
                      show: true,
                      length: 10,
                      length2: 5,
                      lineStyle: {
                        width: 1,
                      },
                    },
                    data: pieData.map((item) => ({
                      value: item.value,
                      name: item.name,
                      itemStyle: {
                        color: item.color,
                        borderColor: item.color,
                        borderWidth: 2,
                        shadowBlur: 4,
                        shadowColor: 'rgba(0, 0, 0, 0.2)',
                      },
                      label: {
                        color: item.color,
                      },
                      labelLine: {
                        lineStyle: {
                          color: item.color,
                        },
                      },
                    })),
                    emphasis: {
                      disabled: true,
                    },
                    animation: false,
                  },
                ],
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          {popularLife.length > 0 ? (
            <Box sx={{ flex: 1 }}>
              {popularLife.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    '&:not(:last-child)': {
                      mb: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 500,
                      color: index < 3 ? gradientColors[index].start : 'text.secondary',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}.
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {item.content || item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatRelativeTime(item.published_at)}
                    </Typography>
                  </Box>
                  {item.view_count > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      🔥 {item.view_count.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" textAlign="center" fontSize={12}>暂无数据</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
