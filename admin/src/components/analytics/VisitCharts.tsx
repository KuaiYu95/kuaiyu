// ===========================================
// 访问量图表组件
// ===========================================

import { Grid } from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface VisitChartsProps {
  visits: { date: string; pv: number; uv: number }[];
  maxPV: number;
  maxUV: number;
  todayPV: number;
  todayUV: number;
  pvDomain?: [number, number];
  uvDomain?: [number, number];
}

export default function VisitCharts({
  visits,
  maxPV,
  maxUV,
  todayPV,
  todayUV,
  pvDomain,
  uvDomain,
}: VisitChartsProps) {
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
                  text: `访问量近 30 天最大值：${maxPV}，今日访问量：${todayPV}`,
                  fontSize: 11,
                  fontWeight: 'normal',
                  fill: '#3b82f6', // 蓝色
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
                  color: '#3b82f6', // 蓝色
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
                      { offset: 0, color: '#3b82f666' },
                      { offset: 1, color: '#3b82f600' },
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
                  text: `访客数近 30 天最大值：${maxUV}，今日访客数：${todayUV}`,
                  fontSize: 11,
                  fontWeight: 'normal',
                  fill: '#6366f1', // 靛蓝色
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
                  color: '#6366f1', // 靛蓝色
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
                      { offset: 0, color: '#6366f166' },
                      { offset: 1, color: '#6366f100' },
                    ],
                  },
                },
              },
            ],
          }}
        />
      </Grid>
    </Grid>
  );
}

