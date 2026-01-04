// ===========================================
// 标签管理页面
// ===========================================

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { tagApi, type Tag } from '@/lib/api';

export default function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 表单数据
  const [name, setName] = useState('');
  const [color, setColor] = useState('#60a5fa');

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await tagApi.list();
      setTags(res.data);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setName(tag.name);
      setColor(tag.color || '#60a5fa');
    } else {
      setEditingTag(null);
      setName('');
      setColor('#60a5fa');
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data = { name, color };
    try {
      if (editingTag) {
        await tagApi.update(editingTag.id, data);
      } else {
        await tagApi.create(data);
      }
      setDialogOpen(false);
      fetchTags();
    } catch (err) {
      console.error('Failed to save tag:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await tagApi.delete(deleteId);
      setDeleteId(null);
      fetchTags();
    } catch (err) {
      console.error('Failed to delete tag:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          标签管理
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>
          新建标签
        </Button>
      </Box>

      <Grid container spacing={2}>
        {tags.map((tag) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={tag.id}>
            <Paper
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderLeft: 4,
                borderLeftColor: tag.color || 'primary.main',
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: tag.color || 'primary.main',
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {tag.name}
                  </Typography>
                </Box>
                <Chip label={`${tag.post_count || 0} 篇`} size="small" />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={() => openDialog(tag)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => setDeleteId(tag.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
        {tags.length === 0 && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider' }} elevation={0}>
              <Typography color="text.secondary">暂无标签</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTag ? '编辑标签' : '新建标签'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mt: 1, mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">颜色</Typography>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: 50, height: 30, border: 'none', cursor: 'pointer' }}
            />
            <Chip label="预览" sx={{ bgcolor: color, color: '#fff' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>确定要删除这个标签吗？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>取消</Button>
          <Button onClick={handleDelete} color="error">删除</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

