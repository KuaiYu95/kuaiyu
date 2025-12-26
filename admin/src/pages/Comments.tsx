// ===========================================
// 评论管理页面
// ===========================================

import { useToast } from '@/components/Toast';
import { commentApi, type Comment } from '@/lib/api';
import { STATUS_LABELS } from '@/lib/constants';
import { Check, Close, Delete, PushPin, Reply } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
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
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Comments() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // 从 URL 读取初始值（page 从 1 开始）
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const rowsPerPageFromUrl = parseInt(searchParams.get('rowsPerPage') || '10', 10);
  const statusFromUrl = searchParams.get('status') || '';
  const isPinnedFromUrl = searchParams.get('isPinned');
  const isPinnedInitial = isPinnedFromUrl === 'true' ? true : isPinnedFromUrl === 'false' ? false : undefined;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pageFromUrl);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageFromUrl);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(statusFromUrl);
  const [isPinned, setIsPinned] = useState<boolean | undefined>(isPinnedInitial);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // 更新 URL 参数
  const updateSearchParams = (updates: { page?: number; rowsPerPage?: number; status?: string; isPinned?: boolean | undefined | null }) => {
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

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page,
        limit: rowsPerPage,
      };

      if (status) {
        params.status = status;
      }

      // 只有当 isPinned 为 true 时才传递参数
      if (isPinned === true) {
        params.is_pinned = true;
      }

      const res = await commentApi.list(params);
      setComments(res.data.items);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // 监听 URL 参数变化（浏览器前进/后退）
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    const rowsPerPageFromUrl = parseInt(searchParams.get('rowsPerPage') || '10', 10);
    const statusFromUrl = searchParams.get('status') || '';
    const isPinnedFromUrl = searchParams.get('isPinned');
    const isPinnedFromUrlValue = isPinnedFromUrl === 'true' ? true : isPinnedFromUrl === 'false' ? false : undefined;

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
    setIsPinned((prev) => {
      if (prev !== isPinnedFromUrlValue) return isPinnedFromUrlValue;
      return prev;
    });
  }, [searchParams]);

  useEffect(() => {
    fetchComments();
  }, [page, rowsPerPage, status, isPinned]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await commentApi.updateStatus(id, newStatus);
      toast.success('状态更新成功');
      fetchComments();
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
      fetchComments();
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
      fetchComments();
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
      fetchComments();
    } catch (err: any) {
      console.error('Failed to toggle pin:', err);
      let errorMessage = '操作失败，请重试';

      if (err.response) {
        // 有响应但状态码不是 2xx
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

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        评论管理
      </Typography>

      {/* 筛选 */}
      <Paper sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }} elevation={0}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>状态</InputLabel>
            <Select
              value={status}
              label="状态"
              sx={{
                width: 300
              }}
              onChange={(e) => {
                const newStatus = e.target.value;
                setStatus(newStatus);
                setPage(1);

                // 如果切换到待审核或垃圾状态，清除置顶筛选
                if (newStatus === 'pending' || newStatus === 'spam') {
                  setIsPinned(undefined);
                  updateSearchParams({ status: newStatus, isPinned: undefined, page: 1 });
                } else {
                  updateSearchParams({ status: newStatus, page: 1 });
                }
              }}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="pending">待审核</MenuItem>
              <MenuItem value="approved">已通过</MenuItem>
              <MenuItem value="spam">垃圾</MenuItem>
            </Select>
          </FormControl>
          {/* 只有全部和已通过状态才显示置顶筛选 */}
          {(status === '' || status === 'approved') && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPinned === true}
                  onChange={(e) => {
                    const newIsPinned = e.target.checked ? true : undefined;
                    setIsPinned(newIsPinned);
                    setPage(1);
                    updateSearchParams({ isPinned: newIsPinned, page: 1 });
                  }}
                />
              }
              label="仅显示置顶"
            />
          )}
        </Box>
      </Paper>

      {/* 表格 */}
      <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>评论者</TableCell>
              <TableCell>内容</TableCell>
              <TableCell width={120}>关联内容</TableCell>
              <TableCell width={100}>状态</TableCell>
              <TableCell width={150}>时间</TableCell>
              <TableCell width={150}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                      {comment.nickname.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {comment.nickname}
                        {comment.is_admin && (
                          <Chip label="管理员" size="small" color="primary" sx={{ ml: 1, height: 18 }} />
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {comment.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {comment.content.length > 100
                      ? comment.content.slice(0, 100) + '...'
                      : comment.content}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {comment.post_title || comment.life_title || '留言板'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[comment.status as keyof typeof STATUS_LABELS]?.label}
                    color={STATUS_LABELS[comment.status as keyof typeof STATUS_LABELS]?.color as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{formatDate(comment.created_at)}</Typography>
                </TableCell>
                <TableCell>
                  {comment.status === 'pending' && (
                    <>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                        title="通过"
                      >
                        <Check fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleStatusChange(comment.id, 'spam')}
                        title="标记为垃圾"
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </>
                  )}
                  {/* 只对一级评论显示置顶按钮 */}
                  {!comment.parent_id && comment.status === 'approved' && (
                    <IconButton
                      size="small"
                      color={comment.is_pinned ? 'primary' : 'default'}
                      onClick={() => handleTogglePin(comment.id)}
                      title={comment.is_pinned ? '取消置顶' : '置顶'}
                    >
                      <PushPin fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => setReplyId(comment.id)}
                    title="回复"
                  >
                    <Reply fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteId(comment.id)}
                    title="删除"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {comments.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">暂无评论</Typography>
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
        <DialogContent>确定要删除这条评论吗？此操作不可恢复。</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>取消</Button>
          <Button onClick={handleDelete} color="error">删除</Button>
        </DialogActions>
      </Dialog>

      {/* 回复对话框 */}
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

