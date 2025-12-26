package model

import (
	"time"
)

type Comment struct {
	BaseModel
	PostID         *uint  `gorm:"index" json:"post_id"`
	LifeRecordID   *uint  `gorm:"index" json:"life_record_id"`
	ParentID       *uint  `gorm:"index" json:"parent_id"`
	ReplyToID      *uint  `gorm:"index" json:"reply_to_id"`
	Nickname       string `gorm:"size:50;not null" json:"nickname"`
	Email          string `gorm:"size:100;not null;index" json:"email"`
	Avatar         string `gorm:"size:500" json:"avatar"`
	Website        string `gorm:"size:500" json:"website"`
	Content        string `gorm:"type:text;not null" json:"content"`
	IsAdmin        bool   `gorm:"default:false" json:"is_admin"`
	IsPinned       bool   `gorm:"default:false;index" json:"is_pinned"`
	Status         string `gorm:"size:20;default:pending;index" json:"status"`
	IPAddress      string `gorm:"size:45" json:"ip_address,omitempty"`
	UserAgent      string `gorm:"size:500" json:"-"`
	
	Parent   *Comment  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Replies  []Comment `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
}

func (Comment) TableName() string {
	return "comments"
}

type CreateCommentRequest struct {
	PostID       *uint  `json:"post_id"`
	LifeRecordID *uint  `json:"life_record_id"`
	IsGuestbook  bool   `json:"is_guestbook"`
	ParentID     *uint  `json:"parent_id"`
	ReplyToID    *uint  `json:"reply_to_id"`
	Nickname     string `json:"nickname" binding:"required,max=50"`
	Email        string `json:"email" binding:"required,email,max=100"`
	Avatar       string `json:"avatar" binding:"max=500"`
	Website      string `json:"website" binding:"max=500"`
	Content      string `json:"content" binding:"required,max=2000"`
}

type AdminReplyRequest struct {
	Content string `json:"content" binding:"required,max=2000"`
}

type UpdateCommentRequest struct {
	Status string `json:"status" binding:"required,oneof=pending approved spam"`
}

type CommentVO struct {
	ID            uint         `json:"id"`
	PostID        *uint        `json:"post_id,omitempty"`
	LifeRecordID  *uint        `json:"life_record_id,omitempty"`
	ParentID      *uint        `json:"parent_id,omitempty"`
	ParentNickname string      `json:"parent_nickname,omitempty"`
	Nickname      string       `json:"nickname"`
	Email         string       `json:"email,omitempty"`
	Avatar        string       `json:"avatar"`
	Website       string       `json:"website"`
	Content       string       `json:"content"`
	IsAdmin       bool         `json:"is_admin"`
	IsPinned      bool         `json:"is_pinned"`
	Status        string       `json:"status"`
	CreatedAt     time.Time    `json:"created_at"`
	Replies       []CommentVO  `json:"replies,omitempty"`
	ReplyCount    int          `json:"reply_count,omitempty"`
	HasMore       bool         `json:"has_more,omitempty"`
}

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
	IsPinned     bool      `json:"is_pinned"`
	Status       string    `json:"status"`
	IPAddress    string    `json:"ip_address"`
	CreatedAt    time.Time `json:"created_at"`
	PostTitle    string    `json:"post_title,omitempty"`
	LifeTitle    string    `json:"life_title,omitempty"`
}

type CreateCommentResponse struct {
	ID      uint   `json:"id"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

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
		IsPinned:     c.IsPinned,
		Status:       c.Status,
		CreatedAt:    c.CreatedAt,
	}
	
	return vo
}

func (c *Comment) ToAdminVO() CommentVO {
	vo := c.ToVO()
	vo.Email = c.Email
	return vo
}

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
		IsPinned:     c.IsPinned,
		Status:       c.Status,
		IPAddress:    c.IPAddress,
		CreatedAt:    c.CreatedAt,
	}
}

