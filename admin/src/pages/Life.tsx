// ===========================================
// 生活记录管理页面
// ===========================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { lifeApi, type LifeRecord } from '@/lib/api';
import { ROUTES, STATUS_LABELS } from '@/lib/constants';

export default function Life() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<LifeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await lifeApi.list({
        page: page + 1,
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
              setStatus(e.target.value);
              setPage(0);
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
              <TableCell>标题</TableCell>
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
                  <Typography variant="body2" fontWeight={500}>
                    {record.title}
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
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
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
