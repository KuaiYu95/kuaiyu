// ===========================================
// 账单统计卡片组件
// ===========================================

import { WalletIcon } from '@/components/icons';
import type { BillStatistics } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Grid } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard, { type StatCardProps } from './StatCard';

interface BillCardsProps {
  billStats: BillStatistics | null;
}

export default function BillCards({ billStats }: BillCardsProps) {
  const navigate = useNavigate();

  const [showHiddenValues, setShowHiddenValues] = useState(false);

  const toggleHiddenValues = () => {
    setShowHiddenValues(!showHiddenValues);
  };

  const billCards: StatCardProps[] = [
    {
      label: '年支出',
      value: billStats?.total_expense || 0,
      icon: <WalletIcon />,
      color: '#f97316', // 橙色
      gradient: { start: '#fb923c', end: '#ea580c' },
      trend: 0,
      onClick: toggleHiddenValues,
      formatValue: (val: number) => showHiddenValues ? `¥${val.toFixed(2)}` : '********',
    },
    {
      label: '年收入',
      value: billStats?.total_income || 0,
      icon: <WalletIcon />,
      color: '#eab308', // 金黄色
      gradient: { start: '#facc15', end: '#ca8a04' },
      trend: 0,
      onClick: toggleHiddenValues,
      formatValue: (val: number) => showHiddenValues ? `¥${val.toFixed(2)}` : '********',
    },
    {
      label: '本月支出',
      value: billStats?.month_expense || 0,
      icon: <WalletIcon />,
      color: '#dc2626', // 深红色
      gradient: { start: '#ef4444', end: '#b91c1c' },
      trend: 0,
      onClick: () => navigate(ROUTES.BILLS),
      formatValue: (val: number) => `¥${val.toFixed(2)}`,
    },
    {
      label: '本月收入',
      value: billStats?.month_income || 0,
      icon: <WalletIcon />,
      color: '#d97706', // 深橙色
      gradient: { start: '#f59e0b', end: '#b45309' },
      trend: 0,
      onClick: toggleHiddenValues,
      formatValue: (val: number) => showHiddenValues ? `¥${val.toFixed(2)}` : '********',
    },
  ];

  return (
    <Grid container spacing={2} mb={2}>
      {billCards.map((card) => (
        <Grid item xs={12} md={6} key={card.label}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
}

