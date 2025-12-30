# SSL 证书配置说明

## 重要提示

⚠️ **SSL 证书应单独管理，不放在项目目录中**

证书文件应放置在服务器上的独立目录，通过环境变量 `SSL_CERT_PATH` 指定路径。

## 默认证书路径

默认证书路径：`/etc/ssl/kuaiyu`

可以通过 `.env` 文件中的 `SSL_CERT_PATH` 环境变量修改。

## 证书文件说明

证书目录应包含以下文件（两个域名的证书文件）：

- `yukuai.kcat.site.fullchain.pem` - 前台域名完整证书链
- `yukuai.kcat.site.privkey.pem` - 前台域名私钥文件
- `admin.kcat.site.fullchain.pem` - 后台域名完整证书链
- `admin.kcat.site.privkey.pem` - 后台域名私钥文件

## 使用腾讯云 SSL 证书

### 步骤 1: 申请证书

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **SSL 证书管理** → **我的证书**
3. 点击 **申请免费证书** 或 **购买证书**
4. 填写域名信息：
   - **前台域名**: `yukuai.kcat.site`
   - **后台域名**: `admin.kcat.site`
5. 完成域名验证（DNS 验证或文件验证）
6. 等待证书审核通过

### 步骤 2: 下载证书

1. 在证书列表中，找到已签发的证书
2. 点击 **下载** 按钮
3. 选择 **Nginx** 格式下载
4. 解压下载的 ZIP 文件

下载的证书文件通常包含：

- `1_yukuai.kcat.site_bundle.crt` - 证书文件（包含完整证书链）
- `2_yukuai.kcat.site.key` - 私钥文件

### 步骤 3: 上传证书到服务器

#### 方法一：使用 SCP 上传

```bash
# 在本地执行，上传前台证书
scp 1_yukuai.kcat.site_bundle.crt root@your-server:/tmp/
scp 2_yukuai.kcat.site.key root@your-server:/tmp/

# 上传后台证书
scp 1_admin.kcat.site_bundle.crt root@your-server:/tmp/
scp 2_admin.kcat.site.key root@your-server:/tmp/
```

#### 方法二：使用 SFTP 上传

使用 FileZilla、WinSCP 等工具上传证书文件到服务器的 `/tmp/` 目录。

### 步骤 4: 配置证书文件

在服务器上执行以下命令：

```bash
# 创建证书目录
sudo mkdir -p /etc/ssl/kuaiyu

# 配置前台证书（yukuai.kcat.site）
sudo cp /tmp/1_yukuai.kcat.site_bundle.crt /etc/ssl/kuaiyu/yukuai.kcat.site.fullchain.pem
sudo cp /tmp/2_yukuai.kcat.site.key /etc/ssl/kuaiyu/yukuai.kcat.site.privkey.pem

# 配置后台证书（admin.kcat.site）
sudo cp /tmp/1_admin.kcat.site_bundle.crt /etc/ssl/kuaiyu/admin.kcat.site.fullchain.pem
sudo cp /tmp/2_admin.kcat.site.key /etc/ssl/kuaiyu/admin.kcat.site.privkey.pem

# 设置文件权限
sudo chmod 600 /etc/ssl/kuaiyu/*.privkey.pem
sudo chmod 644 /etc/ssl/kuaiyu/*.fullchain.pem
sudo chmod 700 /etc/ssl/kuaiyu

# 设置所有者
sudo chown root:root /etc/ssl/kuaiyu/*

# 清理临时文件
sudo rm -f /tmp/*.crt /tmp/*.key
```

### 一键配置脚本

创建脚本 `/opt/ssl/setup-kuaiyu-cert.sh`：

```bash
#!/bin/bash
# 腾讯云 SSL 证书配置脚本

CERT_DIR="/etc/ssl/kuaiyu"
TEMP_DIR="/tmp/ssl-certs"

# 创建证书目录
sudo mkdir -p $CERT_DIR

# 检查证书文件是否存在
if [ ! -f "$TEMP_DIR/1_yukuai.kcat.site_bundle.crt" ] || [ ! -f "$TEMP_DIR/2_yukuai.kcat.site.key" ]; then
    echo "错误: 前台证书文件不存在，请先上传证书文件到 $TEMP_DIR/"
    exit 1
fi

if [ ! -f "$TEMP_DIR/1_admin.kcat.site_bundle.crt" ] || [ ! -f "$TEMP_DIR/2_admin.kcat.site.key" ]; then
    echo "错误: 后台证书文件不存在，请先上传证书文件到 $TEMP_DIR/"
    exit 1
fi

# 配置前台证书
echo "配置前台证书..."
sudo cp $TEMP_DIR/1_yukuai.kcat.site_bundle.crt $CERT_DIR/yukuai.kcat.site.fullchain.pem
sudo cp $TEMP_DIR/2_yukuai.kcat.site.key $CERT_DIR/yukuai.kcat.site.privkey.pem

# 配置后台证书
echo "配置后台证书..."
sudo cp $TEMP_DIR/1_admin.kcat.site_bundle.crt $CERT_DIR/admin.kcat.site.fullchain.pem
sudo cp $TEMP_DIR/2_admin.kcat.site.key $CERT_DIR/admin.kcat.site.privkey.pem

# 设置权限
echo "设置文件权限..."
sudo chmod 600 $CERT_DIR/*.privkey.pem
sudo chmod 644 $CERT_DIR/*.fullchain.pem
sudo chmod 700 $CERT_DIR
sudo chown root:root $CERT_DIR/*

echo "✅ 证书配置完成！"
echo "证书目录: $CERT_DIR"
ls -la $CERT_DIR
```

