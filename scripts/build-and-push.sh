#!/bin/bash
# ===========================================
# 构建并推送 Docker 镜像到服务器
# 用法: 
#   DEPLOY_SERVER_HOST=server.com ./scripts/build-and-push.sh
#   或
#   DOCKER_REGISTRY=registry.com ./scripts/build-and-push.sh
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

# 配置变量（从环境变量读取）
SERVER_HOST="${DEPLOY_SERVER_HOST:-}"
SERVER_USER="${DEPLOY_SERVER_USER:-root}"
SERVER_PORT="${DEPLOY_SERVER_PORT:-22}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${DOCKER_REGISTRY:-}"

# 检查必要参数
if [ -z "$SERVER_HOST" ] && [ -z "$REGISTRY" ]; then
    log_error "请设置 DEPLOY_SERVER_HOST 或 DOCKER_REGISTRY 环境变量"
    echo ""
    echo "用法:"
    echo "  DEPLOY_SERVER_HOST=your-server.com ./scripts/build-and-push.sh"
    echo "  或"
    echo "  DOCKER_REGISTRY=your-registry.com ./scripts/build-and-push.sh"
    echo ""
    echo "可选参数:"
    echo "  DEPLOY_SERVER_USER=root        # 服务器用户名（默认: root）"
    echo "  DEPLOY_SERVER_PORT=22         # SSH 端口（默认: 22）"
    echo "  IMAGE_TAG=latest               # 镜像标签（默认: latest）"
    exit 1
fi

log_info "开始构建和推送 Docker 镜像..."

# 构建镜像
log_step "构建 Docker 镜像..."
if ! docker-compose build --no-cache; then
    log_error "镜像构建失败"
    exit 1
fi

# 获取镜像名称
API_IMAGE="kuaiyu_api:${IMAGE_TAG}"
FRONTEND_IMAGE="kuaiyu_frontend:${IMAGE_TAG}"
ADMIN_IMAGE="kuaiyu_admin:${IMAGE_TAG}"

# 如果使用 Docker Registry
if [ -n "$REGISTRY" ]; then
    log_step "推送镜像到 Docker Registry: ${REGISTRY}"
    
    # 标记镜像
    docker tag "${API_IMAGE}" "${REGISTRY}/${API_IMAGE}"
    docker tag "${FRONTEND_IMAGE}" "${REGISTRY}/${FRONTEND_IMAGE}"
    docker tag "${ADMIN_IMAGE}" "${REGISTRY}/${ADMIN_IMAGE}"
    
    # 推送镜像
    log_step "推送 API 镜像..."
    docker push "${REGISTRY}/${API_IMAGE}"
    
    log_step "推送 Frontend 镜像..."
    docker push "${REGISTRY}/${FRONTEND_IMAGE}"
    
    log_step "推送 Admin 镜像..."
    docker push "${REGISTRY}/${ADMIN_IMAGE}"
    
    log_success "镜像已推送到 Registry"
    exit 0
fi

# 如果直接推送到服务器
if [ -n "$SERVER_HOST" ]; then
    # 检查 SSH 连接
    log_step "检查服务器连接..."
    if ! ssh -p "${SERVER_PORT}" -o ConnectTimeout=5 "${SERVER_USER}@${SERVER_HOST}" "echo '连接成功'" &>/dev/null; then
        log_error "无法连接到服务器 ${SERVER_HOST}"
        exit 1
    fi
    
    log_step "保存镜像为 tar 文件..."
    
    # 创建临时目录
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT
    
    # 保存镜像
    log_step "保存 API 镜像..."
    docker save "${API_IMAGE}" | gzip > "${TEMP_DIR}/api.tar.gz"
    
    log_step "保存 Frontend 镜像..."
    docker save "${FRONTEND_IMAGE}" | gzip > "${TEMP_DIR}/frontend.tar.gz"
    
    log_step "保存 Admin 镜像..."
    docker save "${ADMIN_IMAGE}" | gzip > "${TEMP_DIR}/admin.tar.gz"
    
    # 计算文件大小
    TOTAL_SIZE=$(du -sh "${TEMP_DIR}" | cut -f1)
    log_info "镜像总大小: ${TOTAL_SIZE}"
    
    log_step "上传镜像到服务器 ${SERVER_HOST}..."
    
    # 上传到服务器
    if scp -P "${SERVER_PORT}" \
        "${TEMP_DIR}/api.tar.gz" \
        "${TEMP_DIR}/frontend.tar.gz" \
        "${TEMP_DIR}/admin.tar.gz" \
        "${SERVER_USER}@${SERVER_HOST}:/tmp/" 2>/dev/null; then
        log_success "镜像上传成功"
    else
        log_error "镜像上传失败"
        exit 1
    fi
    
    log_step "在服务器上加载镜像..."
    
    # 在服务器上加载镜像
    ssh -p "${SERVER_PORT}" "${SERVER_USER}@${SERVER_HOST}" << EOF
        set -e
        echo "加载 API 镜像..."
        docker load < /tmp/api.tar.gz || exit 1
        echo "加载 Frontend 镜像..."
        docker load < /tmp/frontend.tar.gz || exit 1
        echo "加载 Admin 镜像..."
        docker load < /tmp/admin.tar.gz || exit 1
        echo "清理临时文件..."
        rm -f /tmp/*.tar.gz
        echo "✅ 镜像加载完成"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "镜像已推送到服务器"
    else
        log_error "镜像加载失败"
        exit 1
    fi
fi

log_success "构建和推送完成！"
