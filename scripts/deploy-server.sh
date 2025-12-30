#!/bin/bash
# ===========================================
# 服务器部署脚本 - 本地构建镜像并推送到服务器运行
# 用法: DEPLOY_SERVER_HOST=server.com ./scripts/deploy-server.sh
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

# 配置变量
SERVER_HOST="${DEPLOY_SERVER_HOST:-}"
SERVER_USER="${DEPLOY_SERVER_USER:-root}"
SERVER_PORT="${DEPLOY_SERVER_PORT:-22}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/kuaiyu}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# 检查必要参数
if [ -z "$SERVER_HOST" ]; then
    log_error "请设置 DEPLOY_SERVER_HOST 环境变量"
    echo ""
    echo "用法: DEPLOY_SERVER_HOST=your-server.com ./scripts/deploy-server.sh"
    echo ""
    echo "可选参数:"
    echo "  DEPLOY_SERVER_USER=root        # 服务器用户名（默认: root）"
    echo "  DEPLOY_SERVER_PORT=22         # SSH 端口（默认: 22）"
    echo "  DEPLOY_PATH=/opt/kuaiyu       # 部署路径（默认: /opt/kuaiyu）"
    echo "  IMAGE_TAG=latest               # 镜像标签（默认: latest）"
    exit 1
fi

log_info "=========================================="
log_info "开始服务器部署流程"
log_info "服务器: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}"
log_info "部署路径: ${DEPLOY_PATH}"
log_info "=========================================="
echo ""

# ===========================================
# 步骤 1: 检查服务器连接
# ===========================================
log_step "步骤 1/4: 检查服务器连接..."
if ! ssh -p "${SERVER_PORT}" -o ConnectTimeout=5 "${SERVER_USER}@${SERVER_HOST}" "echo '连接成功'" &>/dev/null; then
    log_error "无法连接到服务器 ${SERVER_HOST}"
    log_info "请检查："
    echo "  1. 服务器 IP 地址是否正确"
    echo "  2. SSH 密钥是否已配置"
    echo "  3. 防火墙是否开放 ${SERVER_PORT} 端口"
    exit 1
fi
log_success "服务器连接正常"

# 检查服务器 Docker
log_step "检查服务器 Docker..."
if ! ssh -p "${SERVER_PORT}" "${SERVER_USER}@${SERVER_HOST}" "command -v docker &> /dev/null"; then
    log_error "服务器上未安装 Docker"
    log_info "请在服务器上先安装 Docker，或运行服务器初始化脚本"
    exit 1
fi
log_success "服务器 Docker 已安装"

# ===========================================
# 步骤 2: 本地构建镜像
# ===========================================
log_step "步骤 2/4: 本地构建 Docker 镜像..."

# 检查 .env 文件
if [ ! -f .env ]; then
    log_warning ".env 文件不存在，使用 env.example..."
    if [ -f env.example ]; then
        cp env.example .env
        log_warning "请确保生产环境配置正确"
    fi
fi

# 构建镜像
if ! docker-compose build --no-cache; then
    log_error "镜像构建失败"
    exit 1
fi
log_success "镜像构建完成"

# 获取镜像名称（docker-compose 使用连字符，格式：项目名-服务名:标签）
API_IMAGE="kuaiyu-api:${IMAGE_TAG}"
FRONTEND_IMAGE="kuaiyu-frontend:${IMAGE_TAG}"
ADMIN_IMAGE="kuaiyu-admin:${IMAGE_TAG}"

# ===========================================
# 步骤 3: 推送镜像到服务器
# ===========================================
log_step "步骤 3/4: 推送镜像到服务器..."

# 创建临时目录
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# 保存镜像
log_step "保存镜像为 tar 文件..."
docker save "${API_IMAGE}" | gzip > "${TEMP_DIR}/api.tar.gz"
docker save "${FRONTEND_IMAGE}" | gzip > "${TEMP_DIR}/frontend.tar.gz"
docker save "${ADMIN_IMAGE}" | gzip > "${TEMP_DIR}/admin.tar.gz"

# 计算文件大小
TOTAL_SIZE=$(du -sh "${TEMP_DIR}" | cut -f1)
log_info "镜像总大小: ${TOTAL_SIZE}"

# 上传到服务器
log_step "上传镜像到服务器..."
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

# 在服务器上加载镜像
log_step "在服务器上加载镜像..."
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

# ===========================================
# 步骤 4: 上传配置文件和启动服务
# ===========================================
log_step "步骤 4/4: 上传配置文件和启动服务..."

# 创建部署包
DEPLOY_TEMP_DIR=$(mktemp -d)
trap "rm -rf $DEPLOY_TEMP_DIR" EXIT

# 复制必要文件
mkdir -p "${DEPLOY_TEMP_DIR}/kuaiyu"
cp docker-compose.yml "${DEPLOY_TEMP_DIR}/kuaiyu/" 2>/dev/null || log_error "docker-compose.yml 不存在"
cp -r nginx "${DEPLOY_TEMP_DIR}/kuaiyu/" 2>/dev/null || log_warning "nginx 目录不存在"
cp env.example "${DEPLOY_TEMP_DIR}/kuaiyu/" 2>/dev/null || log_warning "env.example 不存在"
cp Makefile "${DEPLOY_TEMP_DIR}/kuaiyu/" 2>/dev/null || true

# 上传到服务器
log_step "上传配置文件到服务器..."
if scp -r -P "${SERVER_PORT}" "${DEPLOY_TEMP_DIR}/kuaiyu" "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/" 2>/dev/null; then
    log_success "配置文件上传成功"
else
    log_error "配置文件上传失败"
    exit 1
fi

# 在服务器上启动服务
log_step "在服务器上启动服务..."
ssh -p "${SERVER_PORT}" "${SERVER_USER}@${SERVER_HOST}" << EOF
    set -e
    cd ${DEPLOY_PATH}/kuaiyu
    
    # 检查 .env 文件
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            echo "⚠️  警告: 已从 env.example 创建 .env 文件，请确保配置正确"
        else
            echo "❌ 错误: .env 文件不存在且 env.example 也不存在"
            exit 1
        fi
    fi
    
    # 停止旧容器
    echo "停止旧容器..."
    docker-compose down || true
    
    # 启动新容器
    echo "启动新容器..."
    docker-compose up -d
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    echo "检查服务状态..."
    docker-compose ps
    
    echo "✅ 部署完成！"
    echo ""
    echo "访问地址:"
    echo "  前台: https://yukuai.kcat.site"
    echo "  后台: https://admin.kcat.site"
EOF

if [ $? -eq 0 ]; then
    log_success "=========================================="
    log_success "服务器部署完成！"
    log_success "=========================================="
    echo ""
    log_info "访问地址:"
    echo -e "  ${GREEN}前台: https://yukuai.kcat.site${NC}"
    echo -e "  ${GREEN}后台: https://admin.kcat.site${NC}"
    echo ""
    log_info "在服务器上查看日志:"
    echo -e "  ${YELLOW}ssh ${SERVER_USER}@${SERVER_HOST}${NC}"
    echo -e "  ${YELLOW}cd ${DEPLOY_PATH}/kuaiyu${NC}"
    echo -e "  ${YELLOW}docker-compose logs -f${NC}"
else
    log_error "部署失败"
    exit 1
fi

