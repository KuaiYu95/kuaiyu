// Package handler HTTP 处理器
// 处理 HTTP 请求和响应
package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"kuaiyu/pkg/constants"
)

// ===========================================
// 辅助函数
// ===========================================

// GetIDParam 获取 URL 中的 ID 参数
func GetIDParam(c *gin.Context, name string) (uint, error) {
	idStr := c.Param(name)
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

// GetPageParams 获取分页参数
func GetPageParams(c *gin.Context) (int, int) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	
	if page < 1 {
		page = constants.DefaultPage
	}
	if limit < 1 {
		limit = constants.DefaultPageSize
	}
	if limit > constants.MaxPageSize {
		limit = constants.MaxPageSize
	}
	
	return page, limit
}

// GetClientIP 获取客户端 IP
func GetClientIP(c *gin.Context) string {
	if ip, exists := c.Get("client_ip"); exists {
		if ipStr, ok := ip.(string); ok {
			return ipStr
		}
	}
	return c.ClientIP()
}

// GetUserAgent 获取 User-Agent
func GetUserAgent(c *gin.Context) string {
	if ua, exists := c.Get("user_agent"); exists {
		if uaStr, ok := ua.(string); ok {
			return uaStr
		}
	}
	return c.GetHeader("User-Agent")
}

