# 脚本说明文档

本目录包含项目管理和部署相关的脚本。

## 脚本列表

### 开发相关

#### `dev.sh` - 启动开发环境

启动开发环境所需的 MySQL 容器。

```bash
./scripts/dev.sh
```

**功能：**

- 启动 MySQL 容器
- 等待 MySQL 就绪
- 显示开发服务器启动命令

---

### 构建相关

#### `build.sh` - 构建生产镜像

构建所有服务的 Docker 镜像。

```bash
./scripts/build.sh              # 普通构建
./scripts/build.sh --no-cache   # 不使用缓存构建
```

**功能：**

- 构建所有 Docker 镜像
- 支持 --no-cache 选项

---

### 部署相关

#### `deploy.sh` - 本地部署

在本地或服务器上更新部署（不推送镜像）。

```bash
./scripts/deploy.sh           # 使用当前代码部署
./scripts/deploy.sh --pull    # 先拉取最新代码再部署
```

**功能：**

- 可选拉取最新代码
- 构建镜像
- 停止旧容器
- 启动新容器
- 清理悬空镜像

#### `build-and-push.sh` - 构建并推送镜像

构建镜像并推送到服务器或 Docker Registry。

```bash
# 推送到服务器
DEPLOY_SERVER_HOST=server.com ./scripts/build-and-push.sh

# 推送到 Docker Registry
DOCKER_REGISTRY=registry.com ./scripts/build-and-push.sh
```

**环境变量：**

- `DEPLOY_SERVER_HOST` - 服务器地址（必需）
- `DEPLOY_SERVER_USER` - 服务器用户名（默认: root）
- `DEPLOY_SERVER_PORT` - SSH 端口（默认: 22）
- `DOCKER_REGISTRY` - Docker Registry 地址
- `IMAGE_TAG` - 镜像标签（默认: latest）

**功能：**

- 构建所有镜像
- 保存为 tar 文件
- 上传到服务器或推送到 Registry
- 在服务器上加载镜像

#### `deploy-to-server.sh` - 一键部署到服务器

完整的部署流程，包括构建、推送、上传配置和启动服务。

```bash
DEPLOY_SERVER_HOST=server.com ./scripts/deploy-to-server.sh
```

**环境变量：**

- `DEPLOY_SERVER_HOST` - 服务器地址（必需）
- `DEPLOY_SERVER_USER` - 服务器用户名（默认: root）
- `DEPLOY_SERVER_PORT` - SSH 端口（默认: 22）
- `DEPLOY_PATH` - 部署路径（默认: /opt/kuaiyu）

**功能：**

1. 构建 Docker 镜像
2. 推送镜像到服务器
3. 上传配置文件
4. 在服务器上启动服务

---

### 备份相关

#### `backup.sh` - 数据库备份

备份 MySQL 数据库。

```bash
./scripts/backup.sh
```

**环境变量（从 .env 读取）：**

- `MYSQL_DATABASE` - 数据库名称（默认: kuaiyu_db）
- `MYSQL_ROOT_PASSWORD` - 数据库 root 密码
- `MYSQL_CONTAINER_NAME` - MySQL 容器名称（默认: kuaiyu_mysql）
- `BACKUP_DIR` - 备份目录（默认: ./backups）
- `BACKUP_RETENTION_DAYS` - 保留天数（默认: 30）

**功能：**

- 导出数据库
- 压缩备份文件
- 自动清理旧备份
- 显示备份文件列表

---

## 通用函数库

### `common.sh` - 通用函数库

提供脚本间共享的函数和变量。

**包含功能：**

- 颜色输出函数
- 日志函数（info, success, warning, error）
- 命令检查函数
- Docker 检查函数
- 环境变量加载函数

**使用方式：**

```bash
source "${SCRIPT_DIR}/common.sh"
```

---

## 使用示例

### 开发环境

```bash
# 1. 启动开发环境
./scripts/dev.sh

# 2. 在另一个终端启动后端
cd api && go run cmd/server/main.go

# 3. 在另一个终端启动前台
cd frontend && npm run dev

# 4. 在另一个终端启动后台
cd admin && npm run dev
```

### 生产部署

#### 方式一：本地部署（服务器上执行）

```bash
# 在服务器上
cd /opt/kuaiyu
./scripts/deploy.sh --pull
```

#### 方式二：远程部署（本地执行）

```bash
# 在本地
export DEPLOY_SERVER_HOST=your-server.com
export DEPLOY_SERVER_USER=root
./scripts/deploy-to-server.sh
```

### 数据库备份

```bash
# 备份数据库
./scripts/backup.sh

# 查看备份文件
ls -lh backups/
```

---

## 注意事项

1. **权限**: 确保脚本有执行权限

   ```bash
   chmod +x scripts/*.sh
   ```

2. **环境变量**: 部署相关脚本需要设置必要的环境变量

3. **SSH 配置**: 推送到服务器需要配置 SSH 密钥认证

4. **Docker**: 所有脚本需要 Docker 和 Docker Compose

5. **网络**: 推送到服务器需要网络连接

---

## 故障排查

### 脚本执行失败

1. 检查脚本权限：`ls -l scripts/*.sh`
2. 检查 Docker 是否运行：`docker info`
3. 检查环境变量是否正确设置
4. 查看脚本输出的错误信息

### 部署失败

1. 检查服务器连接：`ssh user@server`
2. 检查服务器上的 Docker 是否安装
3. 检查服务器上的磁盘空间
4. 查看服务器上的日志：`docker-compose logs`

### 备份失败

1. 检查 MySQL 容器是否运行
2. 检查数据库密码是否正确
3. 检查备份目录权限
4. 检查磁盘空间

---

**最后更新**: 2024-01-01
