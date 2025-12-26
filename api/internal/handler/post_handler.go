// Package handler 文章处理器
package handler

import (
	"time"

	"github.com/gin-gonic/gin"
	"kuaiyu/internal/database"
	"kuaiyu/internal/middleware"
	"kuaiyu/internal/model"
	"kuaiyu/internal/repository"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
	"kuaiyu/pkg/utils"
)

// ===========================================
// 文章处理器
// ===========================================

// PostHandler 文章处理器
type PostHandler struct {
	repo *repository.PostRepository
}

// NewPostHandler 创建文章处理器
func NewPostHandler() *PostHandler {
	return &PostHandler{
		repo: repository.NewPostRepository(),
	}
}

// ===========================================
// 公开接口
// ===========================================

// List 获取文章列表
func (h *PostHandler) List(c *gin.Context) {
	page, limit := GetPageParams(c)
	tag := c.Query("tag")
	keyword := c.Query("search")
	
	var posts []model.Post
	var total int64
	var err error
	
	if keyword != "" {
		posts, total, err = h.repo.Search(keyword, page, limit)
	} else if tag != "" {
		posts, total, err = h.repo.FindByTag(tag, page, limit)
	} else {
		posts, total, err = h.repo.FindPublished(page, limit)
	}
	
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 转换为列表视图
	items := make([]model.PostListVO, len(posts))
	for i, post := range posts {
		items[i] = post.ToListVO()
	}
	
	response.PagedSuccess(c, items, page, limit, total)
}

// GetBySlug 根据 slug 获取文章详情
func (h *PostHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	
	post, err := h.repo.FindBySlug(slug)
	if err != nil {
		response.NotFound(c, "文章不存在")
		return
	}
	
	// 检查状态
	if post.Status != string(constants.PostStatusPublished) {
		response.NotFound(c, "文章不存在")
		return
	}
	
	response.Success(c, post.ToVO())
}

// IncrementViews 增加阅读量
func (h *PostHandler) IncrementViews(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的文章 ID")
		return
	}

	// 防重复：同一 IP + User-Agent + Post 在 1 小时内只计数一次
	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")
	oneHourAgo := time.Now().Add(-1 * time.Hour)
	
	db := database.Get()
	var existingView model.PageView
	checkErr := db.Where("page_type = ? AND page_id = ? AND ip_address = ? AND user_agent = ? AND created_at > ?",
		"post", id, ipAddress, userAgent, oneHourAgo).
		First(&existingView).Error
	
	// 如果 1 小时内已有相同记录，则不计数
	if checkErr == nil {
		response.Success(c, nil)
		return
	}
	
	// 增加阅读量
	if err := h.repo.IncrementViewCount(id); err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 记录到 page_views 表用于统计分析
	pv := model.PageView{
		PageType:   "post",
		PageID:     &id,
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
		Referer:    c.GetHeader("Referer"),
		DeviceType: detectDeviceType(userAgent),
		Browser:    detectBrowser(userAgent),
		OS:         detectOS(userAgent),
	}
	if err := db.Create(&pv).Error; err != nil {
		// 页面访问记录失败不影响主流程，仅记录日志
		// TODO: 添加日志记录
	}

	response.Success(c, nil)
}

// Featured 获取推荐文章
func (h *PostHandler) Featured(c *gin.Context) {
	limit := 5
	posts, err := h.repo.FindFeatured(limit)
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	items := make([]model.PostListVO, len(posts))
	for i, post := range posts {
		items[i] = post.ToListVO()
	}
	
	response.Success(c, items)
}

// Recent 获取最近文章
func (h *PostHandler) Recent(c *gin.Context) {
	limit := 5
	posts, err := h.repo.FindRecent(limit)
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	items := make([]model.PostListVO, len(posts))
	for i, post := range posts {
		items[i] = post.ToListVO()
	}
	
	response.Success(c, items)
}

// ===========================================
// 管理接口
// ===========================================

// AdminList 管理后台文章列表
func (h *PostHandler) AdminList(c *gin.Context) {
	page, limit := GetPageParams(c)
	status := c.Query("status")
	
	posts, total, err := h.repo.FindAll(page, limit, status)
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	items := make([]model.PostVO, len(posts))
	for i, post := range posts {
		items[i] = post.ToVO()
	}
	
	response.PagedSuccess(c, items, page, limit, total)
}

// AdminGet 管理后台获取文章详情
func (h *PostHandler) AdminGet(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的文章 ID")
		return
	}
	
	post, err := h.repo.FindByID(id)
	if err != nil {
		response.NotFound(c, "文章不存在")
		return
	}
	
	response.Success(c, post.ToVO())
}

