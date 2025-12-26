// Package main 应用入口
package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"kuaiyu/internal/config"
	"kuaiyu/internal/database"
	"kuaiyu/internal/router"
)

func main() {
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

