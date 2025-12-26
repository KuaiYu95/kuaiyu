package handler

import (
	"sort"
	"strconv"
	
	"github.com/gin-gonic/gin"
	"kuaiyu/internal/database"
	"kuaiyu/internal/model"
	"kuaiyu/internal/repository"
	"kuaiyu/pkg/constants"
	"kuaiyu/pkg/response"
)

type CommentHandler struct {
	repo *repository.CommentRepository
}

func NewCommentHandler() *CommentHandler {
	return &CommentHandler{
		repo: repository.NewCommentRepository(),
	}
}

func (h *CommentHandler) List(c *gin.Context) {
	commentType := c.Query("comment_type") // post | life | guestbook
	targetIDStr := c.Query("target_id")
	postID, _ := GetIDParam(c, "post_id")
	lifeID, _ := GetIDParam(c, "life_record_id")
	isGuestbook := c.Query("is_guestbook") == "true"
	userEmail := c.Query("email")
	
	var comments []model.Comment
	var err error
	var targetID *uint
	
	db := database.Get()
	
	// 确定评论类型和目标ID
	if commentType == "" {
		// 向后兼容：根据旧参数推断类型
		if postID > 0 {
			commentType = "post"
			targetID = &postID
		} else if lifeID > 0 {
			commentType = "life"
			targetID = &lifeID
		} else if isGuestbook {
			commentType = "guestbook"
			targetID = nil
		} else {
			// 默认返回最近评论
			comments, err = h.repo.FindRecent(20)
			if userEmail != "" {
				var pendingComments []model.Comment
				db.Where("comment_type = ? AND email = ? AND status = ?", "guestbook", userEmail, "pending").
					Order("created_at DESC").Find(&pendingComments)
				comments = append(pendingComments, comments...)
			}
			goto processComments
		}
	} else {
		// 使用新的 comment_type 参数
		if targetIDStr != "" {
			if id, err := strconv.ParseUint(targetIDStr, 10, 32); err == nil && id > 0 {
				targetIDVal := uint(id)
				targetID = &targetIDVal
			}
		}
	}
	
	// 根据类型查询评论
	comments, err = h.repo.FindByCommentType(commentType, targetID, true)
	
	// 添加待审核评论（如果提供了用户邮箱）
	if userEmail != "" {
		var pendingComments []model.Comment
		query := db.Where("comment_type = ? AND email = ? AND status = ?", commentType, userEmail, "pending")
		if targetID != nil {
			query = query.Where("target_id = ?", *targetID)
		} else {
			query = query.Where("target_id IS NULL")
		}
		query.Order("created_at DESC").Find(&pendingComments)
		comments = append(pendingComments, comments...)
	}
	
processComments:
	
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	seen := make(map[uint]bool)
	uniqueComments := make([]model.Comment, 0)
	for _, c := range comments {
		if !seen[c.ID] {
			seen[c.ID] = true
			uniqueComments = append(uniqueComments, c)
		}
	}
	comments = uniqueComments
	
	sort.Slice(comments, func(i, j int) bool {
		if comments[i].IsPinned != comments[j].IsPinned {
			return comments[i].IsPinned
		}
		return comments[i].CreatedAt.After(comments[j].CreatedAt)
	})
	
	if len(comments) > 0 {
		commentIDs := make([]uint, len(comments))
		commentMap := make(map[uint]*model.Comment)
		for i := range comments {
			commentIDs[i] = comments[i].ID
			commentMap[comments[i].ID] = &comments[i]
		}
		
		var allReplies []model.Comment
		db.Where("parent_id IN ? AND status = ?", commentIDs, constants.CommentStatusApproved).
			Order("parent_id ASC, created_at ASC").
			Find(&allReplies)
		
		for i := range allReplies {
			reply := allReplies[i]
			if reply.ParentID != nil {
				if parent, exists := commentMap[*reply.ParentID]; exists {
					parent.Replies = append(parent.Replies, reply)
				}
			}
		}
	}
	
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
	
	items := make([]model.CommentVO, len(comments))
	for i, comment := range comments {
		vo := comment.ToVO()
		
		if len(comment.Replies) > 0 {
			vo.Replies = make([]model.CommentVO, len(comment.Replies))
				for j := range comment.Replies {
					vo.Replies[j] = buildReplyVO(&comment.Replies[j], nicknameMap)
				}
			vo.ReplyCount = len(comment.Replies)
		}
		
		items[i] = vo
	}

	response.Success(c, items)
}

func buildReplyVO(reply *model.Comment, nicknameMap map[uint]string) model.CommentVO {
	replyVO := reply.ToVO()
	replyToID := reply.ReplyToID
	if replyToID == nil {
		replyToID = reply.ParentID
	}
	if replyToID != nil {
		if nickname, exists := nicknameMap[*replyToID]; exists {
			replyVO.ParentNickname = nickname
		}
	}
	return replyVO
}

func (h *CommentHandler) Create(c *gin.Context) {
	var req model.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 确定评论类型和目标ID
	var commentType string
	var targetID *uint
	
	if req.CommentType != "" {
		// 使用新字段
		commentType = req.CommentType
		targetID = req.TargetID
	} else {
		// 向后兼容：根据旧字段推断
		if req.IsGuestbook {
			commentType = "guestbook"
			targetID = nil
		} else if req.PostID != nil {
			commentType = "post"
			targetID = req.PostID
		} else if req.LifeRecordID != nil {
			commentType = "life"
			targetID = req.LifeRecordID
		} else if req.ParentID != nil {
			// 如果是回复，需要从父评论获取类型和目标ID
			var parent model.Comment
			db := database.Get()
			if err := db.First(&parent, *req.ParentID).Error; err != nil {
				response.BadRequest(c, "父评论不存在")
				return
			}
			commentType = parent.CommentType
			targetID = parent.TargetID
		} else {
			response.BadRequest(c, "必须指定评论对象")
			return
		}
	}
	
	isFirst := h.repo.IsFirstComment(req.Email)
	status := string(constants.CommentStatusApproved)
	if isFirst {
		status = string(constants.CommentStatusPending)
	}
	
	comment := model.Comment{
		CommentType:  commentType,
		TargetID:     targetID,
		PostID:       req.PostID,       // 保留用于向后兼容
		LifeRecordID: req.LifeRecordID, // 保留用于向后兼容
		ParentID:     req.ParentID,
		ReplyToID:    req.ReplyToID,
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
		
		// 根据 comment_type 和 target_id 获取关联信息
		if comment.CommentType == "post" && comment.TargetID != nil {
			var post model.Post
			if db.First(&post, *comment.TargetID).Error == nil {
				vo.PostTitle = post.Title
			}
		} else if comment.CommentType == "life" && comment.TargetID != nil {
			var life model.LifeRecord
			if db.First(&life, *comment.TargetID).Error == nil {
				vo.LifeTitle = life.Title
			}
		}
		
		// 向后兼容：如果新字段为空，使用旧字段
		if vo.PostTitle == "" && comment.PostID != nil {
			var post model.Post
			if db.First(&post, *comment.PostID).Error == nil {
				vo.PostTitle = post.Title
			}
		}
		if vo.LifeTitle == "" && comment.LifeRecordID != nil {
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
		CommentType:  parent.CommentType,
		TargetID:     parent.TargetID,
		PostID:       parent.PostID,       // 保留用于向后兼容
		LifeRecordID: parent.LifeRecordID, // 保留用于向后兼容
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

