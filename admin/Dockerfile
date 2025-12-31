# ===========================================
# Yu.kuai - 后台管理 Dockerfile
# ===========================================

FROM node:20-alpine AS base

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 安装依赖阶段（利用 Docker 缓存：如果依赖文件未变，可复用此层）
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app

# 先复制 node_modules（利用缓存层）
COPY --from=deps /app/node_modules ./node_modules

# 再复制源代码（源代码变化时只需重新构建，不需要重新安装依赖）
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

