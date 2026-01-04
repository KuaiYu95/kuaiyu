// Package handler 统计分析处理器
package handler

import (
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/internal/database"
	"kuaiyu/internal/model"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
)

// ===========================================
// 统计分析处理器
// ===========================================

// AnalyticsHandler 统计分析处理器
type AnalyticsHandler struct{}

// NewAnalyticsHandler 创建统计分析处理器
func NewAnalyticsHandler() *AnalyticsHandler {
	return &AnalyticsHandler{}
}

// ===========================================
// 埋点接口
// ===========================================

// Track 记录埋点事件
func (h *AnalyticsHandler) Track(c *gin.Context) {
	var req model.TrackEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	event := model.AnalyticsEvent{
		EventType: req.EventType,
		EventName: req.EventName,
		PageType:  req.PageType,
		PageID:    req.PageID,
		IPAddress: c.ClientIP(),
		UserAgent: c.GetHeader("User-Agent"),
	}

	if req.Properties != nil {
		event.SetProperties(req.Properties)
	}

	db := database.Get()
	db.Create(&event)

	response.Success(c, nil)
}

// PageView 记录页面访问
func (h *AnalyticsHandler) PageView(c *gin.Context) {
	var req model.TrackPageViewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	userAgent := c.GetHeader("User-Agent")

	pv := model.PageView{
		PageType:   req.PageType,
		PageID:     req.PageID,
		IPAddress:  c.ClientIP(),
		UserAgent:  userAgent,
		Referer:    req.Referer,
		DeviceType: detectDeviceType(userAgent),
		Browser:    detectBrowser(userAgent),
		OS:         detectOS(userAgent),
	}

	db := database.Get()
	db.Create(&pv)

	response.Success(c, nil)
}

// ===========================================
// 统计接口
// ===========================================

// Overview 统计概览
func (h *AnalyticsHandler) Overview(c *gin.Context) {
	db := database.Get()

	var result model.OverviewVO

	// 总 PV
	db.Model(&model.PageView{}).Count(&result.TotalPV)

	// 今日 PV
	today := time.Now().Format("2006-01-02")
	db.Model(&model.PageView{}).
		Where("DATE(created_at) = ?", today).
		Count(&result.TodayPV)

	// 过去30天平均PV
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30).Format("2006-01-02")
	var totalPV30Days int64
	db.Model(&model.PageView{}).
		Where("DATE(created_at) >= ? AND DATE(created_at) < ?", thirtyDaysAgo, today).
		Count(&totalPV30Days)
	result.AvgPV30Days = float64(totalPV30Days) / 30.0

	// 总 UV（按 IP 去重）
	db.Model(&model.PageView{}).
		Distinct("ip_address").
		Count(&result.TotalUV)

	// 今日 UV
	db.Model(&model.PageView{}).
		Where("DATE(created_at) = ?", today).
		Distinct("ip_address").
		Count(&result.TodayUV)

	// 过去30天平均UV（按日期去重后计算平均值）
	var uvCounts []int64
	startDate := time.Now().AddDate(0, 0, -30)
	for i := 0; i < 30; i++ {
		date := startDate.AddDate(0, 0, i)
		dateStr := date.Format("2006-01-02")
		var uv int64
		db.Model(&model.PageView{}).
			Where("DATE(created_at) = ?", dateStr).
			Distinct("ip_address").
			Count(&uv)
		uvCounts = append(uvCounts, uv)
	}

	var totalUV30Days int64
	for _, uv := range uvCounts {
		totalUV30Days += uv
	}
	result.AvgUV30Days = float64(totalUV30Days) / 30.0

	// 文章数
	db.Model(&model.Post{}).
		Where("status = ?", constants.PostStatusPublished).
		Count(&result.PostCount)

	// 生活记录数
	db.Model(&model.LifeRecord{}).
		Where("status = ?", constants.PostStatusPublished).
		Count(&result.LifeCount)

	// 评论数
	db.Model(&model.Comment{}).
		Where("status = ?", constants.CommentStatusApproved).
		Count(&result.CommentCount)

	// 标签数
	db.Model(&model.Tag{}).Count(&result.TagCount)

	response.Success(c, result)
}

// Visits 访问趋势
func (h *AnalyticsHandler) Visits(c *gin.Context) {
	days := 30
	db := database.Get()

	var trends []model.VisitTrendVO

	startDate := time.Now().AddDate(0, 0, -days+1)

	for i := 0; i < days; i++ {
		date := startDate.AddDate(0, 0, i)
		dateStr := date.Format("2006-01-02")

		var pv, uv int64

		db.Model(&model.PageView{}).
			Where("DATE(created_at) = ?", dateStr).
			Count(&pv)

		db.Model(&model.PageView{}).
			Where("DATE(created_at) = ?", dateStr).
			Distinct("ip_address").
			Count(&uv)

		trends = append(trends, model.VisitTrendVO{
			Date: dateStr,
			PV:   pv,
			UV:   uv,
		})
	}

	response.Success(c, trends)
}

