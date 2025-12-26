// Package database 数据库连接管理
package database

import (
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"kuaiyu/internal/config"
	"kuaiyu/internal/model"
)

// ===========================================
// 全局数据库实例
// ===========================================

var db *gorm.DB

// Get 获取数据库实例
func Get() *gorm.DB {
	return db
}

// ===========================================
// 数据库初始化
// ===========================================

// Init 初始化数据库连接
func Init() error {
	cfg := config.Get()
	
	// 构建 DSN
	dsn := cfg.GetDSN()
	
	// 配置日志级别
	logLevel := logger.Silent
	if cfg.IsDevelopment() {
		logLevel = logger.Info
	}
	
	// 连接数据库
	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		// 禁用外键约束
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	
	// 获取底层 SQL 连接池
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}
	
	// 配置连接池
	sqlDB.SetMaxIdleConns(cfg.Database.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.Database.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(cfg.Database.ConnMaxLifetime)
	
	log.Println("Database connected successfully")
	
	return nil
}

// ===========================================
// 数据库迁移
// ===========================================

// Migrate 执行数据库迁移
func Migrate() error {
	log.Println("Running database migrations...")
	
	// 自动迁移所有模型
	err := db.AutoMigrate(
		&model.User{},
		&model.Post{},
		&model.LifeRecord{},
		&model.Tag{},
		&model.PostTag{},
		&model.Comment{},
		&model.SiteConfig{},
		&model.PageView{},
		&model.AnalyticsEvent{},
	)
	
	if err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}
	
	// 创建索引
	if err := createIndexes(); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}
	
	log.Println("Database migrations completed")
	
	return nil
}

// createIndexes 创建额外索引
func createIndexes() error {
	// 评论表索引
	db.Exec("CREATE INDEX IF NOT EXISTS idx_comments_email_status ON comments(email, status)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_comments_life_status ON comments(life_record_id, status)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_comments_parent_created ON comments(parent_id, created_at)")
	
	// 文章表索引
	db.Exec("CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(status, published_at)")
	
	return nil
}

// ===========================================
// 数据库种子
// ===========================================

// Seed 播种初始数据
func Seed() error {
	log.Println("Seeding database...")
	
	// 创建默认管理员
	if err := seedAdmin(); err != nil {
		return err
	}
	
	// 创建默认配置
	if err := seedConfig(); err != nil {
		return err
	}
	
	log.Println("Database seeding completed")
	
	return nil
}

// seedAdmin 创建默认管理员
func seedAdmin() error {
	var count int64
	db.Model(&model.User{}).Count(&count)
	
	if count == 0 {
		// 使用 bcrypt 加密密码
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password: %w", err)
		}
		
		admin := model.User{
			Username: "admin",
			Password: string(hashedPassword),
			Email:    "admin@kcat.site",
		}
		
		if err := db.Create(&admin).Error; err != nil {
			return fmt.Errorf("failed to create admin user: %w", err)
		}
		
		log.Println("Default admin user created (username: admin, password: admin123)")
	}
	
	return nil
}

// seedConfig 创建默认配置
func seedConfig() error {
	defaultConfigs := []model.SiteConfig{
		{Key: "site_logo", Value: "", Type: "image"},
		{Key: "site_name", Value: "快鱼博客", Type: "string"},
		{Key: "site_icp", Value: "", Type: "string"},
		{Key: "home_avatar", Value: "", Type: "image"},
		{Key: "home_nickname", Value: "快鱼", Type: "string"},
		{Key: "home_about", Value: "欢迎来到我的博客", Type: "string"},
		{Key: "footer_left_image", Value: "", Type: "image"},
		{Key: "footer_left_name", Value: "快鱼", Type: "string"},
		{Key: "footer_left_description", Value: "一个热爱技术的开发者", Type: "string"},
		{Key: "footer_right_links", Value: `{"categories":[]}`, Type: "json"},
	}
	
	for _, cfg := range defaultConfigs {
		var existing model.SiteConfig
		result := db.Where("key = ?", cfg.Key).First(&existing)
		
		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&cfg).Error; err != nil {
				return fmt.Errorf("failed to create config %s: %w", cfg.Key, err)
			}
		}
	}
	
	return nil
}

// ===========================================
// 数据库健康检查
// ===========================================

// HealthCheck 健康检查
func HealthCheck() error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	
	return sqlDB.Ping()
}

// ===========================================
// 数据库关闭
// ===========================================

// Close 关闭数据库连接
func Close() error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	
	return sqlDB.Close()
}

// ===========================================
// 事务辅助函数
// ===========================================

// Transaction 执行事务
func Transaction(fn func(tx *gorm.DB) error) error {
	return db.Transaction(fn)
}

// WithTimeout 带超时的查询
func WithTimeout(timeout time.Duration) *gorm.DB {
	return db.Session(&gorm.Session{})
}

