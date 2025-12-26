-- ===========================================
-- 快鱼博客数据库初始化脚本
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
  `title` varchar(200) NOT NULL,
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
  KEY `idx_comments_email_status` (`email`, `status`),
  KEY `idx_comments_post_status` (`post_id`, `status`),
  KEY `idx_comments_life_status` (`life_record_id`, `status`),
  KEY `idx_comments_parent_created` (`parent_id`, `created_at`),
  KEY `idx_comments_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 网站配置表
-- ===========================================
CREATE TABLE IF NOT EXISTS `site_configs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text,
  `type` varchar(20) DEFAULT 'string',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_site_configs_key` (`key`)
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
-- 插入默认数据
-- ===========================================

-- 默认管理员 (密码: admin123)
INSERT IGNORE INTO `users` (`username`, `password`, `email`) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.xLRVc.X/fRJjRXcXKi', 'admin@kcat.site');

-- 默认配置
INSERT IGNORE INTO `site_configs` (`key`, `value`, `type`) VALUES 
('site_logo', '', 'image'),
('site_name', '快鱼博客', 'string'),
('site_icp', '', 'string'),
('home_avatar', '', 'image'),
('home_nickname', '快鱼', 'string'),
('home_about', '欢迎来到我的博客', 'string'),
('footer_left_image', '', 'image'),
('footer_left_name', '快鱼', 'string'),
('footer_left_description', '一个热爱技术的开发者', 'string'),
('footer_right_links', '{"categories":[]}', 'json');

SET FOREIGN_KEY_CHECKS = 1;

