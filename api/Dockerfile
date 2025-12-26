# ===========================================
# 快鱼博客 - Go API Dockerfile
# 多阶段构建优化镜像大小
# ===========================================

# 构建阶段
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 安装必要的构建工具
RUN apk add --no-cache gcc musl-dev

# 复制依赖文件
COPY go.mod go.sum ./
RUN go mod download

# 复制源码并构建
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# 运行阶段
FROM alpine:latest

WORKDIR /app

# 安装时区数据和CA证书
RUN apk --no-cache add ca-certificates tzdata

# 复制构建产物
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations

# 设置时区
ENV TZ=Asia/Shanghai

EXPOSE 8080

CMD ["./server"]

