// Package repository 账单数据访问层
package repository

import (
	"time"
	"kuaiyu/internal/model"
)

// ===========================================
// 账单仓库
// ===========================================

// BillRepository 账单仓库
type BillRepository struct {
	*BaseRepository
}

// NewBillRepository 创建账单仓库
func NewBillRepository() *BillRepository {
	return &BillRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// ===========================================
// 查询方法
// ===========================================

// FindByID 根据 ID 查找
func (r *BillRepository) FindByID(id uint) (*model.Bill, error) {
	var bill model.Bill
	err := r.db.Preload("Category").
		First(&bill, id).Error
	if err != nil {
		return nil, err
	}
	return &bill, nil
}

// FindAll 查找所有账单（分页，支持筛选）
func (r *BillRepository) FindAll(page, limit int, filters map[string]interface{}) ([]model.Bill, int64, error) {
	var bills []model.Bill
	var count int64
	
	query := r.db.Model(&model.Bill{}).Preload("Category")
	
	// 应用筛选条件
	if typeVal, ok := filters["type"].(string); ok && typeVal != "" {
		query = query.Where("type = ?", typeVal)
	}
	
	if categoryID, ok := filters["category_id"].(uint); ok && categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	
	if startDate, ok := filters["start_date"].(string); ok && startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	
	if endDate, ok := filters["end_date"].(string); ok && endDate != "" {
		query = query.Where("date <= ?", endDate)
	}
	
	if periodType, ok := filters["period_type"].(string); ok && periodType != "" {
		query = query.Where("period_type = ?", periodType)
	}
	
	if isConsumed, ok := filters["is_consumed"].(bool); ok {
		query = query.Where("is_consumed = ?", isConsumed)
	}
	
	if hasChargeBack, ok := filters["has_charge_back"].(bool); ok {
		query = query.Where("has_charge_back = ?", hasChargeBack)
	}
	
	// 计数
	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}
	
	// 查询
	offset := (page - 1) * limit
	err := query.Order("date DESC, created_at DESC").
		Offset(offset).Limit(limit).
		Find(&bills).Error
	
	return bills, count, err
}

// ===========================================
// 创建方法
// ===========================================

// Create 创建账单
func (r *BillRepository) Create(bill *model.Bill) error {
	return r.db.Create(bill).Error
}

// ===========================================
// 更新方法
// ===========================================

// Update 更新账单
func (r *BillRepository) Update(id uint, bill *model.Bill) error {
	return r.db.Model(&model.Bill{}).Where("id = ?", id).Updates(bill).Error
}

// UpdateRefund 更新退款金额
func (r *BillRepository) UpdateRefund(id uint, refundAmount float64) error {
	return r.db.Model(&model.Bill{}).
		Where("id = ?", id).
		Update("refund", refundAmount).Error
}

// UpdateChargeBack 更新代付信息
func (r *BillRepository) UpdateChargeBack(id uint, hasChargeBack bool, chargeBackAmount float64) error {
	return r.db.Model(&model.Bill{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"has_charge_back":    hasChargeBack,
			"charge_back_amount": chargeBackAmount,
		}).Error
}

// ===========================================
// 删除方法
// ===========================================

// Delete 删除账单（软删除）
func (r *BillRepository) Delete(id uint) error {
	return r.db.Delete(&model.Bill{}, id).Error
}

// ===========================================
// 统计方法
// ===========================================

