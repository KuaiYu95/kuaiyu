// Package router 路由配置
// 统一管理所有 API 路由
package router

import (
	"github.com/gin-gonic/gin"
	"kuaiyu/internal/handler"
	"kuaiyu/internal/middleware"
)

// ===========================================
// 路由配置
// ===========================================

// Setup 配置路由
func Setup(r *gin.Engine) {
	// 全局中间件
	r.Use(middleware.CORS())
	r.Use(middleware.Recovery())
	r.Use(middleware.ClientInfo())
	r.Use(middleware.ResponseHeaders())
	
	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	
	// API 路由组
	api := r.Group("/api")
	{
		// 公开接口
		setupPublicRoutes(api)
		
		// 管理接口
		setupAdminRoutes(api)
	}
}

// ===========================================
// 公开路由
// ===========================================

func setupPublicRoutes(api *gin.RouterGroup) {
	// 文章
	postHandler := handler.NewPostHandler()
	posts := api.Group("/posts")
	posts.Use(middleware.PublicRateLimit())
	{
		posts.GET("", postHandler.List)
		posts.GET("/featured", postHandler.Featured)
		posts.GET("/recent", postHandler.Recent)
		posts.GET("/:slug", postHandler.GetBySlug)
		posts.POST("/:id/views", postHandler.IncrementViews)
	}
	
	// 归档
	api.GET("/archives", postHandler.Archives)
	
	// 生活记录
	lifeHandler := handler.NewLifeHandler()
	life := api.Group("/life")
	life.Use(middleware.PublicRateLimit())
	{
		life.GET("", lifeHandler.List)
		life.GET("/:id", lifeHandler.Get)
	}
	
	// 标签
	tagHandler := handler.NewTagHandler()
	tags := api.Group("/tags")
	{
		tags.GET("", tagHandler.List)
		tags.GET("/:slug", tagHandler.GetBySlug)
	}
	
	// 评论
	commentHandler := handler.NewCommentHandler()
	comments := api.Group("/comments")
	{
		comments.GET("", commentHandler.List)
		comments.POST("", middleware.CommentRateLimit(), commentHandler.Create)
	}
	
	// 配置
	configHandler := handler.NewConfigHandler()
	api.GET("/config", configHandler.Get)
	
	// RSS
	rssHandler := handler.NewRSSHandler()
	api.GET("/rss", rssHandler.Feed)
	api.GET("/rss/posts", rssHandler.PostsFeed)
	api.GET("/rss/life", rssHandler.LifeFeed)
	
	// SEO
	seoHandler := handler.NewSEOHandler()
	api.GET("/sitemap.xml", seoHandler.Sitemap)
	api.GET("/robots.txt", seoHandler.Robots)
	
	// 埋点
	analyticsHandler := handler.NewAnalyticsHandler()
	analytics := api.Group("/analytics")
	{
		analytics.POST("/track", analyticsHandler.Track)
		analytics.POST("/pageview", analyticsHandler.PageView)
	}
}

// ===========================================
// 管理路由
// ===========================================

func setupAdminRoutes(api *gin.RouterGroup) {
	admin := api.Group("/admin")
	
	// 认证
	authHandler := handler.NewAuthHandler()
	admin.POST("/login", middleware.LoginRateLimit(), authHandler.Login)
	admin.POST("/refresh", authHandler.RefreshToken)
	
	// 需要认证的路由
	auth := admin.Group("")
	auth.Use(middleware.Auth())
	{
		// 用户
		auth.POST("/logout", authHandler.Logout)
		auth.GET("/me", authHandler.Me)
		auth.POST("/change-password", authHandler.ChangePassword)
		
		// 文章管理
		postHandler := handler.NewPostHandler()
		posts := auth.Group("/posts")
		{
			posts.GET("", postHandler.AdminList)
			posts.GET("/:id", postHandler.AdminGet)
			posts.POST("", postHandler.Create)
			posts.PUT("/:id", postHandler.Update)
			posts.DELETE("/:id", postHandler.Delete)
		}
		
		// 生活记录管理
		lifeHandler := handler.NewLifeHandler()
		life := auth.Group("/life")
		{
			life.GET("", lifeHandler.AdminList)
			life.GET("/:id", lifeHandler.AdminGet)
			life.POST("", lifeHandler.Create)
			life.PUT("/:id", lifeHandler.Update)
			life.DELETE("/:id", lifeHandler.Delete)
		}
		
		// 标签管理
		tagHandler := handler.NewTagHandler()
		tags := auth.Group("/tags")
		{
			tags.GET("", tagHandler.AdminList)
			tags.POST("", tagHandler.Create)
			tags.PUT("/:id", tagHandler.Update)
			tags.DELETE("/:id", tagHandler.Delete)
		}
		
		// 评论管理
		commentHandler := handler.NewCommentHandler()
		comments := auth.Group("/comments")
		{
			comments.GET("", commentHandler.AdminList)
			comments.POST("/:id/toggle-pin", commentHandler.TogglePin)
			comments.POST("/:id/reply", commentHandler.AdminReply)
			comments.PUT("/:id", commentHandler.UpdateStatus)
			comments.DELETE("/:id", commentHandler.Delete)
		}
		
		// 配置管理
		configHandler := handler.NewConfigHandler()
		config := auth.Group("/config")
		{
			config.GET("", configHandler.AdminGet)
			config.PUT("", configHandler.Update)
		}
		
		// 文件上传
		uploadHandler := handler.NewUploadHandler()
		auth.POST("/upload", middleware.UploadRateLimit(), uploadHandler.Upload)
		
		// 统计分析
		analyticsHandler := handler.NewAnalyticsHandler()
		analytics := auth.Group("/analytics")
		{
			analytics.GET("/overview", analyticsHandler.Overview)
			analytics.GET("/visits", analyticsHandler.Visits)
			analytics.GET("/popular", analyticsHandler.Popular)
			analytics.GET("/events", analyticsHandler.Events)
			analytics.GET("/charts", analyticsHandler.Charts)
		}
	}
}

