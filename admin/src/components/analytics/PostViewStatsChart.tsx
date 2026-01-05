// ===========================================
// 博客阅读量饼图组件
// ===========================================

import type { PostViewStatsVO } from '@/lib/api';
import { Box, useTheme } from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface PostViewStatsChartProps {
  postViewStats: PostViewStatsVO[];
}

export default function PostViewStatsChart({ postViewStats }: PostViewStatsChartProps) {
  const theme = useTheme();

  return (
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
              return `${params.name}<br/>阅读量: ${params.value} (${params.percent}%)`;
            },
          },
          series: [
            {
              name: '博客阅读量',
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
                  return `{name|${params.name}}\n{value|${params.value} (${params.percent}%)}`;
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
              data: postViewStats.map((item, index) => {
                // 博客专属冷色调
                const color = [
                  '#3b82f6', // 蓝色
                  '#8b5cf6', // 紫色
                  '#06b6d4', // 青色
                  '#6366f1', // 靛蓝色
                  '#ec4899', // 粉紫色
                ][index % 5];
                return {
                  value: item.view_count,
                  name: item.title,
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
    </Box>
  );
}

