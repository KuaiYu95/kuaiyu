// Package model 数据模型
// 定义所有数据库模型的基础结构
package model

import (
	"time"

	"gorm.io/gorm"
)

// ===========================================
// 基础模型
// ===========================================

// BaseModel 基础模型，包含通用字段
type BaseModel struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// ===========================================
// 分页请求
// ===========================================

// PageRequest 分页请求参数
type PageRequest struct {
	Page  int `form:"page" json:"page"`
	Limit int `form:"limit" json:"limit"`
}

// GetOffset 获取偏移量
func (p *PageRequest) GetOffset() int {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 {
		p.Limit = 10
	}
	if p.Limit > 100 {
		p.Limit = 100
	}
	return (p.Page - 1) * p.Limit
}

// GetLimit 获取限制数量
func (p *PageRequest) GetLimit() int {
	if p.Limit < 1 {
		return 10
	}
	if p.Limit > 100 {
		return 100
	}
	return p.Limit
}

// ===========================================
// 搜索请求
// ===========================================

// SearchRequest 搜索请求参数
type SearchRequest struct {
	PageRequest
	Keyword string `form:"keyword" json:"keyword"`
	Tag     string `form:"tag" json:"tag"`
	Status  string `form:"status" json:"status"`
	StartAt string `form:"start_at" json:"start_at"`
	EndAt   string `form:"end_at" json:"end_at"`
	OrderBy string `form:"order_by" json:"order_by"`
	Order   string `form:"order" json:"order"` // asc | desc
}

// GetOrderBy 获取排序字段
func (s *SearchRequest) GetOrderBy() string {
	if s.OrderBy == "" {
		return "created_at"
	}
	return s.OrderBy
}

// GetOrder 获取排序方向
func (s *SearchRequest) GetOrder() string {
	if s.Order == "asc" {
		return "asc"
	}
	return "desc"
}

