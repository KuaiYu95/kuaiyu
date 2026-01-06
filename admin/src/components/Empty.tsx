// ===========================================
// Empty 组件
// 空状态组件
// ===========================================

import { InfoIcon } from '@/components/icons';
import { Box, Typography } from '@mui/material';

interface EmptyProps {
  text?: string;
}

export default function Empty({ text = '暂无数据' }: EmptyProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <InfoIcon size={16} loop sx={{ width: 'auto' }} />
      <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
        {text}
      </Typography>
    </Box>
  );
}

