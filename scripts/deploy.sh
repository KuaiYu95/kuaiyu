#!/bin/bash
# ===========================================
# 本地部署脚本（用于生产环境更新）
# 用法: ./scripts/deploy.sh [--pull]
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

# 解析参数
PULL_CODE=false
if [ "$1" = "--pull" ]; then
    PULL_CODE=true
fi

log_info "开始部署..."

# 拉取最新代码（可选）
if [ "$PULL_CODE" = true ]; then
    log_step "拉取最新代码..."
    if git pull origin main; then
        log_success "代码更新成功"
    else
        log_warning "代码拉取失败，继续使用当前代码"
    fi
fi

# 构建镜像
log_step "构建 Docker 镜像..."
if ! docker-compose build; then
    log_error "镜像构建失败"
    exit 1
fi

# 停止旧容器
log_step "停止旧容器..."
docker-compose down

# 启动新容器
log_step "启动新容器..."
if docker-compose up -d; then
    log_success "容器启动成功"
else
    log_error "容器启动失败"
    exit 1
fi

# 等待服务就绪
log_step "等待服务就绪..."
sleep 5

# 清理悬空镜像
log_step "清理悬空镜像..."
docker image prune -f

# 显示服务状态
log_info "服务状态:"
docker-compose ps

log_success "部署完成！"
echo ""
log_info "访问地址:"
echo -e "  ${GREEN}前台: https://yukuai.kcat.site${NC}"
echo -e "  ${GREEN}后台: https://admin.kcat.site${NC}"
