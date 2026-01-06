// ===========================================
// 记账表单页面
// ===========================================

import { ArrowBackIcon } from '@/components/icons';
import { billApi, categoryApi, type Category } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Save } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function BillEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  // 表单数据
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodType, setPeriodType] = useState<'month' | 'year'>('month');
  const [isConsumed, setIsConsumed] = useState(true);
  const [refund, setRefund] = useState<number>(0);
  const [refundType, setRefundType] = useState<0 | 1 | 2>(0);

  // 根据类型筛选分类
  const filteredCategories = categories.filter((cat) => cat.type === type);

  useEffect(() => {
    // 获取分类列表
    categoryApi.list().then((res) => setCategories(res.data));

    // 如果是编辑模式，获取账单详情
    if (isEdit) {
      setLoading(true);
      billApi
        .get(parseInt(id!))
        .then((res) => {
          const bill = res.data;
          setType(bill.type);
          setCategoryId(bill.category_id);
          setAmount(bill.amount);
          setDesc(bill.desc);
          setDate(bill.date);
          setPeriodType(bill.period_type);
          setIsConsumed(bill.is_consumed);
          setRefund(bill.refund || 0);
          setRefundType(bill.refund_type || 0);
        })
        .catch(() => {
          setError('加载账单失败');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证
    if (categoryId === 0) {
      setError('请选择分类');
      return;
    }
    if (amount <= 0) {
      setError('金额必须大于0');
      return;
    }
    if (refundType > 0 && refund <= 0) {
      setError('退款/代付金额必须大于0');
      return;
    }

    setSaving(true);

    const data = {
      type,
      category_id: categoryId,
      amount,
      desc,
      date,
      period_type: periodType,
      is_consumed: isConsumed,
      refund: refundType > 0 ? refund : 0,
      refund_type: refundType,
    };

    try {
      if (isEdit) {
        await billApi.update(parseInt(id!), data);
      } else {
        await billApi.create(data);
      }
      navigate(ROUTES.BILLS);
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    setDeleting(true);
    setError('');
    try {
      await billApi.delete(parseInt(id));
      navigate(ROUTES.BILLS);
    } catch (err: any) {
      setError(err.response?.data?.message || '删除失败');
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: { xs: '100%', sm: 800 },
        mx: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(ROUTES.BILLS)}
          sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
        >
          返回
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {isEdit ? '编辑账单' : '新建账单'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 账单类型 */}
            <FormControl fullWidth>
              <InputLabel>账单类型</InputLabel>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as 'expense' | 'income')}
                label="账单类型"
                size={isMobile ? 'medium' : 'small'}
              >
                <MenuItem value="expense">支出</MenuItem>
                <MenuItem value="income">收入</MenuItem>
              </Select>
            </FormControl>

            {/* 分类 */}
            <FormControl fullWidth>
              <InputLabel>分类</InputLabel>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                label="分类"
                size={isMobile ? 'medium' : 'small'}
              >
                {filteredCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 金额 */}
            <TextField
              label="金额"
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
              size={isMobile ? 'medium' : 'small'}
            />

            {/* 描述 */}
            <TextField
              label="描述"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              fullWidth
              multiline
              rows={3}
              size={isMobile ? 'medium' : 'small'}
            />

            {/* 账单日期 */}
            <TextField
              label="账单日期"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              size={isMobile ? 'medium' : 'small'}
            />

            {/* 周期类型 */}
            <FormControl fullWidth>
              <InputLabel>周期类型</InputLabel>
              <Select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as 'month' | 'year')}
                label="周期类型"
                size={isMobile ? 'medium' : 'small'}
              >
                <MenuItem value="month">当月</MenuItem>
                <MenuItem value="year">当年</MenuItem>
              </Select>
            </FormControl>

            {/* 是否已消费 */}
            <FormControlLabel
              control={
                <Switch
                  checked={isConsumed}
                  onChange={(e) => setIsConsumed(e.target.checked)}
                  size={isMobile ? 'medium' : 'small'}
                />
              }
              label="是否已消费"
            />

            {/* 退款类型 */}
            <FormControl fullWidth>
              <InputLabel>退款类型</InputLabel>
              <Select
                value={refundType}
                onChange={(e) => {
                  const value = e.target.value as '0' | '1' | '2';
                  setRefundType(Number(value) as 0 | 1 | 2);
                  if (value === '0') {
                    setRefund(0);
                  }
                }}
                label="退款类型"
                size={isMobile ? 'medium' : 'small'}
              >
                <MenuItem value={0}>无</MenuItem>
                <MenuItem value={1}>退款</MenuItem>
                <MenuItem value={2}>代付</MenuItem>
              </Select>
            </FormControl>

            {/* 退款/代付金额（条件显示） */}
            {refundType > 0 && (
              <TextField
                label={refundType === 1 ? '退款金额' : '代付金额'}
                type="number"
                value={refund || ''}
                onChange={(e) => setRefund(Number(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
                size={isMobile ? 'medium' : 'small'}
              />
            )}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {isEdit && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setShowDeleteDialog(true)}
              size={isMobile ? 'large' : 'medium'}
              sx={{ minWidth: { xs: 100, sm: 80 }, mr: 'auto' }}
            >
              删除
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate(ROUTES.BILLS)}
            size={isMobile ? 'large' : 'medium'}
            sx={{ minWidth: { xs: 100, sm: 80 } }}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            disabled={saving}
            size={isMobile ? 'large' : 'medium'}
            sx={{ minWidth: { xs: 100, sm: 80 } }}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </Box>
      </form>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这条账单吗？此操作不可恢复。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
            取消
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? '删除中...' : '删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

