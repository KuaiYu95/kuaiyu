-- ===========================================
-- 添加更多评论数据（包括多层次回复）
-- ===========================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 获取文章和生活记录的ID
SET @post1_id = (SELECT id FROM posts WHERE slug = 'nextjs-14-features' LIMIT 1);
SET @post2_id = (SELECT id FROM posts WHERE slug = 'react-18-concurrent' LIMIT 1);
SET @post3_id = (SELECT id FROM posts WHERE slug = 'typescript-5-features' LIMIT 1);
SET @post4_id = (SELECT id FROM posts WHERE slug = 'go-microservices' LIMIT 1);
SET @post5_id = (SELECT id FROM posts WHERE slug = 'tailwind-css-best-practices' LIMIT 1);
SET @post6_id = (SELECT id FROM posts WHERE slug = 'docker-deployment' LIMIT 1);
SET @post7_id = (SELECT id FROM posts WHERE slug = 'dynamic-programming-intro' LIMIT 1);
SET @post10_id = (SELECT id FROM posts WHERE slug = 'japan-kansai-travel' LIMIT 1);

SET @life1_id = (SELECT id FROM life_records WHERE content LIKE '%博客系统%' LIMIT 1);
SET @life2_id = (SELECT id FROM life_records WHERE content LIKE '%樱花%' LIMIT 1);
SET @life3_id = (SELECT id FROM life_records WHERE content LIKE '%深入理解计算机系统%' LIMIT 1);
SET @life4_id = (SELECT id FROM life_records WHERE content LIKE '%咖啡%' LIMIT 1);

-- 获取现有评论的ID（用于回复）
SET @comment1_id = (SELECT id FROM comments WHERE post_id = @post1_id AND parent_id IS NULL ORDER BY id LIMIT 1);
SET @comment2_id = (SELECT id FROM comments WHERE post_id = @post1_id AND parent_id = @comment1_id LIMIT 1);
SET @comment3_id = (SELECT id FROM comments WHERE post_id = @post2_id AND parent_id IS NULL ORDER BY id LIMIT 1);
SET @comment10_id = (SELECT id FROM comments WHERE post_id = @post10_id AND parent_id IS NULL LIMIT 1);
SET @comment11_id = (SELECT id FROM comments WHERE post_id = @post10_id AND parent_id = @comment10_id LIMIT 1);

