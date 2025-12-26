// Package repository 数据访问层
// 提供统一的数据库操作接口
package repository

import (
	"gorm.io/gorm"
	"kuaiyu/internal/database"
)

// ===========================================
// 基础仓库
// ===========================================

// BaseRepository 基础仓库
type BaseRepository struct {
	db *gorm.DB
}

// NewBaseRepository 创建基础仓库
func NewBaseRepository() *BaseRepository {
	return &BaseRepository{
		db: database.Get(),
	}
}

// DB 获取数据库实例
func (r *BaseRepository) DB() *gorm.DB {
	return r.db
}

// ===========================================
// 通用查询方法
// ===========================================

// FindByID 根据 ID 查找
func (r *BaseRepository) FindByID(model interface{}, id uint) error {
	return r.db.First(model, id).Error
}

// FindAll 查找所有
func (r *BaseRepository) FindAll(models interface{}) error {
	return r.db.Find(models).Error
}

// Create 创建
func (r *BaseRepository) Create(model interface{}) error {
	return r.db.Create(model).Error
}

// Update 更新
func (r *BaseRepository) Update(model interface{}) error {
	return r.db.Save(model).Error
}

// Delete 删除
func (r *BaseRepository) Delete(model interface{}) error {
	return r.db.Delete(model).Error
}

// Count 计数
func (r *BaseRepository) Count(model interface{}, count *int64) error {
	return r.db.Model(model).Count(count).Error
}

// ===========================================
// 分页查询
// ===========================================

// Paginate 分页查询
func (r *BaseRepository) Paginate(models interface{}, page, limit int, count *int64, conditions ...interface{}) error {
	offset := (page - 1) * limit
	
	query := r.db.Model(models)
	
	if len(conditions) > 0 {
		query = query.Where(conditions[0], conditions[1:]...)
	}
	
	// 计数
	if err := query.Count(count).Error; err != nil {
		return err
	}
	
	// 查询
	return query.Offset(offset).Limit(limit).Find(models).Error
}

