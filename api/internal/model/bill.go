// Package model 账单模型
package model

import (
	"time"
)

// ===========================================
// 账单模型
// ===========================================

// Bill 账单模型
type Bill struct {
	BaseModel
	Type             string     `gorm:"type:enum('expense','income');not null" json:"type"` // expense | income
	CategoryID       uint       `gorm:"index;not null" json:"category_id"`
	Amount           float64    `gorm:"type:decimal(10,2);not null" json:"amount"`
	Desc             string     `gorm:"size:500" json:"desc"`
	Date             time.Time  `gorm:"type:date;not null" json:"date"`
	PeriodType       string     `gorm:"type:enum('month','year');default:'month'" json:"period_type"` // month | year
	IsConsumed       bool       `gorm:"default:true" json:"is_consumed"`
	Refund           float64    `gorm:"type:decimal(10,2);default:0" json:"refund"`
	RefundType       int        `gorm:"type:tinyint(1);default:0" json:"refund_type"` // 0-无，1-退款，2-代付
	
	// 关联
	Category Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

// TableName 表名
func (Bill) TableName() string {
	return "bills"
}

// ===========================================
// 账单 DTO
// ===========================================

// CreateBillRequest 创建账单请求
type CreateBillRequest struct {
	Type             string  `json:"type" binding:"required,oneof=expense income"`
	CategoryID       uint    `json:"category_id" binding:"required"`
	Amount           float64 `json:"amount" binding:"required,gt=0"`
	Desc             string  `json:"desc" binding:"max=500"`
	Date             string  `json:"date" binding:"required"`
	PeriodType       string  `json:"period_type" binding:"omitempty,oneof=month year"`
	IsConsumed       *bool   `json:"is_consumed"`
	Refund           float64 `json:"refund"`
	RefundType       int     `json:"refund_type" binding:"omitempty,oneof=0 1 2"` // 0-无，1-退款，2-代付
}

// UpdateBillRequest 更新账单请求
type UpdateBillRequest struct {
	Type             string  `json:"type" binding:"omitempty,oneof=expense income"`
	CategoryID       uint    `json:"category_id"`
	Amount           float64 `json:"amount" binding:"omitempty,gt=0"`
	Desc             string  `json:"desc" binding:"max=500"`
	Date             string  `json:"date"`
	PeriodType       string  `json:"period_type" binding:"omitempty,oneof=month year"`
	IsConsumed       *bool   `json:"is_consumed"`
	Refund           float64 `json:"refund"`
	RefundType       int     `json:"refund_type" binding:"omitempty,oneof=0 1 2"` // 0-无，1-退款，2-代付
}

// RefundRequest 退款请求
type RefundRequest struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
}

// ChargeBackRequest 代付请求
type ChargeBackRequest struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
}

// BillVO 账单视图对象
type BillVO struct {
	ID               uint      `json:"id"`
	Type             string    `json:"type"`
	CategoryID       uint      `json:"category_id"`
	Amount           float64   `json:"amount"`
	Desc             string    `json:"desc"`
	Date             string    `json:"date"`
	PeriodType       string    `json:"period_type"`
	IsConsumed       bool      `json:"is_consumed"`
	Refund           float64   `json:"refund"`
	RefundType       int       `json:"refund_type"` // 0-无，1-退款，2-代付
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	Category          *CategoryVO `json:"category,omitempty"`
}

// BillListVO 账单列表视图对象
type BillListVO struct {
	ID               uint      `json:"id"`
	Type             string    `json:"type"`
	CategoryID       uint      `json:"category_id"`
	Amount           float64   `json:"amount"`
	Desc             string    `json:"desc"`
	Date             string    `json:"date"`
	PeriodType       string    `json:"period_type"`
	IsConsumed       bool      `json:"is_consumed"`
	Refund           float64   `json:"refund"`
	RefundType       int       `json:"refund_type"` // 0-无，1-退款，2-代付
	CreatedAt         time.Time `json:"created_at"`
	Category          *CategoryVO `json:"category,omitempty"`
}

// BillStatistics 账单统计数据
type BillStatistics struct {
	TotalExpense     float64 `json:"total_expense"`      // 总支出
	TotalIncome      float64 `json:"total_income"`       // 总收入
	MonthExpense     float64 `json:"month_expense"`      // 本月支出
	MonthIncome      float64 `json:"month_income"`       // 本月收入
	YearExpense      float64 `json:"year_expense"`       // 本年支出
	YearIncome       float64 `json:"year_income"`        // 本年收入
	ExpenseByCategory map[string]float64 `json:"expense_by_category"` // 按分类统计支出
	IncomeByCategory  map[string]float64 `json:"income_by_category"`  // 按分类统计收入
}

// BillTrendData 账单趋势数据
type BillTrendData struct {
	Date        string  `json:"date"`
	Expense     float64 `json:"expense"`
	Income      float64 `json:"income"`
}

// CategoryRankingItem 分类排名项
type CategoryRankingItem struct {
	CategoryName string  `json:"category_name"`
	Total        float64 `json:"total"`
}

// ===========================================
// 转换方法
// ===========================================

// ToVO 转换为视图对象
func (b *Bill) ToVO() BillVO {
	vo := BillVO{
		ID:               b.ID,
		Type:             b.Type,
		CategoryID:       b.CategoryID,
		Amount:           b.Amount,
		Desc:             b.Desc,
		Date:             b.Date.Format("2006-01-02"),
		PeriodType:       b.PeriodType,
		IsConsumed:       b.IsConsumed,
		Refund:           b.Refund,
		RefundType:       b.RefundType,
		CreatedAt:         b.CreatedAt,
		UpdatedAt:         b.UpdatedAt,
	}
	
	// 转换分类
	if b.Category.ID > 0 {
		category := b.Category.ToVO()
		vo.Category = &category
	}
	
	return vo
}

// ToListVO 转换为列表视图对象
func (b *Bill) ToListVO() BillListVO {
	vo := BillListVO{
		ID:               b.ID,
		Type:             b.Type,
		CategoryID:       b.CategoryID,
		Amount:           b.Amount,
		Desc:             b.Desc,
		Date:             b.Date.Format("2006-01-02"),
		PeriodType:       b.PeriodType,
		IsConsumed:       b.IsConsumed,
		Refund:           b.Refund,
		RefundType:       b.RefundType,
		CreatedAt:         b.CreatedAt,
	}
	
	// 转换分类
	if b.Category.ID > 0 {
		category := b.Category.ToVO()
		vo.Category = &category
	}
	
	return vo
}

