#!/bin/bash
# ===========================================
# 数据库备份脚本
# 用法: ./scripts/backup.sh
# ===========================================

set -e

# 加载通用函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# 获取项目根目录
PROJECT_ROOT=$(get_project_root)
cd "$PROJECT_ROOT"

# 加载环境变量
load_env

# 配置变量
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DB_NAME="${MYSQL_DATABASE:-kuaiyu_db}"
DB_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-kuaiyu_root_2024}"
CONTAINER_NAME="${MYSQL_CONTAINER_NAME:-kuaiyu_mysql}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/kuaiyu_db_${TIMESTAMP}.sql"

# 检查 Docker
check_docker

# 创建备份目录
mkdir -p "${BACKUP_DIR}"

log_info "开始备份数据库..."

# 检查容器是否存在
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_error "容器 ${CONTAINER_NAME} 不存在"
    exit 1
fi

# 检查容器是否运行
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_warning "容器 ${CONTAINER_NAME} 未运行，尝试启动..."
    docker start "${CONTAINER_NAME}"
    sleep 5
fi

# 从 Docker 容器中导出数据库
log_step "导出数据库..."
if docker exec "${CONTAINER_NAME}" mysqldump -u root -p"${DB_ROOT_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    "${DB_NAME}" > "${BACKUP_FILE}" 2>/dev/null; then
    log_success "数据库导出成功"
else
    log_error "数据库导出失败"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# 压缩备份文件
log_step "压缩备份文件..."
gzip "${BACKUP_FILE}"
BACKUP_FILE="${BACKUP_FILE}.gz"

# 获取文件大小
FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log_success "备份完成: ${BACKUP_FILE} (${FILE_SIZE})"

# 清理超过指定天数的备份
log_step "清理 ${RETENTION_DAYS} 天前的旧备份..."
DELETED_COUNT=$(find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "${DELETED_COUNT}" -gt 0 ]; then
    log_success "已清理 ${DELETED_COUNT} 个旧备份"
else
    log_info "没有需要清理的旧备份"
fi

# 显示备份列表
log_info "当前备份文件："
ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | tail -5 || log_warning "没有备份文件"
