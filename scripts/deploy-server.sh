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
NO_CACHE="${NO_CACHE:-}"  # 可通过环境变量设置 --no-cache

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
    echo "  NO_CACHE=--no-cache           # 禁用构建缓存（默认: 使用缓存，加快构建）"
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

# 构建镜像（指定平台为 linux/amd64，使用生产环境配置）
# 默认使用缓存以加快构建速度，如需强制重新构建可设置 NO_CACHE=--no-cache
log_info "构建选项: ${NO_CACHE:-使用缓存（推荐，可加快构建速度）}"
if ! DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose -f docker-compose.prod.yml build ${NO_CACHE}; then
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

# 复制必要文件（直接复制到临时目录，不创建子文件夹）
cp docker-compose.prod.yml "${DEPLOY_TEMP_DIR}/docker-compose.yml" 2>/dev/null || log_error "docker-compose.prod.yml 不存在"
cp -r nginx "${DEPLOY_TEMP_DIR}/" 2>/dev/null || log_warning "nginx 目录不存在"

# 上传到服务器
log_step "上传配置文件到服务器..."
# 确保目标目录存在
ssh -p "${SERVER_PORT}" "${SERVER_USER}@${SERVER_HOST}" "mkdir -p ${DEPLOY_PATH}"

# 上传文件
if scp -P "${SERVER_PORT}" "${DEPLOY_TEMP_DIR}/docker-compose.yml" "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/" 2>/dev/null; then
    log_success "docker-compose.yml 上传成功"
else
    log_error "docker-compose.yml 上传失败"
    exit 1
fi

# 上传 nginx 目录
if scp -r -P "${SERVER_PORT}" "${DEPLOY_TEMP_DIR}/nginx" "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/" 2>/dev/null; then
    log_success "nginx 配置上传成功"
else
    log_warning "nginx 配置上传失败（可能已存在）"
fi

# 在服务器上启动服务
log_step "在服务器上启动服务..."
ssh -p "${SERVER_PORT}" "${SERVER_USER}@${SERVER_HOST}" << EOF
    set -e
    cd ${DEPLOY_PATH}
    
    # 检查环境变量（SSL_CERT_PATH 等）
    echo "检查环境变量..."
    echo "当前 SSL_CERT_PATH 环境变量: \${SSL_CERT_PATH:-未设置，将使用默认值 /etc/ssl/kuaiyu}"
    
    # 检查 .env 文件是否存在
    if [ -f .env ]; then
        echo "✅ 发现 .env 文件，docker-compose 会自动读取"
        # 从 .env 文件中读取 SSL_CERT_PATH 并显示
        if grep -q "^SSL_CERT_PATH=" .env 2>/dev/null; then
            SSL_PATH=\$(grep "^SSL_CERT_PATH=" .env | cut -d '=' -f2)
            echo "   SSL_CERT_PATH 从 .env 文件读取: \${SSL_PATH}"
        fi
    else
        echo "ℹ️  未发现 .env 文件"
        echo "   可以通过以下方式设置环境变量："
        echo "   1. 创建 .env 文件: echo 'SSL_CERT_PATH=/path/to/certs' > .env"
        echo "   2. 设置系统环境变量: export SSL_CERT_PATH=/path/to/certs"
        echo "   3. 启动时传递: SSL_CERT_PATH=/path/to/certs docker compose up -d"
    fi
    
    # 验证 SSL 证书路径（如果设置了）
    if [ -n "\${SSL_CERT_PATH}" ] || [ -f .env ]; then
        # 尝试从环境变量或 .env 文件获取路径
        if [ -f .env ]; then
            source .env 2>/dev/null || true
        fi
        if [ -n "\${SSL_CERT_PATH}" ] && [ "\${SSL_CERT_PATH}" != "/etc/ssl/kuaiyu" ]; then
            echo "检查 SSL 证书路径: \${SSL_CERT_PATH}"
            if [ ! -d "\${SSL_CERT_PATH}" ]; then
                echo "⚠️  警告: SSL 证书目录不存在: \${SSL_CERT_PATH}"
                echo "   请确保证书目录存在且包含正确的证书文件"
            fi
        fi
    fi
    
    # 停止旧容器
    echo "停止旧容器..."
    docker compose -f docker-compose.yml down || true
    
    # 启动新容器
    echo "启动新容器..."
    docker compose -f docker-compose.yml up -d
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    echo "检查服务状态..."
    docker compose -f docker-compose.yml ps
    
    # 如果 API 容器不健康，显示日志
    API_STATUS=\$(docker inspect --format='{{.State.Health.Status}}' kuaiyu_api 2>/dev/null || echo "unknown")
    if [ "\$API_STATUS" != "healthy" ]; then
        echo ""
        echo "⚠️  API 容器状态异常，查看日志："
        docker compose -f docker-compose.yml logs --tail=50 api
        echo ""
        echo "请检查："
        echo "  1. 数据库连接是否正常"
        echo "  2. 环境变量是否正确设置"
        echo "  3. API 服务是否正常启动"
    fi
    
    echo "✅ 部署完成！"
    echo ""
    echo "访问地址:"
    echo "  前台: https://yukuai.kcat.site"
    echo "  后台: https://admin.kcat.site"
    echo ""
    echo "注意: 如果服务未正常启动，请检查："
    echo "  1. 环境变量是否正确设置（SSL_CERT_PATH 等）"
    echo "  2. SSL 证书路径是否正确"
    echo "  3. 查看日志: docker compose logs -f"
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
    echo -e "  ${YELLOW}cd ${DEPLOY_PATH}${NC}"
    echo -e "  ${YELLOW}docker compose logs -f${NC}"
    echo ""
    log_info "重要提示:"
    echo -e "  ${YELLOW}请确保在服务器上设置了必要的环境变量（如 SSL_CERT_PATH）${NC}"
    echo -e "  ${YELLOW}或在 ${DEPLOY_PATH} 目录下创建 .env 文件${NC}"
else
    log_error "部署失败"
    exit 1
fi

