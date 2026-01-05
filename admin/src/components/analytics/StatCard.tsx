// ===========================================
// 统计卡片组件
// ===========================================

import { TrendingDownIcon, TrendingUpIcon } from '@/components/icons';
import { COLORS } from '@/lib/constants';
import { Box, Paper, Typography } from '@mui/material';

export interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  gradient: { start: string; end: string };
  trend: number;
  onClick?: () => void;
  formatValue?: (val: number) => string;
}

export default function StatCard({
  label,
  value,
  icon,
  color,
  gradient,
  trend,
  onClick,
  formatValue,
}: StatCardProps) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        lineHeight: 1,
        background: `linear-gradient(135deg, ${gradient.start}15 0%, ${gradient.end}15 100%)`,
        border: `1px solid ${color}30`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0px 12px 24px ${color}40`,
          borderColor: `${color}60`,
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
          background: `linear-gradient(135deg, ${gradient.start}20 0%, ${gradient.end}20 100%)`,
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
              background: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`,
              color: 'white',
              boxShadow: `0px 2px 8px ${color}50`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: 'text.primary',
              fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
              lineHeight: 1.2,
            }}
          >
            {formatValue ? formatValue(value) : value.toLocaleString()}
          </Typography>
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
            {label}
          </Typography>
          {trend !== 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                color: trend > 0 ? COLORS.secondary : COLORS.red,
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                fontWeight: 600,
              }}
            >
              {trend > 0 ? (
                <TrendingUpIcon size={12} color={COLORS.secondary} sx={{ fontSize: { xs: 10, sm: 12 } }} />
              ) : (
                <TrendingDownIcon size={12} color={COLORS.red} sx={{ fontSize: { xs: 10, sm: 12 } }} />
              )}
              {Math.abs(trend).toFixed(1)}%
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

