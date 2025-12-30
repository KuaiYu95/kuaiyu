#!/bin/bash
# ===========================================
# 快语个人博客 - 一键启动脚本
# ===========================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "=========================================="
echo "  快语个人博客 - 一键启动"
echo "=========================================="
echo -e "${NC}"

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: 未安装 Docker${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: 未安装 Docker Compose${NC}"
    exit 1
fi

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env 文件不存在，从 env.example 创建...${NC}"
    cp env.example .env
    echo -e "${YELLOW}请编辑 .env 文件配置数据库密码、JWT Secret 等信息${NC}"
    echo -e "${YELLOW}按 Enter 继续，或 Ctrl+C 退出编辑配置...${NC}"
    read
fi

# 检查 SSL 证书（从环境变量读取证书路径）
SSL_CERT_PATH=${SSL_CERT_PATH:-/etc/ssl/kuaiyu}

# 检查前台证书
if [ ! -f "${SSL_CERT_PATH}/yukuai.kcat.site.fullchain.pem" ] || [ ! -f "${SSL_CERT_PATH}/yukuai.kcat.site.privkey.pem" ]; then
    echo -e "${YELLOW}⚠️  前台 SSL 证书文件不存在${NC}"
    echo -e "${YELLOW}证书路径: ${SSL_CERT_PATH}${NC}"
    echo -e "${YELLOW}请将前台证书文件放置到以下目录：${NC}"
    echo -e "${YELLOW}  - ${SSL_CERT_PATH}/yukuai.kcat.site.fullchain.pem${NC}"
    echo -e "${YELLOW}  - ${SSL_CERT_PATH}/yukuai.kcat.site.privkey.pem${NC}"
    FRONTEND_CERT_MISSING=true
else
    echo -e "${GREEN}✅ 前台 SSL 证书文件检查通过${NC}"
    FRONTEND_CERT_MISSING=false
fi

# 检查后台证书
if [ ! -f "${SSL_CERT_PATH}/admin.kcat.site.fullchain.pem" ] || [ ! -f "${SSL_CERT_PATH}/admin.kcat.site.privkey.pem" ]; then
    echo -e "${YELLOW}⚠️  后台 SSL 证书文件不存在${NC}"
    echo -e "${YELLOW}证书路径: ${SSL_CERT_PATH}${NC}"
    echo -e "${YELLOW}请将后台证书文件放置到以下目录：${NC}"
    echo -e "${YELLOW}  - ${SSL_CERT_PATH}/admin.kcat.site.fullchain.pem${NC}"
    echo -e "${YELLOW}  - ${SSL_CERT_PATH}/admin.kcat.site.privkey.pem${NC}"
    ADMIN_CERT_MISSING=true
else
    echo -e "${GREEN}✅ 后台 SSL 证书文件检查通过${NC}"
    ADMIN_CERT_MISSING=false
fi

# 如果有证书缺失，提示用户
if [ "$FRONTEND_CERT_MISSING" = true ] || [ "$ADMIN_CERT_MISSING" = true ]; then
    echo ""
    echo -e "${YELLOW}可以通过设置 SSL_CERT_PATH 环境变量来指定证书路径${NC}"
    echo -e "${YELLOW}如需使用腾讯云 SSL 证书，请参考 nginx/ssl/README.md${NC}"
    echo -e "${YELLOW}按 Enter 继续（将使用 HTTP），或 Ctrl+C 退出配置证书...${NC}"
    read
fi

# 创建必要的目录
echo -e "${BLUE}📁 创建必要的目录...${NC}"
mkdir -p nginx/logs
mkdir -p nginx/ssl
mkdir -p nginx/conf.d

# 构建镜像
echo -e "${BLUE}🏗️  构建 Docker 镜像...${NC}"
docker-compose build

# 启动服务
echo -e "${BLUE}🚀 启动服务...${NC}"
docker-compose up -d

# 等待服务启动
echo -e "${BLUE}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo -e "${BLUE}📊 检查服务状态...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ 服务启动完成！${NC}"
echo ""
echo -e "${GREEN}访问地址:${NC}"
echo -e "  ${GREEN}前台:${NC} https://yukuai.kcat.site"
echo -e "  ${GREEN}后台:${NC} https://admin.kcat.site"
echo ""
echo -e "${GREEN}常用命令:${NC}"
echo -e "  查看日志: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  停止服务: ${YELLOW}docker-compose down${NC}"
echo -e "  重启服务: ${YELLOW}docker-compose restart${NC}"
echo -e "  查看状态: ${YELLOW}docker-compose ps${NC}"
echo ""

