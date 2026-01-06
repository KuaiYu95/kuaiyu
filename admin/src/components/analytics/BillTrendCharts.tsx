// ===========================================
// 账单趋势图表组件
// ===========================================

import type { BillTrendData } from '@/lib/api';
import { Grid } from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface BillTrendChartsProps {
  dailyTrend: BillTrendData[];
  monthlyTrend: BillTrendData[];
}

export default function BillTrendCharts({ dailyTrend, monthlyTrend }: BillTrendChartsProps) {

  const normalizedDailyTrend: BillTrendData[] = (() => {
    if (!dailyTrend || dailyTrend.length === 0) {
      const days: BillTrendData[] = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        days.push({ date: dateStr, expense: 0, income: 0 });
      }
      return days;
    }

    const today = new Date();
    const map = new Map<string, BillTrendData>();
    dailyTrend.forEach((item) => {
      const key = item.date.split('T')[0];
      map.set(key, item);
    });

    const result: BillTrendData[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = map.get(dateStr);
      if (existing) {
        result.push(existing);
      } else {
        result.push({ date: dateStr, expense: 0, income: 0 });
      }
    }
    return result;
  })();

  return (
    <Grid container spacing={2} mb={2}>
      <Grid item xs={12} lg={6}>
        <ReactECharts
          style={{ height: '150px', width: '100%' }}
          option={{
            grid: {
              top: 20,
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
                  text: `近30天最大支出：¥${Math.max(...normalizedDailyTrend.map(item => item.expense), 0).toFixed(2)}，今日支出：¥${normalizedDailyTrend[normalizedDailyTrend.length - 1]?.expense.toFixed(2) || '0.00'}`,
                  fontSize: 11,
                  fontWeight: 'normal',
                  fill: '#f97316',
                  lineHeight: 16,
                },
              },
            ],
            xAxis: {
              type: 'category',
              data: normalizedDailyTrend.map(item => {
                const date = new Date(item.date);
                return `${date.getMonth() + 1}-${date.getDate()}`;
              }),
              show: false,
              boundaryGap: false,
            },
            yAxis: {
              type: 'value',
              show: false,
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
              formatter: (params: any) => {
                let res = `<div>${params[0].name}</div>`;
                params.forEach((item: any) => {
                  res += `<div><span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>${item.seriesName}: ¥${item.value.toFixed(2)}</div>`;
                });
                return res;
              },
            },
            series: [
              {
                name: '支出',
                type: 'line',
                smooth: true,
                symbol: 'none',
                data: normalizedDailyTrend.map(item => item.expense),
                lineStyle: {
                  color: '#f97316', // 橙色
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
                      { offset: 0, color: '#f9731666' },
                      { offset: 1, color: '#f9731600' },
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
              top: 20,
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
                  text: `近12个月统计：最大月支出：¥${Math.max(...monthlyTrend.map(item => item.expense), 0).toFixed(2)}，最大月收入：¥${Math.max(...monthlyTrend.map(item => item.income), 0).toFixed(2)}`,
                  fontSize: 11,
                  fontWeight: 'normal',
                  fill: '#eab308', // 金黄色
                  lineHeight: 16,
                },
              },
            ],
            xAxis: {
              type: 'category',
              data: monthlyTrend.map(item => {
                const [year, month] = item.date.split('-');
                return `${year}-${month}`;
              }),
              show: false,
              boundaryGap: [0.15, 0.15],
            },
            yAxis: {
              type: 'value',
              show: false,
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
              formatter: (params: any) => {
                let res = `<div>${params[0].name}</div>`;
                params.forEach((item: any) => {
                  res += `<div><span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>${item.seriesName}: ¥${item.value.toFixed(2)}</div>`;
                });
                return res;
              },
            },
            series: [
              {
                name: '支出',
                type: 'bar',
                data: monthlyTrend.map(item => item.expense),
                barMinHeight: 2,
                barCategoryGap: 8,
                itemStyle: {
                  color: '#f97316', // 橙色
                  borderRadius: [4, 4, 0, 0],
                },
              },
              {
                name: '收入',
                type: 'bar',
                data: monthlyTrend.map(item => item.income),
                barMinHeight: 2,
                barCategoryGap: 8,
                itemStyle: {
                  color: '#eab308', // 金黄色
                  borderRadius: [4, 4, 0, 0],
                },
              },
            ],
          }}
        />
      </Grid>
    </Grid>
  );
}

