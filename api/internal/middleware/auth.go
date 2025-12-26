// Package middleware JWT 认证中间件
package middleware

import (
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"kuaiyu/internal/config"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
)

// ===========================================
// JWT Claims
// ===========================================

// Claims JWT 声明
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// ===========================================
// Token 生成
// ===========================================

// GenerateToken 生成 JWT Token
func GenerateToken(userID uint, username string) (string, error) {
	cfg := config.Get()
	
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(cfg.JWT.AccessExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    cfg.JWT.Issuer,
		},
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWT.Secret))
}

// GenerateRefreshToken 生成刷新 Token
func GenerateRefreshToken(userID uint, username string) (string, error) {
	cfg := config.Get()
	
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(cfg.JWT.RefreshExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    cfg.JWT.Issuer,
		},
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWT.Secret))
}

// ===========================================
// Token 解析
// ===========================================

// ParseToken 解析 JWT Token
func ParseToken(tokenString string) (*Claims, error) {
	cfg := config.Get()
	
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWT.Secret), nil
	})
	
	if err != nil {
		return nil, err
	}
	
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	
	return nil, jwt.ErrSignatureInvalid
}

// ===========================================
// 认证中间件
// ===========================================

// Auth JWT 认证中间件
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从 Header 获取 Token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, constants.MsgUnauthorized)
			c.Abort()
			return
		}
		
		// 检查 Bearer 前缀
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Unauthorized(c, constants.MsgInvalidToken)
			c.Abort()
			return
		}
		
		// 解析 Token
		claims, err := ParseToken(parts[1])
		if err != nil {
			if err == jwt.ErrTokenExpired {
				response.Unauthorized(c, constants.MsgTokenExpired)
			} else {
				response.Unauthorized(c, constants.MsgInvalidToken)
			}
			c.Abort()
			return
		}
		
		// 将用户信息存入上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		
		c.Next()
	}
}

// OptionalAuth 可选认证中间件（用于公开接口但需要识别用户身份）
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}
		
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}
		
		claims, err := ParseToken(parts[1])
		if err == nil {
			c.Set("user_id", claims.UserID)
			c.Set("username", claims.Username)
		}
		
		c.Next()
	}
}

// ===========================================
// 辅助函数
// ===========================================

// GetUserID 从上下文获取用户ID
func GetUserID(c *gin.Context) uint {
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(uint); ok {
			return id
		}
	}
	return 0
}

// GetUsername 从上下文获取用户名
func GetUsername(c *gin.Context) string {
	if username, exists := c.Get("username"); exists {
		if name, ok := username.(string); ok {
			return name
		}
	}
	return ""
}

// IsAuthenticated 检查是否已认证
func IsAuthenticated(c *gin.Context) bool {
	return GetUserID(c) > 0
}

