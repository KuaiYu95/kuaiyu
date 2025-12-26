// Package handler 上传处理器
package handler

import (
	"fmt"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/pkg/constants"
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
	
	// 生成新文件名
	ext := filepath.Ext(file.Filename)
	newFilename := fmt.Sprintf("%s_%s%s",
		time.Now().Format("20060102150405"),
		utils.GenerateRandomString(8),
		ext,
	)
	
	// TODO: 上传到腾讯云 COS
	// 这里先返回模拟的 URL
	url := fmt.Sprintf("/uploads/%s", newFilename)
	
	response.Success(c, gin.H{
		"url":      url,
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

