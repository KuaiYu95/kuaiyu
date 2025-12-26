// Package repository 文章数据访问层
package repository

import (
	"gorm.io/gorm"
	"kuaiyu/internal/model"
	"kuaiyu/pkg/constants"
)

// ===========================================
// 文章仓库
// ===========================================

// PostRepository 文章仓库
type PostRepository struct {
	*BaseRepository
}

// NewPostRepository 创建文章仓库
func NewPostRepository() *PostRepository {
	return &PostRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// ===========================================
// 查询方法
// ===========================================

// FindBySlug 根据 slug 查找
func (r *PostRepository) FindBySlug(slug string) (*model.Post, error) {
	var post model.Post
	err := r.db.Preload("Tags").Preload("Author").
		Where("slug = ?", slug).First(&post).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

// FindByID 根据 ID 查找
func (r *PostRepository) FindByID(id uint) (*model.Post, error) {
	var post model.Post
	err := r.db.Preload("Tags").Preload("Author").
		First(&post, id).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

// FindPublished 查找已发布文章（分页）
func (r *PostRepository) FindPublished(page, limit int) ([]model.Post, int64, error) {
	var posts []model.Post
	var count int64
	
	query := r.db.Model(&model.Post{}).
		Where("status = ?", constants.PostStatusPublished).
		Preload("Tags")
	
	// 计数
	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}
	
	// 查询
	offset := (page - 1) * limit
	err := query.Order("published_at DESC").
		Offset(offset).Limit(limit).
		Find(&posts).Error
	
	return posts, count, err
}

// FindByTag 根据标签查找文章
func (r *PostRepository) FindByTag(tagSlug string, page, limit int) ([]model.Post, int64, error) {
	var posts []model.Post
	var count int64
	
	// 先找到标签
	var tag model.Tag
	if err := r.db.Where("slug = ?", tagSlug).First(&tag).Error; err != nil {
		return nil, 0, err
	}
	
	// 查询关联文章
	query := r.db.Model(&model.Post{}).
		Joins("JOIN post_tags ON post_tags.post_id = posts.id").
		Where("post_tags.tag_id = ? AND posts.status = ?", tag.ID, constants.PostStatusPublished).
		Preload("Tags")
	
	// 计数
	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}
	
	// 查询
	offset := (page - 1) * limit
	err := query.Order("posts.published_at DESC").
		Offset(offset).Limit(limit).
		Find(&posts).Error
	
	return posts, count, err
}

// Search 搜索文章
func (r *PostRepository) Search(keyword string, page, limit int) ([]model.Post, int64, error) {
	var posts []model.Post
	var count int64
	
	query := r.db.Model(&model.Post{}).
		Where("status = ?", constants.PostStatusPublished).
		Where("title LIKE ? OR excerpt LIKE ? OR content LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%").
		Preload("Tags")
	
	// 计数
	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}
	
	// 查询
	offset := (page - 1) * limit
	err := query.Order("published_at DESC").
		Offset(offset).Limit(limit).
		Find(&posts).Error
	
	return posts, count, err
}

// FindFeatured 查找推荐文章
func (r *PostRepository) FindFeatured(limit int) ([]model.Post, error) {
	var posts []model.Post
	err := r.db.Where("status = ?", constants.PostStatusPublished).
		Preload("Tags").
		Order("view_count DESC").
		Limit(limit).
		Find(&posts).Error
	return posts, err
}

// FindRecent 查找最近文章
func (r *PostRepository) FindRecent(limit int) ([]model.Post, error) {
	var posts []model.Post
	err := r.db.Where("status = ?", constants.PostStatusPublished).
		Preload("Tags").
		Order("published_at DESC").
		Limit(limit).
		Find(&posts).Error
	return posts, err
}

// FindAll 查找所有文章（管理后台）
func (r *PostRepository) FindAll(page, limit int, status string) ([]model.Post, int64, error) {
	var posts []model.Post
	var count int64
	
	query := r.db.Model(&model.Post{}).Preload("Tags")
	
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	// 计数
	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}
	
	// 查询
	offset := (page - 1) * limit
	err := query.Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&posts).Error
	
	return posts, count, err
}

// ===========================================
// 归档查询
// ===========================================

// Archive 归档结构
type Archive struct {
	Year  int `json:"year"`
	Month int `json:"month"`
	Count int `json:"count"`
}

// FindArchives 查找归档
func (r *PostRepository) FindArchives() ([]Archive, error) {
	var archives []Archive
	err := r.db.Model(&model.Post{}).
		Select("YEAR(published_at) as year, MONTH(published_at) as month, COUNT(*) as count").
		Where("status = ?", constants.PostStatusPublished).
		Group("YEAR(published_at), MONTH(published_at)").
		Order("year DESC, month DESC").
		Scan(&archives).Error
	return archives, err
}

// FindByYear 根据年份查找文章
func (r *PostRepository) FindByYear(year int) ([]model.Post, error) {
	var posts []model.Post
	err := r.db.Where("status = ? AND YEAR(published_at) = ?", constants.PostStatusPublished, year).
		Order("published_at DESC").
		Find(&posts).Error
	return posts, err
}

// ===========================================
// 更新方法
// ===========================================

// IncrementViewCount 增加阅读量
func (r *PostRepository) IncrementViewCount(id uint) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + ?", 1)).Error
}

// UpdateTags 更新文章标签
func (r *PostRepository) UpdateTags(post *model.Post, tagIDs []uint) error {
	// 先清除原有标签
	if err := r.db.Model(post).Association("Tags").Clear(); err != nil {
		return err
	}
	
	if len(tagIDs) == 0 {
		return nil
	}
	
	// 添加新标签
	var tags []model.Tag
	if err := r.db.Where("id IN ?", tagIDs).Find(&tags).Error; err != nil {
		return err
	}
	
	return r.db.Model(post).Association("Tags").Replace(tags)
}

// ===========================================
// 验证方法
// ===========================================

// SlugExists 检查 slug 是否存在
func (r *PostRepository) SlugExists(slug string, excludeID uint) bool {
	var count int64
	query := r.db.Model(&model.Post{}).Where("slug = ?", slug)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	query.Count(&count)
	return count > 0
}

