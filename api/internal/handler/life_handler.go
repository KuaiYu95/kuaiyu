// Package handler 生活记录处理器
package handler

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"kuaiyu/internal/database"
	"kuaiyu/internal/middleware"
	"kuaiyu/internal/model"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
)

// ===========================================
// 生活记录处理器
// ===========================================

// LifeHandler 生活记录处理器
type LifeHandler struct{}

// NewLifeHandler 创建生活记录处理器
func NewLifeHandler() *LifeHandler {
	return &LifeHandler{}
}

// ===========================================
// 公开接口
// ===========================================

// List 获取生活记录列表
func (h *LifeHandler) List(c *gin.Context) {
	page, limit := GetPageParams(c)
	
	var records []model.LifeRecord
	var total int64
	
	db := database.Get()
	query := db.Model(&model.LifeRecord{}).
		Where("status = ?", constants.PostStatusPublished)
	
	query.Count(&total)
	
	offset := (page - 1) * limit
	if err := query.Order("published_at DESC").
		Offset(offset).Limit(limit).
		Find(&records).Error; err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 转换为列表视图
	items := make([]model.LifeRecordListVO, len(records))
	for i, record := range records {
		items[i] = record.ToListVO(constants.LifeContentPreviewLength)
	}
	
	response.PagedSuccess(c, items, page, limit, total)
}

// Get 获取生活记录详情
func (h *LifeHandler) Get(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	var record model.LifeRecord
	db := database.Get()
	if err := db.First(&record, id).Error; err != nil {
		response.NotFound(c, "记录不存在")
		return
	}
	
	if record.Status != string(constants.PostStatusPublished) {
		response.NotFound(c, "记录不存在")
		return
	}
	
	response.Success(c, record.ToVO())
}

// IncrementViews 增加生活记录的阅读量，并记录到 page_views 表
func (h *LifeHandler) IncrementViews(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")
	oneHourAgo := time.Now().Add(-1 * time.Hour)

	db := database.Get()

	// 防重复：同一 IP + User-Agent + Life 在 1 小时内只计数一次
	var existingView model.PageView
	checkErr := db.Where(
		"page_type = ? AND page_id = ? AND ip_address = ? AND user_agent = ? AND created_at > ?",
		"life", id, ipAddress, userAgent, oneHourAgo,
	).First(&existingView).Error

	if checkErr == nil {
		// 1 小时内已有记录，直接返回
		response.Success(c, nil)
		return
	}

	// 增加 life_records 表中的 view_count
	if err := db.Model(&model.LifeRecord{}).
		Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + ?", 1)).
		Error; err != nil {
		response.InternalError(c, "")
		return
	}

	// 写入 page_views 表，用于 PV/UV 统计和热门内容分析
	pv := model.PageView{
		PageType:   "life",
		PageID:     &id,
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
		Referer:    c.GetHeader("Referer"),
		DeviceType: detectDeviceType(userAgent),
		Browser:    detectBrowser(userAgent),
		OS:         detectOS(userAgent),
	}

	if err := db.Create(&pv).Error; err != nil {
		// 记录失败不影响主流程，仅打日志
		log.Printf("Failed to record life page view: %v", err)
	}

	response.Success(c, nil)
}

// ===========================================
// 管理接口
// ===========================================

// AdminList 管理后台列表
func (h *LifeHandler) AdminList(c *gin.Context) {
	page, limit := GetPageParams(c)
	status := c.Query("status")
	
	var records []model.LifeRecord
	var total int64
	
	db := database.Get()
	query := db.Model(&model.LifeRecord{})
	
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Count(&total)
	
	offset := (page - 1) * limit
	if err := query.Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&records).Error; err != nil {
		response.InternalError(c, "")
		return
	}
	
	items := make([]model.LifeRecordVO, len(records))
	for i, record := range records {
		items[i] = record.ToVO()
	}
	
	response.PagedSuccess(c, items, page, limit, total)
}

// AdminGet 管理后台详情
func (h *LifeHandler) AdminGet(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	var record model.LifeRecord
	db := database.Get()
	if err := db.First(&record, id).Error; err != nil {
		response.NotFound(c, "记录不存在")
		return
	}
	
	response.Success(c, record.ToVO())
}

// Create 创建生活记录
func (h *LifeHandler) Create(c *gin.Context) {
	var req model.CreateLifeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	record := model.LifeRecord{
		Content:    req.Content,
		CoverImage: req.CoverImage,
		Status:     req.Status,
		AuthorID:   middleware.GetUserID(c),
	}
	
	if req.Status == string(constants.PostStatusPublished) {
		now := time.Now()
		record.PublishedAt = &now
	}
	
	db := database.Get()
	if err := db.Create(&record).Error; err != nil {
		response.InternalError(c, "创建失败")
		return
	}
	
	response.Created(c, record.ToVO())
}

// Update 更新生活记录
func (h *LifeHandler) Update(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	var req model.UpdateLifeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	var record model.LifeRecord
	db := database.Get()
	if err := db.First(&record, id).Error; err != nil {
		response.NotFound(c, "记录不存在")
		return
	}
	
	if req.Content != "" {
		record.Content = req.Content
	}
	if req.CoverImage != "" {
		record.CoverImage = req.CoverImage
	}
	if req.Status != "" {
		if req.Status == string(constants.PostStatusPublished) && record.PublishedAt == nil {
			now := time.Now()
			record.PublishedAt = &now
		}
		record.Status = req.Status
	}
	
	if err := db.Save(&record).Error; err != nil {
		response.InternalError(c, "更新失败")
		return
	}
	
	response.SuccessMessage(c, constants.MsgUpdateSuccess, record.ToVO())
}

// Delete 删除生活记录
func (h *LifeHandler) Delete(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	db := database.Get()
	if err := db.Delete(&model.LifeRecord{}, id).Error; err != nil {
		response.InternalError(c, "删除失败")
		return
	}
	
	response.SuccessMessage(c, constants.MsgDeleteSuccess, nil)
}

