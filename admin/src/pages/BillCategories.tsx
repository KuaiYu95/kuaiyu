// ===========================================
// 分类管理页面
// ===========================================

import { categoryApi, type Category } from '@/lib/api';
import { Add, Delete } from '@mui/icons-material';
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
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function BillCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // 表单数据
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.list();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openDialog = () => {
    setName('');
    setKey('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !key.trim()) {
      return;
    }

    try {
      await categoryApi.create({ name: name.trim(), key: key.trim() });
      setDialogOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to create category:', err);
      alert(err.response?.data?.message || '创建分类失败');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await categoryApi.delete(deleteId);
      setDeleteId(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      alert(err.response?.data?.message || '删除分类失败');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          分类管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openDialog}
          size="small"
          sx={{
            minWidth: { xs: 'auto', sm: 100 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            新建分类
          </Box>
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
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
                onMouseEnter={() => setHoveredId(category.id)}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mb: 0.5,
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {category.key}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<Delete />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(category.id);
                      }}
                      color="error"
                      sx={{
                        minWidth: 'auto',
                        height: 24,
                        lineHeight: 1,
                        px: 1,
                        opacity: hoveredId === category.id ? 1 : 0,
                        visibility: hoveredId === category.id ? 'visible' : 'hidden',
                        transition: 'opacity 0.2s ease, visibility 0.2s ease',
                      }}
                    >
                      删除
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={`${category.bill_count || 0} 条账单`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        borderRadius: 1,
                        px: 0.5,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {categories.length === 0 && !loading && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">暂无分类</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* 新建分类对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新建分类</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="分类名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mt: 1, mb: 2 }}
            autoFocus
            placeholder="如：餐饮、购物"
          />
          <TextField
            fullWidth
            label="分类键"
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            required
            sx={{ mb: 1 }}
            placeholder="如：food、shopping"
            helperText="用于程序识别，建议使用英文小写字母和下划线"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!name.trim() || !key.trim()}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除这个分类吗？如果该分类下有关联的账单，系统会自动将这些账单移动到"其他"分类。此操作不可恢复。
          </Typography>
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

