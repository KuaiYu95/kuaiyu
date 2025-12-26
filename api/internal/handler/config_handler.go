// Package handler 配置处理器
package handler

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
	"kuaiyu/internal/database"
	"kuaiyu/internal/model"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
)

// ===========================================
// 配置处理器
// ===========================================

// ConfigHandler 配置处理器
type ConfigHandler struct{}

// NewConfigHandler 创建配置处理器
func NewConfigHandler() *ConfigHandler {
	return &ConfigHandler{}
}

// ===========================================
// 公开接口
// ===========================================

// Get 获取公开配置
func (h *ConfigHandler) Get(c *gin.Context) {
	db := database.Get()
	
	var configs []model.SiteConfig
	if err := db.Find(&configs).Error; err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 转换为视图对象
	result := model.SiteConfigVO{}
	
	for _, cfg := range configs {
		switch cfg.Key {
		case constants.ConfigSiteLogo:
			result.SiteLogo = cfg.Value
		case constants.ConfigSiteName:
			result.SiteName = cfg.Value
		case constants.ConfigSiteICP:
			result.SiteICP = cfg.Value
		case constants.ConfigHomeAvatar:
			result.HomeAvatar = cfg.Value
		case constants.ConfigHomeNickname:
			result.HomeNickname = cfg.Value
		case constants.ConfigHomeAbout:
			result.HomeAbout = cfg.Value
		case constants.ConfigFooterLeftImage:
			result.FooterLeftImage = cfg.Value
		case constants.ConfigFooterLeftName:
			result.FooterLeftName = cfg.Value
		case constants.ConfigFooterLeftDescription:
			result.FooterLeftDescription = cfg.Value
		case constants.ConfigFooterRightLinks:
			json.Unmarshal([]byte(cfg.Value), &result.FooterRightLinks)
		}
	}
	
	response.Success(c, result)
}

// ===========================================
// 管理接口
// ===========================================

// AdminGet 管理后台获取配置
func (h *ConfigHandler) AdminGet(c *gin.Context) {
	db := database.Get()
	
	var configs []model.SiteConfig
	if err := db.Find(&configs).Error; err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 转换为 map
	result := make(map[string]interface{})
	for _, cfg := range configs {
		result[cfg.Key] = cfg.ParseValue()
	}
	
	response.Success(c, result)
}

// Update 更新配置
func (h *ConfigHandler) Update(c *gin.Context) {
	var req model.UpdateConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	db := database.Get()
	
	for _, item := range req.Configs {
		var config model.SiteConfig
		result := db.Where("key = ?", item.Key).First(&config)
		
		// 处理值
		var value string
		switch v := item.Value.(type) {
		case string:
			value = v
		default:
			data, _ := json.Marshal(v)
			value = string(data)
		}
		
		if result.Error != nil {
			// 创建新配置
			config = model.SiteConfig{
				Key:   item.Key,
				Value: value,
				Type:  item.Type,
			}
			if config.Type == "" {
				config.Type = "string"
			}
			db.Create(&config)
		} else {
			// 更新现有配置
			config.Value = value
			if item.Type != "" {
				config.Type = item.Type
			}
			db.Save(&config)
		}
	}
	
	response.SuccessMessage(c, constants.MsgUpdateSuccess, nil)
}

