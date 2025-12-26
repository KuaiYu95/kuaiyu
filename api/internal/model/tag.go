// Package model 标签模型
package model

import (
	"time"
)

// ===========================================
// 标签模型
// ===========================================

// Tag 标签模型
type Tag struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex;size:50;not null" json:"name"`
	Slug        string    `gorm:"uniqueIndex;size:50" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Color       string    `gorm:"size:20" json:"color"` // 标签颜色
	CreatedAt   time.Time `json:"created_at"`
	
	// 关联
	Posts []Post `gorm:"many2many:post_tags" json:"posts,omitempty"`
}

// TableName 表名
func (Tag) TableName() string {
	return "tags"
}

// PostTag 文章标签关联表
type PostTag struct {
	PostID uint `gorm:"primaryKey"`
	TagID  uint `gorm:"primaryKey"`
}

// TableName 表名
func (PostTag) TableName() string {
	return "post_tags"
}

// ===========================================
// 标签 DTO
// ===========================================

// CreateTagRequest 创建标签请求
type CreateTagRequest struct {
	Name        string `json:"name" binding:"required,max=50"`
	Slug        string `json:"slug" binding:"max=50"`
	Description string `json:"description"`
	Color       string `json:"color" binding:"max=20"`
}

// UpdateTagRequest 更新标签请求
type UpdateTagRequest struct {
	Name        string `json:"name" binding:"max=50"`
	Slug        string `json:"slug" binding:"max=50"`
	Description string `json:"description"`
	Color       string `json:"color" binding:"max=20"`
}

// TagVO 标签视图对象
type TagVO struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description,omitempty"`
	Color       string `json:"color,omitempty"`
	PostCount   int    `json:"post_count,omitempty"`
}

// TagWithPostsVO 带文章的标签视图对象
type TagWithPostsVO struct {
	TagVO
	Posts []PostListVO `json:"posts,omitempty"`
}

// ===========================================
// 转换方法
// ===========================================

// ToVO 转换为视图对象
func (t *Tag) ToVO() TagVO {
	return TagVO{
		ID:          t.ID,
		Name:        t.Name,
		Slug:        t.Slug,
		Description: t.Description,
		Color:       t.Color,
	}
}

// ToVOWithCount 转换为带文章数的视图对象
func (t *Tag) ToVOWithCount(count int) TagVO {
	vo := t.ToVO()
	vo.PostCount = count
	return vo
}

