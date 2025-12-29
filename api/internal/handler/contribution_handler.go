// Package handler 贡献日历处理器
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
// 贡献日历处理器
// ===========================================

// ContributionHandler 贡献日历处理器
type ContributionHandler struct{}

// NewContributionHandler 创建贡献日历处理器
func NewContributionHandler() *ContributionHandler {
	return &ContributionHandler{}
}

// ===========================================
// 贡献日历数据结构
// ===========================================

// ContributionDay 某一天的贡献数据
type ContributionDay struct {
	Date      string                `json:"date"`       // YYYY-MM-DD
	Type      string                `json:"type"`       // "post", "life", "both"
	Count     int                   `json:"count"`      // 总记录数
	Posts     []ContributionItem    `json:"posts"`      // 博客记录
	LifeRecords []ContributionItem  `json:"life_records"` // 生活记录
}

// ContributionItem 贡献项（用于 hover 显示）
type ContributionItem struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Slug        string `json:"slug,omitempty"` // 博客有 slug，生活记录没有
	Type        string `json:"type"`           // "post" 或 "life"
	PublishedAt string `json:"published_at"`   // ISO 8601 格式
}

// ===========================================
// 公开接口
// ===========================================

// GetContributionCalendar 获取贡献日历数据
// Query: type (可选) - "post", "life", "all" (默认 "all")
// Query: year (可选) - 年份，默认当前年份
func (h *ContributionHandler) GetContributionCalendar(c *gin.Context) {
	// 获取查询参数
	contributionType := c.DefaultQuery("type", "all") // post, life, all
	yearStr := c.DefaultQuery("year", "")
	
	// 确定年份
	var targetYear int
	if yearStr != "" {
		if y, err := time.Parse("2006", yearStr); err == nil {
			targetYear = y.Year()
		} else {
			response.BadRequest(c, "无效的年份格式")
			return
		}
	} else {
		targetYear = time.Now().Year()
	}
	
	// 计算日期范围（一年的开始和结束）
	startDate := time.Date(targetYear, 1, 1, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(targetYear, 12, 31, 23, 59, 59, 999999999, time.UTC)
	
	db := database.Get()
	result := make(map[string]*ContributionDay)
	
	// 注意：不需要初始化所有日期，只返回有记录的日期即可
	
	// 查询博客记录
	if contributionType == "all" || contributionType == "post" {
		var posts []model.Post
		db.Where("status = ? AND published_at >= ? AND published_at <= ?",
			constants.PostStatusPublished, startDate, endDate).
			Select("id, title, slug, published_at").
			Order("published_at ASC").
			Find(&posts)
		
		for _, post := range posts {
			if post.PublishedAt != nil {
				dateKey := post.PublishedAt.Format("2006-01-02")
				if _, exists := result[dateKey]; !exists {
					result[dateKey] = &ContributionDay{
						Date:        dateKey,
						Type:        "none",
						Count:       0,
						Posts:       []ContributionItem{},
						LifeRecords: []ContributionItem{},
					}
				}
				day := result[dateKey]
				day.Posts = append(day.Posts, ContributionItem{
					ID:          post.ID,
					Title:       post.Title,
					Slug:        post.Slug,
					Type:        "post",
					PublishedAt: post.PublishedAt.Format(time.RFC3339),
				})
				day.Count++
				if day.Type == "none" {
					day.Type = "post"
				} else if day.Type == "life" {
					day.Type = "both"
				}
			}
		}
	}
	
	// 查询生活记录
	if contributionType == "all" || contributionType == "life" {
		var lifeRecords []model.LifeRecord
		db.Where("status = ? AND published_at >= ? AND published_at <= ?",
			constants.PostStatusPublished, startDate, endDate).
			Select("id, title, content, published_at").
			Order("published_at ASC").
			Find(&lifeRecords)
		
		for _, record := range lifeRecords {
			if record.PublishedAt != nil {
				dateKey := record.PublishedAt.Format("2006-01-02")
				if _, exists := result[dateKey]; !exists {
					result[dateKey] = &ContributionDay{
						Date:        dateKey,
						Type:        "none",
						Count:       0,
						Posts:       []ContributionItem{},
						LifeRecords: []ContributionItem{},
					}
				}
				day := result[dateKey]
				// 生活记录可能没有 title，使用 content 的前50个字符
				title := record.Title
				if title == "" && len(record.Content) > 0 {
					contentRunes := []rune(record.Content)
					if len(contentRunes) > 50 {
						title = string(contentRunes[:50]) + "..."
					} else {
						title = record.Content
					}
				}
				
				day.LifeRecords = append(day.LifeRecords, ContributionItem{
					ID:          record.ID,
					Title:       title,
					Type:        "life",
					PublishedAt: record.PublishedAt.Format(time.RFC3339),
				})
				day.Count++
				if day.Type == "none" {
					day.Type = "life"
				} else if day.Type == "post" {
					day.Type = "both"
				}
			}
		}
	}
	
	// 转换为数组（只返回有记录的日期）
	days := make([]ContributionDay, 0, len(result))
	for _, day := range result {
		if day.Count > 0 {
			days = append(days, *day)
		}
	}
	
	response.Success(c, gin.H{
		"year": targetYear,
		"type": contributionType,
		"days": days,
	})
}

