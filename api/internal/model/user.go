// Package model 用户模型
package model

import (
	"time"
)

// ===========================================
// 用户模型
// ===========================================

// User 用户模型
type User struct {
	BaseModel
	Username  string     `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password  string     `gorm:"size:255;not null" json:"-"`
	Email     string     `gorm:"size:100" json:"email"`
	Avatar    string     `gorm:"size:500" json:"avatar"`
	LastLogin *time.Time `json:"last_login"`
}

// TableName 表名
func (User) TableName() string {
	return "users"
}

// ===========================================
// 用户 DTO
// ===========================================

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6,max=50"`
}

// LoginResponse 登录响应
type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	User         UserVO `json:"user"`
}

// UserVO 用户视图对象
type UserVO struct {
	ID        uint       `json:"id"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	Avatar    string     `json:"avatar"`
	LastLogin *time.Time `json:"last_login"`
}

// ChangePasswordRequest 修改密码请求
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required,min=6,max=50"`
	NewPassword string `json:"new_password" binding:"required,min=6,max=50"`
}

// ===========================================
// 转换方法
// ===========================================

// ToVO 转换为视图对象
func (u *User) ToVO() UserVO {
	return UserVO{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		Avatar:    u.Avatar,
		LastLogin: u.LastLogin,
	}
}

