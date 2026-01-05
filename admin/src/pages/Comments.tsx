// ===========================================
// 评论管理页面
// ===========================================

import FilterBar from '@/components/FilterBar';
import { CalendarIcon, CheckIcon, CloseIcon, ForumIcon, ReplyIcon, TrashIcon, UpgradeIcon } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { commentApi, type Comment } from '@/lib/api';
import { COLORS, STATUS_LABELS } from '@/lib/constants';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Comments() {
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isPC = useMediaQuery(theme.breakpoints.up('sm'));
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFromUrl = searchParams.get('status') || '';
  const isPinnedFromUrl = searchParams.get('isPinned');
  const isPinnedInitial = isPinnedFromUrl === 'true' ? true : isPinnedFromUrl === 'false' ? false : undefined;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState(statusFromUrl);
  const [isPinned, setIsPinned] = useState<boolean | undefined>(isPinnedInitial);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const limit = 20;

  const updateSearchParams = (updates: { status?: string; isPinned?: boolean | undefined | null }) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.status !== undefined) {
      if (updates.status === '') {
        newParams.delete('status');
      } else {
        newParams.set('status', updates.status);
      }
    }

    // 特殊处理 isPinned：使用 'isPinned' in updates 来判断是否传递了该参数
    if ('isPinned' in updates) {
      if (updates.isPinned === true) {
        newParams.set('isPinned', 'true');
      } else {
        newParams.delete('isPinned');
      }
    }

    setSearchParams(newParams, { replace: true });
  };

  const isLoadingRef = useRef(false);

  const fetchComments = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
      setComments([]);
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
      const params: any = {
        page: currentPage,
        limit: limit,
      };

      if (status) {
        params.status = status;
      }

      if (isPinned === true) {
        params.is_pinned = true;
      }

      const res = await commentApi.list(params);

      if (reset) {
        setComments(res.data.items);
      } else {
        setComments((prev) => [...prev, ...res.data.items]);
      }

      const totalPages = res.data.pagination.totalPages || Math.ceil(res.data.pagination.total / limit);
      const nextPage = currentPage + 1;
      const newHasMore = currentPage < totalPages;

      setHasMore(newHasMore);
      setPage(nextPage);
      pageRef.current = nextPage;
      hasMoreRef.current = newHasMore;
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    const statusFromUrl = searchParams.get('status') || '';
    const isPinnedFromUrl = searchParams.get('isPinned');
    const isPinnedFromUrlValue = isPinnedFromUrl === 'true' ? true : isPinnedFromUrl === 'false' ? false : undefined;

    setStatus((prev) => {
      if (prev !== statusFromUrl) return statusFromUrl;
      return prev;
    });
    setIsPinned((prev) => {
      if (prev !== isPinnedFromUrlValue) return isPinnedFromUrlValue;
      return prev;
    });
  }, [searchParams]);

  useEffect(() => {
    fetchComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isPinned]);

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
        fetchComments(false);
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

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await commentApi.updateStatus(id, newStatus);
      toast.success('状态更新成功');
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    } catch (err: any) {
      console.error('Failed to update comment status:', err);
      toast.error(err.response?.data?.message || err.message || '操作失败，请重试');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await commentApi.delete(deleteId);
      setDeleteId(null);
      toast.success('删除成功');
      setComments((prev) => prev.filter((c) => c.id !== deleteId));
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      toast.error(err.response?.data?.message || err.message || '删除失败，请重试');
    }
  };

  const handleReply = async () => {
    if (!replyId || !replyContent.trim()) return;
    try {
      await commentApi.reply(replyId, replyContent);
      setReplyId(null);
      setReplyContent('');
      toast.success('回复成功');
      fetchComments(true);
    } catch (err: any) {
      console.error('Failed to reply comment:', err);
      toast.error(err.response?.data?.message || err.message || '回复失败，请重试');
    }
  };

  const handleTogglePin = async (id: number) => {
    try {
      await commentApi.togglePin(id);
      const comment = comments.find((c) => c.id === id);
      toast.success(comment?.is_pinned ? '已取消置顶' : '已置顶');
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, is_pinned: !c.is_pinned } : c)));
    } catch (err: any) {
      let errorMessage = '操作失败，请重试';

      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = '接口不存在，请检查 API 服务是否正常运行';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || '只能置顶一级评论';
        } else if (err.response.status === 401) {
          errorMessage = '未授权，请重新登录';
        } else {
          errorMessage = err.response.data?.message || `请求失败 (${err.response.status})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  const getParentNickname = (parentId: number | null) => {
    if (!parentId) return null;
    const parentComment = comments.find((c) => c.id === parentId);
    return parentComment?.nickname || null;
  };

  const getTargetTitle = (comment: Comment) => {
    if (comment.comment_type === 'post' && comment.post_title) {
      return comment.post_title;
    }
    if (comment.comment_type === 'life' && comment.life_title) {
      return comment.life_title;
    }
    if (comment.comment_type === 'guestbook') {
      return '留言板';
    }
    return comment.post_title || comment.life_title || '留言板';
  };

  return (
    <Box sx={{ p: 2 }}>
      <FilterBar
        status={status}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          if (newStatus === 'pending' || newStatus === 'spam') {
            setIsPinned(undefined);
            updateSearchParams({ status: newStatus, isPinned: undefined });
          } else {
            updateSearchParams({ status: newStatus });
          }
        }}
        statusOptions={[
          { value: '', label: '全部' },
          { value: 'pending', label: '待审核' },
          { value: 'approved', label: '已通过' },
          { value: 'spam', label: '垃圾' },
        ]}
        showSearch={isPC}
        additionalFilters={
          (status === '' || status === 'approved') ? (
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={isPinned === true}
                  onChange={(e) => {
                    const newIsPinned = e.target.checked ? true : undefined;
                    setIsPinned(newIsPinned);
                    updateSearchParams({ isPinned: newIsPinned });
                  }}
                />
              }
              label={<Typography variant="body2" color="text.secondary" >置顶</Typography>}
            />
          ) : undefined
        }
      />

      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {comments.map((comment) => {
            const parentNickname = getParentNickname(comment.parent_id);
            const targetTitle = getTargetTitle(comment);

            return (
              <Grid item xs={12} key={comment.id}>
                <Card
                  sx={{
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                      display: 'flex',
                      gap: 1.5,
                    }}
                  >
                    <ReplyIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyId(comment.id);
                      }}
                      title="回复"
                      size={18}
                      hover={true}
                      color={theme.palette.text.secondary}
                      hoverColor={COLORS.blue}
                    />
                    {!comment.parent_id && comment.status === 'approved' && (
                      <UpgradeIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(comment.id);
                        }}
                        title={comment.is_pinned ? '取消置顶' : '置顶'}
                        size={18}
                        hover={true}
                        color={comment.is_pinned ? COLORS.yellow : theme.palette.text.secondary}
                        hoverColor={COLORS.yellow}
                      />
                    )}
                    <TrashIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(comment.id);
                      }}
                      title="删除"
                      size={18}
                      hover={true}
                      color={theme.palette.text.secondary}
                      hoverColor={COLORS.red}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      p: 2,
                      '&:last-child': {
                        pb: 2,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                      {!isMobile && (
                        <Avatar sx={{ width: 40, height: 40, fontSize: 16 }}>
                          {comment.nickname.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                          {comment.is_admin && (
                            <Chip label="管理员" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                          )}
                          {!comment.is_admin && (
                            <Typography variant="body2" fontWeight={500}>
                              {comment.nickname}
                            </Typography>
                          )}
                          {parentNickname ? (
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                在
                              </Typography>
                              <Typography variant="body2" color="primary" sx={{ fontSize: '0.875rem' }}>
                                {targetTitle}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                回复了
                              </Typography>
                              <Typography variant="body2" color="primary" sx={{ fontSize: '0.875rem' }}>
                                @{parentNickname}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                评论了
                              </Typography>
                              <Typography variant="body2" color="primary" sx={{ fontSize: '0.875rem' }}>
                                {targetTitle}
                              </Typography>
                            </>
                          )}
                        </Stack>
                        <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {comment.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.6,
                      }}
                    >
                      {comment.content}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pt: 1.5,
                        borderTop: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" gap={1} alignItems="center">
                        {comment.status !== 'approved' && (
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                            <ForumIcon size={14} color={STATUS_LABELS[comment.status as keyof typeof STATUS_LABELS]?.color} />
                            <Box sx={{ color: STATUS_LABELS[comment.status as keyof typeof STATUS_LABELS]?.color, fontSize: 13, flexShrink: 0 }}>{STATUS_LABELS[comment.status as keyof typeof STATUS_LABELS]?.label}</Box>
                          </Stack>
                        )}
                        {comment.status === 'pending' && (
                          <>
                            <CheckIcon
                              size={18}
                              hover={true}
                              color={theme.palette.success.main}
                              title="通过"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(comment.id, 'approved');
                              }}
                            />
                            <CloseIcon
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(comment.id, 'spam');
                              }}
                              title="标记为垃圾"
                              size={18}
                              hover={true}
                              color={theme.palette.error.main}
                            />
                          </>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarIcon size={14} color={theme.palette.text.secondary} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', flexShrink: 0 }}>
                          {formatDate(comment.created_at)}
                        </Typography>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          {comments.length === 0 && !loading && (
            <Grid item xs={12}>
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography color="text.secondary" sx={{ fontSize: '12px' }}>暂无评论</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
      {loadingMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {!hasMore && comments.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
            没有更多了
          </Typography>
        </Box>
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>确定要删除这条评论吗？此操作不可恢复。</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>取消</Button>
          <Button onClick={handleDelete} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!replyId} onClose={() => setReplyId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>回复评论</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="输入回复内容..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyId(null)}>取消</Button>
          <Button onClick={handleReply} variant="contained" disabled={!replyContent.trim()}>
            回复
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

