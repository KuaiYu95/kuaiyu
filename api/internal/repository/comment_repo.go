// Package repository 评论数据访问层
package repository

import (
	"gorm.io/gorm"
	"kuaiyu/internal/model"
	"kuaiyu/pkg/constants"
)

// ===========================================
// 评论仓库
// ===========================================

// CommentRepository 评论仓库
type CommentRepository struct {
	*BaseRepository
}

// NewCommentRepository 创建评论仓库
func NewCommentRepository() *CommentRepository {
	return &CommentRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// ===========================================
// 查询方法
// ===========================================

// FindByPostID 根据文章 ID 查找评论
func (r *CommentRepository) FindByPostID(postID uint, includeReplies bool) ([]model.Comment, error) {
	var comments []model.Comment
	
	query := r.db.Where("post_id = ? AND parent_id IS NULL AND status = ?",
		postID, constants.CommentStatusApproved).
		Order("created_at ASC")
	
	if includeReplies {
		query = query.Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Where("status = ?", constants.CommentStatusApproved).
				Order("created_at ASC")
		})
	}
	
	err := query.Find(&comments).Error
	return comments, err
}

// FindByLifeRecordID 根据生活记录 ID 查找评论
func (r *CommentRepository) FindByLifeRecordID(lifeRecordID uint, includeReplies bool) ([]model.Comment, error) {
	var comments []model.Comment
	
	query := r.db.Where("life_record_id = ? AND parent_id IS NULL AND status = ?",
		lifeRecordID, constants.CommentStatusApproved).
		Order("created_at ASC")
	
	if includeReplies {
		query = query.Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Where("status = ?", constants.CommentStatusApproved).
				Order("created_at ASC")
		})
	}
	
	err := query.Find(&comments).Error
	return comments, err
}

// FindReplies 查找回复
func (r *CommentRepository) FindReplies(parentID uint, limit int) ([]model.Comment, int64, error) {
	var replies []model.Comment
	var count int64
	
	query := r.db.Model(&model.Comment{}).
		Where("parent_id = ? AND status = ?", parentID, constants.CommentStatusApproved)
	
	// 计数
	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}
	
	// 查询
	err := query.Order("created_at ASC").
		Limit(limit).
		Find(&replies).Error
	
	return replies, count, err
}

// FindAll 查找所有评论（管理后台）
func (r *CommentRepository) FindAll(page, limit int, status string) ([]model.Comment, int64, error) {
	var comments []model.Comment
	var count int64
	
	query := r.db.Model(&model.Comment{})
	
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
		Find(&comments).Error
	
	return comments, count, err
}

// FindPending 查找待审核评论
func (r *CommentRepository) FindPending(page, limit int) ([]model.Comment, int64, error) {
	return r.FindAll(page, limit, string(constants.CommentStatusPending))
}

// FindRecent 查找最近评论
func (r *CommentRepository) FindRecent(limit int) ([]model.Comment, error) {
	var comments []model.Comment
	err := r.db.Where("status = ? AND parent_id IS NULL", constants.CommentStatusApproved).
		Order("created_at DESC").
		Limit(limit).
		Find(&comments).Error
	return comments, err
}

// ===========================================
// 首次评论判断
// ===========================================

// IsFirstComment 判断是否为首次评论（基于邮箱）
func (r *CommentRepository) IsFirstComment(email string) bool {
	var count int64
	r.db.Model(&model.Comment{}).
		Where("email = ? AND status = ?", email, constants.CommentStatusApproved).
		Count(&count)
	return count == 0
}

// ===========================================
// 统计方法
// ===========================================

// CountByStatus 按状态统计
func (r *CommentRepository) CountByStatus() (map[string]int64, error) {
	result := make(map[string]int64)
	
	var counts []struct {
		Status string
		Count  int64
	}
	
	err := r.db.Model(&model.Comment{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&counts).Error
	
	if err != nil {
		return nil, err
	}
	
	for _, c := range counts {
		result[c.Status] = c.Count
	}
	
	return result, nil
}

// CountByPostID 统计文章评论数
func (r *CommentRepository) CountByPostID(postID uint) int64 {
	var count int64
	r.db.Model(&model.Comment{}).
		Where("post_id = ? AND status = ?", postID, constants.CommentStatusApproved).
		Count(&count)
	return count
}

// CountByLifeRecordID 统计生活记录评论数
func (r *CommentRepository) CountByLifeRecordID(lifeRecordID uint) int64 {
	var count int64
	r.db.Model(&model.Comment{}).
		Where("life_record_id = ? AND status = ?", lifeRecordID, constants.CommentStatusApproved).
		Count(&count)
	return count
}


