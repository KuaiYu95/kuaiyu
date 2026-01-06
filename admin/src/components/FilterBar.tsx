// ===========================================
// 统一筛选栏组件
// ===========================================

import { CheckBox, CheckBoxOutlineBlank, Search } from '@mui/icons-material';
import { Box, Button, TextField } from '@mui/material';

export interface FilterBarProps {
  status?: string;
  onStatusChange?: (status: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  statusFilterValue?: string; // 要筛选的状态值，如 'draft' 或 'pending'
  statusLabel?: string; // 按钮显示的文本，如 '草稿' 或 '待审核'
  searchPlaceholder?: string;
  showSearch?: boolean;
  showStatus?: boolean;
  additionalFilters?: React.ReactNode;
}

export default function FilterBar({
  status = '',
  onStatusChange,
  searchValue = '',
  onSearchChange,
  statusFilterValue = 'draft',
  statusLabel = '草稿',
  searchPlaceholder = '搜索...',
  showSearch = true,
  showStatus = true,
  additionalFilters,
}: FilterBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        gap: 2,
        alignItems: 'center',
        flexWrap: 'nowrap',
      }}
    >
      {showSearch && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
          }}
          sx={{
            flex: '1',
          }}
        />
      )}

      {showStatus && (
        <Button
          variant={status === statusFilterValue ? 'contained' : 'outlined'}
          startIcon={status === statusFilterValue ? <CheckBox /> : <CheckBoxOutlineBlank />}
          onClick={() => {
            const newStatus = status === statusFilterValue ? '' : statusFilterValue;
            onStatusChange?.(newStatus);
          }}
          size="small"
          sx={{
            whiteSpace: 'nowrap',
            flexShrink: 0,
            ...(status === statusFilterValue
              ? {}
              : {
                color: 'text.secondary',
                borderColor: 'divider',
              }),
          }}
        >
          {statusLabel}
        </Button>
      )}

      {additionalFilters && (
        <Box sx={{ gap: 2, display: 'flex', flexShrink: 0 }}>
          {additionalFilters}
        </Box>
      )}
    </Box>
  );
}

