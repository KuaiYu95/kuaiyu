// ===========================================
// 博客管理页面
// ===========================================

import { postApi, type Post } from '@/lib/api';
import { ROUTES, STATUS_LABELS } from '@/lib/constants';
import FilterBar from '@/components/FilterBar';
import { Add, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Pagination,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Posts() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isPC = useMediaQuery(theme.breakpoints.up('sm'));
  const [searchParams, setSearchParams] = useSearchParams();

  // 从 URL 读取初始值（page 从 1 开始）
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const rowsPerPageFromUrl = parseInt(searchParams.get('rowsPerPage') || '10', 10);
  const statusFromUrl = searchParams.get('status') || '';
  const searchFromUrl = searchParams.get('search') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pageFromUrl);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageFromUrl);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(statusFromUrl);
  const [search, setSearch] = useState(searchFromUrl);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // 更新 URL 参数
  const updateSearchParams = (updates: { page?: number; rowsPerPage?: number; status?: string; search?: string }) => {
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

    if (updates.search !== undefined) {
      if (updates.search === '') {
        newParams.delete('search');
      } else {
        newParams.set('search', updates.search);
      }
    }

    setSearchParams(newParams, { replace: true });
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postApi.list({
        page: page,
        limit: rowsPerPage,
        status: status || undefined,
        search: search || undefined,
      });
      setPosts(res.data.items);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // 监听 URL 参数变化（浏览器前进/后退）
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    const rowsPerPageFromUrl = parseInt(searchParams.get('rowsPerPage') || '10', 10);
    const statusFromUrl = searchParams.get('status') || '';
    const searchFromUrl = searchParams.get('search') || '';

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
    setSearch((prev) => {
      if (prev !== searchFromUrl) return searchFromUrl;
      return prev;
    });
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
  }, [page, rowsPerPage, status, search]);

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
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          博客管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(ROUTES.POST_NEW)}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          新建文章
        </Button>
      </Box>

      {/* 筛选 */}
      <FilterBar
        status={status}
        searchValue={search}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
          updateSearchParams({ status: newStatus, page: 1 });
        }}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
          updateSearchParams({ search: value, page: 1 });
        }}
        statusOptions={[
          { value: '', label: '全部' },
          { value: 'draft', label: '草稿' },
          { value: 'published', label: '已发布' },
        ]}
        showSearch={isPC}
      />

      {/* 列表 */}
      <Paper
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
        elevation={0}
      >
        <List sx={{ p: 0 }}>
          {posts.map((post) => (
            <ListItem
              key={post.id}
              onClick={() => navigate(ROUTES.POST_EDIT(post.id))}
              onMouseEnter={() => setHoveredId(post.id)}
              onMouseLeave={() => setHoveredId(null)}
              sx={{
                cursor: 'pointer',
                borderBottom: 1,
                borderColor: 'divider',
                py: 2,
                px: 3,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
              secondaryAction={
                hoveredId === post.id ? (
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(post.id);
                    }}
                    sx={{
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: 'white',
                      },
                    }}
                  >
                    <Delete />
                  </IconButton>
                ) : null
              }
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    label={STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]?.label}
                    color={STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]?.color as any}
                    size="small"
                  />
                  <Typography variant="body1" fontWeight={500} sx={{ flex: 1, minWidth: 0 }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {post.view_count} 阅读
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, minWidth: 100 }}>
                    {post.published_at ? formatDate(post.published_at) : '-'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'flex', sm: 'none' } }}>
                  <Typography variant="caption" color="text.secondary">
                    {post.view_count} 阅读
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    •
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {post.published_at ? formatDate(post.published_at) : '-'}
                  </Typography>
                </Stack>
              </Box>
            </ListItem>
          ))}
          {posts.length === 0 && !loading && (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography color="text.secondary">暂无文章</Typography>
            </Box>
          )}
        </List>
        {total > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Pagination
              count={Math.ceil(total / rowsPerPage)}
              page={page}
              onChange={(_, p) => {
                setPage(p);
                updateSearchParams({ page: p });
              }}
              color="primary"
            />
          </Box>
        )}
      </Paper>

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