-- ===========================================
-- 为文章1添加更多评论和回复
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
-- 新的一级评论
(@post1_id, NULL, NULL, 'Next.js学习者', 'nextjs@example.com', '', '', '这篇文章解决了我很多疑惑，特别是 Server Components 的部分，写得很详细！', 0, 'approved', '192.168.1.200', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(@post1_id, NULL, NULL, '全栈开发者', 'fullstack@example.com', '', 'https://fullstack.dev', 'Turbopack 的速度提升确实很明显，开发体验好了很多。', 0, 'approved', '192.168.1.201', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- 对现有评论的回复（二级回复）
(@post1_id, NULL, @comment1_id, '技术博主', 'tech@example.com', '', '', '同感！Next.js 14 的改进确实很大，期待更多实践分享。', 0, 'approved', '192.168.1.202', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(@post1_id, NULL, @comment2_id, '前端工程师', 'fe@example.com', '', '', '感谢回复！我会继续分享更多 Next.js 的实践经验的。', 0, 'approved', '192.168.1.203', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 获取刚插入的评论ID用于三级回复
SET @new_comment1_id = (SELECT id FROM comments WHERE post_id = @post1_id AND parent_id = @comment1_id AND nickname = '技术博主' LIMIT 1);
SET @new_comment2_id = (SELECT id FROM comments WHERE post_id = @post1_id AND parent_id = @comment2_id AND nickname = '前端工程师' LIMIT 1);

-- 对回复的回复（三级回复）
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post1_id, NULL, @new_comment1_id, 'Admin', 'admin@kcat.site', '', '', '谢谢支持！我会持续更新内容的。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@post1_id, NULL, @new_comment2_id, 'Next.js学习者', 'nextjs@example.com', '', '', '太好了，期待你的新文章！', 0, 'approved', '192.168.1.204', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ===========================================
-- 为文章2添加多层次回复
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
-- 新的一级评论
(@post2_id, NULL, NULL, 'React开发者', 'reactdev@example.com', '', '', 'React 18 的并发特性让我的应用性能提升了很多，特别是 Suspense 的改进。', 0, 'approved', '192.168.1.205', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(@post2_id, NULL, NULL, 'UI设计师', 'ui@example.com', '', '', '自动批处理功能真的很实用，减少了不必要的重渲染。', 0, 'approved', '192.168.1.206', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- 获取刚插入的评论ID
SET @react_comment_id = (SELECT id FROM comments WHERE post_id = @post2_id AND parent_id IS NULL AND nickname = 'React开发者' LIMIT 1);
SET @ui_comment_id = (SELECT id FROM comments WHERE post_id = @post2_id AND parent_id IS NULL AND nickname = 'UI设计师' LIMIT 1);

-- 对一级评论的回复（二级）
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post2_id, NULL, @react_comment_id, 'Admin', 'admin@kcat.site', '', '', '是的，Suspense 现在支持数据获取，让异步组件的处理更加优雅。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(@post2_id, NULL, @ui_comment_id, '前端工程师', 'fe@example.com', '', '', '确实，特别是在处理复杂表单时，批处理的效果很明显。', 0, 'approved', '192.168.1.207', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));

-- 获取二级回复的ID
SET @admin_reply_id = (SELECT id FROM comments WHERE post_id = @post2_id AND parent_id = @react_comment_id AND nickname = 'Admin' LIMIT 1);
SET @fe_reply_id = (SELECT id FROM comments WHERE post_id = @post2_id AND parent_id = @ui_comment_id AND nickname = '前端工程师' LIMIT 1);

-- 对二级回复的回复（三级）
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post2_id, NULL, @admin_reply_id, 'React开发者', 'reactdev@example.com', '', '', '感谢补充！我准备在项目中试试这个特性。', 0, 'approved', '192.168.1.208', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(@post2_id, NULL, @fe_reply_id, 'UI设计师', 'ui@example.com', '', '', '我也在项目中用到了，用户体验提升很明显！', 0, 'approved', '192.168.1.209', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- ===========================================
-- 为文章3添加评论和回复
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post3_id, NULL, NULL, 'TypeScript爱好者', 'tslover@example.com', '', '', 'satisfies 操作符真的很实用，类型检查更加灵活了。', 0, 'approved', '192.168.1.210', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY));

SET @ts_comment_id = (SELECT id FROM comments WHERE post_id = @post3_id AND parent_id IS NULL AND nickname = 'TypeScript爱好者' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post3_id, NULL, @ts_comment_id, 'Admin', 'admin@kcat.site', '', '', '是的，satisfies 可以在保持类型推断的同时进行类型检查，非常方便。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));

SET @ts_admin_reply_id = (SELECT id FROM comments WHERE post_id = @post3_id AND parent_id = @ts_comment_id AND nickname = 'Admin' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post3_id, NULL, @ts_admin_reply_id, 'TypeScript爱好者', 'tslover@example.com', '', '', '学到了，我这就去试试！', 0, 'approved', '192.168.1.211', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- ===========================================
-- 为文章4添加评论
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post4_id, NULL, NULL, '后端架构师', 'architect@example.com', '', '', 'Go 语言在微服务领域确实很有优势，我们团队也在用。', 0, 'approved', '192.168.1.212', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY));

SET @architect_comment_id = (SELECT id FROM comments WHERE post_id = @post4_id AND parent_id IS NULL AND nickname = '后端架构师' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post4_id, NULL, @architect_comment_id, 'Go开发者', 'go@example.com', '', '', '能分享一下你们团队的服务拆分经验吗？', 0, 'approved', '192.168.1.213', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY));

SET @go_dev_reply_id = (SELECT id FROM comments WHERE post_id = @post4_id AND parent_id = @architect_comment_id AND nickname = 'Go开发者' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post4_id, NULL, @go_dev_reply_id, '后端架构师', 'architect@example.com', '', '', '我们主要是按业务域拆分，每个服务负责一个独立的业务功能。', 0, 'approved', '192.168.1.214', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY));

SET @architect_reply_id = (SELECT id FROM comments WHERE post_id = @post4_id AND parent_id = @go_dev_reply_id AND nickname = '后端架构师' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post4_id, NULL, @architect_reply_id, 'Admin', 'admin@kcat.site', '', '', '很好的实践！按业务域拆分确实是最常见的方式。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ===========================================
-- 为文章5添加评论
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post5_id, NULL, NULL, 'CSS爱好者', 'css@example.com', '', '', 'Tailwind 的响应式工具类真的很方便，不用写媒体查询了。', 0, 'approved', '192.168.1.215', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY));

SET @css_comment_id = (SELECT id FROM comments WHERE post_id = @post5_id AND parent_id IS NULL AND nickname = 'CSS爱好者' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post5_id, NULL, @css_comment_id, '设计师', 'designer@example.com', '', '', '是的，而且样式的一致性也更容易保证了。', 0, 'approved', '192.168.1.216', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ===========================================
-- 为文章6添加评论
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post6_id, NULL, NULL, 'DevOps工程师', 'devops@example.com', '', '', 'Docker Compose 确实让本地开发环境搭建变得简单多了。', 0, 'approved', '192.168.1.217', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 19 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY));

SET @devops_comment_id = (SELECT id FROM comments WHERE post_id = @post6_id AND parent_id IS NULL AND nickname = 'DevOps工程师' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post6_id, NULL, @devops_comment_id, 'Admin', 'admin@kcat.site', '', '', '是的，特别是多服务应用的开发，Docker Compose 非常实用。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY));

SET @devops_admin_reply_id = (SELECT id FROM comments WHERE post_id = @post6_id AND parent_id = @devops_comment_id AND nickname = 'Admin' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post6_id, NULL, @devops_admin_reply_id, 'DevOps工程师', 'devops@example.com', '', '', '我们团队也在用，环境一致性得到了很好的保证。', 0, 'approved', '192.168.1.218', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 17 DAY), DATE_SUB(NOW(), INTERVAL 17 DAY));

-- ===========================================
-- 为文章7添加评论
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post7_id, NULL, NULL, '算法学习者', 'algo@example.com', '', '', '动态规划一直是我的弱项，这篇文章讲得很清楚！', 0, 'approved', '192.168.1.219', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 24 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY));

