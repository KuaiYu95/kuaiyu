// Package main 应用入口
package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"kuaiyu/internal/config"
	"kuaiyu/internal/database"
	"kuaiyu/internal/router"
)

func main() {
	// 加载 .env 文件（支持 .env 和 .env.local）
	// 查找项目根目录（向上查找包含 docker-compose.yml 的目录）
	workDir, _ := os.Getwd()
	rootDir := workDir
	for {
		if _, err := os.Stat(filepath.Join(rootDir, "docker-compose.yml")); err == nil {
			break
		}
		parent := filepath.Dir(rootDir)
		if parent == rootDir {
			// 已到达根目录，使用当前目录
			rootDir = workDir
			break
		}
		rootDir = parent
	}
	
	// 加载 .env 文件（先加载 .env，然后加载 .env.local，.env.local 会覆盖 .env 的值）
	envFiles := []string{".env", ".env.local"}
	for _, envFile := range envFiles {
		envPath := filepath.Join(rootDir, envFile)
		if _, err := os.Stat(envPath); err == nil {
			// 使用 Overload 确保后面的文件可以覆盖前面的值
			if err := godotenv.Overload(envPath); err != nil {
				log.Printf("Warning: Failed to load %s: %v", envPath, err)
			} else {
				log.Printf("Loaded environment file: %s", envPath)
			}
		}
	}
	
	// 加载配置
	cfg := config.Get()
	log.Printf("Starting %s v%s...", "Kuaiyu API", "1.0.0")
	
	// 设置 Gin 模式
	gin.SetMode(cfg.Server.Mode)
	
	// 初始化数据库
	if err := database.Init(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()
	
	// 执行数据库迁移
	if err := database.Migrate(); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	
	// 播种初始数据
	if err := database.Seed(); err != nil {
		log.Fatalf("Failed to seed database: %v", err)
	}
	
	// 创建 Gin 实例
	r := gin.New()
	r.Use(gin.Logger())
	
	// 配置路由
	router.Setup(r)
	
	// 启动服务
	log.Printf("Server is running on port %s", cfg.Server.Port)
	if err := r.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

