// Package model 评论模型
package model

import (
	"time"
)

// ===========================================
// 评论模型
// ===========================================

// Comment 评论模型
type Comment struct {
	BaseModel
	PostID       *uint  `gorm:"index" json:"post_id"`        // 博客文章ID
	LifeRecordID *uint  `gorm:"index" json:"life_record_id"` // 生活记录ID
	ParentID     *uint  `gorm:"index" json:"parent_id"`      // 父评论ID（回复）
	Nickname     string `gorm:"size:50;not null" json:"nickname"`
	Email        string `gorm:"size:100;not null;index" json:"email"`
	Avatar       string `gorm:"size:500" json:"avatar"`
	Website      string `gorm:"size:500" json:"website"`
	Content      string `gorm:"type:text;not null" json:"content"`
	IsAdmin      bool   `gorm:"default:false" json:"is_admin"` // 是否为管理员回复
	Status       string `gorm:"size:20;default:pending;index" json:"status"` // pending | approved | spam
	IPAddress    string `gorm:"size:45" json:"ip_address,omitempty"`
	UserAgent    string `gorm:"size:500" json:"-"`
	
	// 关联
	Parent   *Comment  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Replies  []Comment `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
}

// TableName 表名
func (Comment) TableName() string {
	return "comments"
}

// ===========================================
// 评论 DTO
// ===========================================

// CreateCommentRequest 创建评论请求
type CreateCommentRequest struct {
	PostID       *uint  `json:"post_id"`
	LifeRecordID *uint  `json:"life_record_id"`
	ParentID     *uint  `json:"parent_id"`
	Nickname     string `json:"nickname" binding:"required,max=50"`
	Email        string `json:"email" binding:"required,email,max=100"`
	Avatar       string `json:"avatar" binding:"max=500"`
	Website      string `json:"website" binding:"max=500"`
	Content      string `json:"content" binding:"required,max=2000"`
}

// AdminReplyRequest 管理员回复请求
type AdminReplyRequest struct {
	Content string `json:"content" binding:"required,max=2000"`
}

// UpdateCommentRequest 更新评论请求
type UpdateCommentRequest struct {
	Status string `json:"status" binding:"required,oneof=pending approved spam"`
}

// CommentVO 评论视图对象
type CommentVO struct {
	ID           uint         `json:"id"`
	PostID       *uint        `json:"post_id,omitempty"`
	LifeRecordID *uint        `json:"life_record_id,omitempty"`
	ParentID     *uint        `json:"parent_id,omitempty"`
	Nickname     string       `json:"nickname"`
	Email        string       `json:"email,omitempty"` // 仅管理员可见
	Avatar       string       `json:"avatar"`
	Website      string       `json:"website"`
	Content      string       `json:"content"`
	IsAdmin      bool         `json:"is_admin"`
	Status       string       `json:"status"`
	CreatedAt    time.Time    `json:"created_at"`
	Replies      []CommentVO  `json:"replies,omitempty"`
	ReplyCount   int          `json:"reply_count,omitempty"` // 回复总数
	HasMore      bool         `json:"has_more,omitempty"`    // 是否有更多回复
}

// CommentListVO 评论列表视图对象（用于管理后台）
type CommentListVO struct {
	ID           uint      `json:"id"`
	PostID       *uint     `json:"post_id,omitempty"`
	LifeRecordID *uint     `json:"life_record_id,omitempty"`
	ParentID     *uint     `json:"parent_id,omitempty"`
	Nickname     string    `json:"nickname"`
	Email        string    `json:"email"`
	Avatar       string    `json:"avatar"`
	Website      string    `json:"website"`
	Content      string    `json:"content"`
	IsAdmin      bool      `json:"is_admin"`
	Status       string    `json:"status"`
	IPAddress    string    `json:"ip_address"`
	CreatedAt    time.Time `json:"created_at"`
	PostTitle    string    `json:"post_title,omitempty"`     // 关联文章标题
	LifeTitle    string    `json:"life_title,omitempty"`     // 关联生活记录标题
}

// CreateCommentResponse 创建评论响应
type CreateCommentResponse struct {
	ID      uint   `json:"id"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

// ===========================================
// 转换方法
// ===========================================

// ToVO 转换为视图对象（公开，隐藏邮箱）
func (c *Comment) ToVO() CommentVO {
	vo := CommentVO{
		ID:           c.ID,
		PostID:       c.PostID,
		LifeRecordID: c.LifeRecordID,
		ParentID:     c.ParentID,
		Nickname:     c.Nickname,
		Avatar:       c.Avatar,
		Website:      c.Website,
		Content:      c.Content,
		IsAdmin:      c.IsAdmin,
		Status:       c.Status,
		CreatedAt:    c.CreatedAt,
	}
	
	return vo
}

// ToAdminVO 转换为管理后台视图对象（包含邮箱）
func (c *Comment) ToAdminVO() CommentVO {
	vo := c.ToVO()
	vo.Email = c.Email
	return vo
}

// ToListVO 转换为列表视图对象
func (c *Comment) ToListVO() CommentListVO {
	return CommentListVO{
		ID:           c.ID,
		PostID:       c.PostID,
		LifeRecordID: c.LifeRecordID,
		ParentID:     c.ParentID,
		Nickname:     c.Nickname,
		Email:        c.Email,
		Avatar:       c.Avatar,
		Website:      c.Website,
		Content:      c.Content,
		IsAdmin:      c.IsAdmin,
		Status:       c.Status,
		IPAddress:    c.IPAddress,
		CreatedAt:    c.CreatedAt,
	}
}

