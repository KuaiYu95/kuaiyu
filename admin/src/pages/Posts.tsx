// ===========================================
// 博客管理页面
// ===========================================

import FilterBar from '@/components/FilterBar';
import { postApi, type Post } from '@/lib/api';
import { ROUTES, STATUS_LABELS } from '@/lib/constants';
import { Add, CalendarToday, EditNote, Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Posts() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isPC = useMediaQuery(theme.breakpoints.up('sm'));
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFromUrl = searchParams.get('status') || '';
  const searchFromUrl = searchParams.get('search') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState(statusFromUrl);
  const [search, setSearch] = useState(searchFromUrl);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const limit = 20;

  // 更新 URL 参数
  const updateSearchParams = (updates: { status?: string; search?: string }) => {
    const newParams = new URLSearchParams(searchParams);

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

  const isLoadingRef = useRef(false);

  const fetchPosts = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
      setPosts([]);
      setHasMore(true);
      pageRef.current = 1;
      hasMoreRef.current = true;
      isLoadingRef.current = true;
    } else {
      if (isLoadingRef.current || !hasMore) {
        return;
      }
      isLoadingRef.current = true;
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 1 : pageRef.current;
      const res = await postApi.list({
        page: currentPage,
        limit: limit,
        status: status || undefined,
        search: search || undefined,
      });

      if (reset) {
        setPosts(res.data.items);
      } else {
        setPosts((prev) => [...prev, ...res.data.items]);
      }

      const totalPages = res.data.pagination.totalPages || Math.ceil(res.data.pagination.total / limit);
      const nextPage = currentPage + 1;
      const newHasMore = currentPage < totalPages;

      setHasMore(newHasMore);
      setPage(nextPage);
      pageRef.current = nextPage;
      hasMoreRef.current = newHasMore;
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  // 监听 URL 参数变化（浏览器前进/后退）
  useEffect(() => {
    const statusFromUrl = searchParams.get('status') || '';
    const searchFromUrl = searchParams.get('search') || '';

    setStatus((prev) => {
      if (prev !== statusFromUrl) return statusFromUrl;
      return prev;
    });
    setSearch((prev) => {
      if (prev !== searchFromUrl) return searchFromUrl;
      return prev;
    });
  }, [searchParams]);

  // 当筛选条件变化时，重新加载数据
  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    pageRef.current = page;
    hasMoreRef.current = hasMore;
  }, [page, hasMore]);

  useEffect(() => {
    let lastScrollTime = 0;
    const throttleDelay = 200;

    const handleScroll = () => {
      if (isLoadingRef.current || !hasMoreRef.current) {
        return;
      }

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 200;

      if (isNearBottom) {
        fetchPosts(false);
        return;
      }

      const now = Date.now();
      if (now - lastScrollTime < throttleDelay) {
        return;
      }
      lastScrollTime = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await postApi.delete(deleteId);
      setDeleteId(null);
      // 删除后重新加载数据
      setPosts((prev) => prev.filter((post) => post.id !== deleteId));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <FilterBar
            status={status}
            searchValue={search}
            onStatusChange={(newStatus) => {
              setStatus(newStatus);
              updateSearchParams({ status: newStatus });
            }}
            onSearchChange={(value) => {
              setSearch(value);
              updateSearchParams({ search: value });
            }}
            statusOptions={[
              { value: '', label: '全部' },
              { value: 'draft', label: '草稿' },
              { value: 'published', label: '已发布' },
            ]}
            showSearch={isPC}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(ROUTES.POST_NEW)}
          size="small"
          sx={{
            minWidth: { xs: 'auto', sm: 100 },
            px: { xs: 1, sm: 2 },
            '& .MuiButton-startIcon': {
              margin: { xs: 0, sm: '0 4px 0 -4px' },
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            新建
          </Box>
        </Button>
      </Box>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={() => setHoveredId(post.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => navigate(ROUTES.POST_EDIT(post.id))}
            >
              {post.cover_image && (
                <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    image={post.cover_image}
                    alt={post.title}
                    sx={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                </Box>
              )}
              <CardContent
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  px: 1.5,
                  pt: 1.5,
                  pb: 1.5,
                  '&:last-child': {
                    pb: 1.5,
                  },
                }}
              >
                <Typography
                  variant="body1"
                  component="h3"
                  sx={{
                    fontWeight: 400,
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.5,
                    fontSize: '0.95rem',
                    color: 'text.primary',
                  }}
                >
                  {post.title}
                </Typography>
                {post.excerpt && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.6,
                    }}
                  >
                    {post.excerpt}
                  </Typography>
                )}
                {post.tags && post.tags.length > 0 && (
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.65rem',
                          height: 20,
                          borderRadius: 1,
                          px: 0.5,
                          borderColor: tag.color || 'divider',
                          color: tag.color || 'text.secondary',
                          fontWeight: 400,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: tag.color || 'primary.main',
                            color: tag.color || 'primary.main',
                            bgcolor: 'action.hover',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                )}
                <Box
                  sx={{
                    mt: 'auto',
                    pt: 1.5,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    {post.status !== 'published' && (
                      <Chip
                        icon={
                          post.status === 'draft' ? (
                            <EditNote sx={{ fontSize: 14 }} />
                          ) : undefined
                        }
                        label={STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]?.label}
                        color={STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]?.color as any}
                        size="small"
                        sx={{
                          height: 24,
                          borderRadius: 1.5,
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          ...(post.status === 'draft' && {
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: 'white',
                            border: 'none',
                            '& .MuiChip-icon': {
                              color: 'white',
                            },
                          }),
                        }}
                      />
                    )}
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(post.id);
                      }}
                      sx={{
                        minWidth: 'auto',
                        px: 1,
                        height: 24,
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        lineHeight: 1,
                        color: 'text.secondary',
                        opacity: hoveredId === post.id ? 1 : 0,
                        visibility: hoveredId === post.id ? 'visible' : 'hidden',
                        transition: 'opacity 0.2s ease, visibility 0.2s ease',
                        '&:hover': {
                          color: 'error.main',
                          bgcolor: 'transparent',
                        },
                      }}
                    >
                      删除
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {post.view_count > 0 && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {post.view_count}
                        </Typography>
                      </Stack>
                    )}
                    {post.published_at && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {formatDate(post.published_at)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {posts.length === 0 && !loading && (
          <Grid item xs={12}>
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ fontSize: '12px' }}>暂无文章</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      {loadingMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {!hasMore && posts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
            没有更多了
          </Typography>
        </Box>
      )}
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

