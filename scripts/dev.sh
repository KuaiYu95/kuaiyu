#!/bin/bash
# ===========================================
# 开发环境启动脚本
# 用法: ./scripts/dev.sh
# ===========================================

set -e

# 加载通用函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# 获取项目根目录
PROJECT_ROOT=$(get_project_root)
cd "$PROJECT_ROOT"

# 检查 Docker
check_docker

log_info "启动开发环境..."

# 检查 docker-compose.dev.yml 是否存在
if [ ! -f "docker-compose.dev.yml" ]; then
    log_warning "docker-compose.dev.yml 不存在，使用 docker-compose.yml"
    COMPOSE_FILE="docker-compose.yml"
else
    COMPOSE_FILE="docker-compose.dev.yml"
fi

# 启动 MySQL
log_step "启动 MySQL 容器..."
if docker-compose -f "${COMPOSE_FILE}" up -d mysql; then
    log_success "MySQL 容器启动成功"
else
    log_error "MySQL 容器启动失败"
    exit 1
fi

# 获取 MySQL 容器名称
MYSQL_CONTAINER=$(docker-compose -f "${COMPOSE_FILE}" ps -q mysql)
if [ -z "$MYSQL_CONTAINER" ]; then
    log_error "无法获取 MySQL 容器 ID"
    exit 1
fi
MYSQL_CONTAINER_NAME=$(docker inspect --format='{{.Name}}' "$MYSQL_CONTAINER" | sed 's/^\///')

log_info "MySQL 容器名称: ${MYSQL_CONTAINER_NAME}"

# 等待 MySQL 就绪
log_step "等待 MySQL 就绪..."
MAX_WAIT=60
WAIT_COUNT=0
while ! docker exec "${MYSQL_CONTAINER_NAME}" mysqladmin ping -h localhost --silent 2>/dev/null; do
    if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
        log_error "MySQL 启动超时"
        log_info "尝试查看容器日志: docker logs ${MYSQL_CONTAINER_NAME}"
        exit 1
    fi
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
    if [ $((WAIT_COUNT % 5)) -eq 0 ]; then
        echo -n "."
    fi
done
echo ""

log_success "MySQL 已就绪，端口 3306"
echo ""

# 检查 .env 文件中的数据库配置
log_info "检查数据库配置..."
if [ -f .env ]; then
    # 检查是否配置了 DB_* 变量
    if ! grep -q "^DB_HOST=" .env 2>/dev/null; then
        log_warning ".env 文件中缺少 DB_* 配置"
        log_info "开发环境数据库配置："
        echo ""
        echo "  DB_HOST=127.0.0.1"
        echo "  DB_PORT=3306"
        echo "  DB_USER=kuaiyu"
        echo "  DB_PASSWORD=kuaiyu123"
        echo "  DB_NAME=kuaiyu_db"
        echo ""
        log_warning "请将这些配置添加到 .env 文件中"
    else
        log_success "数据库配置已存在"
    fi
else
    log_warning ".env 文件不存在，请创建并配置数据库连接"
fi

echo ""
log_info "现在可以在各个目录中启动开发服务器："
echo ""
echo -e "  ${GREEN}后端 API (Go):${NC}"
echo -e "    ${YELLOW}cd api && go run cmd/server/main.go${NC}"
echo ""
echo -e "  ${GREEN}前台 (Next.js):${NC}"
echo -e "    ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo -e "  ${GREEN}后台 (React):${NC}"
echo -e "    ${YELLOW}cd admin && npm run dev${NC}"
echo ""
