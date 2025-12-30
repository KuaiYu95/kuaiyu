#!/bin/bash
# ===========================================
# 通用函数库
# 提供脚本间共享的函数和变量
# ===========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取项目根目录
get_project_root() {
    echo "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
}

# 打印信息
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 打印成功
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 打印警告
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 打印错误
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 打印步骤
log_step() {
    echo -e "${YELLOW}📦 $1${NC}"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "命令 '$1' 未安装，请先安装"
        exit 1
    fi
}

# 检查 Docker 是否运行
check_docker() {
    if ! docker info &> /dev/null; then
        log_error "Docker 未运行，请先启动 Docker"
        exit 1
    fi
}

# 加载环境变量
load_env() {
    local env_file="${1:-.env}"
    if [ -f "$env_file" ]; then
        set -a
        source "$env_file"
        set +a
    fi
}

