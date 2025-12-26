#!/bin/bash
# ===========================================
# 开发环境启动脚本
# ===========================================

set -e

echo "🚀 启动开发环境..."

# 启动 MySQL
echo "📦 启动 MySQL 容器..."
docker-compose -f docker-compose.dev.yml up -d mysql

# 等待 MySQL 就绪
echo "⏳ 等待 MySQL 就绪..."
sleep 10

echo "✅ MySQL 已启动，端口 3306"
echo ""
echo "现在可以在各个目录中启动开发服务器："
echo ""
echo "  后端 API (Go):"
echo "    cd api && go run cmd/server/main.go"
echo ""
echo "  前台 (Next.js):"
echo "    cd frontend && npm run dev"
echo ""
echo "  后台 (React):"
echo "    cd admin && npm run dev"
echo ""

