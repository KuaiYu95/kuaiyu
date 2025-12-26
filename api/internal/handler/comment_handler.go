// Package handler 评论处理器
package handler

import (
	"sort"
	
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
	
	// 排序：置顶评论在前，然后按创建时间排序
	sort.Slice(comments, func(i, j int) bool {
		if comments[i].IsPinned != comments[j].IsPinned {
			return comments[i].IsPinned
		}
		return comments[i].CreatedAt.Before(comments[j].CreatedAt)
	})
	
	// 批量加载所有评论的回复（避免 N+1 查询）
	if len(comments) > 0 {
		commentIDs := make([]uint, len(comments))
		commentMap := make(map[uint]*model.Comment)
		for i := range comments {
			commentIDs[i] = comments[i].ID
			commentMap[comments[i].ID] = &comments[i]
		}
		
		// 一次性查询所有回复
		var allReplies []model.Comment
		db.Where("parent_id IN ? AND status = ?", commentIDs, constants.CommentStatusApproved).
			Order("parent_id ASC, created_at ASC").
			Find(&allReplies)
		
		// 将回复分组到对应的父评论
		for i := range allReplies {
			reply := allReplies[i]
			if reply.ParentID != nil {
				if parent, exists := commentMap[*reply.ParentID]; exists {
					parent.Replies = append(parent.Replies, reply)
				}
			}
		}
	}
	
	// 创建所有评论ID到昵称的映射（包括回复的父评论）
	allCommentIDs := make(map[uint]bool)
	for _, comment := range comments {
		allCommentIDs[comment.ID] = true
		if len(comment.Replies) > 0 {
			for _, reply := range comment.Replies {
				allCommentIDs[reply.ID] = true
				if reply.ParentID != nil {
					allCommentIDs[*reply.ParentID] = true
				}
			}
		}
	}
	
	// 批量查询所有需要的评论昵称
	commentIDList := make([]uint, 0, len(allCommentIDs))
	for id := range allCommentIDs {
		commentIDList = append(commentIDList, id)
	}
	
	nicknameMap := make(map[uint]string)
	if len(commentIDList) > 0 {
		var nicknameComments []struct {
			ID       uint
			Nickname string
		}
		db.Model(&model.Comment{}).
			Select("id, nickname").
			Where("id IN ?", commentIDList).
			Find(&nicknameComments)
		
		for _, nc := range nicknameComments {
			nicknameMap[nc.ID] = nc.Nickname
		}
	}
	
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
					vo.Replies[j] = buildReplyVO(&comment.Replies[j], nicknameMap)
				}
				vo.HasMore = true
			} else {
				vo.Replies = make([]model.CommentVO, replyCount)
				for j := range comment.Replies {
					vo.Replies[j] = buildReplyVO(&comment.Replies[j], nicknameMap)
				}
			}
			vo.ReplyCount = replyCount
		}
		
		items[i] = vo
	}

	response.Success(c, items)
}

// buildReplyVO 构建回复的视图对象并填充父评论昵称
func buildReplyVO(reply *model.Comment, nicknameMap map[uint]string) model.CommentVO {
	replyVO := reply.ToVO()
	if reply.ParentID != nil {
		if parentNickname, exists := nicknameMap[*reply.ParentID]; exists {
			replyVO.ParentNickname = parentNickname
		}
	}
	return replyVO
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
	isPinnedStr := c.Query("is_pinned")
	
	var isPinned *bool
	if isPinnedStr == "true" || isPinnedStr == "1" {
		pinned := true
		isPinned = &pinned
	} else if isPinnedStr == "false" || isPinnedStr == "0" {
		pinned := false
		isPinned = &pinned
	}
	
	comments, total, err := h.repo.FindAll(page, limit, status, isPinned)
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

// TogglePin 切换评论置顶状态
func (h *CommentHandler) TogglePin(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的 ID")
		return
	}
	
	var comment model.Comment
	db := database.Get()
	if err := db.First(&comment, id).Error; err != nil {
		response.NotFound(c, "评论不存在")
		return
	}
	
	// 只允许对一级评论（parent_id 为 NULL）进行置顶
	if comment.ParentID != nil {
		response.BadRequest(c, "只能置顶一级评论")
		return
	}
	
	// 切换置顶状态
	comment.IsPinned = !comment.IsPinned
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

