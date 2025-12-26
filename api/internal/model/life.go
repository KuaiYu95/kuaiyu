// Package model 生活记录模型
package model

import (
	"time"
)

// ===========================================
// 生活记录模型
// ===========================================

// LifeRecord 生活记录模型
type LifeRecord struct {
	BaseModel
	Title       string     `gorm:"size:200;not null" json:"title"`
	Content     string     `gorm:"type:text" json:"content"`
	CoverImage  string     `gorm:"size:500" json:"cover_image"`
	Status      string     `gorm:"size:20;default:draft" json:"status"` // draft | published
	AuthorID    uint       `gorm:"index" json:"author_id"`
	PublishedAt *time.Time `json:"published_at"`
	
	// 关联
	Author   User      `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Comments []Comment `gorm:"foreignKey:LifeRecordID" json:"comments,omitempty"`
}

// TableName 表名
func (LifeRecord) TableName() string {
	return "life_records"
}

// ===========================================
// 生活记录 DTO
// ===========================================

// CreateLifeRequest 创建生活记录请求
type CreateLifeRequest struct {
	Title      string `json:"title" binding:"required,max=200"`
	Content    string `json:"content" binding:"required"`
	CoverImage string `json:"cover_image"`
	Status     string `json:"status" binding:"oneof=draft published"`
}

// UpdateLifeRequest 更新生活记录请求
type UpdateLifeRequest struct {
	Title      string `json:"title" binding:"max=200"`
	Content    string `json:"content"`
	CoverImage string `json:"cover_image"`
	Status     string `json:"status" binding:"omitempty,oneof=draft published"`
}

// LifeRecordVO 生活记录视图对象
type LifeRecordVO struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	CoverImage  string    `json:"cover_image"`
	Status      string    `json:"status"`
	AuthorID    uint      `json:"author_id"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Author      *UserVO   `json:"author,omitempty"`
	IsExpanded  bool      `json:"is_expanded"` // 是否展开全文
}

// LifeRecordListVO 生活记录列表视图对象
type LifeRecordListVO struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`      // 可能是预览或全文
	CoverImage  string    `json:"cover_image"`
	Status      string    `json:"status"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time `json:"created_at"`
	HasMore     bool      `json:"has_more"` // 是否有更多内容
}

// ===========================================
// 转换方法
// ===========================================

// ToVO 转换为视图对象
func (l *LifeRecord) ToVO() LifeRecordVO {
	vo := LifeRecordVO{
		ID:          l.ID,
		Title:       l.Title,
		Content:     l.Content,
		CoverImage:  l.CoverImage,
		Status:      l.Status,
		AuthorID:    l.AuthorID,
		PublishedAt: l.PublishedAt,
		CreatedAt:   l.CreatedAt,
		UpdatedAt:   l.UpdatedAt,
		IsExpanded:  true,
	}
	
	if l.Author.ID > 0 {
		author := l.Author.ToVO()
		vo.Author = &author
	}
	
	return vo
}

// ToListVO 转换为列表视图对象
func (l *LifeRecord) ToListVO(previewLen int) LifeRecordListVO {
	content := l.Content
	hasMore := false
	
	// 如果内容超过阈值，截取预览
	runes := []rune(content)
	if len(runes) > 500 {
		if previewLen > 0 && len(runes) > previewLen {
			content = string(runes[:previewLen]) + "..."
			hasMore = true
		}
	}
	
	return LifeRecordListVO{
		ID:          l.ID,
		Title:       l.Title,
		Content:     content,
		CoverImage:  l.CoverImage,
		Status:      l.Status,
		PublishedAt: l.PublishedAt,
		CreatedAt:   l.CreatedAt,
		HasMore:     hasMore,
	}
}

