// Package cos 腾讯云 COS 服务
// 提供文件上传到腾讯云对象存储的功能
package cos

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/tencentyun/cos-go-sdk-v5"
	"golang.org/x/net/proxy"
	"kuaiyu/internal/config"
)

// ===========================================
// COS 客户端
// ===========================================

var cosClient *cos.Client

// Init 初始化 COS 客户端
func Init() error {
	cfg := config.Get()
	
	// 检查配置是否完整
	if cfg.COS.SecretID == "" || cfg.COS.SecretKey == "" || cfg.COS.Bucket == "" || cfg.COS.Region == "" {
		return fmt.Errorf("COS 配置不完整，请检查环境变量")
	}
	
	// 构建 COS URL
	u, err := url.Parse(fmt.Sprintf("https://%s.cos.%s.myqcloud.com", cfg.COS.Bucket, cfg.COS.Region))
	if err != nil {
		return fmt.Errorf("构建 COS URL 失败: %v", err)
	}
	
	// 配置代理（优先使用配置中的代理，其次使用环境变量）
	proxyURL := cfg.COS.ProxyURL
	if proxyURL == "" {
		// 尝试从环境变量读取代理
		if httpsProxy := os.Getenv("https_proxy"); httpsProxy != "" {
			proxyURL = httpsProxy
		} else if httpProxy := os.Getenv("http_proxy"); httpProxy != "" {
			proxyURL = httpProxy
		} else if allProxy := os.Getenv("all_proxy"); allProxy != "" {
			proxyURL = allProxy
		}
	}
	
	// 记录代理配置（用于调试，不记录完整 URL 以保护隐私）
	if proxyURL != "" {
		proxyType := "HTTP"
		if strings.HasPrefix(proxyURL, "socks5://") {
			proxyType = "SOCKS5"
		}
		fmt.Printf("[COS] 使用 %s 代理: %s\n", proxyType, maskProxyURL(proxyURL))
	} else {
		fmt.Printf("[COS] 未配置代理，使用直连\n")
	}
	
	// 创建基础 Transport
	var baseTransport *http.Transport
	if proxyURL != "" {
		proxyURLParsed, err := url.Parse(proxyURL)
		if err != nil {
			return fmt.Errorf("解析代理 URL 失败: %v", err)
		}
		
		// 判断代理类型
		if strings.HasPrefix(proxyURL, "socks5://") {
			// SOCKS5 代理
			dialer, err := proxy.SOCKS5("tcp", proxyURLParsed.Host, nil, proxy.Direct)
			if err != nil {
				return fmt.Errorf("创建 SOCKS5 代理失败: %v", err)
			}
			// 将 Dial 转换为 DialContext
			baseTransport = &http.Transport{
				DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
					return dialer.Dial(network, addr)
				},
			}
		} else {
			// HTTP/HTTPS 代理
			baseTransport = &http.Transport{
				Proxy: http.ProxyURL(proxyURLParsed),
			}
		}
	} else {
		// 没有代理时使用默认 Transport
		baseTransport = &http.Transport{
			DialContext: (&net.Dialer{
				Timeout:   30 * time.Second,
				KeepAlive: 30 * time.Second,
			}).DialContext,
		}
	}
	
	// 创建带认证的 Transport
	authTransport := &cos.AuthorizationTransport{
		SecretID:  cfg.COS.SecretID,
		SecretKey: cfg.COS.SecretKey,
	}
	if baseTransport != nil {
		authTransport.Transport = baseTransport
	}
	
	// 配置 HTTP 客户端
	httpClient := &http.Client{
		Transport: authTransport,
	}
	
	// 创建 COS 客户端
	cosClient = cos.NewClient(&cos.BaseURL{BucketURL: u}, httpClient)
	
	return nil
}

// ===========================================
// 上传功能
// ===========================================

// UploadFile 上传文件到 COS
// file: 文件内容
// filename: 文件名（包含路径）
// contentType: 文件 MIME 类型
// 返回: 文件访问 URL 和错误
func UploadFile(file io.Reader, filename string, contentType string) (string, error) {
	if cosClient == nil {
		if err := Init(); err != nil {
			return "", fmt.Errorf("COS 客户端未初始化: %v", err)
		}
	}
	
	cfg := config.Get()
	
	// 构建 COS 对象键（路径）
	objectKey := fmt.Sprintf("uploads/%s", filename)
	
	// 设置文件元数据
	opt := &cos.ObjectPutOptions{
		ObjectPutHeaderOptions: &cos.ObjectPutHeaderOptions{
			ContentType: contentType,
		},
	}
	
	// 上传文件
	_, err := cosClient.Object.Put(context.Background(), objectKey, file, opt)
	if err != nil {
		return "", fmt.Errorf("上传文件到 COS 失败: %v", err)
	}
	
	// 设置 ACL 为公共读，允许公开访问
	_, err = cosClient.Object.PutACL(context.Background(), objectKey, &cos.ObjectPutACLOptions{
		Header: &cos.ACLHeaderOptions{
			XCosACL: "public-read",
		},
	})
	if err != nil {
		// ACL 设置失败不影响文件上传，只记录警告
		fmt.Printf("[COS] 警告: 设置文件 ACL 失败: %v\n", err)
	}
	
	// 构建文件访问 URL
	var fileURL string
	if cfg.COS.BaseURL != "" {
		// 如果配置了自定义域名，使用自定义域名
		fileURL = fmt.Sprintf("%s/%s", cfg.COS.BaseURL, objectKey)
	} else {
		// 否则使用默认 COS 域名
		fileURL = fmt.Sprintf("https://%s.cos.%s.myqcloud.com/%s", cfg.COS.Bucket, cfg.COS.Region, objectKey)
	}
	
	return fileURL, nil
}

// UploadFileFromMultipart 从 multipart 文件上传到 COS
// file: multipart.File 对象
// filename: 原始文件名
// contentType: 文件 MIME 类型
// 返回: 文件访问 URL 和错误
func UploadFileFromMultipart(file io.Reader, filename string, contentType string) (string, error) {
	// 生成新的文件名（保持扩展名）
	ext := filepath.Ext(filename)
	newFilename := fmt.Sprintf("%s%s",
		time.Now().Format("20060102150405"),
		ext,
	)
	
	return UploadFile(file, newFilename, contentType)
}

// DeleteFile 删除 COS 中的文件
// objectKey: COS 对象键（路径）
func DeleteFile(objectKey string) error {
	if cosClient == nil {
		if err := Init(); err != nil {
			return fmt.Errorf("COS 客户端未初始化: %v", err)
		}
	}
	
	_, err := cosClient.Object.Delete(context.Background(), objectKey)
	if err != nil {
		return fmt.Errorf("删除 COS 文件失败: %v", err)
	}
	
	return nil
}

// GetClient 获取 COS 客户端（用于高级操作）
func GetClient() *cos.Client {
	if cosClient == nil {
		Init()
	}
	return cosClient
}

// maskProxyURL 隐藏代理 URL 中的敏感信息（用于日志）
func maskProxyURL(proxyURL string) string {
	u, err := url.Parse(proxyURL)
	if err != nil {
		return "***"
	}
	if u.User != nil {
		return fmt.Sprintf("%s://***:***@%s", u.Scheme, u.Host)
	}
	return fmt.Sprintf("%s://%s", u.Scheme, u.Host)
}

