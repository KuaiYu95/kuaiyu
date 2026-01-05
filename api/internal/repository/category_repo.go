// Package repository 分类数据访问层
package repository

import (
	"kuaiyu/internal/model"
)

// ===========================================
// 分类仓库
// ===========================================

// CategoryRepository 分类仓库
type CategoryRepository struct {
	*BaseRepository
}

// NewCategoryRepository 创建分类仓库
func NewCategoryRepository() *CategoryRepository {
	return &CategoryRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// ===========================================
// 查询方法
// ===========================================

// FindAll 查找所有分类
func (r *CategoryRepository) FindAll() ([]model.Category, error) {
	var categories []model.Category
	err := r.db.Order("created_at ASC").Find(&categories).Error
	return categories, err
}

// FindByID 根据 ID 查找
func (r *CategoryRepository) FindByID(id uint) (*model.Category, error) {
	var category model.Category
	err := r.db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// FindByKey 根据 key 查找
func (r *CategoryRepository) FindByKey(key string) (*model.Category, error) {
	var category model.Category
	err := r.db.Where("key = ?", key).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// ===========================================
// 创建方法
// ===========================================

// Create 创建分类
func (r *CategoryRepository) Create(category *model.Category) error {
	return r.db.Create(category).Error
}

// ===========================================
// 删除方法
// ===========================================

// Delete 删除分类
func (r *CategoryRepository) Delete(id uint) error {
	return r.db.Delete(&model.Category{}, id).Error
}

// ===========================================
// 统计方法
// ===========================================

// CountBillsByCategory 统计分类下的账单数量
func (r *CategoryRepository) CountBillsByCategory(categoryID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.Bill{}).
		Where("category_id = ?", categoryID).
		Count(&count).Error
	return count, err
}

// UpdateBillsCategory 批量更新账单的分类
func (r *CategoryRepository) UpdateBillsCategory(oldCategoryID, newCategoryID uint) error {
	return r.db.Model(&model.Bill{}).
		Where("category_id = ?", oldCategoryID).
		Update("category_id", newCategoryID).Error
}

