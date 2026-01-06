// ===========================================
// 标签管理页面
// ===========================================

import Empty from '@/components/Empty';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { categoryApi, tagApi, type Category, type Tag } from '@/lib/api';
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
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function Tags() {
  // 博客标签
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagDeleteId, setTagDeleteId] = useState<number | null>(null);

  // 标签表单
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#60a5fa');

  // 账单分类
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDeleteId, setCategoryDeleteId] = useState<number | null>(null);
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');

  // 分类表单
  const [categoryName, setCategoryName] = useState('');
  const [categoryKey, setCategoryKey] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  // 加载标签
  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const res = await tagApi.list();
      setTags(res.data);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    } finally {
      setTagsLoading(false);
    }
  };

  // 加载账单分类
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryApi.list();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchCategories();
  }, []);

  // 打开标签编辑/新建对话框
  const openTagDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
      setTagColor(tag.color || '#60a5fa');
    } else {
      setEditingTag(null);
      setTagName('');
      setTagColor('#60a5fa');
    }
    setTagDialogOpen(true);
  };

  const handleTagSubmit = async () => {
    const data = { name: tagName, color: tagColor };
    try {
      if (editingTag) {
        await tagApi.update(editingTag.id, data);
      } else {
        await tagApi.create(data);
      }
      setTagDialogOpen(false);
      fetchTags();
    } catch (err) {
      console.error('Failed to save tag:', err);
    }
  };

  const handleTagDelete = async () => {
    if (!tagDeleteId) return;
    try {
      await tagApi.delete(tagDeleteId);
      setTagDeleteId(null);
      fetchTags();
    } catch (err) {
      console.error('Failed to delete tag:', err);
    }
  };

  // 打开分类新建对话框
  const openCategoryDialog = (type: 'expense' | 'income') => {
    setCategoryType(type);
    setCategoryName('');
    setCategoryKey('');
    setCategoryDialogOpen(true);
  };

  const handleCategorySubmit = async () => {
    if (!categoryName.trim() || !categoryKey.trim()) return;
    try {
      await categoryApi.create({
        name: categoryName.trim(),
        key: categoryKey.trim(),
        type: categoryType,
      });
      setCategoryDialogOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to create category:', err);
      alert(err.response?.data?.message || '创建分类失败');
    }
  };

  const handleCategoryDelete = async () => {
    if (!categoryDeleteId) return;
    try {
      await categoryApi.delete(categoryDeleteId);
      setCategoryDeleteId(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      alert(err.response?.data?.message || '删除分类失败');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          配置中心
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          管理博客标签和记账分类，记账分类中区分支出与收入。
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* 博客标签 */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                    博客标签
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    用于博客文章的标签管理
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlusIcon size={16} hover />}
                  onClick={() => openTagDialog()}
                  sx={{
                    minWidth: { xs: 'auto', sm: 80 },
                    px: { xs: 1, sm: 1.5 },
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0, sm: 0.5 },
                    },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    新建
                  </Box>
                </Button>
              </Box>

              <Divider sx={{ my: 1 }} />

              {tagsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : tags.length === 0 ? (
                <Box sx={{ py: 2 }}>
                  <Empty text="暂无标签" />
                </Box>
              ) : (
                <List
                  dense
                  sx={{
                    maxHeight: 360,
                    overflow: 'auto',
                    p: 0,
                    '& .MuiListItemSecondaryAction-root': {
                      right: 3,
                    },
                  }}
                >
                  {tags.map((tag) => (
                    <ListItem
                      key={tag.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            label={`${tag.post_count || 0} 篇`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem', borderRadius: 1 }}
                          />
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => openTagDialog(tag)}
                            sx={{ width: 28, height: 28 }}
                          >
                            <EditIcon size={18} hover />
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => setTagDeleteId(tag.id)}
                            sx={{ width: 28, height: 28 }}
                          >
                            <TrashIcon size={18} hover />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        px: 0,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: tag.color || 'primary.main',
                            flexShrink: 0,
                          }}
                        />
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {tag.name}
                              </Typography>
                              {tag.slug && (
                                <Chip
                                  label={tag.slug}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 18, fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 支出分类 */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                    记账分类 · 支出
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    管理支出类的记账分类
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlusIcon size={16} hover />}
                  onClick={() => openCategoryDialog('expense')}
                  sx={{
                    minWidth: { xs: 'auto', sm: 80 },
                    px: { xs: 1, sm: 1.5 },
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0, sm: 0.5 },
                    },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    新建
                  </Box>
                </Button>
              </Box>

              <Divider sx={{ my: 1 }} />

              {categoriesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : expenseCategories.length === 0 ? (
                <Box sx={{ py: 2 }}>
                  <Empty text="暂无支出分类" />
                </Box>
              ) : (
                <List
                  dense
                  sx={{
                    maxHeight: 360,
                    overflow: 'auto',
                    p: 0,
                    '& .MuiListItemSecondaryAction-root': {
                      right: 3,
                    },
                  }}
                >
                  {expenseCategories.map((category) => (
                    <ListItem
                      key={category.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Chip
                            label={`${category.bill_count || 0} 条`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              borderRadius: 1,
                            }}
                          />
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => setCategoryDeleteId(category.id)}
                            sx={{ width: 28, height: 28 }}
                          >
                            <TrashIcon size={18} hover />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        px: 0,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {category.name}
                            </Typography>
                            <Chip
                              label={category.key}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 收入分类 */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                    记账分类 · 收入
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    管理收入类的记账分类
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlusIcon size={16} hover />}
                  onClick={() => openCategoryDialog('income')}
                  sx={{
                    minWidth: { xs: 'auto', sm: 80 },
                    px: { xs: 1, sm: 1.5 },
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0, sm: 0.5 },
                    },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    新建
                  </Box>
                </Button>
              </Box>

              <Divider sx={{ my: 1 }} />

              {categoriesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : incomeCategories.length === 0 ? (
                <Box sx={{ py: 2 }}>
                  <Empty text="暂无收入分类" />
                </Box>
              ) : (
                <List
                  dense
                  sx={{
                    maxHeight: 360,
                    overflow: 'auto',
                    p: 0,
                    '& .MuiListItemSecondaryAction-root': {
                      right: 3,
                    },
                  }}
                >
                  {incomeCategories.map((category) => (
                    <ListItem
                      key={category.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Chip
                            label={`${category.bill_count || 0} 条`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              borderRadius: 1,
                            }}
                          />
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => setCategoryDeleteId(category.id)}
                            sx={{ width: 28, height: 28 }}
                          >
                            <TrashIcon size={18} hover />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        px: 0,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {category.name}
                            </Typography>
                            <Chip
                              label={category.key}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 标签编辑对话框 */}
      <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTag ? '编辑标签' : '新建标签'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="名称"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
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
              value={tagColor}
              onChange={(e) => setTagColor(e.target.value)}
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
                bgcolor: tagColor,
                color: '#fff',
                height: 24,
                '&:hover': {
                  bgcolor: tagColor,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTagDialogOpen(false)}>取消</Button>
          <Button onClick={handleTagSubmit} variant="contained" disabled={!tagName.trim()}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 标签删除确认对话框 */}
      <Dialog open={!!tagDeleteId} onClose={() => setTagDeleteId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这个标签吗？此操作不可恢复。</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTagDeleteId(null)}>取消</Button>
          <Button onClick={handleTagDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 分类新建对话框 */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{categoryType === 'expense' ? '新建支出分类' : '新建收入分类'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="分类名称"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            sx={{ mt: 1, mb: 2 }}
            autoFocus
            placeholder={categoryType === 'expense' ? '如：餐饮、购物' : '如：工资、奖金'}
          />
          <TextField
            fullWidth
            label="分类键"
            value={categoryKey}
            onChange={(e) => setCategoryKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            required
            sx={{ mb: 1 }}
            placeholder={categoryType === 'expense' ? '如：food、shopping' : '如：salary、bonus'}
            helperText="用于程序识别，建议使用英文小写字母和下划线"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCategoryDialogOpen(false)}>取消</Button>
          <Button onClick={handleCategorySubmit} variant="contained" disabled={!categoryName.trim() || !categoryKey.trim()}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 分类删除确认对话框 */}
      <Dialog open={!!categoryDeleteId} onClose={() => setCategoryDeleteId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除这个分类吗？如果该分类下有关联的账单，系统会自动将这些账单移动到&quot;其他&quot;分类。此操作不可恢复。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCategoryDeleteId(null)}>取消</Button>
          <Button onClick={handleCategoryDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

