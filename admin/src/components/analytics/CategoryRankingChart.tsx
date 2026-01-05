// ===========================================
// 分类消费饼图组件
// ===========================================

import type { CategoryRankingItem } from '@/lib/api';
import { useTheme } from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface CategoryRankingChartProps {
  categoryRanking: CategoryRankingItem[];
}

export default function CategoryRankingChart({ categoryRanking }: CategoryRankingChartProps) {
  const theme = useTheme();

  return (
    <ReactECharts
      style={{ height: '100%', width: '100%', minHeight: 200 }}
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
            return `${params.name}消费 (${params.percent}%)<br/>¥${params.value.toFixed(2)}`;
          },
        },
        series: [
          {
            name: '分类消费',
            type: 'pie',
            radius: ['20%', '60%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            padAngle: 2,
            itemStyle: {
              borderRadius: 4,
            },
            label: {
              show: true,
              alignTo: 'edge',
              formatter: (params: any) => {
                return `{name|${params.name}}\n{value|¥${params.value.toFixed(2)} (${params.percent}%)}`;
              },
              minMargin: 5,
              edgeDistance: 10,
              lineHeight: 15,
              rich: {
                name: {
                  fontSize: 12,
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                },
                value: {
                  fontSize: 10,
                  color: theme.palette.text.secondary,
                  padding: [2, 0, 0, 0],
                },
              },
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 0,
              maxSurfaceAngle: 80,
              lineStyle: {
                width: 1,
              },
            },
            labelLayout: (params: any) => {
              const isLeft = params.labelRect.x < (params.labelRect.x + params.labelRect.width) / 2;
              const points = params.labelLinePoints;
              if (points && points.length > 2) {
                points[2][0] = isLeft
                  ? params.labelRect.x
                  : params.labelRect.x + params.labelRect.width;
              }
              return {
                labelLinePoints: points,
              };
            },
            data: categoryRanking.map((item, index) => {
              // 账单专属暖色调
              const color = [
                '#f97316', // 橙色
                '#eab308', // 金黄色
                '#dc2626', // 深红色
                '#d97706', // 深橙色
                '#b45309', // 棕色
              ][index % 5];
              return {
                value: item.total,
                name: item.category_name,
                itemStyle: {
                  color: color,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.1)',
                },
              };
            }),
            emphasis: {
              disabled: true,
            },
            animation: false,
          },
        ],
      }}
    />
  );
}

