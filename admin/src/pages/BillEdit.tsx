// ===========================================
// 记账表单页面
// ===========================================

import { ArrowBackIcon } from '@/components/icons';
import { OptionGroup } from '@/components/OptionGroup';
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
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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
    setCategoriesLoading(true);
    categoryApi
      .list()
      .then((res) => setCategories(res.data))
      .finally(() => setCategoriesLoading(false));

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
    // 仅在编辑模式下验证退款相关字段
    if (isEdit && refundType > 0 && refund <= 0) {
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
      refund: isEdit && refundType > 0 ? refund : 0,
      refund_type: isEdit ? refundType : 0,
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
        p: 2,
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          {/* 账单类型 - 平铺按钮 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 72,
                whiteSpace: 'nowrap',
              }}
            >
              账单类型
            </Typography>
            <OptionGroup
              value={type}
              onChange={(v) => setType(v)}
              options={[
                { label: '支出', value: 'expense' },
                { label: '收入', value: 'income' },
              ]}
              dense
              sx={{ flex: 1 }}
            />
          </Box>

          {/* 分类 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 72,
                whiteSpace: 'nowrap',
                mt: 0.5,
              }}
            >
              分类
            </Typography>
            {filteredCategories.length > 0 ? (
              <OptionGroup
                value={categoryId}
                onChange={(v) => setCategoryId(Number(v))}
                options={filteredCategories.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
                dense
                sx={{ flex: 1 }}
              />
            ) : categoriesLoading ? (
              <Typography variant="body2" color="text.secondary">
                分类加载中...
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无可用分类，请先在分类管理中创建。
              </Typography>
            )}
          </Box>

          {/* 金额 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 72,
                whiteSpace: 'nowrap',
              }}
            >
              金额
            </Typography>
            <TextField
              placeholder="请输入金额"
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>

          {/* 描述 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 72,
                whiteSpace: 'nowrap',
              }}
            >
              描述
            </Typography>
            <TextField
              placeholder="可填写备注信息"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              fullWidth
              multiline
              rows={3}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>

          {/* 账单日期 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 72,
                whiteSpace: 'nowrap',
              }}
            >
              账单日期
            </Typography>
            <TextField
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* 周期类型 - 平铺按钮 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 72,
                whiteSpace: 'nowrap',
              }}
            >
              周期类型
            </Typography>
            <OptionGroup
              value={periodType}
              onChange={(v) => setPeriodType(v as 'month' | 'year')}
              options={[
                { label: '当月', value: 'month' },
                { label: '当年', value: 'year' },
              ]}
              dense
              sx={{ flex: 1 }}
            />
          </Box>

          {/* 是否已消费 - 平铺按钮 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 72,
                whiteSpace: 'nowrap',
              }}
            >
              是否已消费
            </Typography>
            <OptionGroup
              value={isConsumed ? 'true' : 'false'}
              onChange={(v) => setIsConsumed(v === 'true')}
              options={[
                { label: '已消费', value: 'true' },
                { label: '未消费', value: 'false' },
              ]}
              dense
              sx={{ flex: 1 }}
            />
          </Box>

          {/* 退款类型 - 平铺按钮（仅编辑模式显示） */}
          {isEdit && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    minWidth: 72,
                    whiteSpace: 'nowrap',
                  }}
                >
                  退款类型
                </Typography>
                <OptionGroup
                  value={refundType}
                  onChange={(v) => {
                    const val = Number(v) as 0 | 1 | 2;
                    setRefundType(val);
                    if (val === 0) {
                      setRefund(0);
                    }
                  }}
                  options={[
                    { label: '无', value: 0 },
                    { label: '退款', value: 1 },
                    { label: '代付', value: 2 },
                  ]}
                  dense
                  sx={{ flex: 1 }}
                />
              </Box>

              {/* 退款/代付金额（条件显示） */}
              {refundType > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 72,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {refundType === 1 ? '退款金额' : '代付金额'}
                  </Typography>
                  <TextField
                    placeholder="请输入金额"
                    type="number"
                    value={refund || ''}
                    onChange={(e) => setRefund(Number(e.target.value))}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 2,
            flexDirection: 'row',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          {isEdit && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setShowDeleteDialog(true)}
              size={isMobile ? 'large' : 'medium'}
              sx={{
                minWidth: { xs: 100, sm: 80 },
                flex: 1,
              }}
            >
              删除
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate(ROUTES.BILLS)}
            size={isMobile ? 'large' : 'medium'}
            sx={{
              minWidth: { xs: 100, sm: 80 },
              flex: 1,
            }}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            disabled={saving}
            size={isMobile ? 'large' : 'medium'}
            sx={{
              minWidth: { xs: 100, sm: 80 },
              flex: 1,
            }}
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