设置执行权限：

```bash
sudo chmod +x /opt/ssl/setup-kuaiyu-cert.sh
```

使用方法：

```bash
# 1. 上传证书文件到 /tmp/ssl-certs/
# 2. 执行脚本
sudo /opt/ssl/setup-kuaiyu-cert.sh
```

## 配置证书路径

在 `.env` 文件中设置证书路径：

```bash
# 使用默认路径
SSL_CERT_PATH=/etc/ssl/kuaiyu

# 或使用自定义路径
SSL_CERT_PATH=/opt/ssl/kuaiyu
```

## 验证证书

```bash
# 检查证书文件是否存在
ls -la /etc/ssl/kuaiyu/

# 应该看到以下文件：
# - yukuai.kcat.site.fullchain.pem
# - yukuai.kcat.site.privkey.pem
# - admin.kcat.site.fullchain.pem
# - admin.kcat.site.privkey.pem

# 查看前台证书信息
openssl x509 -in /etc/ssl/kuaiyu/yukuai.kcat.site.fullchain.pem -text -noout | grep -A 2 "Subject:"

# 查看后台证书信息
openssl x509 -in /etc/ssl/kuaiyu/admin.kcat.site.fullchain.pem -text -noout | grep -A 2 "Subject:"

# 测试 Nginx 配置
docker exec kuaiyu_nginx nginx -t
```

## 证书更新

### 腾讯云证书更新流程

1. **在腾讯云控制台更新证书**

   - 进入 SSL 证书管理
   - 找到需要更新的证书
   - 点击 **续费** 或 **重新申请**

2. **下载新证书**

   - 下载新证书文件（Nginx 格式）

3. **上传并替换证书**

   ```bash
   # 备份旧证书
   sudo cp -r /etc/ssl/kuaiyu /etc/ssl/kuaiyu.backup.$(date +%Y%m%d)

   # 上传新证书到 /tmp/ssl-certs/
   # 然后执行配置脚本
   sudo /opt/ssl/setup-kuaiyu-cert.sh

   # 重启 Nginx
   cd /opt/kuaiyu
   docker-compose restart nginx
   ```

## 安全提示

⚠️ **重要安全建议**:

1. **私钥文件权限**: 私钥文件（\*.privkey.pem）必须设置为 600 权限，只有所有者可读写
2. **证书目录权限**: 证书目录应设置为 700 权限
3. **不要提交到 Git**: 确保证书文件不会被提交到版本控制系统
4. **定期备份**: 定期备份证书文件（特别是私钥）
5. **证书有效期**: 注意证书有效期，提前续费或更新

## 文件权限设置

```bash
# 设置证书目录权限
sudo chmod 700 /etc/ssl/kuaiyu

# 设置证书文件权限
sudo chmod 644 /etc/ssl/kuaiyu/*.fullchain.pem
sudo chmod 600 /etc/ssl/kuaiyu/*.privkey.pem

# 设置所有者
sudo chown root:root /etc/ssl/kuaiyu/*
```

## 常见问题

### 证书文件找不到

- 检查 `SSL_CERT_PATH` 环境变量是否正确设置
- 检查证书文件路径是否存在
- 检查文件权限是否正确
- 确认证书文件名是否正确（包含域名前缀）

### 证书格式问题

腾讯云下载的证书文件格式：

- 证书文件：`1_domain_bundle.crt` → 重命名为 `domain.fullchain.pem`
- 私钥文件：`2_domain.key` → 重命名为 `domain.privkey.pem`

### 权限问题

- 确保证书文件权限正确（私钥 600，证书 644）
- 检查 Docker 容器是否有读取权限
- 可能需要调整 SELinux 设置（CentOS）

### 证书过期

- 腾讯云证书有效期通常为 1 年
- 提前 30 天续费或更新证书
- 更新后记得重启 Nginx 服务

---

**最后更新**: 2024-01-01