SET @algo_comment_id = (SELECT id FROM comments WHERE post_id = @post7_id AND parent_id IS NULL AND nickname = '算法学习者' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post7_id, NULL, @algo_comment_id, 'Admin', 'admin@kcat.site', '', '', '谢谢！动态规划确实需要多练习，建议从经典的背包问题开始。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 23 DAY), DATE_SUB(NOW(), INTERVAL 23 DAY));

SET @algo_admin_reply_id = (SELECT id FROM comments WHERE post_id = @post7_id AND parent_id = @algo_comment_id AND nickname = 'Admin' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post7_id, NULL, @algo_admin_reply_id, '算法学习者', 'algo@example.com', '', '', '好的，我会去练习的，谢谢建议！', 0, 'approved', '192.168.1.220', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY));

-- ===========================================
-- 为文章10添加更多回复
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post10_id, NULL, @comment11_id, '旅行爱好者', 'travel@example.com', '', '', '谢谢推荐！我已经在规划路线了，很期待！', 0, 'approved', '192.168.1.221', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 37 DAY), DATE_SUB(NOW(), INTERVAL 37 DAY));

SET @travel_reply_id = (SELECT id FROM comments WHERE post_id = @post10_id AND parent_id = @comment11_id AND nickname = '旅行爱好者' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@post10_id, NULL, @travel_reply_id, 'Admin', 'admin@kcat.site', '', '', '不客气！记得去奈良看小鹿，特别可爱！', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 36 DAY), DATE_SUB(NOW(), INTERVAL 36 DAY));

