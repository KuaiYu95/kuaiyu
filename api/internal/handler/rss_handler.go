// Package handler RSS 处理器
package handler

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/internal/database"
	"kuaiyu/internal/model"
	"kuaiyu/pkg/constants"
)

// ===========================================
// RSS 处理器
// ===========================================

// RSSHandler RSS 处理器
type RSSHandler struct{}

// NewRSSHandler 创建 RSS 处理器
func NewRSSHandler() *RSSHandler {
	return &RSSHandler{}
}

// ===========================================
// RSS Feed
// ===========================================

// Feed 生成 RSS Feed
func (h *RSSHandler) Feed(c *gin.Context) {
	db := database.Get()
	
	// 获取最近文章
	var posts []model.Post
	db.Where("status = ?", constants.PostStatusPublished).
		Order("published_at DESC").
		Limit(20).
		Find(&posts)
	
	// 获取配置
	var siteName string
	var siteConfig model.SiteConfig
	if db.Where("key = ?", constants.ConfigSiteName).First(&siteConfig).Error == nil {
		siteName = siteConfig.Value
	}
	
	xml := h.generateRSS(siteName, "https://kcat.site", posts)
	
	c.Header("Content-Type", "application/rss+xml; charset=utf-8")
	c.String(200, xml)
}

// PostsFeed 博客 RSS Feed
func (h *RSSHandler) PostsFeed(c *gin.Context) {
	h.Feed(c)
}

// LifeFeed 生活记录 RSS Feed
func (h *RSSHandler) LifeFeed(c *gin.Context) {
	db := database.Get()
	
	var records []model.LifeRecord
	db.Where("status = ?", constants.PostStatusPublished).
		Order("published_at DESC").
		Limit(20).
		Find(&records)
	
	// 转换为 RSS 格式
	xml := h.generateLifeRSS("快鱼生活", "https://kcat.site/life", records)
	
	c.Header("Content-Type", "application/rss+xml; charset=utf-8")
	c.String(200, xml)
}

// generateRSS 生成 RSS XML
func (h *RSSHandler) generateRSS(title, link string, posts []model.Post) string {
	now := time.Now().Format(time.RFC1123Z)
	
	items := ""
	for _, post := range posts {
		pubDate := ""
		if post.PublishedAt != nil {
			pubDate = post.PublishedAt.Format(time.RFC1123Z)
		}
		
		items += fmt.Sprintf(`
    <item>
      <title><![CDATA[%s]]></title>
      <link>%s/blog/%s</link>
      <description><![CDATA[%s]]></description>
      <pubDate>%s</pubDate>
      <guid>%s/blog/%s</guid>
    </item>`,
			post.Title,
			link, post.Slug,
			post.Excerpt,
			pubDate,
			link, post.Slug,
		)
	}
	
	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[%s]]></title>
    <link>%s</link>
    <description><![CDATA[%s 的博客]]></description>
    <language>zh-CN</language>
    <lastBuildDate>%s</lastBuildDate>
    <atom:link href="%s/api/rss" rel="self" type="application/rss+xml"/>%s
  </channel>
</rss>`, title, link, title, now, link, items)
}

// generateLifeRSS 生成生活记录 RSS
func (h *RSSHandler) generateLifeRSS(title, link string, records []model.LifeRecord) string {
	now := time.Now().Format(time.RFC1123Z)
	
	items := ""
	for _, record := range records {
		pubDate := ""
		if record.PublishedAt != nil {
			pubDate = record.PublishedAt.Format(time.RFC1123Z)
		}
		
		// 截取内容预览
		content := record.Content
		if len([]rune(content)) > 200 {
			content = string([]rune(content)[:200]) + "..."
		}
		
		items += fmt.Sprintf(`
    <item>
      <title><![CDATA[%s]]></title>
      <link>%s/%d</link>
      <description><![CDATA[%s]]></description>
      <pubDate>%s</pubDate>
      <guid>%s/%d</guid>
    </item>`,
			record.Title,
			link, record.ID,
			content,
			pubDate,
			link, record.ID,
		)
	}
	
	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[%s]]></title>
    <link>%s</link>
    <description><![CDATA[生活记录]]></description>
    <language>zh-CN</language>
    <lastBuildDate>%s</lastBuildDate>
    <atom:link href="%s/api/rss/life" rel="self" type="application/rss+xml"/>%s
  </channel>
</rss>`, title, link, now, "https://kcat.site", items)
}

