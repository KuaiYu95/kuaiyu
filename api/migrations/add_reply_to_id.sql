-- 添加 reply_to_id 字段用于记录实际回复的评论ID
ALTER TABLE comments ADD COLUMN reply_to_id INT UNSIGNED NULL AFTER parent_id;
ALTER TABLE comments ADD INDEX idx_reply_to_id (reply_to_id);
