// Package model 统计分析模型
package model

import (
	"encoding/json"
	"time"
)

// ===========================================
// 页面访问记录模型
// ===========================================

// PageView 页面访问记录
type PageView struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PageType   string    `gorm:"size:50;index" json:"page_type"` // home | post | life | archive | category | guestbook
	PageID     *uint     `gorm:"index" json:"page_id"`           // 文章/记录ID
	IPAddress  string    `gorm:"size:45" json:"ip_address"`
	UserAgent  string    `gorm:"size:500" json:"user_agent"`
	Referer    string    `gorm:"size:500" json:"referer"`
	Country    string    `gorm:"size:50" json:"country"`
	City       string    `gorm:"size:50" json:"city"`
	DeviceType string    `gorm:"size:20" json:"device_type"` // desktop | mobile | tablet
	Browser    string    `gorm:"size:50" json:"browser"`
	OS         string    `gorm:"size:50" json:"os"`
	CreatedAt  time.Time `gorm:"index" json:"created_at"`
}

// TableName 表名
func (PageView) TableName() string {
	return "page_views"
}

// ===========================================
// 埋点事件模型
// ===========================================

// AnalyticsEvent 埋点事件
type AnalyticsEvent struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	EventType  string    `gorm:"size:50;index" json:"event_type"` // click | view | scroll | form_submit
	EventName  string    `gorm:"size:100;index" json:"event_name"`
	PageType   string    `gorm:"size:50" json:"page_type"`
	PageID     *uint     `json:"page_id"`
	UserID     string    `gorm:"size:100" json:"user_id"` // 匿名用户ID
	Properties string    `gorm:"type:json" json:"properties"`
	IPAddress  string    `gorm:"size:45" json:"ip_address"`
	UserAgent  string    `gorm:"size:500" json:"user_agent"`
	CreatedAt  time.Time `gorm:"index" json:"created_at"`
}

// TableName 表名
func (AnalyticsEvent) TableName() string {
	return "analytics_events"
}

// ===========================================
// 统计 DTO
// ===========================================

// TrackEventRequest 埋点事件请求
type TrackEventRequest struct {
	EventType  string                 `json:"event_type" binding:"required"`
	EventName  string                 `json:"event_name" binding:"required"`
	PageType   string                 `json:"page_type"`
	PageID     *uint                  `json:"page_id"`
	Properties map[string]interface{} `json:"properties"`
}

// TrackPageViewRequest 页面访问请求
type TrackPageViewRequest struct {
	PageType string `json:"page_type" binding:"required"`
	PageID   *uint  `json:"page_id"`
	Referer  string `json:"referer"`
}

// ===========================================
// 统计视图对象
// ===========================================

// OverviewVO 统计概览
type OverviewVO struct {
	TotalPV      int64   `json:"total_pv"`
	TodayPV      int64   `json:"today_pv"`
	AvgPV30Days  float64 `json:"avg_pv_30_days"` // 过去30天平均PV
	TotalUV      int64   `json:"total_uv"`
	TodayUV      int64   `json:"today_uv"`
	AvgUV30Days  float64 `json:"avg_uv_30_days"` // 过去30天平均UV
	PostCount    int64   `json:"post_count"`
	LifeCount    int64   `json:"life_count"`
	CommentCount int64   `json:"comment_count"`
	TagCount     int64   `json:"tag_count"`
}

// VisitTrendVO 访问趋势
type VisitTrendVO struct {
	Date string `json:"date"`
	PV   int64  `json:"pv"`
	UV   int64  `json:"uv"`
}

// DeviceDistributionVO 设备分布
type DeviceDistributionVO struct {
	DeviceType string  `json:"device_type"`
	Count      int64   `json:"count"`
	Percentage float64 `json:"percentage"`
}

// BrowserDistributionVO 浏览器分布
type BrowserDistributionVO struct {
	Browser    string  `json:"browser"`
	Count      int64   `json:"count"`
	Percentage float64 `json:"percentage"`
}

// PopularContentVO 热门内容
type PopularContentVO struct {
	ID          uint       `json:"id"`
	Title       string     `json:"title"`
	Content     string     `json:"content,omitempty"` // 生活记录的内容
	ViewCount   int64      `json:"view_count"`
	PublishedAt *time.Time `json:"published_at"`
	Type        string     `json:"type"` // post | life
}

// PopularVO 热门内容响应
type PopularVO struct {
	Posts []PopularContentVO `json:"posts"`
	Lifes []PopularContentVO `json:"lifes"`
}

// RealtimeVisitVO 实时访问
type RealtimeVisitVO struct {
	Time       time.Time `json:"time"`
	PageType   string    `json:"page_type"`
	PageTitle  string    `json:"page_title"`
	IPAddress  string    `json:"ip_address"`
	DeviceType string    `json:"device_type"`
	Browser    string    `json:"browser"`
}

// ===========================================
// 转换方法
// ===========================================

// GetProperties 获取属性
func (e *AnalyticsEvent) GetProperties() map[string]interface{} {
	var props map[string]interface{}
	if e.Properties != "" {
		json.Unmarshal([]byte(e.Properties), &props)
	}
	return props
}

// SetProperties 设置属性
func (e *AnalyticsEvent) SetProperties(props map[string]interface{}) error {
	data, err := json.Marshal(props)
	if err != nil {
		return err
	}
	e.Properties = string(data)
	return nil
}
