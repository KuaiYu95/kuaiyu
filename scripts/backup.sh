#!/bin/bash
# ===========================================
# 数据库备份脚本
# ===========================================

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/kuaiyu_db_${TIMESTAMP}.sql"

# 创建备份目录
mkdir -p ${BACKUP_DIR}

echo "📦 开始备份数据库..."

# 从 Docker 容器中导出数据库
docker exec kuaiyu_mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD:-kuaiyu_root_2024} kuaiyu_db > ${BACKUP_FILE}

# 压缩备份文件
gzip ${BACKUP_FILE}

echo "✅ 备份完成: ${BACKUP_FILE}.gz"

# 清理超过 30 天的备份
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete
echo "🧹 已清理 30 天前的旧备份"

