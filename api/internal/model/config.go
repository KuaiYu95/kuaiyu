// Package model 网站配置模型
package model

import (
	"encoding/json"
	"time"
)

// ===========================================
// 配置模型
// ===========================================

// SiteConfig 网站配置模型
type SiteConfig struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Key       string    `gorm:"column:key;uniqueIndex;size:100;not null" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	Type      string    `gorm:"size:20;default:string" json:"type"` // string | json | image
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName 表名
func (SiteConfig) TableName() string {
	return "site_configs"
}

// ===========================================
// 配置 DTO
// ===========================================

// ConfigMap 配置映射
type ConfigMap map[string]interface{}

// UpdateConfigRequest 更新配置请求
type UpdateConfigRequest struct {
	Configs []ConfigItem `json:"configs" binding:"required"`
}

// ConfigItem 配置项
type ConfigItem struct {
	Key   string      `json:"key" binding:"required"`
	Value interface{} `json:"value"`
	Type  string      `json:"type"` // string | json | image
}

// ===========================================
// Footer 配置结构
// ===========================================

// FooterLink Footer 链接
type FooterLink struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

// FooterCategory Footer 分类
type FooterCategory struct {
	Category string       `json:"category"`
	Links    []FooterLink `json:"links"`
}

// ===========================================
// 配置视图对象
// ===========================================

// SiteConfigVO 配置视图对象（聚合）
type SiteConfigVO struct {
	// 网站基础配置
	SiteLogo string `json:"site_logo"`
	SiteName string `json:"site_name"`
	SiteICP  string `json:"site_icp"`
	
	// 首页配置
	HomeAvatar   string `json:"home_avatar"`
	HomeNickname string `json:"home_nickname"`
	HomeAbout    string `json:"home_about"`
	
	// Footer 配置
	FooterLeftImage        string           `json:"footer_left_image"`
	FooterLeftName         string           `json:"footer_left_name"`
	FooterLeftDescription  string           `json:"footer_left_description"`
	FooterRightCategories  []FooterCategory `json:"footer_right_categories"`
}

// ===========================================
// 转换方法
// ===========================================

// ParseValue 解析配置值
func (c *SiteConfig) ParseValue() interface{} {
	if c.Type == "json" {
		var result interface{}
		if err := json.Unmarshal([]byte(c.Value), &result); err == nil {
			return result
		}
	}
	return c.Value
}

// SetValue 设置配置值
func (c *SiteConfig) SetValue(value interface{}) error {
	switch v := value.(type) {
	case string:
		c.Value = v
	default:
		data, err := json.Marshal(value)
		if err != nil {
			return err
		}
		c.Value = string(data)
	}
	return nil
}

