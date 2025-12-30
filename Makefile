# ===========================================
# Makefile - 项目管理命令
# ===========================================

.PHONY: help dev deploy deploy-server build api frontend admin logs clean

# 默认显示帮助
help:
	@echo "可用命令:"
	@echo ""
	@echo "开发环境:"
	@echo "  make dev        - 启动开发环境 (仅 MySQL，使用 dev.sh)"
	@echo "  make api        - 启动 API 开发服务器"
	@echo "  make frontend   - 启动前台开发服务器"
	@echo "  make admin      - 启动后台开发服务器"
	@echo ""
	@echo "部署命令:"
	@echo "  make deploy     - 本地部署到 Docker (使用 deploy.sh)"
	@echo "  make deploy-server - 部署到服务器 (使用 deploy-server.sh)"
	@echo "                    需要设置: DEPLOY_SERVER_HOST=server.com"
	@echo "  make build      - 仅构建 Docker 镜像"
	@echo ""
	@echo "运维命令:"
	@echo "  make logs       - 查看容器日志"
	@echo "  make clean      - 清理 Docker 资源"

# 启动开发环境
dev:
	./scripts/dev.sh

# 本地部署到 Docker
deploy:
	./scripts/deploy.sh

# 部署到服务器
deploy-server:
	@if [ -z "$(DEPLOY_SERVER_HOST)" ]; then \
		echo "❌ 错误: 请设置 DEPLOY_SERVER_HOST 环境变量"; \
		echo "用法: DEPLOY_SERVER_HOST=server.com make deploy-server"; \
		exit 1; \
	fi
	./scripts/deploy-server.sh

# 仅构建镜像
build:
	docker-compose build

# 启动 API 开发服务器
api:
	cd api && DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=kuaiyu DB_PASSWORD=kuaiyu123 DB_NAME=kuaiyu_db go run cmd/server/main.go

# 启动前台开发服务器
frontend:
	cd frontend && npm run dev

# 启动后台开发服务器
admin:
	cd admin && npm run dev

# 查看日志
logs:
	docker-compose logs -f

# 清理 Docker 资源
clean:
	docker-compose down -v
	docker image prune -f
	docker volume prune -f

