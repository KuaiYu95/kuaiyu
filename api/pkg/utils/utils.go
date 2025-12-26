// Package utils 通用工具函数
// 提供项目中常用的工具函数，避免重复代码
package utils

import (
	"crypto/rand"
	"encoding/hex"
	"regexp"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"golang.org/x/crypto/bcrypt"
)

// ===========================================
// 字符串工具
// ===========================================

// GenerateSlug 生成 URL 友好的 slug
func GenerateSlug(title string) string {
	// 转小写
	slug := strings.ToLower(title)

	// 替换空格为连字符
	slug = strings.ReplaceAll(slug, " ", "-")

	// 移除非字母数字和连字符的字符
	reg := regexp.MustCompile(`[^a-z0-9\-\p{Han}]+`)
	slug = reg.ReplaceAllString(slug, "")

	// 移除多余的连字符
	reg = regexp.MustCompile(`-+`)
	slug = reg.ReplaceAllString(slug, "-")

	// 去除首尾连字符
	slug = strings.Trim(slug, "-")

	return slug
}

// GenerateRandomString 生成随机字符串
func GenerateRandomString(length int) string {
	bytes := make([]byte, length/2+1)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)[:length]
}

// TruncateString 截断字符串
func TruncateString(s string, maxLen int) string {
	if utf8.RuneCountInString(s) <= maxLen {
		return s
	}
	runes := []rune(s)
	return string(runes[:maxLen]) + "..."
}

// StripMarkdown 移除 Markdown 标记
func StripMarkdown(content string) string {
	// 移除代码块
	reg := regexp.MustCompile("```[\\s\\S]*?```")
	content = reg.ReplaceAllString(content, "")

	// 移除行内代码
	reg = regexp.MustCompile("`[^`]*`")
	content = reg.ReplaceAllString(content, "")

	// 移除图片
	reg = regexp.MustCompile(`!\[.*?\]\(.*?\)`)
	content = reg.ReplaceAllString(content, "")

	// 移除链接，保留文本
	reg = regexp.MustCompile(`\[(.*?)\]\(.*?\)`)
	content = reg.ReplaceAllString(content, "$1")

	// 移除标题标记
	reg = regexp.MustCompile(`#{1,6}\s*`)
	content = reg.ReplaceAllString(content, "")

	// 移除粗体和斜体
	reg = regexp.MustCompile(`\*{1,3}(.*?)\*{1,3}`)
	content = reg.ReplaceAllString(content, "$1")

	// 移除删除线
	reg = regexp.MustCompile(`~~(.*?)~~`)
	content = reg.ReplaceAllString(content, "$1")

	// 移除引用
	reg = regexp.MustCompile(`>\s*`)
	content = reg.ReplaceAllString(content, "")

	// 移除列表标记
	reg = regexp.MustCompile(`^[\s]*[-*+]\s+`)
	content = reg.ReplaceAllString(content, "")

	// 移除多余空白
	reg = regexp.MustCompile(`\s+`)
	content = reg.ReplaceAllString(content, " ")

	return strings.TrimSpace(content)
}

// GenerateExcerpt 生成文章摘要
func GenerateExcerpt(content string, maxLen int) string {
	// 移除 Markdown 标记
	plain := StripMarkdown(content)
	// 截断
	return TruncateString(plain, maxLen)
}

// ===========================================
// 密码工具
// ===========================================

// HashPassword 密码加密
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword 验证密码
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// ===========================================
// 验证工具
// ===========================================

// IsValidEmail 验证邮箱格式
func IsValidEmail(email string) bool {
	reg := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return reg.MatchString(email)
}

// IsValidURL 验证 URL 格式
func IsValidURL(url string) bool {
	reg := regexp.MustCompile(`^https?://[^\s/$.?#].[^\s]*$`)
	return reg.MatchString(url)
}

// IsValidSlug 验证 slug 格式
func IsValidSlug(slug string) bool {
	reg := regexp.MustCompile(`^[a-z0-9\-\p{Han}]+$`)
	return reg.MatchString(slug)
}

// ContainsChinese 检查是否包含中文
func ContainsChinese(s string) bool {
	for _, r := range s {
		if unicode.Is(unicode.Han, r) {
			return true
		}
	}
	return false
}

// ===========================================
// 时间工具
// ===========================================

// FormatTime 格式化时间
func FormatTime(t time.Time, format string) string {
	if format == "" {
		format = "2006-01-02 15:04:05"
	}
	return t.Format(format)
}

// FormatDate 格式化日期
func FormatDate(t time.Time) string {
	return t.Format("2006-01-02")
}

// StartOfDay 获取当天开始时间
func StartOfDay(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
}

// EndOfDay 获取当天结束时间
func EndOfDay(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 999999999, t.Location())
}

// ===========================================
// 数值工具
// ===========================================

// Max 返回最大值
func Max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// Min 返回最小值
func Min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Clamp 限制值在范围内
func Clamp(value, min, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

// ===========================================
// 切片工具
// ===========================================

// ContainsString 检查切片是否包含字符串
func ContainsString(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// UniqueStrings 字符串切片去重
func UniqueStrings(slice []string) []string {
	seen := make(map[string]bool)
	result := []string{}
	for _, s := range slice {
		if !seen[s] {
			seen[s] = true
			result = append(result, s)
		}
	}
	return result
}

