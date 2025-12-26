#!/bin/bash
# ===========================================
# 生产构建脚本
# ===========================================

set -e

echo "🏗️ 开始构建生产镜像..."

# 构建所有服务
docker-compose build --no-cache

echo "✅ 构建完成！"
echo ""
echo "运行以下命令启动服务："
echo "  docker-compose up -d"

