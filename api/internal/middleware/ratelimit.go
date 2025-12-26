// Package middleware 限流中间件
package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/pkg/response"
)

// ===========================================
// 限流器
// ===========================================

// RateLimiter 限流器
type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     int           // 允许的请求数
	window   time.Duration // 时间窗口
}

// visitor 访问者
type visitor struct {
	count    int
	lastSeen time.Time
}

// NewRateLimiter 创建限流器
func NewRateLimiter(rate int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     rate,
		window:   window,
	}
	
	// 启动清理协程
	go rl.cleanup()
	
	return rl
}

// Allow 检查是否允许请求
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	v, exists := rl.visitors[key]
	now := time.Now()
	
	if !exists {
		rl.visitors[key] = &visitor{count: 1, lastSeen: now}
		return true
	}
	
	// 检查时间窗口是否过期
	if now.Sub(v.lastSeen) > rl.window {
		v.count = 1
		v.lastSeen = now
		return true
	}
	
	// 检查是否超过限制
	if v.count >= rl.rate {
		return false
	}
	
	v.count++
	v.lastSeen = now
	return true
}

// cleanup 清理过期的访问者
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(rl.window)
	for range ticker.C {
		rl.mu.Lock()
		for key, v := range rl.visitors {
			if time.Since(v.lastSeen) > rl.window*2 {
				delete(rl.visitors, key)
			}
		}
		rl.mu.Unlock()
	}
}

// ===========================================
// 限流中间件
// ===========================================

// RateLimit 限流中间件
func RateLimit(rate int, window time.Duration) gin.HandlerFunc {
	limiter := NewRateLimiter(rate, window)
	
	return func(c *gin.Context) {
		key := c.ClientIP()
		
		if !limiter.Allow(key) {
			response.TooManyRequests(c)
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// RateLimitByKey 按自定义键限流
func RateLimitByKey(rate int, window time.Duration, keyFunc func(c *gin.Context) string) gin.HandlerFunc {
	limiter := NewRateLimiter(rate, window)
	
	return func(c *gin.Context) {
		key := keyFunc(c)
		
		if !limiter.Allow(key) {
			response.TooManyRequests(c)
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// ===========================================
// 预设限流中间件
// ===========================================

// PublicRateLimit 公共接口限流 (100次/分钟)
func PublicRateLimit() gin.HandlerFunc {
	return RateLimit(100, time.Minute)
}

// CommentRateLimit 评论接口限流 (5次/分钟)
func CommentRateLimit() gin.HandlerFunc {
	return RateLimit(5, time.Minute)
}

// LoginRateLimit 登录接口限流 (5次/15分钟)
func LoginRateLimit() gin.HandlerFunc {
	return RateLimit(5, 15*time.Minute)
}

// UploadRateLimit 上传接口限流 (10次/分钟)
func UploadRateLimit() gin.HandlerFunc {
	return RateLimit(10, time.Minute)
}

