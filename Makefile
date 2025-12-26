# ===========================================
# Makefile - 项目管理命令
# ===========================================

.PHONY: help dev dev-mysql build deploy backup clean logs

# 默认显示帮助
help:
	@echo "可用命令:"
	@echo "  make dev        - 启动开发环境 (仅 MySQL)"
	@echo "  make build      - 构建生产镜像"
	@echo "  make deploy     - 部署到生产环境"
	@echo "  make backup     - 备份数据库"
	@echo "  make logs       - 查看容器日志"
	@echo "  make clean      - 清理 Docker 资源"
	@echo ""
	@echo "开发命令:"
	@echo "  make api        - 启动 API 开发服务器"
	@echo "  make frontend   - 启动前台开发服务器"
	@echo "  make admin      - 启动后台开发服务器"

# 启动开发数据库
dev:
	docker-compose -f docker-compose.dev.yml up -d mysql
	@echo "✅ MySQL 已启动 (localhost:3306)"

# 启动 API 开发服务器
api:
	cd api && DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=kuaiyu DB_PASSWORD=kuaiyu123 DB_NAME=kuaiyu_db go run cmd/server/main.go

# 启动前台开发服务器
frontend:
	cd frontend && npm run dev

# 启动后台开发服务器
admin:
	cd admin && npm run dev

# 构建生产镜像
build:
	docker-compose build

# 部署
deploy:
	./scripts/deploy.sh

# 备份数据库
backup:
	./scripts/backup.sh

# 查看日志
logs:
	docker-compose logs -f

# 清理
clean:
	docker-compose down -v
	docker image prune -f
	docker volume prune -f

