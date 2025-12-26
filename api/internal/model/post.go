// Package model 博客文章模型
package model

import (
	"time"
)

// ===========================================
// 文章模型
// ===========================================

// Post 博客文章模型
type Post struct {
	BaseModel
	Title       string     `gorm:"size:200;not null" json:"title"`
	Slug        string     `gorm:"uniqueIndex;size:200" json:"slug"`
	Content     string     `gorm:"type:text" json:"content"`
	Excerpt     string     `gorm:"type:text" json:"excerpt"`
	CoverImage  string     `gorm:"size:500" json:"cover_image"`
	Status      string     `gorm:"size:20;default:draft" json:"status"` // draft | published
	ViewCount   int        `gorm:"default:0" json:"view_count"`
	AuthorID    uint       `gorm:"index" json:"author_id"`
	PublishedAt *time.Time `json:"published_at"`
	
	// 关联
	Author   User   `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Tags     []Tag  `gorm:"many2many:post_tags" json:"tags,omitempty"`
	Comments []Comment `gorm:"foreignKey:PostID" json:"comments,omitempty"`
}

// TableName 表名
func (Post) TableName() string {
	return "posts"
}

// ===========================================
// 文章 DTO
// ===========================================

// CreatePostRequest 创建文章请求
type CreatePostRequest struct {
	Title      string   `json:"title" binding:"required,max=200"`
	Slug       string   `json:"slug" binding:"max=200"`
	Content    string   `json:"content" binding:"required"`
	Excerpt    string   `json:"excerpt"`
	CoverImage string   `json:"cover_image"`
	Status     string   `json:"status" binding:"oneof=draft published"`
	TagIDs     []uint   `json:"tag_ids"`
}

// UpdatePostRequest 更新文章请求
type UpdatePostRequest struct {
	Title      string   `json:"title" binding:"max=200"`
	Slug       string   `json:"slug" binding:"max=200"`
	Content    string   `json:"content"`
	Excerpt    string   `json:"excerpt"`
	CoverImage string   `json:"cover_image"`
	Status     string   `json:"status" binding:"omitempty,oneof=draft published"`
	TagIDs     []uint   `json:"tag_ids"`
}

// PostVO 文章视图对象
type PostVO struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Content     string    `json:"content,omitempty"`
	Excerpt     string    `json:"excerpt"`
	CoverImage  string    `json:"cover_image"`
	Status      string    `json:"status"`
	ViewCount   int       `json:"view_count"`
	AuthorID    uint      `json:"author_id"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Author      *UserVO   `json:"author,omitempty"`
	Tags        []TagVO   `json:"tags,omitempty"`
}

// PostListVO 文章列表视图对象（不含内容）
type PostListVO struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Excerpt     string    `json:"excerpt"`
	CoverImage  string    `json:"cover_image"`
	Status      string    `json:"status"`
	ViewCount   int       `json:"view_count"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time `json:"created_at"`
	Tags        []TagVO   `json:"tags,omitempty"`
}

// ===========================================
// 转换方法
// ===========================================

// ToVO 转换为视图对象
func (p *Post) ToVO() PostVO {
	vo := PostVO{
		ID:          p.ID,
		Title:       p.Title,
		Slug:        p.Slug,
		Content:     p.Content,
		Excerpt:     p.Excerpt,
		CoverImage:  p.CoverImage,
		Status:      p.Status,
		ViewCount:   p.ViewCount,
		AuthorID:    p.AuthorID,
		PublishedAt: p.PublishedAt,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
	
	// 转换作者
	if p.Author.ID > 0 {
		author := p.Author.ToVO()
		vo.Author = &author
	}
	
	// 转换标签
	if len(p.Tags) > 0 {
		vo.Tags = make([]TagVO, len(p.Tags))
		for i, tag := range p.Tags {
			vo.Tags[i] = tag.ToVO()
		}
	}
	
	return vo
}

// ToListVO 转换为列表视图对象
func (p *Post) ToListVO() PostListVO {
	vo := PostListVO{
		ID:          p.ID,
		Title:       p.Title,
		Slug:        p.Slug,
		Excerpt:     p.Excerpt,
		CoverImage:  p.CoverImage,
		Status:      p.Status,
		ViewCount:   p.ViewCount,
		PublishedAt: p.PublishedAt,
		CreatedAt:   p.CreatedAt,
	}
	
	// 转换标签
	if len(p.Tags) > 0 {
		vo.Tags = make([]TagVO, len(p.Tags))
		for i, tag := range p.Tags {
			vo.Tags[i] = tag.ToVO()
		}
	}
	
	return vo
}

