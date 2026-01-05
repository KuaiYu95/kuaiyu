-- ===========================================
-- Yu.kuai数据库初始化脚本
-- 用于 Docker 容器首次启动时初始化数据库
-- ===========================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- 用户表
-- ===========================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT '',
  `avatar` varchar(500) DEFAULT '',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_username` (`username`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 博客文章表
-- ===========================================
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) DEFAULT '',
  `content` text,
  `excerpt` text,
  `cover_image` varchar(500) DEFAULT '',
  `status` varchar(20) DEFAULT 'draft',
  `view_count` int DEFAULT 0,
  `author_id` int unsigned DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_posts_slug` (`slug`),
  KEY `idx_posts_author_id` (`author_id`),
  KEY `idx_posts_status` (`status`),
  KEY `idx_posts_published` (`status`, `published_at`),
  KEY `idx_posts_deleted_at` (`deleted_at`),
  FULLTEXT KEY `idx_posts_search` (`title`, `excerpt`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 生活记录表
-- ===========================================
CREATE TABLE IF NOT EXISTS `life_records` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT '',
  `content` text,
  `cover_image` varchar(500) DEFAULT '',
  `status` varchar(20) DEFAULT 'draft',
  `author_id` int unsigned DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_life_records_author_id` (`author_id`),
  KEY `idx_life_records_status` (`status`),
  KEY `idx_life_records_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 标签表
-- ===========================================
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) DEFAULT '',
  `description` text,
  `color` varchar(20) DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tags_name` (`name`),
  UNIQUE KEY `idx_tags_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 文章标签关联表
-- ===========================================
CREATE TABLE IF NOT EXISTS `post_tags` (
  `post_id` int unsigned NOT NULL,
  `tag_id` int unsigned NOT NULL,
  PRIMARY KEY (`post_id`, `tag_id`),
  KEY `idx_post_tags_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 评论表
-- ===========================================
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `post_id` int unsigned DEFAULT NULL,
  `life_record_id` int unsigned DEFAULT NULL,
  `parent_id` int unsigned DEFAULT NULL,
  `nickname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `avatar` varchar(500) DEFAULT '',
  `website` varchar(500) DEFAULT '',
  `content` text NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `is_pinned` tinyint(1) DEFAULT 0,
  `status` varchar(20) DEFAULT 'pending',
  `ip_address` varchar(45) DEFAULT '',
  `user_agent` varchar(500) DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_comments_post_id` (`post_id`),
  KEY `idx_comments_life_record_id` (`life_record_id`),
  KEY `idx_comments_parent_id` (`parent_id`),
  KEY `idx_comments_email` (`email`),
  KEY `idx_comments_status` (`status`),
  KEY `idx_comments_is_pinned` (`is_pinned`),
  KEY `idx_comments_email_status` (`email`, `status`),
  KEY `idx_comments_post_status` (`post_id`, `status`),
  KEY `idx_comments_life_status` (`life_record_id`, `status`),
  KEY `idx_comments_parent_created` (`parent_id`, `created_at`),
  KEY `idx_comments_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 页面访问记录表
-- ===========================================
CREATE TABLE IF NOT EXISTS `page_views` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `page_type` varchar(50) DEFAULT '',
  `page_id` int unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT '',
  `user_agent` varchar(500) DEFAULT '',
  `referer` varchar(500) DEFAULT '',
  `country` varchar(50) DEFAULT '',
  `city` varchar(50) DEFAULT '',
  `device_type` varchar(20) DEFAULT '',
  `browser` varchar(50) DEFAULT '',
  `os` varchar(50) DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_page_views_page` (`page_type`, `page_id`),
  KEY `idx_page_views_created_at` (`created_at`),
  KEY `idx_page_views_ip` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 埋点事件表
-- ===========================================
CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `event_type` varchar(50) DEFAULT '',
  `event_name` varchar(100) DEFAULT '',
  `page_type` varchar(50) DEFAULT '',
  `page_id` int unsigned DEFAULT NULL,
  `user_id` varchar(100) DEFAULT '',
  `properties` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT '',
  `user_agent` varchar(500) DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_analytics_events_event` (`event_type`, `event_name`),
  KEY `idx_analytics_events_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 记账功能数据库表
-- ===========================================

-- ===========================================
-- 分类表
-- ===========================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称，如"餐饮"、"购物"',
  `key` varchar(50) NOT NULL COMMENT '分类键，用于程序识别，如"food"、"shopping"',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_key` (`key`),
  UNIQUE KEY `idx_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 账单表
-- ===========================================
CREATE TABLE IF NOT EXISTS `bills` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('expense','income') NOT NULL COMMENT '支出/收入',
  `category_id` int unsigned NOT NULL COMMENT '分类ID',
  `amount` decimal(10,2) NOT NULL COMMENT '金额',
  `desc` varchar(500) DEFAULT '' COMMENT '描述',
  `date` date NOT NULL COMMENT '账单日期',
  `period_type` enum('month','year') DEFAULT 'month' COMMENT '周期类型：当月/当年',
  `is_consumed` tinyint(1) DEFAULT 1 COMMENT '是否已消费',
  `has_charge_back` tinyint(1) DEFAULT 0 COMMENT '是否存在代付',
  `charge_back_amount` decimal(10,2) DEFAULT 0 COMMENT '代付金额',
  `refund` decimal(10,2) DEFAULT 0 COMMENT '退款金额，仅支出类型',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL COMMENT '软删除',
  PRIMARY KEY (`id`),
  KEY `idx_bills_type` (`type`),
  KEY `idx_bills_category_id` (`category_id`),
  KEY `idx_bills_date` (`date`),
  KEY `idx_bills_type_date` (`type`, `date`),
  KEY `idx_bills_period_type` (`period_type`),
  KEY `idx_bills_is_consumed` (`is_consumed`),
  KEY `idx_bills_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_bills_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 插入默认数据
-- ===========================================

-- 默认管理员 (密码: admin123)
INSERT IGNORE INTO `users` (`username`, `password`, `email`) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.xLRVc.X/fRJjRXcXKi', 'admin@kcat.site');

-- 插入初始分类数据
INSERT IGNORE INTO `categories` (`name`, `key`, `created_at`) VALUES
('餐饮', 'food', NOW()),
('购物', 'shopping', NOW()),
('交通', 'transport', NOW()),
('预/充值', 'prepaid', NOW()),
('工资', 'salary', NOW()),
('娱乐', 'entertainment', NOW()),
('医疗', 'medical', NOW()),
('教育', 'education', NOW()),
('住房', 'housing', NOW()),
('其他', 'other', NOW());

SET FOREIGN_KEY_CHECKS = 1;

