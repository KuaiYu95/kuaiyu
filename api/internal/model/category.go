// Package model 分类模型
package model

import (
	"time"
)

// ===========================================
// 分类模型
// ===========================================

// Category 分类模型
type Category struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"uniqueIndex:idx_categories_name_type;size:50;not null" json:"name"`
	Key       string    `gorm:"uniqueIndex;size:50;not null" json:"key"`
	Type      string    `gorm:"type:enum('expense','income');not null;default:'expense'" json:"type"` // expense | income
	CreatedAt time.Time `json:"created_at"`
	
	// 关联
	Bills []Bill `gorm:"foreignKey:CategoryID" json:"bills,omitempty"`
}

// TableName 表名
func (Category) TableName() string {
	return "categories"
}

// ===========================================
// 分类 DTO
// ===========================================

// CreateCategoryRequest 创建分类请求
type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required,max=50"`
	Key  string `json:"key" binding:"required,max=50"`
	Type string `json:"type" binding:"required,oneof=expense income"`
}

// CategoryVO 分类视图对象
type CategoryVO struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Key       string `json:"key"`
	Type      string `json:"type"`
	CreatedAt string `json:"created_at"`
	BillCount int64  `json:"bill_count,omitempty"`
}

// ===========================================
// 转换方法
// ===========================================

// ToVO 转换为视图对象
func (c *Category) ToVO() CategoryVO {
	return CategoryVO{
		ID:        c.ID,
		Name:      c.Name,
		Key:       c.Key,
		Type:      c.Type,
		CreatedAt: c.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

// ToVOWithCount 转换为带账单数的视图对象
func (c *Category) ToVOWithCount(count int64) CategoryVO {
	vo := c.ToVO()
	vo.BillCount = count
	return vo
}

