// ===========================================
// 统计分析页面
// ===========================================

import {
  BillCards,
  BillTrendCharts,
  CategoryRankingChart,
  ContentStatsChart,
  FrontendCards,
  VisitCharts,
} from '@/components/analytics';
import { analyticsApi, billApi, type BillStatistics, type BillTrendData, type CategoryRankingItem, type Overview } from '@/lib/api';
import { Box, CircularProgress, Grid } from '@mui/material';
import { useEffect, useState } from 'react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [visits, setVisits] = useState<{ date: string; pv: number; uv: number }[]>([]);
  const [billStats, setBillStats] = useState<BillStatistics | null>(null);
  const [dailyTrend, setDailyTrend] = useState<BillTrendData[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<BillTrendData[]>([]);
  const [categoryRanking, setCategoryRanking] = useState<CategoryRankingItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, visitsRes, billStatsRes, dailyTrendRes, monthlyTrendRes, categoryRankingRes] = await Promise.all([
          analyticsApi.overview(),
          analyticsApi.visits(),
          billApi.statistics({ is_consumed: true }),
          billApi.dailyTrend(),
          billApi.monthlyTrend(),
          billApi.categoryRanking(),
        ]);
        setOverview(overviewRes.data);
        setVisits(visitsRes.data);
        setBillStats(billStatsRes.data);
        setDailyTrend(dailyTrendRes.data);
        setMonthlyTrend(monthlyTrendRes.data);
        setCategoryRanking(categoryRankingRes.data);
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

  const maxPV = visits.length > 0 ? Math.max(...visits.map((v) => v.pv)) : 0;
  const maxUV = visits.length > 0 ? Math.max(...visits.map((v) => v.uv)) : 0;
  const pvDomain: [number, number] | undefined = maxPV > 0 ? [0, Math.ceil(maxPV * 1.2)] : undefined;
  const uvDomain: [number, number] | undefined = maxUV > 0 ? [0, Math.ceil(maxUV * 1.2)] : undefined;
  const todayPV = overview?.today_pv || 0;
  const todayUV = overview?.today_uv || 0;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 左侧：账单相关 */}
        <Grid item xs={12} lg={6}>
          <BillCards billStats={billStats} />
          <BillTrendCharts dailyTrend={dailyTrend} monthlyTrend={monthlyTrend} />
          <Grid item xs={12} lg={12}>
            <CategoryRankingChart categoryRanking={categoryRanking} />
          </Grid>
        </Grid>

        {/* 右侧：前台相关 */}
        <Grid item xs={12} lg={6}>
          <FrontendCards overview={overview} calculateTrend={calculateTrend} />
          <VisitCharts
            visits={visits}
            maxPV={maxPV}
            maxUV={maxUV}
            todayPV={todayPV}
            todayUV={todayUV}
            pvDomain={pvDomain}
            uvDomain={uvDomain}
          />
          <Grid item xs={12} lg={12}>
            <ContentStatsChart overview={overview} />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
