// ===========================================
// 账单列表页面
// ===========================================

import { billApi, categoryApi, type Bill, type Category } from '@/lib/api';
import { COLORS, ROUTES } from '@/lib/constants';
import { Add, Delete, Edit, MoneyOff, Payment } from '@mui/icons-material';
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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Bills() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 默认筛选：近30天、当月、已消费、无代付
  const defaultEndDate = new Date().toISOString().split('T')[0];
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const typeFromUrl = searchParams.get('type') || '';
  const startDateFromUrl = searchParams.get('start_date') || defaultStartDate;
  const endDateFromUrl = searchParams.get('end_date') || defaultEndDate;
  const periodTypeFromUrl = searchParams.get('period_type') || 'month';
  const isConsumedFromUrl = searchParams.get('is_consumed') !== null ? searchParams.get('is_consumed') === 'true' : true;
  const hasChargeBackFromUrl = searchParams.get('has_charge_back') !== null ? searchParams.get('has_charge_back') === 'true' : false;

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // 筛选条件
  const [type, setType] = useState(typeFromUrl);
  const [startDate, setStartDate] = useState(startDateFromUrl);
  const [endDate, setEndDate] = useState(endDateFromUrl);
  const [periodType, setPeriodType] = useState(periodTypeFromUrl);
  const [isConsumed, setIsConsumed] = useState<boolean | null>(isConsumedFromUrl);
  const [hasChargeBack, setHasChargeBack] = useState<boolean | null>(hasChargeBackFromUrl);

  // 对话框状态
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [refundId, setRefundId] = useState<number | null>(null);
  const [chargeBackId, setChargeBackId] = useState<number | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [chargeBackAmount, setChargeBackAmount] = useState<number>(0);

  const limit = 20;
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);

  // 更新 URL 参数
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    categoryApi.list().then((res) => setCategories(res.data));
  }, []);

  const fetchBills = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setBills([]);
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
        start_date: startDate,
        end_date: endDate,
        period_type: periodType,
        is_consumed: isConsumed,
        has_charge_back: hasChargeBack,
      };

      if (type) {
        params.type = type;
      }

      const res = await billApi.list(params);
      const newBills = res.data.items;

      if (reset) {
        setBills(newBills);
      } else {
        setBills((prev) => [...prev, ...newBills]);
      }

      setHasMore(newBills.length === limit);
      hasMoreRef.current = newBills.length === limit;
      pageRef.current = currentPage + 1;
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    fetchBills(true);
  }, [type, startDate, endDate, periodType, isConsumed, hasChargeBack]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await billApi.delete(deleteId);
      setBills((prev) => prev.filter((b) => b.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete bill:', err);
    }
  };

  const handleRefund = async () => {
    if (!refundId || refundAmount <= 0) return;
    try {
      await billApi.refund(refundId, refundAmount);
      await fetchBills(true);
      setRefundId(null);
      setRefundAmount(0);
    } catch (err) {
      console.error('Failed to refund:', err);
    }
  };

  const handleChargeBack = async () => {
    if (!chargeBackId || chargeBackAmount <= 0) return;
    try {
      await billApi.chargeBack(chargeBackId, chargeBackAmount);
      await fetchBills(true);
      setChargeBackId(null);
      setChargeBackAmount(0);
    } catch (err) {
      console.error('Failed to charge back:', err);
    }
  };

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
      if (!isLoadingRef.current && hasMoreRef.current) {
        fetchBills(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || '未知';
  };

  if (loading && bills.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 300 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            {/* 时间范围 */}
            <TextField
              label="开始日期"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                updateSearchParams({ start_date: e.target.value });
              }}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { xs: '100%', sm: 150 } }}
            />
            <TextField
              label="结束日期"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                updateSearchParams({ end_date: e.target.value });
              }}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { xs: '100%', sm: 150 } }}
            />

            {/* 账单类型 */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
              <InputLabel>账单类型</InputLabel>
              <Select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  updateSearchParams({ type: e.target.value || null });
                }}
                label="账单类型"
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="expense">支出</MenuItem>
                <MenuItem value="income">收入</MenuItem>
              </Select>
            </FormControl>

            {/* 周期类型 */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
              <InputLabel>周期类型</InputLabel>
              <Select
                value={periodType}
                onChange={(e) => {
                  setPeriodType(e.target.value);
                  updateSearchParams({ period_type: e.target.value });
                }}
                label="周期类型"
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="month">当月</MenuItem>
                <MenuItem value="year">当年</MenuItem>
              </Select>
            </FormControl>

            {/* 是否已消费 */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
              <InputLabel>是否已消费</InputLabel>
              <Select
                value={isConsumed === null ? '' : String(isConsumed)}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value === 'true';
                  setIsConsumed(value);
                  updateSearchParams({ is_consumed: value === null ? null : String(value) });
                }}
                label="是否已消费"
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="true">已消费</MenuItem>
                <MenuItem value="false">未消费</MenuItem>
              </Select>
            </FormControl>

            {/* 是否存在代付 */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
              <InputLabel>是否存在代付</InputLabel>
              <Select
                value={hasChargeBack === null ? '' : String(hasChargeBack)}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value === 'true';
                  setHasChargeBack(value);
                  updateSearchParams({ has_charge_back: value === null ? null : String(value) });
                }}
                label="是否存在代付"
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="true">有代付</MenuItem>
                <MenuItem value="false">无代付</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(ROUTES.BILL_NEW)}
          size="small"
          sx={{ minWidth: { xs: 'auto', sm: 100 } }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            新建
          </Box>
        </Button>
      </Box>

      {bills.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">暂无账单</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {bills.map((bill) => (
              <Grid item xs={12} sm={6} md={4} key={bill.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ flex: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Chip
                        label={bill.type === 'expense' ? '支出' : '收入'}
                        size="small"
                        color={bill.type === 'expense' ? 'error' : 'success'}
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="h6" fontWeight="bold" color={bill.type === 'expense' ? COLORS.red : COLORS.secondary}>
                        {bill.type === 'expense' ? '-' : '+'}¥{bill.amount.toFixed(2)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {getCategoryName(bill.category_id)}
                    </Typography>

                    {bill.desc && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {bill.desc}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {bill.date} · {bill.period_type === 'month' ? '当月' : '当年'}
                    </Typography>

                    <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                      {bill.is_consumed && (
                        <Chip label="已消费" size="small" variant="outlined" />
                      )}
                      {bill.has_charge_back && (
                        <Chip label="有代付" size="small" variant="outlined" />
                      )}
                      {bill.refund > 0 && (
                        <Chip label={`退款¥${bill.refund.toFixed(2)}`} size="small" variant="outlined" color="warning" />
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => navigate(ROUTES.BILL_EDIT(bill.id))}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        修改
                      </Button>
                      {bill.type === 'expense' && (
                        <Button
                          size="small"
                          startIcon={<MoneyOff />}
                          onClick={() => {
                            setRefundId(bill.id);
                            setRefundAmount(0);
                          }}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          退款
                        </Button>
                      )}
                      {bill.has_charge_back && (
                        <Button
                          size="small"
                          startIcon={<Payment />}
                          onClick={() => {
                            setChargeBackId(bill.id);
                            setChargeBackAmount(bill.charge_back_amount || 0);
                          }}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          代付
                        </Button>
                      )}
                      <Button
                        size="small"
                        startIcon={<Delete />}
                        color="error"
                        onClick={() => setDeleteId(bill.id)}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        删除
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {loadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这条账单吗？此操作不可恢复。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>取消</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 退款对话框 */}
      <Dialog open={refundId !== null} onClose={() => setRefundId(null)}>
        <DialogTitle>退款</DialogTitle>
        <DialogContent>
          <TextField
            label="退款金额"
            type="number"
            value={refundAmount || ''}
            onChange={(e) => setRefundAmount(Number(e.target.value))}
            fullWidth
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundId(null)}>取消</Button>
          <Button onClick={handleRefund} variant="contained" disabled={refundAmount <= 0}>
            确认退款
          </Button>
        </DialogActions>
      </Dialog>

      {/* 代付对话框 */}
      <Dialog open={chargeBackId !== null} onClose={() => setChargeBackId(null)}>
        <DialogTitle>代付</DialogTitle>
        <DialogContent>
          <TextField
            label="代付金额"
            type="number"
            value={chargeBackAmount || ''}
            onChange={(e) => setChargeBackAmount(Number(e.target.value))}
            fullWidth
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChargeBackId(null)}>取消</Button>
          <Button onClick={handleChargeBack} variant="contained" disabled={chargeBackAmount <= 0}>
            确认代付
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

