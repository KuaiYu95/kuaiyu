# ===========================================
# Yu.kuai - 后台管理 Dockerfile
# ===========================================

FROM node:20-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建参数（从 docker-compose.yml 的 build.args 传递）
ARG VITE_API_URL

# 将构建参数转换为环境变量（Vite 构建时需要）
ENV VITE_API_URL=${VITE_API_URL}

# 构建
RUN pnpm run build

# 使用 Nginx 托管静态文件
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

