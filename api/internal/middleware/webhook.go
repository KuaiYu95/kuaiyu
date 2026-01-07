// Package middleware Webhook 相关中间件
package middleware

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
)

// ===========================================
// 账单 Webhook 鉴权
// ===========================================

const (
	// BillWebhookSecretEnv 环境变量名：账单 Webhook 密钥
	BillWebhookSecretEnv = "BILL_WEBHOOK_SECRET"
	// BillWebhookTimestampHeader 时间戳 Header
	BillWebhookTimestampHeader = "X-Bill-Timestamp"
	// BillWebhookSignatureHeader 签名 Header
	BillWebhookSignatureHeader = "X-Bill-Signature"
	// billWebhookSkew 允许的时间偏移（防重放）
	billWebhookSkew = 5 * time.Minute
)

// BillWebhookAuth 账单 Webhook 鉴权中间件
//
// 签名算法：
//   raw = secret + "\n" + timestamp + "\n" + body
//   signature = HEX( SHA256(raw) )
//
// Header:
//   X-Bill-Timestamp: Unix 时间戳（秒）
//   X-Bill-Signature: 上述 signature
func BillWebhookAuth() gin.HandlerFunc {
	secret := os.Getenv(BillWebhookSecretEnv)

	return func(c *gin.Context) {
		if secret == "" {
			// 未配置密钥时，为避免误用，直接拒绝
			response.InternalError(c, "Webhook 未配置密钥")
			c.Abort()
			return
		}

		tsStr := c.GetHeader(BillWebhookTimestampHeader)
		if tsStr == "" {
			response.BadRequest(c, "缺少时间戳")
			c.Abort()
			return
		}

		sig := c.GetHeader(BillWebhookSignatureHeader)
		if sig == "" {
			response.Unauthorized(c, constants.MsgUnauthorized)
			c.Abort()
			return
		}

		// 校验时间戳窗口，防止重放
		ts, err := strconv.ParseInt(tsStr, 10, 64)
		if err != nil {
			response.BadRequest(c, "无效的时间戳")
			c.Abort()
			return
		}

		now := time.Now()
		tm := time.Unix(ts, 0)
		if tm.Before(now.Add(-billWebhookSkew)) || tm.After(now.Add(billWebhookSkew)) {
			response.Unauthorized(c, "时间戳超出允许范围")
			c.Abort()
			return
		}

		// 读取请求 Body 并恢复，以便后续处理使用
		bodyBytes, err := c.GetRawData()
		if err != nil {
			response.BadRequest(c, "读取请求体失败")
			c.Abort()
			return
		}
		// 重新放回 Body
		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		// 计算签名
		raw := secret + "\n" + tsStr + "\n" + string(bodyBytes)
		sum := sha256.Sum256([]byte(raw))
		expectedSig := hex.EncodeToString(sum[:])

		if !secureCompare(expectedSig, sig) {
			response.Unauthorized(c, constants.MsgInvalidToken)
			c.Abort()
			return
		}

		c.Next()
	}
}

// secureCompare 常量时间比较，避免简单的时序攻击
func secureCompare(a, b string) bool {
	if len(a) != len(b) {
		return false
	}
	var res byte
	for i := 0; i < len(a); i++ {
		res |= a[i] ^ b[i]
	}
	return res == 0
}


