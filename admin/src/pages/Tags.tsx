// ===========================================
// 标签管理页面
// ===========================================

import Empty from '@/components/Empty';
import { PlusIcon } from '@/components/icons';
import { tagApi, type Tag } from '@/lib/api';
import { Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<PlusIcon size={18} hover />}
          onClick={() => openDialog()}
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
            新建标签
          </Box>
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {tags.map((tag) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={tag.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
                onMouseEnter={() => setHoveredId(tag.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    '&:last-child': {
                      pb: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 4,
                      height: '100%',
                      bgcolor: tag.color || 'primary.main',
                      borderRadius: '4px 0 0 4px',
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: tag.color || 'primary.main',
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tag.name}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(tag.id);
                      }}
                      sx={{
                        minWidth: 'auto',
                        height: 24,
                        lineHeight: 1,
                        px: 1,
                        color: 'text.secondary',
                        opacity: hoveredId === tag.id ? 1 : 0,
                        visibility: hoveredId === tag.id ? 'visible' : 'hidden',
                        transition: 'opacity 0.2s ease, visibility 0.2s ease',
                        '&:hover': {
                          color: 'error.main',
                          bgcolor: 'transparent',
                        },
                      }}
                    >
                      删除
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={`${tag.post_count || 0} 篇`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        borderRadius: 1,
                        px: 0.5,
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDialog(tag);
                      }}
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: 16,
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {tags.length === 0 && !loading && (
            <Grid item xs={12}>
              <Box sx={{ py: 2 }}>
                <Empty text="暂无标签" />
              </Box>
            </Grid>
          )}
        </Grid>
      )}

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
            autoFocus
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ minWidth: 40 }}>
              颜色
            </Typography>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: 50,
                height: 36,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: 0,
              }}
            />
            <Chip
              label="预览"
              sx={{
                bgcolor: color,
                color: '#fff',
                height: 24,
                '&:hover': {
                  bgcolor: color,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这个标签吗？此操作不可恢复。</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>取消</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

