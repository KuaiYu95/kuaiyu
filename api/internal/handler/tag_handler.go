// Package handler 标签处理器
package handler

import (
	"github.com/gin-gonic/gin"
	"kuaiyu/internal/database"
	"kuaiyu/internal/model"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
	"kuaiyu/pkg/utils"
)

// ===========================================
// 标签处理器
// ===========================================

// TagHandler 标签处理器
type TagHandler struct{}

// NewTagHandler 创建标签处理器
func NewTagHandler() *TagHandler {
	return &TagHandler{}
}

// ===========================================
// 公开接口
// ===========================================

// List 获取标签列表
func (h *TagHandler) List(c *gin.Context) {
	var tags []model.Tag
	db := database.Get()
	
	if err := db.Find(&tags).Error; err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 统计每个标签的文章数
	items := make([]model.TagVO, len(tags))
	for i, tag := range tags {
		var count int64
		db.Table("post_tags").
			Joins("JOIN posts ON posts.id = post_tags.post_id").
			Where("post_tags.tag_id = ? AND posts.status = ?", tag.ID, constants.PostStatusPublished).
			Count(&count)
		
		items[i] = tag.ToVOWithCount(int(count))
	}
	
	response.Success(c, items)
}

// GetBySlug 根据 slug 获取标签及关联文章
func (h *TagHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	page, limit := GetPageParams(c)
	
	var tag model.Tag
	db := database.Get()
	
	if err := db.Where("slug = ?", slug).First(&tag).Error; err != nil {
		response.NotFound(c, "标签不存在")
		return
	}
	
	// 查询关联文章
	var posts []model.Post
	var total int64
	
	query := db.Model(&model.Post{}).
		Joins("JOIN post_tags ON post_tags.post_id = posts.id").
		Where("post_tags.tag_id = ? AND posts.status = ?", tag.ID, constants.PostStatusPublished).
		Preload("Tags")
	
	query.Count(&total)
	
	offset := (page - 1) * limit
	if err := query.Order("posts.published_at DESC").
		Offset(offset).Limit(limit).
		Find(&posts).Error; err != nil {
		response.InternalError(c, "")
		return
	}
	
	postVOs := make([]model.PostListVO, len(posts))
	for i, post := range posts {
		postVOs[i] = post.ToListVO()
	}
	
	result := model.TagWithPostsVO{
		TagVO: tag.ToVOWithCount(int(total)),
		Posts: postVOs,
	}
	
	response.Success(c, gin.H{
		"tag":   result.TagVO,
		"posts": result.Posts,
		"pagination": response.Paginate(page, limit, total),
	})
}

// ===========================================
// 管理接口
// ===========================================

// AdminList 管理后台列表
func (h *TagHandler) AdminList(c *gin.Context) {
	var tags []model.Tag
	db := database.Get()
	
	if err := db.Order("created_at DESC").Find(&tags).Error; err != nil {
		response.InternalError(c, "")
		return
	}
	
	items := make([]model.TagVO, len(tags))
	for i, tag := range tags {
		var count int64
		db.Table("post_tags").Where("tag_id = ?", tag.ID).Count(&count)
		items[i] = tag.ToVOWithCount(int(count))
	}
	
	response.Success(c, items)
}

// Create 创建标签
func (h *TagHandler) Create(c *gin.Context) {
	var req model.CreateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	slug := req.Slug
	if slug == "" {
		slug = utils.GenerateSlug(req.Name)
	}
	
	tag := model.Tag{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		Color:       req.Color,
	}
	
	db := database.Get()
	if err := db.Create(&tag).Error; err != nil {
		response.BadRequest(c, "标签名称已存在")
		return
	}
	
	response.Created(c, tag.ToVO())
}

// Update 更新标签
func (h *TagHandler) Update(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	var req model.UpdateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	var tag model.Tag
	db := database.Get()
	if err := db.First(&tag, id).Error; err != nil {
		response.NotFound(c, "标签不存在")
		return
	}
	
	if req.Name != "" {
		tag.Name = req.Name
	}
	if req.Slug != "" {
		tag.Slug = req.Slug
	}
	if req.Description != "" {
		tag.Description = req.Description
	}
	if req.Color != "" {
		tag.Color = req.Color
	}
	
	if err := db.Save(&tag).Error; err != nil {
		response.InternalError(c, "更新失败")
		return
	}
	
	response.SuccessMessage(c, constants.MsgUpdateSuccess, tag.ToVO())
}

// Delete 删除标签
func (h *TagHandler) Delete(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	db := database.Get()
	
	// 先删除关联
	db.Exec("DELETE FROM post_tags WHERE tag_id = ?", id)
	
	// 删除标签
	if err := db.Delete(&model.Tag{}, id).Error; err != nil {
		response.InternalError(c, "删除失败")
		return
	}
	
	response.SuccessMessage(c, constants.MsgDeleteSuccess, nil)
}