// Create 创建文章
func (h *PostHandler) Create(c *gin.Context) {
	var req model.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 生成 slug
	slug := req.Slug
	if slug == "" {
		slug = utils.GenerateSlug(req.Title)
	}
	
	// 检查 slug 是否存在
	if h.repo.SlugExists(slug, 0) {
		slug = slug + "-" + utils.GenerateRandomString(4)
	}
	
	// 生成摘要
	excerpt := req.Excerpt
	if excerpt == "" {
		excerpt = utils.GenerateExcerpt(req.Content, constants.ExcerptMaxLength)
	}
	
	// 创建文章
	post := model.Post{
		Title:      req.Title,
		Slug:       slug,
		Content:    req.Content,
		Excerpt:    excerpt,
		CoverImage: req.CoverImage,
		Status:     req.Status,
		AuthorID:   middleware.GetUserID(c),
	}
	
	// 设置发布时间
	if req.Status == string(constants.PostStatusPublished) {
		now := time.Now()
		post.PublishedAt = &now
	}
	
	if err := h.repo.Create(&post); err != nil {
		response.InternalError(c, "创建失败")
		return
	}
	
	// 更新标签
	if len(req.TagIDs) > 0 {
		h.repo.UpdateTags(&post, req.TagIDs)
	}
	
	// 重新加载关联
	reloadedPost, err := h.repo.FindByID(post.ID)
	if err == nil {
		post = *reloadedPost
	}
	
	response.Created(c, post.ToVO())
}

// Update 更新文章
func (h *PostHandler) Update(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的文章 ID")
		return
	}
	
	var req model.UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	post, err := h.repo.FindByID(id)
	if err != nil {
		response.NotFound(c, "文章不存在")
		return
	}
	
	// 更新字段
	if req.Title != "" {
		post.Title = req.Title
	}
	if req.Slug != "" {
		if h.repo.SlugExists(req.Slug, id) {
			response.BadRequest(c, constants.MsgSlugExists)
			return
		}
		post.Slug = req.Slug
	}
	if req.Content != "" {
		post.Content = req.Content
		if req.Excerpt == "" {
			post.Excerpt = utils.GenerateExcerpt(req.Content, constants.ExcerptMaxLength)
		}
	}
	if req.Excerpt != "" {
		post.Excerpt = req.Excerpt
	}
	if req.CoverImage != "" {
		post.CoverImage = req.CoverImage
	}
	if req.Status != "" {
		// 首次发布设置发布时间
		if req.Status == string(constants.PostStatusPublished) && post.PublishedAt == nil {
			now := time.Now()
			post.PublishedAt = &now
		}
		post.Status = req.Status
	}
	
	if err := h.repo.Update(post); err != nil {
		response.InternalError(c, "更新失败")
		return
	}
	
	// 更新标签
	if req.TagIDs != nil {
		h.repo.UpdateTags(post, req.TagIDs)
	}
	
	// 重新加载
	post, _ = h.repo.FindByID(id)
	
	response.SuccessMessage(c, constants.MsgUpdateSuccess, post.ToVO())
}

// Delete 删除文章
func (h *PostHandler) Delete(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的文章 ID")
		return
	}
	
	post, err := h.repo.FindByID(id)
	if err != nil {
		response.NotFound(c, "文章不存在")
		return
	}
	
	if err := h.repo.Delete(post); err != nil {
		response.InternalError(c, "删除失败")
		return
	}
	
	response.SuccessMessage(c, constants.MsgDeleteSuccess, nil)
}

// ===========================================
// 归档接口
// ===========================================

// Archives 获取归档
func (h *PostHandler) Archives(c *gin.Context) {
	archives, err := h.repo.FindArchives()
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 按年份分组获取文章
	type ArchiveYear struct {
		Year  int                  `json:"year"`
		Posts []model.PostListVO   `json:"posts"`
	}
	
	var result []ArchiveYear
	yearMap := make(map[int][]model.PostListVO)
	
	for _, a := range archives {
		if _, exists := yearMap[a.Year]; !exists {
			posts, _ := h.repo.FindByYear(a.Year)
			items := make([]model.PostListVO, len(posts))
			for i, post := range posts {
				items[i] = post.ToListVO()
			}
			yearMap[a.Year] = items
		}
	}
	
	// 转换为数组
	years := make([]int, 0, len(yearMap))
	for year := range yearMap {
		years = append(years, year)
	}
	
	// 排序（降序）
	for i := 0; i < len(years)-1; i++ {
		for j := i + 1; j < len(years); j++ {
			if years[i] < years[j] {
				years[i], years[j] = years[j], years[i]
			}
		}
	}
	
	for _, year := range years {
		result = append(result, ArchiveYear{
			Year:  year,
			Posts: yearMap[year],
		})
	}
	
	response.Success(c, result)
}

