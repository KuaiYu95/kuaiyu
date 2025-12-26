// ===========================================
// 生活记录管理页面
// ===========================================

import { lifeApi, type LifeRecord } from '@/lib/api';
import { ROUTES, STATUS_LABELS } from '@/lib/constants';
import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Life() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 从 URL 读取初始值（page 从 1 开始）
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const rowsPerPageFromUrl = parseInt(searchParams.get('rowsPerPage') || '10', 10);
  const statusFromUrl = searchParams.get('status') || '';

  const [records, setRecords] = useState<LifeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pageFromUrl);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageFromUrl);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(statusFromUrl);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 更新 URL 参数
  const updateSearchParams = (updates: { page?: number; rowsPerPage?: number; status?: string }) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.page !== undefined) {
      if (updates.page === 1) {
        newParams.delete('page');
      } else {
        newParams.set('page', updates.page.toString());
      }
    }

    if (updates.rowsPerPage !== undefined) {
      if (updates.rowsPerPage === 10) {
        newParams.delete('rowsPerPage');
      } else {
        newParams.set('rowsPerPage', updates.rowsPerPage.toString());
      }
    }

    if (updates.status !== undefined) {
      if (updates.status === '') {
        newParams.delete('status');
      } else {
        newParams.set('status', updates.status);
      }
    }

    setSearchParams(newParams, { replace: true });
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await lifeApi.list({
        page: page,
        limit: rowsPerPage,
        status: status || undefined,
      });
      setRecords(res.data.items);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch life records:', err);
    } finally {
      setLoading(false);
    }
  };

  // 监听 URL 参数变化（浏览器前进/后退）
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    const rowsPerPageFromUrl = parseInt(searchParams.get('rowsPerPage') || '10', 10);
    const statusFromUrl = searchParams.get('status') || '';

    setPage((prev) => {
      if (prev !== pageFromUrl) return pageFromUrl;
      return prev;
    });
    setRowsPerPage((prev) => {
      if (prev !== rowsPerPageFromUrl) return rowsPerPageFromUrl;
      return prev;
    });
    setStatus((prev) => {
      if (prev !== statusFromUrl) return statusFromUrl;
      return prev;
    });
  }, [searchParams]);

  useEffect(() => {
    fetchRecords();
  }, [page, rowsPerPage, status]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await lifeApi.delete(deleteId);
      setDeleteId(null);
      fetchRecords();
    } catch (err) {
      console.error('Failed to delete life record:', err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          生活记录
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(ROUTES.LIFE_NEW)}
        >
          新建记录
        </Button>
      </Box>

      {/* 筛选 */}
      <Paper sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }} elevation={0}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>状态</InputLabel>
          <Select
            value={status}
            label="状态"
            onChange={(e) => {
              const newStatus = e.target.value;
              setStatus(newStatus);
              setPage(1);
              updateSearchParams({ status: newStatus, page: 1 });
            }}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="draft">草稿</MenuItem>
            <MenuItem value="published">已发布</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* 表格 */}
      <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={80}>封面</TableCell>
              <TableCell>内容预览</TableCell>
              <TableCell width={100}>状态</TableCell>
              <TableCell width={120}>发布时间</TableCell>
              <TableCell width={100}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>
                  {record.cover_image ? (
                    <Box
                      component="img"
                      src={record.cover_image}
                      sx={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1 }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        bgcolor: 'grey.800',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        无
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 400 }} noWrap>
                    {record.content.replace(/[#*`\n]/g, ' ').slice(0, 80)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[record.status as keyof typeof STATUS_LABELS]?.label}
                    color={STATUS_LABELS[record.status as keyof typeof STATUS_LABELS]?.color as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {record.published_at ? formatDate(record.published_at) : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(ROUTES.LIFE_EDIT(record.id))}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteId(record.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">暂无记录</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={(_, p) => {
            const newPage = p + 1;
            setPage(newPage);
            updateSearchParams({ page: newPage });
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            const newRowsPerPage = parseInt(e.target.value, 10);
            setRowsPerPage(newRowsPerPage);
            setPage(1);
            updateSearchParams({ rowsPerPage: newRowsPerPage, page: 1 });
          }}
          labelRowsPerPage="每页行数"
        />
      </TableContainer>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>确定要删除这条记录吗？此操作不可恢复。</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>取消</Button>
          <Button onClick={handleDelete} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