// GetStatistics 获取统计数据
func (r *BillRepository) GetStatistics(startDate, endDate string, filters map[string]interface{}) (*model.BillStatistics, error) {
	stats := &model.BillStatistics{
		ExpenseByCategory: make(map[string]float64),
		IncomeByCategory:  make(map[string]float64),
	}
	
	query := r.db.Model(&model.Bill{})
	
	// 应用日期筛选
	if startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("date <= ?", endDate)
	}
	
	// 应用其他筛选
	if typeVal, ok := filters["type"].(string); ok && typeVal != "" {
		query = query.Where("type = ?", typeVal)
	}
	
	// 总支出
	var totalExpense float64
	expenseQuery := r.db.Model(&model.Bill{}).Where("type = ?", "expense")
	if startDate != "" {
		expenseQuery = expenseQuery.Where("date >= ?", startDate)
	}
	if endDate != "" {
		expenseQuery = expenseQuery.Where("date <= ?", endDate)
	}
	if typeVal, ok := filters["type"].(string); ok && typeVal != "" && typeVal == "expense" {
		// 已经在type筛选中了
	}
	expenseQuery.Select("COALESCE(SUM(amount - refund - COALESCE(charge_back_amount, 0)), 0)").Scan(&totalExpense)
	stats.TotalExpense = totalExpense
	
	// 总收入
	var totalIncome float64
	incomeQuery := r.db.Model(&model.Bill{}).Where("type = ?", "income")
	if startDate != "" {
		incomeQuery = incomeQuery.Where("date >= ?", startDate)
	}
	if endDate != "" {
		incomeQuery = incomeQuery.Where("date <= ?", endDate)
	}
	if typeVal, ok := filters["type"].(string); ok && typeVal != "" && typeVal == "income" {
		// 已经在type筛选中了
	}
	incomeQuery.Select("COALESCE(SUM(amount), 0)").Scan(&totalIncome)
	stats.TotalIncome = totalIncome
	
	// 本月支出和收入
	now := time.Now()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	monthEnd := monthStart.AddDate(0, 1, 0).Add(-time.Second)
	
	var monthExpense float64
	r.db.Model(&model.Bill{}).
		Where("date >= ? AND date <= ? AND type = ?", monthStart.Format("2006-01-02"), monthEnd.Format("2006-01-02"), "expense").
		Select("COALESCE(SUM(amount - refund - COALESCE(charge_back_amount, 0)), 0)").
		Scan(&monthExpense)
	stats.MonthExpense = monthExpense
	
	var monthIncome float64
	r.db.Model(&model.Bill{}).
		Where("date >= ? AND date <= ? AND type = ?", monthStart.Format("2006-01-02"), monthEnd.Format("2006-01-02"), "income").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&monthIncome)
	stats.MonthIncome = monthIncome
	
	// 本年支出和收入
	yearStart := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
	yearEnd := time.Date(now.Year(), 12, 31, 23, 59, 59, 0, now.Location())
	
	var yearExpense float64
	r.db.Model(&model.Bill{}).
		Where("date >= ? AND date <= ? AND type = ?", yearStart.Format("2006-01-02"), yearEnd.Format("2006-01-02"), "expense").
		Select("COALESCE(SUM(amount - refund - COALESCE(charge_back_amount, 0)), 0)").
		Scan(&yearExpense)
	stats.YearExpense = yearExpense
	
	var yearIncome float64
	r.db.Model(&model.Bill{}).
		Where("date >= ? AND date <= ? AND type = ?", yearStart.Format("2006-01-02"), yearEnd.Format("2006-01-02"), "income").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&yearIncome)
	stats.YearIncome = yearIncome
	
	// 按分类统计支出
	type CategoryExpense struct {
		CategoryName string
		Total        float64
	}
	var expenseByCategory []CategoryExpense
	expenseCategoryQuery := r.db.Model(&model.Bill{}).
		Select("categories.name as category_name, COALESCE(SUM(bills.amount - bills.refund - COALESCE(bills.charge_back_amount, 0)), 0) as total").
		Joins("JOIN categories ON categories.id = bills.category_id").
		Where("bills.type = ?", "expense")
	if startDate != "" {
		expenseCategoryQuery = expenseCategoryQuery.Where("bills.date >= ?", startDate)
	}
	if endDate != "" {
		expenseCategoryQuery = expenseCategoryQuery.Where("bills.date <= ?", endDate)
	}
	expenseCategoryQuery.Group("categories.id, categories.name").Scan(&expenseByCategory)
	
	for _, item := range expenseByCategory {
		stats.ExpenseByCategory[item.CategoryName] = item.Total
	}
	
	// 按分类统计收入
	type CategoryIncome struct {
		CategoryName string
		Total        float64
	}
	var incomeByCategory []CategoryIncome
	incomeCategoryQuery := r.db.Model(&model.Bill{}).
		Select("categories.name as category_name, COALESCE(SUM(bills.amount), 0) as total").
		Joins("JOIN categories ON categories.id = bills.category_id").
		Where("bills.type = ?", "income")
	if startDate != "" {
		incomeCategoryQuery = incomeCategoryQuery.Where("bills.date >= ?", startDate)
	}
	if endDate != "" {
		incomeCategoryQuery = incomeCategoryQuery.Where("bills.date <= ?", endDate)
	}
	incomeCategoryQuery.Group("categories.id, categories.name").Scan(&incomeByCategory)
	
	for _, item := range incomeByCategory {
		stats.IncomeByCategory[item.CategoryName] = item.Total
	}
	
	return stats, nil
}

