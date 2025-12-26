// Package response 统一响应格式
// 提供标准化的 API 响应结构，确保所有接口返回格式一致
package response

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/pkg/constants"
)

// ===========================================
// 响应结构体
// ===========================================

// Response 标准响应结构
type Response struct {
	Code      int         `json:"code"`                // 状态码
	Message   string      `json:"message"`             // 消息
	Data      interface{} `json:"data"`                // 数据
	Timestamp string      `json:"timestamp"`           // 时间戳
	Errors    []FieldError `json:"errors,omitempty"`   // 字段错误（可选）
}

// FieldError 字段错误
type FieldError struct {
	Field   string `json:"field"`   // 字段名
	Message string `json:"message"` // 错误信息
}

// Pagination 分页信息
type Pagination struct {
	Page       int   `json:"page"`       // 当前页
	Limit      int   `json:"limit"`      // 每页数量
	Total      int64 `json:"total"`      // 总数
	TotalPages int   `json:"totalPages"` // 总页数
}

// PagedData 分页数据
type PagedData struct {
	Items      interface{} `json:"items"`      // 数据列表
	Pagination Pagination  `json:"pagination"` // 分页信息
}

// ===========================================
// 响应方法
// ===========================================

// JSON 发送 JSON 响应
func JSON(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, Response{
		Code:      code,
		Message:   message,
		Data:      data,
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	JSON(c, http.StatusOK, constants.MsgSuccess, data)
}

// SuccessMessage 成功响应（带消息）
func SuccessMessage(c *gin.Context, message string, data interface{}) {
	JSON(c, http.StatusOK, message, data)
}

// Created 创建成功响应
func Created(c *gin.Context, data interface{}) {
	JSON(c, http.StatusCreated, constants.MsgCreateSuccess, data)
}

// NoContent 无内容响应
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// ===========================================
// 错误响应方法
// ===========================================

// Error 错误响应
func Error(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Code:      code,
		Message:   message,
		Data:      nil,
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

// ErrorWithData 错误响应（带数据）
func ErrorWithData(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, Response{
		Code:      code,
		Message:   message,
		Data:      data,
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

// ErrorWithFields 字段验证错误响应
func ErrorWithFields(c *gin.Context, message string, errors []FieldError) {
	c.JSON(http.StatusBadRequest, Response{
		Code:      http.StatusBadRequest,
		Message:   message,
		Data:      nil,
		Errors:    errors,
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

// BadRequest 400 错误
func BadRequest(c *gin.Context, message string) {
	if message == "" {
		message = constants.MsgBadRequest
	}
	Error(c, http.StatusBadRequest, message)
}

// Unauthorized 401 错误
func Unauthorized(c *gin.Context, message string) {
	if message == "" {
		message = constants.MsgUnauthorized
	}
	Error(c, http.StatusUnauthorized, message)
}

// Forbidden 403 错误
func Forbidden(c *gin.Context, message string) {
	if message == "" {
		message = constants.MsgForbidden
	}
	Error(c, http.StatusForbidden, message)
}

// NotFound 404 错误
func NotFound(c *gin.Context, message string) {
	if message == "" {
		message = constants.MsgNotFound
	}
	Error(c, http.StatusNotFound, message)
}

// TooManyRequests 429 错误
func TooManyRequests(c *gin.Context) {
	Error(c, http.StatusTooManyRequests, constants.MsgTooManyRequests)
}

// InternalError 500 错误
func InternalError(c *gin.Context, message string) {
	if message == "" {
		message = constants.MsgInternalError
	}
	Error(c, http.StatusInternalServerError, message)
}

// ===========================================
// 分页工具方法
// ===========================================

// Paginate 计算分页信息
func Paginate(page, limit int, total int64) Pagination {
	if page < 1 {
		page = constants.DefaultPage
	}
	if limit < 1 {
		limit = constants.DefaultPageSize
	}
	if limit > constants.MaxPageSize {
		limit = constants.MaxPageSize
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	return Pagination{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}
}

// PagedSuccess 分页成功响应
func PagedSuccess(c *gin.Context, items interface{}, page, limit int, total int64) {
	Success(c, PagedData{
		Items:      items,
		Pagination: Paginate(page, limit, total),
	})
}

