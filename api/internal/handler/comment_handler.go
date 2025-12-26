// Package handler 评论处理器
package handler

import (
	"github.com/gin-gonic/gin"
	"kuaiyu/internal/database"
	"kuaiyu/internal/model"
	"kuaiyu/internal/repository"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
)

// ===========================================
// 评论处理器
// ===========================================

// CommentHandler 评论处理器
type CommentHandler struct {
	repo *repository.CommentRepository
}

// NewCommentHandler 创建评论处理器
func NewCommentHandler() *CommentHandler {
	return &CommentHandler{
		repo: repository.NewCommentRepository(),
	}
}

// ===========================================
// 公开接口
// ===========================================

// List 获取评论列表
func (h *CommentHandler) List(c *gin.Context) {
	postID, _ := GetIDParam(c, "post_id")
	lifeID, _ := GetIDParam(c, "life_record_id")
	userEmail := c.Query("email") // 用户邮箱，用于查询自己的待审核评论
	
	var comments []model.Comment
	var err error
	
	db := database.Get()
	
	if postID > 0 {
		comments, err = h.repo.FindByPostID(postID, true)
		// 追加用户自己的待审核评论
		if userEmail != "" {
			var pendingComments []model.Comment
			db.Where("post_id = ? AND email = ? AND status = ?", postID, userEmail, "pending").
				Order("created_at DESC").Find(&pendingComments)
			comments = append(pendingComments, comments...)
		}
	} else if lifeID > 0 {
		comments, err = h.repo.FindByLifeRecordID(lifeID, true)
		// 追加用户自己的待审核评论
		if userEmail != "" {
			var pendingComments []model.Comment
			db.Where("life_record_id = ? AND email = ? AND status = ?", lifeID, userEmail, "pending").
				Order("created_at DESC").Find(&pendingComments)
			comments = append(pendingComments, comments...)
		}
	} else {
		// 获取最近评论（留言板）
		comments, err = h.repo.FindRecent(20)
		// 追加用户自己的待审核留言板评论
		if userEmail != "" {
			var pendingComments []model.Comment
			db.Where("post_id IS NULL AND life_record_id IS NULL AND email = ? AND status = ?", userEmail, "pending").
				Order("created_at DESC").Find(&pendingComments)
			comments = append(pendingComments, comments...)
		}
	}
	
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 去重（避免已批准的评论重复显示）
	seen := make(map[uint]bool)
	uniqueComments := make([]model.Comment, 0)
	for _, c := range comments {
		if !seen[c.ID] {
			seen[c.ID] = true
			uniqueComments = append(uniqueComments, c)
		}
	}
	comments = uniqueComments
	
	// 转换为视图对象
	items := make([]model.CommentVO, len(comments))
	for i, comment := range comments {
		vo := comment.ToVO()
		
		// 处理回复
		if len(comment.Replies) > 0 {
			replyCount := len(comment.Replies)
			displayLimit := constants.DefaultReplyLimit
			
			if replyCount > displayLimit {
				vo.Replies = make([]model.CommentVO, displayLimit)
				for j := 0; j < displayLimit; j++ {
					vo.Replies[j] = comment.Replies[j].ToVO()
				}
				vo.HasMore = true
			} else {
				vo.Replies = make([]model.CommentVO, replyCount)
				for j, reply := range comment.Replies {
					vo.Replies[j] = reply.ToVO()
				}
			}
			vo.ReplyCount = replyCount
		}
		
		items[i] = vo
	}
	
	response.Success(c, items)
}

