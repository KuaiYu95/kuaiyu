// Package config 配置管理
// 统一管理应用配置，支持环境变量和默认值
package config

import (
	"os"
	"strconv"
	"time"
)

// ===========================================
// 配置结构体
// ===========================================

// Config 应用配置
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	COS      COSConfig
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Port    string
	Mode    string // debug | release | test
	Timeout time.Duration
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Host            string
	Port            string
	User            string
	Password        string
	DBName          string
	MaxIdleConns    int
	MaxOpenConns    int
	ConnMaxLifetime time.Duration
}

// JWTConfig JWT 配置
type JWTConfig struct {
	Secret            string
	AccessExpiry      time.Duration
	RefreshExpiry     time.Duration
	Issuer            string
}

// COSConfig 腾讯云 COS 配置
type COSConfig struct {
	SecretID  string
	SecretKey string
	Bucket    string
	Region    string
	BaseURL   string
	ProxyURL  string // 代理 URL，格式：http://127.0.0.1:7890 或 socks5://127.0.0.1:7891
}

// ===========================================
// 全局配置实例
// ===========================================

var cfg *Config

// Get 获取配置实例（单例模式）
func Get() *Config {
	if cfg == nil {
		cfg = Load()
	}
	return cfg
}

// Load 加载配置
func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port:    getEnv("PORT", "8080"),
			Mode:    getEnv("GIN_MODE", "debug"),
			Timeout: getDurationEnv("SERVER_TIMEOUT", 30*time.Second),
		},
		Database: DatabaseConfig{
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnv("DB_PORT", "3306"),
			User:            getEnv("DB_USER", "root"),
			Password:        getEnv("DB_PASSWORD", ""),
			DBName:          getEnv("DB_NAME", "kuaiyu_db"),
			MaxIdleConns:    getIntEnv("DB_MAX_IDLE_CONNS", 10),
			MaxOpenConns:    getIntEnv("DB_MAX_OPEN_CONNS", 100),
			ConnMaxLifetime: getDurationEnv("DB_CONN_MAX_LIFETIME", time.Hour),
		},
		JWT: JWTConfig{
			Secret:        getEnv("JWT_SECRET", "kuaiyu_jwt_secret"),
			AccessExpiry:  getDurationEnv("JWT_ACCESS_EXPIRY", 24*time.Hour),
			RefreshExpiry: getDurationEnv("JWT_REFRESH_EXPIRY", 7*24*time.Hour),
			Issuer:        getEnv("JWT_ISSUER", "kuaiyu-api"),
		},
		COS: COSConfig{
			SecretID:  getEnv("COS_SECRET_ID", ""),
			SecretKey: getEnv("COS_SECRET_KEY", ""),
			Bucket:    getEnv("COS_BUCKET", ""),
			Region:    getEnv("COS_REGION", ""),
			BaseURL:   getEnv("COS_BASE_URL", ""),
			ProxyURL:  getEnv("COS_PROXY_URL", ""), // 支持从环境变量读取代理
		},
	}
}

// ===========================================
// 环境变量工具函数
// ===========================================

// getEnv 获取环境变量，带默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getIntEnv 获取整数环境变量
func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getBoolEnv 获取布尔环境变量
func getBoolEnv(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

// getDurationEnv 获取时间间隔环境变量
func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

// ===========================================
// 配置验证
// ===========================================

// Validate 验证配置
func (c *Config) Validate() error {
	// 可以添加配置验证逻辑
	return nil
}

// IsDevelopment 是否为开发模式
func (c *Config) IsDevelopment() bool {
	return c.Server.Mode == "debug"
}

// IsProduction 是否为生产模式
func (c *Config) IsProduction() bool {
	return c.Server.Mode == "release"
}

// GetDSN 获取数据库连接字符串
func (c *Config) GetDSN() string {
	return c.Database.User + ":" + c.Database.Password +
		"@tcp(" + c.Database.Host + ":" + c.Database.Port + ")/" +
		c.Database.DBName + "?charset=utf8mb4&parseTime=True&loc=Local"
}

