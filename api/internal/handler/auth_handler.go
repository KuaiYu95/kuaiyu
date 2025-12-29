// Package handler 认证处理器
package handler

import (
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/internal/database"
	"kuaiyu/internal/middleware"
	"kuaiyu/internal/model"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
	"kuaiyu/pkg/utils"
)

// ===========================================
// 认证处理器
// ===========================================

// AuthHandler 认证处理器
type AuthHandler struct{}

// NewAuthHandler 创建认证处理器
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// ===========================================
// 登录
// ===========================================

// Login 管理员登录
func (h *AuthHandler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 查找用户
	var user model.User
	db := database.Get()
	if err := db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		response.Unauthorized(c, constants.MsgLoginFailed)
		return
	}
	
	// 验证密码
	if !utils.CheckPassword(req.Password, user.Password) {
		response.Unauthorized(c, constants.MsgLoginFailed)
		return
	}
	
	// 生成 Token
	accessToken, err := middleware.GenerateToken(user.ID, user.Username)
	if err != nil {
		response.InternalError(c, "生成令牌失败")
		return
	}
	
	refreshToken, err := middleware.GenerateRefreshToken(user.ID, user.Username)
	if err != nil {
		response.InternalError(c, "生成令牌失败")
		return
	}
	
	// 更新最后登录时间
	now := time.Now()
	user.LastLogin = &now
	db.Save(&user)
	
	cfg := config.Get()
	response.Success(c, model.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(cfg.JWT.AccessExpiry.Seconds()),
		User:         user.ToVO(),
	})
}

// Logout 登出
func (h *AuthHandler) Logout(c *gin.Context) {
	// 客户端清除 token 即可
	response.Success(c, nil)
}

// Me 获取当前用户信息
func (h *AuthHandler) Me(c *gin.Context) {
	userID := middleware.GetUserID(c)
	
	var user model.User
	db := database.Get()
	if err := db.First(&user, userID).Error; err != nil {
		response.NotFound(c, "用户不存在")
		return
	}
	
	response.Success(c, user.ToVO())
}

// ChangePassword 修改密码
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req model.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	userID := middleware.GetUserID(c)
	
	var user model.User
	db := database.Get()
	if err := db.First(&user, userID).Error; err != nil {
		response.NotFound(c, "用户不存在")
		return
	}
	
	// 验证旧密码
	if !utils.CheckPassword(req.OldPassword, user.Password) {
		response.BadRequest(c, "旧密码错误")
		return
	}
	
	// 加密新密码
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		response.InternalError(c, "密码加密失败")
		return
	}
	
	// 更新密码
	user.Password = hashedPassword
	if err := db.Save(&user).Error; err != nil {
		response.InternalError(c, "更新失败")
		return
	}
	
	response.SuccessMessage(c, "密码修改成功", nil)
}

// RefreshToken 刷新 Token
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	// 从请求体获取 refresh token
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 解析 refresh token
	claims, err := middleware.ParseToken(req.RefreshToken)
	if err != nil {
		response.Unauthorized(c, constants.MsgInvalidToken)
		return
	}
	
	// 生成新的 access token
	accessToken, err := middleware.GenerateToken(claims.UserID, claims.Username)
	if err != nil {
		response.InternalError(c, "生成令牌失败")
		return
	}
	
	cfg := config.Get()
	response.Success(c, gin.H{
		"access_token": accessToken,
		"expires_in":   int64(cfg.JWT.AccessExpiry.Seconds()),
	})
}