// Create 创建评论
func (h *CommentHandler) Create(c *gin.Context) {
	var req model.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 验证必须有关联
	if req.PostID == nil && req.LifeRecordID == nil && req.ParentID == nil {
		response.BadRequest(c, "必须指定评论对象")
		return
	}
	
	// 判断是否首次评论
	isFirst := h.repo.IsFirstComment(req.Email)
	status := string(constants.CommentStatusApproved)
	if isFirst {
		status = string(constants.CommentStatusPending)
	}
	
	comment := model.Comment{
		PostID:       req.PostID,
		LifeRecordID: req.LifeRecordID,
		ParentID:     req.ParentID,
		Nickname:     req.Nickname,
		Email:        req.Email,
		Avatar:       req.Avatar,
		Website:      req.Website,
		Content:      req.Content,
		Status:       status,
		IPAddress:    GetClientIP(c),
		UserAgent:    GetUserAgent(c),
	}
	
	db := database.Get()
	if err := db.Create(&comment).Error; err != nil {
		response.InternalError(c, "评论失败")
		return
	}
	
	message := constants.MsgCommentApproved
	if isFirst {
		message = constants.MsgCommentPending
	}
	
	response.SuccessMessage(c, message, model.CreateCommentResponse{
		ID:      comment.ID,
		Status:  status,
		Message: message,
	})
}

// ===========================================
// 管理接口
// ===========================================

// AdminList 管理后台评论列表
func (h *CommentHandler) AdminList(c *gin.Context) {
	page, limit := GetPageParams(c)
	status := c.Query("status")
	
	comments, total, err := h.repo.FindAll(page, limit, status)
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 获取关联信息
	db := database.Get()
	items := make([]model.CommentListVO, len(comments))
	for i, comment := range comments {
		vo := comment.ToListVO()
		
		// 获取关联文章标题
		if comment.PostID != nil {
			var post model.Post
			if db.First(&post, *comment.PostID).Error == nil {
				vo.PostTitle = post.Title
			}
		}
		
		// 获取关联生活记录标题
		if comment.LifeRecordID != nil {
			var life model.LifeRecord
			if db.First(&life, *comment.LifeRecordID).Error == nil {
				vo.LifeTitle = life.Title
			}
		}
		
		items[i] = vo
	}
	
	response.PagedSuccess(c, items, page, limit, total)
}

// UpdateStatus 更新评论状态
func (h *CommentHandler) UpdateStatus(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	var req model.UpdateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	var comment model.Comment
	db := database.Get()
	if err := db.First(&comment, id).Error; err != nil {
		response.NotFound(c, "评论不存在")
		return
	}
	
	comment.Status = req.Status
	if err := db.Save(&comment).Error; err != nil {
		response.InternalError(c, "更新失败")
		return
	}
	
	response.SuccessMessage(c, constants.MsgUpdateSuccess, comment.ToAdminVO())
}

// Delete 删除评论
func (h *CommentHandler) Delete(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	db := database.Get()
	
	// 删除子评论
	db.Where("parent_id = ?", id).Delete(&model.Comment{})
	
	// 删除评论
	if err := db.Delete(&model.Comment{}, id).Error; err != nil {
		response.InternalError(c, "删除失败")
		return
	}
	
	response.SuccessMessage(c, constants.MsgDeleteSuccess, nil)
}

// AdminReply 管理员回复
func (h *CommentHandler) AdminReply(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	var req model.AdminReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 检查父评论
	var parent model.Comment
	db := database.Get()
	if err := db.First(&parent, id).Error; err != nil {
		response.NotFound(c, "评论不存在")
		return
	}
	
	// 创建管理员回复
	reply := model.Comment{
		PostID:       parent.PostID,
		LifeRecordID: parent.LifeRecordID,
		ParentID:     &id,
		Nickname:     "管理员",
		Email:        "admin@kcat.site",
		Content:      req.Content,
		IsAdmin:      true,
		Status:       string(constants.CommentStatusApproved),
		IPAddress:    GetClientIP(c),
		UserAgent:    GetUserAgent(c),
	}
	
	if err := db.Create(&reply).Error; err != nil {
		response.InternalError(c, "回复失败")
		return
	}
	
	response.Created(c, reply.ToVO())
}

