// ===========================================
// 评论管理页面
// ===========================================

import { useEffect, useState } from 'react';
import {
  Box,
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
} from '@mui/material';
import { Check, Close, Delete, Reply } from '@mui/icons-material';
import { commentApi, type Comment } from '@/lib/api';
import { STATUS_LABELS, COMMENT_STATUS } from '@/lib/constants';

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await commentApi.list({
        page: page + 1,
        limit: rowsPerPage,
        status: status || undefined,
      });
      setComments(res.data.items);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, rowsPerPage, status]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await commentApi.updateStatus(id, newStatus);
      fetchComments();
    } catch (err) {
      console.error('Failed to update comment status:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await commentApi.delete(deleteId);
      setDeleteId(null);
      fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleReply = async () => {
    if (!replyId || !replyContent.trim()) return;
    try {
      await commentApi.reply(replyId, replyContent);
      setReplyId(null);
      setReplyContent('');
      fetchComments();
    } catch (err) {
      console.error('Failed to reply comment:', err);
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

      {/* 状态筛选 */}
      <Tabs
        value={status}
        onChange={(_, v) => {
          setStatus(v);
          setPage(0);
        }}
        sx={{ mb: 2 }}
      >
        <Tab label="全部" value="" />
        <Tab label="待审核" value="pending" />
        <Tab label="已通过" value="approved" />
        <Tab label="垃圾" value="spam" />
      </Tabs>

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

