// Package constants 定义全局常量
// 统一管理项目中使用的所有常量，便于维护和修改
package constants

import "time"

// ===========================================
// 应用配置常量
// ===========================================

const (
	// AppName 应用名称
	AppName = "kuaiyu"
	// AppVersion 应用版本
	AppVersion = "1.0.0"
	// DefaultPort 默认端口
	DefaultPort = "8080"
)

// ===========================================
// 分页常量
// ===========================================

const (
	// DefaultPage 默认页码
	DefaultPage = 1
	// DefaultPageSize 默认每页数量
	DefaultPageSize = 10
	// MaxPageSize 最大每页数量
	MaxPageSize = 100
)

// ===========================================
// JWT 配置常量
// ===========================================

const (
	// AccessTokenExpiry Access Token 过期时间
	AccessTokenExpiry = 15 * time.Minute
	// RefreshTokenExpiry Refresh Token 过期时间
	RefreshTokenExpiry = 7 * 24 * time.Hour
	// TokenIssuer Token 签发者
	TokenIssuer = "kuaiyu-api"
)

// ===========================================
// 文件上传常量
// ===========================================

const (
	// MaxFileSize 最大文件大小 (5MB)
	MaxFileSize = 5 << 20
	// AllowedImageTypes 允许的图片类型
	AllowedImageTypesStr = "jpg,jpeg,png,gif,webp"
)

// AllowedImageTypes 允许的图片 MIME 类型
var AllowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/jpg":  true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

// ===========================================
// 缓存常量
// ===========================================

const (
	// CacheConfigKey 配置缓存键
	CacheConfigKey = "site_config"
	// CacheConfigExpiry 配置缓存过期时间
	CacheConfigExpiry = 5 * time.Minute
)

// ===========================================
// 限流常量
// ===========================================

const (
	// RateLimitPublic 公共接口限流 (每分钟)
	RateLimitPublic = 100
	// RateLimitComment 评论接口限流 (每分钟)
	RateLimitComment = 5
	// RateLimitLogin 登录接口限流 (每15分钟)
	RateLimitLogin = 5
	// RateLimitUpload 上传接口限流 (每分钟)
	RateLimitUpload = 10
)

// ===========================================
// 内容常量
// ===========================================

const (
	// ExcerptMaxLength 摘要最大长度
	ExcerptMaxLength = 200
	// LifeContentPreviewLength 生活记录预览长度
	LifeContentPreviewLength = 300
	// LifeContentFullThreshold 生活记录全文阈值
	LifeContentFullThreshold = 500
	// DefaultReplyLimit 默认回复显示数量
	DefaultReplyLimit = 3
)

// ===========================================
// 状态常量
// ===========================================

// PostStatus 文章状态
type PostStatus string

const (
	PostStatusDraft     PostStatus = "draft"
	PostStatusPublished PostStatus = "published"
)

// CommentStatus 评论状态
type CommentStatus string

const (
	CommentStatusPending  CommentStatus = "pending"
	CommentStatusApproved CommentStatus = "approved"
	CommentStatusSpam     CommentStatus = "spam"
)

// PageType 页面类型
type PageType string

const (
	PageTypeHome     PageType = "home"
	PageTypePost     PageType = "post"
	PageTypeLife     PageType = "life"
	PageTypeArchive  PageType = "archive"
	PageTypeCategory PageType = "category"
	PageTypeGuest    PageType = "guestbook"
)

// DeviceType 设备类型
type DeviceType string

const (
	DeviceTypeDesktop DeviceType = "desktop"
	DeviceTypeMobile  DeviceType = "mobile"
	DeviceTypeTablet  DeviceType = "tablet"
)

// ===========================================
// 配置键常量
// ===========================================

const (
	// 网站基础配置
	ConfigSiteLogo = "site_logo"
	ConfigSiteName = "site_name"
	ConfigSiteICP  = "site_icp"

	// 首页配置
	ConfigHomeAvatar   = "home_avatar"
	ConfigHomeNickname = "home_nickname"
	ConfigHomeAbout    = "home_about"

	// Footer配置
	ConfigFooterLeftImage       = "footer_left_image"
	ConfigFooterLeftName        = "footer_left_name"
	ConfigFooterLeftDescription = "footer_left_description"
	ConfigFooterRightLinks      = "footer_right_links"
)

// ===========================================
// 错误码常量
// ===========================================

const (
	// 成功
	CodeSuccess = 200

	// 客户端错误 4xx
	CodeBadRequest   = 400
	CodeUnauthorized = 401
	CodeForbidden    = 403
	CodeNotFound     = 404
	CodeTooMany      = 429

	// 服务端错误 5xx
	CodeInternalError = 500
)

// ===========================================
// 错误消息常量
// ===========================================

const (
	MsgSuccess           = "success"
	MsgBadRequest        = "请求参数错误"
	MsgUnauthorized      = "未授权，请先登录"
	MsgForbidden         = "禁止访问"
	MsgNotFound          = "资源不存在"
	MsgTooManyRequests   = "请求过于频繁，请稍后再试"
	MsgInternalError     = "服务器内部错误"
	MsgInvalidToken      = "无效的令牌"
	MsgTokenExpired      = "令牌已过期"
	MsgLoginFailed       = "用户名或密码错误"
	MsgUserLocked        = "账号已被锁定，请稍后再试"
	MsgCommentPending    = "评论提交成功，等待审核"
	MsgCommentApproved   = "评论发布成功"
	MsgUploadFailed      = "文件上传失败"
	MsgInvalidFileType   = "不支持的文件类型"
	MsgFileTooLarge      = "文件大小超出限制"
	MsgEmailExists       = "邮箱已被使用"
	MsgSlugExists        = "URL 标识已存在"
	MsgOperationFailed   = "操作失败"
	MsgOperationSuccess  = "操作成功"
	MsgCreateSuccess     = "创建成功"
	MsgUpdateSuccess     = "更新成功"
	MsgDeleteSuccess     = "删除成功"
)

