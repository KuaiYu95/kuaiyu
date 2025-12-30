# ===========================================
# Yu.kuai - Go API Dockerfile
# 多阶段构建优化镜像大小
# ===========================================

# 构建阶段
FROM golang:1.25-alpine AS builder

WORKDIR /app

# 配置 Alpine 镜像源（直接使用官方源，避免 DNS 问题）
# 如果网络环境需要，可以取消注释下面的镜像源配置
# RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories

# 安装必要的构建工具
RUN apk update && apk add --no-cache gcc musl-dev

# 复制依赖文件
COPY go.mod go.sum ./
RUN go mod download

# 复制源码并构建
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# 运行阶段
FROM alpine:latest

WORKDIR /app

# 配置 Alpine 镜像源（直接使用官方源，避免 DNS 问题）
# 如果网络环境需要，可以取消注释下面的镜像源配置
# RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories

# 安装时区数据和CA证书
RUN apk update && apk --no-cache add ca-certificates tzdata

# 复制构建产物
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations

# 设置时区
ENV TZ=Asia/Shanghai

EXPOSE 8080

CMD ["./server"]

