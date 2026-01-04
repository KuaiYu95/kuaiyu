// ===========================================
// 统一筛选栏组件
// ===========================================

import { Search } from '@mui/icons-material';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

export interface FilterBarProps {
  status?: string;
  onStatusChange?: (status: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
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
  statusOptions = [
    { value: '', label: '全部' },
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
  ],
  searchPlaceholder = '搜索...',
  showSearch = true,
  showStatus = true,
  additionalFilters,
}: FilterBarProps) {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: { xs: 'nowrap', sm: 'wrap' },
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
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              minWidth: { xs: '100%', sm: 200 },
            }}
          />
        )}

        {showStatus && (
          <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 240 }, flexShrink: 0 }}>
            <InputLabel>状态</InputLabel>
            <Select
              value={status}
              label="状态"
              onChange={(e) => onStatusChange?.(e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.value === '' ? '全部' : option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {additionalFilters && (
          <Box sx={{ gap: 2, display: 'flex', flexShrink: 0 }}>
            {additionalFilters}
          </Box>
        )}
      </Box>
    </Box>
  );
}

