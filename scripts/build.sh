#!/bin/bash
# ===========================================
# 生产构建脚本
# 用法: ./scripts/build.sh [--no-cache]
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
NO_CACHE=""
if [ "$1" = "--no-cache" ]; then
    NO_CACHE="--no-cache"
    log_warning "使用 --no-cache 选项，构建时间可能较长"
fi

log_info "开始构建生产镜像..."

# 构建所有服务
log_step "构建 Docker 镜像..."
if docker-compose build ${NO_CACHE}; then
    log_success "构建完成！"
    echo ""
    log_info "运行以下命令启动服务："
    echo -e "  ${GREEN}docker-compose up -d${NC}"
    echo ""
    log_info "或使用一键启动脚本："
    echo -e "  ${GREEN}./start.sh${NC}"
else
    log_error "构建失败"
    exit 1
fi
