#!/bin/bash
# ===========================================
# 一键部署到服务器脚本
# 用法: DEPLOY_SERVER_HOST=server.com ./scripts/deploy-to-server.sh
# ===========================================

set -e

# 加载通用函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# 获取项目根目录
PROJECT_ROOT=$(get_project_root)

# 配置变量
SERVER_HOST="${DEPLOY_SERVER_HOST:-}"
SERVER_USER="${DEPLOY_SERVER_USER:-root}"
SERVER_PORT="${DEPLOY_SERVER_PORT:-22}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/kuaiyu}"

# 检查必要参数
if [ -z "$SERVER_HOST" ]; then
    log_error "请设置 DEPLOY_SERVER_HOST 环境变量"
    echo ""
    echo "用法: DEPLOY_SERVER_HOST=your-server.com ./scripts/deploy-to-server.sh"
    echo ""
    echo "可选参数:"
    echo "  DEPLOY_SERVER_USER=root        # 服务器用户名（默认: root）"
    echo "  DEPLOY_SERVER_PORT=22         # SSH 端口（默认: 22）"
    echo "  DEPLOY_PATH=/opt/kuaiyu       # 部署路径（默认: /opt/kuaiyu）"
    exit 1
fi

log_info "开始部署到服务器 ${SERVER_HOST}..."

# 检查 SSH 连接
log_step "检查服务器连接..."
if ! ssh -p "${SERVER_PORT}" -o ConnectTimeout=5 "${SERVER_USER}@${SERVER_HOST}" "echo '连接成功'" &>/dev/null; then
    log_error "无法连接到服务器 ${SERVER_HOST}"
    exit 1
fi

# 1. 构建镜像
log_step "步骤 1/4: 构建 Docker 镜像..."
cd "$PROJECT_ROOT"
if ! docker-compose build; then
    log_error "镜像构建失败"
    exit 1
fi

# 2. 推送镜像到服务器
log_step "步骤 2/4: 推送镜像到服务器..."
if ! "$PROJECT_ROOT/scripts/build-and-push.sh"; then
    log_error "镜像推送失败"
    exit 1
fi

# 3. 上传配置文件
log_step "步骤 3/4: 上传配置文件..."

# 创建部署包
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# 复制必要文件
mkdir -p "${TEMP_DIR}/kuaiyu"
cp docker-compose.yml "${TEMP_DIR}/kuaiyu/" 2>/dev/null || log_warning "docker-compose.yml 不存在"
cp -r nginx "${TEMP_DIR}/kuaiyu/" 2>/dev/null || log_warning "nginx 目录不存在"
cp -r scripts "${TEMP_DIR}/kuaiyu/" 2>/dev/null || log_warning "scripts 目录不存在"
cp env.example "${TEMP_DIR}/kuaiyu/" 2>/dev/null || log_warning "env.example 不存在"
cp Makefile "${TEMP_DIR}/kuaiyu/" 2>/dev/null || true
cp start.sh "${TEMP_DIR}/kuaiyu/" 2>/dev/null || log_warning "start.sh 不存在"

# 创建 .env 文件（如果不存在）
if [ ! -f "${TEMP_DIR}/kuaiyu/.env" ]; then
    if [ -f env.example ]; then
        cp env.example "${TEMP_DIR}/kuaiyu/.env"
        log_warning "已创建 .env 文件，请确保在服务器上配置"
    fi
fi

# 上传到服务器
log_step "上传文件到服务器..."
if scp -r -P "${SERVER_PORT}" "${TEMP_DIR}/kuaiyu" "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/" 2>/dev/null; then
    log_success "文件上传成功"
else
    log_error "文件上传失败"
    exit 1
fi

# 4. 在服务器上启动服务
log_step "步骤 4/4: 在服务器上启动服务..."

ssh -p "${SERVER_PORT}" "${SERVER_USER}@${SERVER_HOST}" << EOF
    set -e
    cd ${DEPLOY_PATH}/kuaiyu
    
    # 检查 .env 文件
    if [ ! -f .env ]; then
        echo "⚠️  警告: .env 文件不存在，请先配置"
        exit 1
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
    log_success "部署完成！"
else
    log_error "部署失败"
    exit 1
fi
