-- ===========================================
-- 测试数据生成脚本
-- 用于生成博客文章、标签、生活记录和评论等测试数据
-- ===========================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 获取管理员用户ID（假设为1）
SET @admin_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- ===========================================
-- 创建标签
-- ===========================================
INSERT INTO `tags` (`name`, `slug`, `description`, `color`, `created_at`) VALUES
('技术分享', 'tech', '技术相关的文章和心得', '#3b82f6', NOW()),
('生活随笔', 'life', '日常生活的记录和感悟', '#10b981', NOW()),
('前端开发', 'frontend', '前端技术栈相关', '#8b5cf6', NOW()),
('后端开发', 'backend', '后端技术栈相关', '#f59e0b', NOW()),
('算法学习', 'algorithm', '算法和数据结构', '#ef4444', NOW()),
('设计思考', 'design', '设计和用户体验', '#ec4899', NOW()),
('读书笔记', 'reading', '阅读心得和笔记', '#06b6d4', NOW()),
('旅行日记', 'travel', '旅行见闻和游记', '#14b8a6', NOW());

-- ===========================================
-- 创建博客文章
-- ===========================================
INSERT INTO `posts` (`title`, `slug`, `content`, `excerpt`, `cover_image`, `status`, `view_count`, `author_id`, `published_at`, `created_at`, `updated_at`) VALUES
('Next.js 14 新特性深度解析', 'nextjs-14-features', 
'# Next.js 14 新特性深度解析

Next.js 14 带来了许多令人兴奋的新特性，包括 Server Components、Turbopack、以及更好的 TypeScript 支持。

## Server Components

Server Components 允许我们在服务器端渲染组件，减少客户端 JavaScript 的体积。

## Turbopack

Turbopack 是 Rust 编写的下一代打包工具，比 Webpack 快 700 倍。

## 总结

Next.js 14 为开发者提供了更好的开发体验和性能优化。',
'Next.js 14 带来了 Server Components、Turbopack 等新特性，本文将深入解析这些新功能的使用方法和最佳实践。',
'', 'published', 156, @admin_id, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

('React 18 并发特性详解', 'react-18-concurrent', 
'# React 18 并发特性详解

React 18 引入了并发渲染（Concurrent Rendering）的概念，让应用更加流畅。

## Concurrent Rendering

并发渲染允许 React 中断渲染过程，优先处理更紧急的更新。

## Automatic Batching

自动批处理可以自动合并多个状态更新，减少不必要的重渲染。

## Suspense 改进

Suspense 现在支持数据获取，可以更好地处理异步组件。',
'React 18 的并发特性为应用带来了更好的性能和用户体验，本文将详细介绍这些特性的使用方法。',
'', 'published', 203, @admin_id, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

('TypeScript 5.0 新特性一览', 'typescript-5-features', 
'# TypeScript 5.0 新特性一览

TypeScript 5.0 带来了装饰器支持、更好的性能以及新的类型系统改进。

## 装饰器支持

TypeScript 5.0 正式支持 ECMAScript 装饰器提案。

## 性能优化

编译速度提升了 2-3 倍，内存使用也大幅降低。

## 类型系统改进

新增了 `satisfies` 操作符，可以更好地进行类型检查。',
'TypeScript 5.0 带来了装饰器、性能优化和类型系统改进，本文将介绍这些新特性的使用方法。',
'', 'published', 189, @admin_id, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),

('Go 语言微服务实践', 'go-microservices', 
'# Go 语言微服务实践

Go 语言以其简洁的语法和出色的性能，成为构建微服务的理想选择。

## 服务拆分

合理的服务拆分是微服务架构成功的关键。

## 服务通信

使用 gRPC 或 REST API 进行服务间通信。

## 服务治理

通过服务发现、负载均衡和熔断机制来保证服务的稳定性。',
'本文介绍如何使用 Go 语言构建微服务架构，包括服务拆分、通信和治理等实践。',
'', 'published', 142, @admin_id, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),

('Tailwind CSS 最佳实践', 'tailwind-css-best-practices', 
'# Tailwind CSS 最佳实践

Tailwind CSS 是一个功能强大的实用优先的 CSS 框架。

## 组件化思维

将常用的样式组合封装成组件，提高开发效率。

## 响应式设计

利用 Tailwind 的响应式工具类，轻松实现移动端适配。

## 性能优化

通过 PurgeCSS 移除未使用的样式，减小 CSS 文件体积。',
'本文分享 Tailwind CSS 的使用经验和最佳实践，帮助开发者更高效地使用这个框架。',
'', 'published', 178, @admin_id, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),

('Docker 容器化部署指南', 'docker-deployment', 
'# Docker 容器化部署指南

Docker 让应用的部署变得简单和一致。

## 镜像构建

编写高效的 Dockerfile，优化镜像大小。

## 容器编排

使用 Docker Compose 或 Kubernetes 进行容器编排。

## 最佳实践

遵循 Docker 最佳实践，确保应用的安全性和可维护性。',
'本文介绍如何使用 Docker 进行应用的容器化部署，包括镜像构建、编排和最佳实践。',
'', 'published', 165, @admin_id, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),

('算法：动态规划入门', 'dynamic-programming-intro', 
'# 动态规划入门

动态规划是解决最优化问题的经典方法。

## 基本思想

将问题分解为子问题，通过解决子问题来解决原问题。

## 经典问题

背包问题、最长公共子序列、编辑距离等都是动态规划的经典应用。

## 实践技巧

掌握状态转移方程的推导方法，是学好动态规划的关键。',
'本文介绍动态规划的基本思想和经典问题，帮助初学者快速入门。',
'', 'published', 134, @admin_id, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),

('用户体验设计原则', 'ux-design-principles', 
'# 用户体验设计原则

好的用户体验是产品成功的关键。

## 简洁性

保持界面简洁，避免不必要的复杂性。

## 一致性

保持设计元素的一致性，让用户更容易理解和使用。

## 反馈

及时给用户反馈，让用户知道操作的结果。',
'本文介绍用户体验设计的基本原则，帮助设计师和开发者创造更好的产品体验。',
'', 'published', 198, @admin_id, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),

('《深入理解计算机系统》读书笔记', 'csapp-reading-notes', 
'# 《深入理解计算机系统》读书笔记

这是一本经典的计算机系统教材。

## 程序结构和执行

理解程序的编译、链接和执行过程。

## 程序间的交互

学习进程、信号和系统调用的概念。

## 程序间的通信

掌握网络编程和并发编程的基本方法。',
'本文记录阅读《深入理解计算机系统》的心得和笔记。',
'', 'published', 112, @admin_id, DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),

('日本关西旅行日记', 'japan-kansai-travel', 
'# 日本关西旅行日记

记录在关西地区旅行的美好时光。

## 大阪

大阪的美食和购物体验令人难忘。

## 京都

京都的古建筑和传统文化让人流连忘返。

## 奈良

奈良的小鹿和古寺是必去的景点。',
'记录在日本关西地区旅行的见闻和感受。',
'', 'published', 245, @admin_id, DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ===========================================
-- 关联文章和标签
-- ===========================================
INSERT INTO `post_tags` (`post_id`, `tag_id`) VALUES
(1, 1), (1, 3), -- Next.js 14 -> 技术分享, 前端开发
(2, 1), (2, 3), -- React 18 -> 技术分享, 前端开发
(3, 1), (3, 3), -- TypeScript 5 -> 技术分享, 前端开发
(4, 1), (4, 4), -- Go 微服务 -> 技术分享, 后端开发
(5, 1), (5, 3), -- Tailwind CSS -> 技术分享, 前端开发
(6, 1), (6, 4), -- Docker -> 技术分享, 后端开发
(7, 1), (7, 5), -- 动态规划 -> 技术分享, 算法学习
(8, 6), -- 用户体验 -> 设计思考
(9, 7), -- 读书笔记 -> 读书笔记
(10, 2), (10, 8); -- 日本旅行 -> 生活随笔, 旅行日记

-- ===========================================
-- 创建生活记录
-- ===========================================
INSERT INTO `life_records` (`title`, `content`, `cover_image`, `status`, `author_id`, `published_at`, `created_at`, `updated_at`) VALUES
('', '今天完成了博客系统的开发，终于可以上线了！🎉', '', 'published', @admin_id, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('', '周末去公园散步，看到了美丽的樱花，心情特别好。🌸', '', 'published', @admin_id, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('', '读完了《深入理解计算机系统》，对计算机底层有了更深入的理解。📚', '', 'published', @admin_id, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
('', '今天尝试了新的咖啡店，拿铁的味道很棒！☕', '', 'published', @admin_id, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('', '晚上看了一部很棒的电影，剧情和画面都很出色。🎬', '', 'published', @admin_id, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
('', '今天学习了新的算法，动态规划真的很有趣！💡', '', 'published', @admin_id, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
('', '和朋友一起做了顿丰盛的晚餐，厨艺有进步。🍳', '', 'published', @admin_id, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
('', '今天天气很好，去爬山了，山顶的风景真美！⛰️', '', 'published', @admin_id, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY));

-- ===========================================
-- 创建评论（文章评论）
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
-- 文章1的评论
(1, NULL, NULL, '前端小白', 'frontend@example.com', '', 'https://example.com', '这篇文章写得太好了，对 Next.js 14 有了更深入的理解！', 0, 'approved', '192.168.1.100', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, NULL, 1, 'Admin', 'admin@kcat.site', '', '', '谢谢支持！如果有什么问题可以随时提问。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, NULL, NULL, 'React爱好者', 'react@example.com', '', '', 'Server Components 确实是个很棒的特性，期待更多实践分享！', 0, 'approved', '192.168.1.101', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- 文章2的评论
(2, NULL, NULL, '开发者', 'dev@example.com', '', '', 'React 18 的并发特性确实让应用更流畅了，感谢分享！', 0, 'approved', '192.168.1.102', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, NULL, NULL, '新手', 'newbie@example.com', '', '', '对于新手来说有点难理解，希望能有更详细的例子。', 0, 'pending', '192.168.1.103', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 文章3的评论
(3, NULL, NULL, 'TypeScript用户', 'ts@example.com', '', '', 'TypeScript 5.0 的性能提升真的很明显，编译速度快了很多！', 0, 'approved', '192.168.1.104', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY)),
(3, NULL, NULL, '学习者', 'learner@example.com', '', '', '装饰器支持太棒了，终于可以更方便地使用装饰器了。', 0, 'approved', '192.168.1.105', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- 文章4的评论
(4, NULL, NULL, 'Go开发者', 'go@example.com', '', '', 'Go 语言确实很适合微服务，性能好，部署简单。', 0, 'approved', '192.168.1.106', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),

-- 文章5的评论
(5, NULL, NULL, '设计师', 'designer@example.com', '', '', 'Tailwind CSS 让开发效率提升了很多，样式写起来很爽！', 0, 'approved', '192.168.1.107', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 17 DAY), DATE_SUB(NOW(), INTERVAL 17 DAY)),

-- 文章10的评论
(10, NULL, NULL, '旅行爱好者', 'travel@example.com', '', '', '关西地区真的很美，我也想去！有什么推荐的路线吗？', 0, 'approved', '192.168.1.108', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 39 DAY), DATE_SUB(NOW(), INTERVAL 39 DAY)),
(10, NULL, 10, 'Admin', 'admin@kcat.site', '', '', '推荐大阪-京都-奈良的经典路线，每个城市都有独特的魅力！', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 38 DAY), DATE_SUB(NOW(), INTERVAL 38 DAY));

-- ===========================================
-- 创建评论（生活记录评论）
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
-- 生活记录1的评论
(NULL, 1, NULL, '朋友A', 'friend1@example.com', '', '', '恭喜上线！网站做得很棒！', 0, 'approved', '192.168.1.109', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(NULL, 1, NULL, '朋友B', 'friend2@example.com', '', '', '期待更多内容！', 0, 'approved', '192.168.1.110', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 生活记录2的评论
(NULL, 2, NULL, '花友', 'flower@example.com', '', '', '樱花季真的很美，我也想去看看！', 0, 'approved', '192.168.1.111', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- 生活记录3的评论
(NULL, 3, NULL, '书友', 'book@example.com', '', '', '这本书我也在读，确实很经典！', 0, 'approved', '192.168.1.112', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- ===========================================
-- 创建留言板评论（guestbook）
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(NULL, NULL, NULL, '访客1', 'visitor1@example.com', '', 'https://example.com', '网站做得很棒，内容也很丰富！', 0, 'approved', '192.168.1.113', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(NULL, NULL, NULL, '访客2', 'visitor2@example.com', '', '', '期待更多技术分享！', 0, 'approved', '192.168.1.114', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(NULL, NULL, NULL, '访客3', 'visitor3@example.com', '', '', '设计很简洁，用户体验很好！', 0, 'approved', '192.168.1.115', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
(NULL, NULL, NULL, '访客4', 'visitor4@example.com', '', '', '希望能有更多生活记录分享！', 0, 'pending', '192.168.1.116', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR));

SET FOREIGN_KEY_CHECKS = 1;

-- 显示插入结果
SELECT '✓ 测试数据插入完成！' AS status;
SELECT CONCAT('文章数量: ', COUNT(*)) AS posts_count FROM posts WHERE deleted_at IS NULL;
SELECT CONCAT('标签数量: ', COUNT(*)) AS tags_count FROM tags;
SELECT CONCAT('生活记录数量: ', COUNT(*)) AS life_count FROM life_records WHERE deleted_at IS NULL;
SELECT CONCAT('评论数量: ', COUNT(*)) AS comments_count FROM comments WHERE deleted_at IS NULL;

