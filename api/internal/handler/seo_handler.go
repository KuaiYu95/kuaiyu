// Package handler SEO 处理器
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
// SEO 处理器
// ===========================================

// SEOHandler SEO 处理器
type SEOHandler struct{}

// NewSEOHandler 创建 SEO 处理器
func NewSEOHandler() *SEOHandler {
	return &SEOHandler{}
}

// ===========================================
// Sitemap
// ===========================================

// Sitemap 生成 Sitemap
func (h *SEOHandler) Sitemap(c *gin.Context) {
	baseURL := "https://kcat.site"
	db := database.Get()
	
	// 静态页面
	urls := []string{
		fmt.Sprintf(`  <url><loc>%s</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`, baseURL),
		fmt.Sprintf(`  <url><loc>%s/blog</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`, baseURL),
		fmt.Sprintf(`  <url><loc>%s/life</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`, baseURL),
		fmt.Sprintf(`  <url><loc>%s/archive</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`, baseURL),
		fmt.Sprintf(`  <url><loc>%s/category</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`, baseURL),
		fmt.Sprintf(`  <url><loc>%s/guestbook</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`, baseURL),
	}
	
	// 博客文章
	var posts []model.Post
	db.Where("status = ?", constants.PostStatusPublished).Find(&posts)
	
	for _, post := range posts {
		lastmod := post.UpdatedAt.Format("2006-01-02")
		urls = append(urls, fmt.Sprintf(
			`  <url><loc>%s/blog/%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
			baseURL, post.Slug, lastmod,
		))
	}
	
	// 生活记录
	var records []model.LifeRecord
	db.Where("status = ?", constants.PostStatusPublished).Find(&records)
	
	for _, record := range records {
		lastmod := record.UpdatedAt.Format("2006-01-02")
		urls = append(urls, fmt.Sprintf(
			`  <url><loc>%s/life/%d</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
			baseURL, record.ID, lastmod,
		))
	}
	
	// 标签页面
	var tags []model.Tag
	db.Find(&tags)
	
	for _, tag := range tags {
		urls = append(urls, fmt.Sprintf(
			`  <url><loc>%s/category/%s</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`,
			baseURL, tag.Slug,
		))
	}
	
	// 生成 XML
	xml := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
%s
</urlset>`, joinStrings(urls, "\n"))
	
	c.Header("Content-Type", "application/xml; charset=utf-8")
	c.String(200, xml)
}

// Robots 生成 robots.txt
func (h *SEOHandler) Robots(c *gin.Context) {
	robots := `User-agent: *
Allow: /

# 禁止爬取后台
Disallow: /admin/
Disallow: /api/admin/

# Sitemap
Sitemap: https://kcat.site/api/sitemap.xml
`
	
	c.Header("Content-Type", "text/plain; charset=utf-8")
	c.String(200, robots)
}

// ===========================================
// 辅助函数
// ===========================================

func joinStrings(strs []string, sep string) string {
	result := ""
	for i, s := range strs {
		if i > 0 {
			result += sep
		}
		result += s
	}
	return result
}

// GetLastBuildTime 获取最后构建时间
func GetLastBuildTime() string {
	return time.Now().Format(time.RFC3339)
}

