// ===========================================
// 通用平铺选择组件
// ===========================================

import { Box, Button, type SxProps, type Theme } from '@mui/material';

export interface OptionItem<T extends string | number> {
  label: string;
  value: T;
}

export interface OptionGroupProps<T extends string | number> {
  value: T;
  options: OptionItem<T>[];
  onChange: (value: T) => void;
  /**
   * 是否紧凑模式（用于表单内的窄按钮）
   */
  dense?: boolean;
  /**
   * 自定义容器样式
   */
  sx?: SxProps<Theme>;
}

export function OptionGroup<T extends string | number>({
  value,
  options,
  onChange,
  dense = true,
  sx,
}: OptionGroupProps<T>) {
  const size = dense ? 'small' : 'medium';
  const baseButtonSx: SxProps<Theme> = dense
    ? {
      minWidth: { xs: 64, sm: 80 },
      px: 1.5,
      py: 0.5,
      fontSize: 13,
    }
    : {
      minWidth: { xs: 80, sm: 96 },
    };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.75,
        ...sx,
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Button
            key={String(opt.value)}
            variant={selected ? 'contained' : 'outlined'}
            color={selected ? 'primary' : undefined}
            size={size}
            onClick={() => onChange(opt.value)}
            sx={{
              ...baseButtonSx,
              ...(!selected && {
                color: 'text.secondary',
                borderColor: 'divider',
              }),
            }}
          >
            {opt.label}
          </Button>
        );
      })}
    </Box>
  );
}


