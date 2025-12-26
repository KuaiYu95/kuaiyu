// ===========================================
// 博客管理页面
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { postApi, type Post } from '@/lib/api';
import { ROUTES, STATUS_LABELS } from '@/lib/constants';

export default function Posts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postApi.list({
        page: page + 1,
        limit: rowsPerPage,
        status: status || undefined,
      });
      setPosts(res.data.items);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, rowsPerPage, status]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await postApi.delete(deleteId);
      setDeleteId(null);
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          博客管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(ROUTES.POST_NEW)}
        >
          新建文章
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
              <TableCell>标题</TableCell>
              <TableCell width={100}>状态</TableCell>
              <TableCell width={80}>阅读量</TableCell>
              <TableCell width={120}>发布时间</TableCell>
              <TableCell width={120}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {post.title}
                  </Typography>
                  {post.tags && post.tags.length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      {post.tags.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          size="small"
                          sx={{ mr: 0.5, height: 20, fontSize: 11 }}
                        />
                      ))}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]?.label}
                    color={STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]?.color as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{post.view_count}</TableCell>
                <TableCell>
                  {post.published_at ? formatDate(post.published_at) : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(ROUTES.POST_EDIT(post.id))}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteId(post.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">暂无文章</Typography>
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
        <DialogContent>确定要删除这篇文章吗？此操作不可恢复。</DialogContent>
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

