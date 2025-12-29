// Package handler 上传处理器
package handler

import (
	"fmt"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/internal/config"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/cos"
	"kuaiyu/pkg/response"
	"kuaiyu/pkg/utils"
)

// ===========================================
// 上传处理器
// ===========================================

// UploadHandler 上传处理器
type UploadHandler struct{}

// NewUploadHandler 创建上传处理器
func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// ===========================================
// 上传接口
// ===========================================

// Upload 上传文件
func (h *UploadHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "请选择文件")
		return
	}
	
	// 检查文件大小
	if file.Size > constants.MaxFileSize {
		response.BadRequest(c, constants.MsgFileTooLarge)
		return
	}
	
	// 检查文件类型
	contentType := file.Header.Get("Content-Type")
	if !constants.AllowedImageTypes[contentType] {
		response.BadRequest(c, constants.MsgInvalidFileType)
		return
	}
	
	// 打开文件
	src, err := file.Open()
	if err != nil {
		response.BadRequest(c, "无法打开文件")
		return
	}
	defer src.Close()
	
	// 生成新文件名
	ext := filepath.Ext(file.Filename)
	newFilename := fmt.Sprintf("%s_%s%s",
		time.Now().Format("20060102150405"),
		utils.GenerateRandomString(8),
		ext,
	)
	
	// 检查 COS 配置
	cfg := config.Get()
	if cfg.COS.SecretID == "" || cfg.COS.SecretKey == "" || cfg.COS.Bucket == "" || cfg.COS.Region == "" {
		// COS 未配置，返回错误
		response.InternalError(c, "文件上传服务未配置，请联系管理员")
		return
	}
	
	// 初始化 COS 客户端
	if err := cos.Init(); err != nil {
		response.InternalError(c, fmt.Sprintf("初始化上传服务失败: %v", err))
		return
	}
	
	// 上传到腾讯云 COS
	fileURL, err := cos.UploadFile(src, newFilename, contentType)
	if err != nil {
		response.InternalError(c, fmt.Sprintf("上传文件失败: %v", err))
		return
	}
	
	response.Success(c, gin.H{
		"url":      fileURL,
		"filename": newFilename,
		"size":     file.Size,
	})
}

// UploadResponse 上传响应
type UploadResponse struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
	Width    int    `json:"width,omitempty"`
	Height   int    `json:"height,omitempty"`
}