-- ===========================================
-- 为生活记录添加更多评论和回复
-- ===========================================
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
-- 生活记录1的更多评论
(@life1_id, NULL, NULL, '技术朋友', 'techfriend@example.com', '', '', '恭喜！网站看起来很专业，期待更多内容。', 0, 'approved', '192.168.1.222', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

SET @tech_friend_comment_id = (SELECT id FROM comments WHERE life_record_id = @life1_id AND parent_id IS NULL AND nickname = '技术朋友' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life1_id, NULL, @tech_friend_comment_id, 'Admin', 'admin@kcat.site', '', '', '谢谢！我会持续更新的。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

SET @life1_admin_reply_id = (SELECT id FROM comments WHERE life_record_id = @life1_id AND parent_id = @tech_friend_comment_id AND nickname = 'Admin' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life1_id, NULL, @life1_admin_reply_id, '技术朋友', 'techfriend@example.com', '', '', '太好了，我会经常来看看的！', 0, 'approved', '192.168.1.223', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 生活记录2的评论和回复
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life2_id, NULL, NULL, '摄影爱好者', 'photo@example.com', '', '', '樱花季的照片一定很美吧！', 0, 'approved', '192.168.1.224', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));

SET @photo_comment_id = (SELECT id FROM comments WHERE life_record_id = @life2_id AND parent_id IS NULL AND nickname = '摄影爱好者' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life2_id, NULL, @photo_comment_id, 'Admin', 'admin@kcat.site', '', '', '是的，樱花真的很美，心情都变好了！', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

SET @life2_admin_reply_id = (SELECT id FROM comments WHERE life_record_id = @life2_id AND parent_id = @photo_comment_id AND nickname = 'Admin' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life2_id, NULL, @life2_admin_reply_id, '花友', 'flower@example.com', '', '', '我也想去看看，能推荐一下地点吗？', 0, 'approved', '192.168.1.225', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

SET @life2_flower_reply_id = (SELECT id FROM comments WHERE life_record_id = @life2_id AND parent_id = @life2_admin_reply_id AND nickname = '花友' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life2_id, NULL, @life2_flower_reply_id, 'Admin', 'admin@kcat.site', '', '', '我是在附近的公园看的，市中心很多公园都有樱花。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 生活记录3的评论
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life3_id, NULL, NULL, '计算机学生', 'cs@example.com', '', '', '这本书我也在读，确实很经典，就是有点难。', 0, 'approved', '192.168.1.226', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

SET @cs_comment_id = (SELECT id FROM comments WHERE life_record_id = @life3_id AND parent_id IS NULL AND nickname = '计算机学生' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life3_id, NULL, @cs_comment_id, 'Admin', 'admin@kcat.site', '', '', '确实有点难，建议配合实践一起学习，会更容易理解。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- 生活记录4的评论
INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life4_id, NULL, NULL, '咖啡爱好者', 'coffee@example.com', '', '', '哪家咖啡店？我也想去试试！', 0, 'approved', '192.168.1.227', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY));

SET @coffee_comment_id = (SELECT id FROM comments WHERE life_record_id = @life4_id AND parent_id IS NULL AND nickname = '咖啡爱好者' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life4_id, NULL, @coffee_comment_id, 'Admin', 'admin@kcat.site', '', '', '是在市中心新开的那家，环境很不错。', 1, 'approved', '127.0.0.1', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));

SET @life4_admin_reply_id = (SELECT id FROM comments WHERE life_record_id = @life4_id AND parent_id = @coffee_comment_id AND nickname = 'Admin' LIMIT 1);

INSERT INTO `comments` (`post_id`, `life_record_id`, `parent_id`, `nickname`, `email`, `avatar`, `website`, `content`, `is_admin`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(@life4_id, NULL, @life4_admin_reply_id, '咖啡爱好者', 'coffee@example.com', '', '', '好的，周末去试试！', 0, 'approved', '192.168.1.228', 'Mozilla/5.0', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

SET FOREIGN_KEY_CHECKS = 1;

-- 显示插入结果
SELECT '✓ 评论数据添加完成！' AS status;
SELECT CONCAT('总评论数: ', COUNT(*)) AS total_comments FROM comments WHERE deleted_at IS NULL;
SELECT CONCAT('一级评论: ', SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END)) AS top_level FROM comments WHERE deleted_at IS NULL;
SELECT CONCAT('回复数: ', SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END)) AS replies FROM comments WHERE deleted_at IS NULL;
