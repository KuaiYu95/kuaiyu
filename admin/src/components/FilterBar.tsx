// ===========================================
// 统一筛选栏组件
// ===========================================

import {
  Box,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';
import { FilterList, Search } from '@mui/icons-material';
import { useState } from 'react';

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
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
      elevation={0}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
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
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
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
          <>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, flex: 1 }}>
              {additionalFilters}
            </Box>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <FilterList />
            </IconButton>
          </>
        )}

        {!additionalFilters && <Box sx={{ flex: 1 }} />}
      </Box>

      {/* 移动端折叠面板 */}
      {additionalFilters && (
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {additionalFilters}
          </Box>
        </Collapse>
      )}
    </Paper>
  );
}

