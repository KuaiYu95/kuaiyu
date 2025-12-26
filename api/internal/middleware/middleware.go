// Package middleware 中间件
// 提供 HTTP 请求处理中间件
package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/internal/config"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
)

// ===========================================
// CORS 中间件
// ===========================================

// CORS 跨域中间件
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		
		// 允许的域名列表
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"https://kcat.site",
			"https://www.kcat.site",
			"https://admin.kcat.site",
		}
		
		// 检查是否允许
		allowed := false
		for _, o := range allowedOrigins {
			if o == origin {
				allowed = true
				break
			}
		}
		
		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")
		
		// 预检请求
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		
		c.Next()
	}
}

// ===========================================
// 安全头中间件
// ===========================================

// SecurityHeaders 安全头中间件
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 防止 XSS
		c.Header("X-XSS-Protection", "1; mode=block")
		// 防止 MIME 类型嗅探
		c.Header("X-Content-Type-Options", "nosniff")
		// 防止点击劫持
		c.Header("X-Frame-Options", "SAMEORIGIN")
		// 引用策略
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		// 内容安全策略
		c.Header("Content-Security-Policy", "default-src 'self'")
		
		c.Next()
	}
}

// ===========================================
// 请求日志中间件
// ===========================================

// RequestLogger 请求日志中间件
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		
		c.Next()
		
		endTime := time.Now()
		latency := endTime.Sub(startTime)
		
		// 可以在这里记录日志到文件或日志系统
		if config.Get().IsDevelopment() {
			statusCode := c.Writer.Status()
			clientIP := c.ClientIP()
			method := c.Request.Method
			
			if query != "" {
				path = path + "?" + query
			}
			
			// 使用 gin 默认日志格式
			gin.DefaultWriter.Write([]byte(
				endTime.Format("2006/01/02 - 15:04:05") + " | " +
					string(rune(statusCode)) + " | " +
					latency.String() + " | " +
					clientIP + " | " +
					method + " " + path + "\n",
			))
		}
	}
}

// ===========================================
// 恢复中间件
// ===========================================

// Recovery 恢复中间件，捕获 panic
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// 记录错误日志
				// logger.Error("Panic recovered", "error", err)
				
				response.InternalError(c, constants.MsgInternalError)
				c.Abort()
			}
		}()
		c.Next()
	}
}

// ===========================================
// 请求超时中间件
// ===========================================

// Timeout 请求超时中间件
func Timeout(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 设置请求超时
		c.Request = c.Request.WithContext(c.Request.Context())
		
		done := make(chan struct{})
		
		go func() {
			c.Next()
			close(done)
		}()
		
		select {
		case <-done:
			return
		case <-time.After(timeout):
			c.AbortWithStatusJSON(http.StatusGatewayTimeout, gin.H{
				"code":    http.StatusGatewayTimeout,
				"message": "请求超时",
			})
		}
	}
}

// ===========================================
// 客户端信息中间件
// ===========================================

// ClientInfo 提取客户端信息
func ClientInfo() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取真实 IP
		clientIP := c.GetHeader("X-Real-IP")
		if clientIP == "" {
			clientIP = c.GetHeader("X-Forwarded-For")
			if clientIP != "" {
				// 取第一个 IP
				clientIP = strings.Split(clientIP, ",")[0]
			}
		}
		if clientIP == "" {
			clientIP = c.ClientIP()
		}
		c.Set("client_ip", strings.TrimSpace(clientIP))
		
		// User-Agent
		c.Set("user_agent", c.GetHeader("User-Agent"))
		
		// Referer
		c.Set("referer", c.GetHeader("Referer"))
		
		c.Next()
	}
}

// ===========================================
// 响应头中间件
// ===========================================

// ResponseHeaders 响应头中间件
func ResponseHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Powered-By", "Kuaiyu")
		c.Next()
	}
}