// GetDailyTrend 获取近30天每天的消费趋势
func (r *BillRepository) GetDailyTrend() ([]model.BillTrendData, error) {
	now := time.Now()
	endDate := now.Format("2006-01-02")
	startDate := now.AddDate(0, 0, -30).Format("2006-01-02")

	type TrendItem struct {
		Date    string
		Expense float64
		Income  float64
	}
	var trendItems []TrendItem
	r.db.Model(&model.Bill{}).
		Select("DATE(bills.date) as date, "+
			"COALESCE(SUM(CASE WHEN bills.type = 'expense' THEN bills.amount - bills.refund - COALESCE(bills.charge_back_amount, 0) ELSE 0 END), 0) as expense, "+
			"COALESCE(SUM(CASE WHEN bills.type = 'income' THEN bills.amount ELSE 0 END), 0) as income").
		Where("bills.date >= ? AND bills.date <= ?", startDate, endDate).
		Group("DATE(bills.date)").
		Order("date ASC").
		Scan(&trendItems)

	result := make([]model.BillTrendData, len(trendItems))
	for i, item := range trendItems {
		result[i] = model.BillTrendData{
			Date:    item.Date,
			Expense: item.Expense,
			Income:  item.Income,
		}
	}

	return result, nil
}

// GetMonthlyTrend 获取近12个月每月的消费趋势
func (r *BillRepository) GetMonthlyTrend() ([]model.BillTrendData, error) {
	now := time.Now()
	var result []model.BillTrendData

	// 生成近12个月的月份列表
	for i := 11; i >= 0; i-- {
		monthDate := now.AddDate(0, -i, 0)
		monthStart := time.Date(monthDate.Year(), monthDate.Month(), 1, 0, 0, 0, 0, monthDate.Location())
		monthEnd := monthStart.AddDate(0, 1, 0).Add(-time.Second)

		type MonthTrendItem struct {
			Expense float64
			Income  float64
		}
		var trendItem MonthTrendItem
		r.db.Model(&model.Bill{}).
			Select("COALESCE(SUM(CASE WHEN bills.type = 'expense' THEN bills.amount - bills.refund - COALESCE(bills.charge_back_amount, 0) ELSE 0 END), 0) as expense, "+
				"COALESCE(SUM(CASE WHEN bills.type = 'income' THEN bills.amount ELSE 0 END), 0) as income").
			Where("bills.date >= ? AND bills.date <= ?", monthStart.Format("2006-01-02"), monthEnd.Format("2006-01-02")).
			Scan(&trendItem)

		result = append(result, model.BillTrendData{
			Date:    monthStart.Format("2006-01"),
			Expense: trendItem.Expense,
			Income:  trendItem.Income,
		})
	}

	return result, nil
}

// GetCategoryRanking 获取近12个月不同种类消费排名（全部）
func (r *BillRepository) GetCategoryRanking() ([]model.CategoryRankingItem, error) {
	now := time.Now()
	monthStart := now.AddDate(0, -12, 0)
	monthStart = time.Date(monthStart.Year(), monthStart.Month(), 1, 0, 0, 0, 0, monthStart.Location())

	type CategoryRankItem struct {
		CategoryName string
		Total        float64
	}
	var rankItems []CategoryRankItem
	r.db.Model(&model.Bill{}).
		Select("categories.name as category_name, COALESCE(SUM(bills.amount - bills.refund - COALESCE(bills.charge_back_amount, 0)), 0) as total").
		Joins("JOIN categories ON categories.id = bills.category_id").
		Where("bills.type = ? AND bills.date >= ?", "expense", monthStart.Format("2006-01-02")).
		Group("categories.id, categories.name").
		Scan(&rankItems)

	result := make([]model.CategoryRankingItem, len(rankItems))
	for i, item := range rankItems {
		result[i] = model.CategoryRankingItem{
			CategoryName: item.CategoryName,
			Total:        item.Total,
		}
	}

	return result, nil
}