// Popular 热门内容（文章和生活记录）
func (h *AnalyticsHandler) Popular(c *gin.Context) {
	limit := 10
	db := database.Get()

	// 获取热门文章
	var posts []model.Post
	db.Where("status = ?", constants.PostStatusPublished).
		Order("view_count DESC").
		Limit(limit).
		Find(&posts)

	postsResult := make([]model.PopularContentVO, len(posts))
	for i, post := range posts {
		postsResult[i] = model.PopularContentVO{
			ID:          post.ID,
			Title:       post.Title,
			ViewCount:   int64(post.ViewCount),
			PublishedAt: post.PublishedAt,
			Type:        "post",
		}
	}

	// 获取热门生活记录
	var lifeRecords []model.LifeRecord
	db.Where("status = ?", constants.PostStatusPublished).
		Order("created_at DESC").
		Limit(limit).
		Find(&lifeRecords)

	lifesResult := make([]model.PopularContentVO, len(lifeRecords))
	for i, life := range lifeRecords {
		// 生活记录没有 view_count，从 page_views 表统计
		var viewCount int64
		db.Model(&model.PageView{}).
			Where("page_type = ? AND page_id = ?", "life", life.ID).
			Count(&viewCount)

		// 截取内容前50字符
		content := life.Content
		if len([]rune(content)) > 50 {
			content = string([]rune(content)[:50])
		}

		lifesResult[i] = model.PopularContentVO{
			ID:          life.ID,
			Title:       life.Title,
			Content:     content,
			ViewCount:   viewCount,
			PublishedAt: life.PublishedAt,
			Type:        "life",
		}
	}

	// 按 ViewCount 排序生活记录
	for i := 0; i < len(lifesResult)-1; i++ {
		for j := i + 1; j < len(lifesResult); j++ {
			if lifesResult[i].ViewCount < lifesResult[j].ViewCount {
				lifesResult[i], lifesResult[j] = lifesResult[j], lifesResult[i]
			}
		}
	}

	result := model.PopularVO{
		Posts: postsResult,
		Lifes: lifesResult,
	}

	response.Success(c, result)
}

// Events 埋点事件统计
func (h *AnalyticsHandler) Events(c *gin.Context) {
	eventType := c.Query("event_type")
	db := database.Get()

	query := db.Model(&model.AnalyticsEvent{})
	if eventType != "" {
		query = query.Where("event_type = ?", eventType)
	}

	var events []struct {
		EventName string `json:"event_name"`
		Count     int64  `json:"count"`
	}

	query.Select("event_name, COUNT(*) as count").
		Group("event_name").
		Order("count DESC").
		Limit(20).
		Scan(&events)

	response.Success(c, events)
}

// Charts 图表数据
func (h *AnalyticsHandler) Charts(c *gin.Context) {
	chartType := c.Query("chart_type")
	db := database.Get()

	switch chartType {
	case "device_distribution":
		var result []model.DeviceDistributionVO
		var total int64

		db.Model(&model.PageView{}).Count(&total)

		db.Model(&model.PageView{}).
			Select("device_type, COUNT(*) as count").
			Group("device_type").
			Scan(&result)

		for i := range result {
			if total > 0 {
				result[i].Percentage = float64(result[i].Count) / float64(total) * 100
			}
		}

		response.Success(c, result)

	case "browser_distribution":
		var result []model.BrowserDistributionVO
		var total int64

		db.Model(&model.PageView{}).Count(&total)

		db.Model(&model.PageView{}).
			Select("browser, COUNT(*) as count").
			Group("browser").
			Order("count DESC").
			Limit(10).
			Scan(&result)

		for i := range result {
			if total > 0 {
				result[i].Percentage = float64(result[i].Count) / float64(total) * 100
			}
		}

		response.Success(c, result)

	default:
		response.BadRequest(c, "不支持的图表类型")
	}
}

// ===========================================
// 辅助函数
// ===========================================

func detectDeviceType(userAgent string) string {
	// 简单的设备检测
	if contains(userAgent, "Mobile") || contains(userAgent, "Android") {
		return "mobile"
	}
	if contains(userAgent, "Tablet") || contains(userAgent, "iPad") {
		return "tablet"
	}
	return "desktop"
}

func detectBrowser(userAgent string) string {
	if contains(userAgent, "Chrome") && !contains(userAgent, "Edge") {
		return "Chrome"
	}
	if contains(userAgent, "Firefox") {
		return "Firefox"
	}
	if contains(userAgent, "Safari") && !contains(userAgent, "Chrome") {
		return "Safari"
	}
	if contains(userAgent, "Edge") {
		return "Edge"
	}
	return "Other"
}

func detectOS(userAgent string) string {
	if contains(userAgent, "Windows") {
		return "Windows"
	}
	if contains(userAgent, "Mac OS") {
		return "macOS"
	}
	if contains(userAgent, "Linux") {
		return "Linux"
	}
	if contains(userAgent, "Android") {
		return "Android"
	}
	if contains(userAgent, "iOS") || contains(userAgent, "iPhone") {
		return "iOS"
	}
	return "Other"
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsHelper(s, substr))
}

func containsHelper(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
