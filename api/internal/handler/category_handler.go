// Package handler 分类处理器
package handler

import (
	"github.com/gin-gonic/gin"
	"kuaiyu/internal/model"
	"kuaiyu/internal/repository"
	"kuaiyu/pkg/response"
)

// ===========================================
// 分类处理器
// ===========================================

// CategoryHandler 分类处理器
type CategoryHandler struct {
	repo *repository.CategoryRepository
}

// NewCategoryHandler 创建分类处理器
func NewCategoryHandler() *CategoryHandler {
	return &CategoryHandler{
		repo: repository.NewCategoryRepository(),
	}
}

// ===========================================
// 管理接口
// ===========================================

// List 获取分类列表
func (h *CategoryHandler) List(c *gin.Context) {
	categories, err := h.repo.FindAll()
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 转换为视图对象并统计账单数量
	items := make([]model.CategoryVO, len(categories))
	for i, category := range categories {
		count, _ := h.repo.CountBillsByCategory(category.ID)
		items[i] = category.ToVOWithCount(count)
	}
	
	response.Success(c, items)
}

// Create 创建分类
func (h *CategoryHandler) Create(c *gin.Context) {
	var req model.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	// 如果没有显式传递类型，默认设置为 expense（与数据库默认值一致）
	if req.Type == "" {
		req.Type = "expense"
	}

	// 检查 key 是否已存在
	existing, _ := h.repo.FindByKey(req.Key)
	if existing != nil {
		response.BadRequest(c, "分类键已存在")
		return
	}

	// 检查 name 是否已存在
	var existingByName model.Category
	if err := h.repo.DB().Where("name = ? AND type = ?", req.Name, req.Type).First(&existingByName).Error; err == nil {
		response.BadRequest(c, "分类名称已存在")
		return
	}

	category := &model.Category{
		Name: req.Name,
		Key:  req.Key,
		Type: req.Type,
	}

	if err := h.repo.Create(category); err != nil {
		response.InternalError(c, "")
		return
	}

	response.Success(c, category.ToVO())
}

// Delete 删除分类
func (h *CategoryHandler) Delete(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的分类 ID")
		return
	}
	
	// 检查分类是否存在
	_, err = h.repo.FindByID(id)
	if err != nil {
		response.NotFound(c, "分类不存在")
		return
	}
	
	// 检查是否有关联账单
	count, err := h.repo.CountBillsByCategory(id)
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	if count > 0 {
		// 如果有关联账单，需要先批量修改到"其他"分类
		// 查找"其他"分类
		otherCategory, err := h.repo.FindByKey("other")
		if err != nil {
			// 如果没有"其他"分类，创建一个
			otherCategory = &model.Category{
				Name: "其他",
				Key:  "other",
			}
			if err := h.repo.Create(otherCategory); err != nil {
				response.InternalError(c, "无法创建默认分类")
				return
			}
		}
		
		// 批量更新账单分类
		if err := h.repo.UpdateBillsCategory(id, otherCategory.ID); err != nil {
			response.InternalError(c, "批量更新账单分类失败")
			return
		}
	}
	
	// 删除分类
	if err := h.repo.Delete(id); err != nil {
		response.InternalError(c, "")
		return
	}
	
	response.Success(c, nil)
}

