// ===========================================
// 账单列表页面
// ===========================================

import Empty from '@/components/Empty';
import { CloseIcon, PlusIcon, SearchIcon } from '@/components/icons';
import { billApi, categoryApi, type Bill, type Category } from '@/lib/api';
import { COLORS, ROUTES } from '@/lib/constants';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';


export default function Bills() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isConsumedFromUrl = searchParams.get('is_consumed') !== null ? searchParams.get('is_consumed') === 'true' : null;
  const searchFromUrl = searchParams.get('search') || '';

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // 筛选条件
  const [isConsumed, setIsConsumed] = useState<boolean | null>(isConsumedFromUrl);
  const [search, setSearch] = useState(searchFromUrl);

  // 使用 ref 存储最新的筛选条件，用于滚动加载
  const filtersRef = useRef({ isConsumed, search });
  useEffect(() => {
    filtersRef.current = { isConsumed, search };
  }, [isConsumed, search]);

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
      // 使用 ref 中的最新筛选条件
      const filters = filtersRef.current;
      const params: any = {
        page: currentPage,
        limit: limit,
      };

      if (filters.isConsumed !== null) {
        params.is_consumed = filters.isConsumed;
      }
      if (filters.search) {
        params.search = filters.search;
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
  }, [isConsumed]);


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

  // 按日期分组账单
  const groupedBills = bills.reduce((acc, bill) => {
    const date = bill.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(bill);
    return acc;
  }, {} as Record<string, Bill[]>);

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return '今天';
    } else if (isYesterday) {
      return '昨天';
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekday = weekdays[date.getDay()];
      return `${month}月${day}日 周${weekday}`;
    }
  };

  // 计算日期总金额
  const getDateTotal = (bills: Bill[]) => {
    const expense = bills
      .filter((b) => b.type === 'expense')
      .reduce((sum, b) => {
        // 退款 / 代付金额都要从支出中扣除
        const actualAmount = b.amount - b.refund;
        return sum + actualAmount;
      }, 0);
    const income = bills.filter((b) => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    return { expense, income };
  };

  if (loading && bills.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <TextField
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const value = (e.target as HTMLInputElement).value;
              updateSearchParams({ search: value || null });
              fetchBills(true);
            }
          }}
          size="small"
          placeholder="搜索金额、描述、日期..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={18} hover={true} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <CloseIcon size={16} hover={true} onClick={() => {
                  setSearch('');
                  setTimeout(() => {
                    updateSearchParams({ search: null });
                    fetchBills(true);
                  }, 0);
                }} />
              </InputAdornment>
            ) : null,
          }}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant={isConsumed === false ? 'contained' : 'outlined'}
          startIcon={isConsumed === false ? <CheckBox /> : <CheckBoxOutlineBlank />}
          onClick={() => {
            const newValue = isConsumed === false ? null : false;
            setIsConsumed(newValue);
            updateSearchParams({ is_consumed: newValue === null ? null : String(newValue) });
          }}
          size="small"
          sx={{
            whiteSpace: 'nowrap',
            flexShrink: 0,
            ...(isConsumed === false
              ? {}
              : {
                color: 'text.secondary',
                borderColor: 'divider',
              }),
          }}
        >
          未消费
        </Button>
        <Button
          variant="contained"
          startIcon={<PlusIcon size={18} hover />}
          onClick={() => navigate(ROUTES.BILL_NEW)}
          size="small"
          sx={{
            minWidth: { xs: 'auto', sm: 100 },
            '& .MuiButton-startIcon': {
              margin: { xs: 0, sm: '0 8px 0 0' },
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            新建
          </Box>
        </Button>
      </Box>
      {bills.length === 0 ? (
        <Box sx={{ py: 8 }}>
          <Empty text="暂无账单" />
        </Box>
      ) : (
        <>
          <Box sx={{ mt: 2, position: 'relative' }}>
            {Object.entries(groupedBills)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, dateBills], index, allDates) => {
                const total = getDateTotal(dateBills);
                const isLast = index === allDates.length - 1;
                return (
                  <Box key={date} sx={{ position: 'relative' }}>
                    {/* 日期标题 */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        ml: { xs: 1.5, sm: 2 },
                        position: 'relative',
                        top: 0,
                        zIndex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        py: 1,
                        pl: 1.5,
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: { xs: -10, sm: -12 },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: { xs: 12, sm: 14 },
                          height: { xs: 12, sm: 14 },
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: COLORS.primary,
                          backgroundColor: 'transparent',
                          zIndex: 2,
                        }}
                      />
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.95)' }}>
                          {formatDate(date)}
                        </Typography>
                        {(total.income > 0 || total.expense > 0) && (
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            sx={{
                              fontSize: '0.875rem',
                              color: total.income - total.expense > 0 ? 'rgba(52, 211, 153, 0.9)' : 'rgba(251, 113, 133, 0.9)'
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                fontSize: '0.75rem',
                                mr: 0.25,
                              }}
                            >
                              ¥
                            </Box>
                            {Math.abs((total.income - total.expense)).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {/* 从圆圈向下连接的虚线 - 从日期标题容器中间开始 */}
                    {!isLast && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: { xs: 7.5, sm: 10 },
                          top: { xs: '24px', sm: '28px' },
                          bottom: -10,
                          width: 0,
                          borderLeft: '1px dashed',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          zIndex: 1,
                        }}
                      />
                    )}

                    {/* 该日期的账单列表 */}
                    <Box sx={{ ml: { xs: 1.5, sm: 2 }, position: 'relative' }}>
                      <Stack>
                        {dateBills.map((bill) => (
                          <Paper
                            key={bill.id}
                            onClick={() => navigate(ROUTES.BILL_EDIT(bill.id))}
                            sx={{
                              pl: { xs: 1, sm: 1.5 },
                              py: { xs: 0.75, sm: 1 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              position: 'relative',
                              backgroundColor: 'transparent',
                              boxShadow: 'none',
                              border: 'none',
                            }}
                          >
                            {/* 前置类型圆点 */}
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: bill.type === 'expense' ? COLORS.red : COLORS.secondary,
                                flexShrink: 0,
                                mr: { xs: 1, sm: 1.5 },
                                ml: { xs: 0.5, sm: 1 }, // 和左侧竖线保持一定距离
                              }}
                            />

                            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  minWidth: { xs: 60, sm: 80 },
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.9)',
                                  fontWeight: 500,
                                }}
                              >
                                {getCategoryName(bill.category_id)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  minWidth: 0,
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.7)',
                                }}
                              >
                                {bill.desc || ''}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  minWidth: { xs: 70, sm: 100 },
                                  textAlign: 'right',
                                  fontSize: '0.75rem',
                                  color: bill.type === 'expense'
                                    ? 'rgba(251, 113, 133, 0.95)'
                                    : 'rgba(52, 211, 153, 0.95)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                }}
                              >
                                {bill.refund_type > 0 && bill.refund > 0 && (
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.25,
                                      px: 0.5,
                                      py: 0.1,
                                      mr: 1,
                                      borderRadius: 0.75,
                                      fontSize: '0.65rem',
                                      lineHeight: 1.4,
                                      border: '1px solid',
                                      borderColor: 'rgba(52, 211, 153, 0.8)',
                                      color: 'rgba(52, 211, 153, 0.9)',
                                    }}
                                  >
                                    <Box component="span">
                                      {bill.refund_type === 1 ? '退' : '代'}
                                    </Box>
                                    <Box component="span">¥{bill.refund.toFixed(2)}</Box>
                                  </Box>
                                )}
                                <Box
                                  component="span"
                                  sx={{
                                    fontSize: '0.75rem',
                                    mr: 0.25,
                                  }}
                                >
                                  ¥
                                </Box>
                                {bill.amount.toFixed(2)}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
          </Box>

          {loadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </>
      )}

    </Box>
  );
}

