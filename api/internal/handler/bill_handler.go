// Package handler 账单处理器
package handler

import (
	"fmt"
	"math"
	"time"
	"github.com/gin-gonic/gin"
	"kuaiyu/internal/model"
	"kuaiyu/internal/repository"
	"kuaiyu/pkg/response"
)

// ===========================================
// 账单处理器
// ===========================================

// BillHandler 账单处理器
type BillHandler struct {
	repo *repository.BillRepository
	categoryRepo *repository.CategoryRepository
}

// NewBillHandler 创建账单处理器
func NewBillHandler() *BillHandler {
	return &BillHandler{
		repo: repository.NewBillRepository(),
		categoryRepo: repository.NewCategoryRepository(),
	}
}

// ===========================================
// 管理接口
// ===========================================

// List 获取账单列表
func (h *BillHandler) List(c *gin.Context) {
	page, limit := GetPageParams(c)
	
	// 构建筛选条件
	filters := make(map[string]interface{})
	
	if typeVal := c.Query("type"); typeVal != "" {
		filters["type"] = typeVal
	}
	
	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		if categoryID, err := GetIDParam(c, "category_id"); err == nil {
			filters["category_id"] = categoryID
		}
	}
	
	if startDate := c.Query("start_date"); startDate != "" {
		filters["start_date"] = startDate
	}
	
	if endDate := c.Query("end_date"); endDate != "" {
		filters["end_date"] = endDate
	}
	
	if periodType := c.Query("period_type"); periodType != "" {
		filters["period_type"] = periodType
	}
	
	if isConsumedStr := c.Query("is_consumed"); isConsumedStr != "" {
		filters["is_consumed"] = isConsumedStr == "true"
	}
	
	if refundTypeStr := c.Query("refund_type"); refundTypeStr != "" {
		var refundType int
		if _, err := fmt.Sscanf(refundTypeStr, "%d", &refundType); err == nil {
			filters["refund_type"] = refundType
		}
	}
	
	if search := c.Query("search"); search != "" {
		filters["search"] = search
	}
	
	bills, total, err := h.repo.FindAll(page, limit, filters)
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 转换为列表视图
	items := make([]model.BillListVO, len(bills))
	for i, bill := range bills {
		items[i] = bill.ToListVO()
	}
	
	response.PagedSuccess(c, items, page, limit, total)
}

// Get 获取账单详情
func (h *BillHandler) Get(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的账单 ID")
		return
	}
	
	bill, err := h.repo.FindByID(id)
	if err != nil {
		response.NotFound(c, "账单不存在")
		return
	}
	
	response.Success(c, bill.ToVO())
}

// Create 创建账单
func (h *BillHandler) Create(c *gin.Context) {
	var req model.CreateBillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 根据 category_id 或 category_name 查找分类
	var category *model.Category
	var err error
	
	if req.CategoryID > 0 {
		// 优先使用 category_id
		category, err = h.categoryRepo.FindByID(req.CategoryID)
		if err != nil {
			response.BadRequest(c, "分类不存在")
			return
		}
	} else if req.CategoryName != "" {
		// 如果传了 category_name，根据名称和账单类型查找
		category, err = h.categoryRepo.FindByNameAndType(req.CategoryName, req.Type)
		if err != nil {
			response.BadRequest(c, "分类不存在或名称与类型不匹配")
			return
		}
	} else {
		// 两个都没传
		response.BadRequest(c, "必须提供 category_id 或 category_name")
		return
	}
	
	// 处理金额：如果为负数，转换为绝对值
	amount := req.Amount
	if amount < 0 {
		amount = math.Abs(amount)
	}
	
	// 解析日期
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		response.BadRequest(c, "日期格式错误，应为 YYYY-MM-DD")
		return
	}
	
	// 设置默认值
	periodType := req.PeriodType
	if periodType == "" {
		periodType = "month"
	}
	
	isConsumed := true
	if req.IsConsumed != nil {
		isConsumed = *req.IsConsumed
	}
	
	// 处理退款/代付信息
	refund := req.Refund
	refundType := req.RefundType
	
	// 验证退款/代付金额
	if refund > 0 && refundType == 0 {
		response.BadRequest(c, "退款/代付金额大于0时，必须指定退款类型")
		return
	}
	
	if refund > 0 && (refundType != 1 && refundType != 2) {
		response.BadRequest(c, "退款类型必须为1（退款）或2（代付）")
		return
	}
	
	if refund == 0 {
		refundType = 0
	}
	
	bill := &model.Bill{
		Type:       req.Type,
		CategoryID: req.CategoryID,
		Amount:     amount,
		Desc:       req.Desc,
		Date:       date,
		PeriodType: periodType,
		IsConsumed: isConsumed,
		Refund:     refund,
		RefundType: refundType,
	}
	bill.Category = *category
	
	if err := h.repo.Create(bill); err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 重新加载以获取关联数据
	bill, _ = h.repo.FindByID(bill.ID)
	response.Success(c, bill.ToVO())
}

// Update 更新账单
func (h *BillHandler) Update(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的账单 ID")
		return
	}
	
	// 检查账单是否存在
	bill, err := h.repo.FindByID(id)
	if err != nil {
		response.NotFound(c, "账单不存在")
		return
	}
	
	var req model.UpdateBillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 更新字段
	if req.Type != "" {
		bill.Type = req.Type
	}
	
	if req.CategoryID > 0 {
		// 验证分类是否存在
		category, err := h.categoryRepo.FindByID(req.CategoryID)
		if err != nil {
			response.BadRequest(c, "分类不存在")
			return
		}
		bill.CategoryID = req.CategoryID
		bill.Category = *category
	}
	
	if req.Amount > 0 {
		bill.Amount = req.Amount
	}
	
	if req.Desc != "" {
		bill.Desc = req.Desc
	}
	
	if req.Date != "" {
		date, err := time.Parse("2006-01-02", req.Date)
		if err != nil {
			response.BadRequest(c, "日期格式错误，应为 YYYY-MM-DD")
			return
		}
		bill.Date = date
	}
	
	if req.PeriodType != "" {
		bill.PeriodType = req.PeriodType
	}
	
	if req.IsConsumed != nil {
		bill.IsConsumed = *req.IsConsumed
	}
	
	// 更新退款/代付信息
	if req.Refund > 0 {
		if req.RefundType == 0 {
			response.BadRequest(c, "退款/代付金额大于0时，必须指定退款类型")
			return
		}
		if req.RefundType != 1 && req.RefundType != 2 {
			response.BadRequest(c, "退款类型必须为1（退款）或2（代付）")
			return
		}
		bill.Refund = req.Refund
		bill.RefundType = req.RefundType
	} else if req.RefundType > 0 {
		// 如果只设置了类型但没有金额，清空
		bill.Refund = 0
		bill.RefundType = 0
	}
	
	// 验证退款/代付金额不能超过原金额
	if bill.Refund > bill.Amount {
		response.BadRequest(c, "退款/代付金额不能超过原金额")
		return
	}
	
	if err := h.repo.Update(id, bill); err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 重新加载以获取关联数据
	bill, _ = h.repo.FindByID(id)
	response.Success(c, bill.ToVO())
}

// Delete 删除账单
func (h *BillHandler) Delete(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的账单 ID")
		return
	}
	
	// 检查账单是否存在
	_, err = h.repo.FindByID(id)
	if err != nil {
		response.NotFound(c, "账单不存在")
		return
	}
	
	if err := h.repo.Delete(id); err != nil {
		response.InternalError(c, "")
		return
	}
	
	response.Success(c, nil)
}

// Statistics 获取统计数据
func (h *BillHandler) Statistics(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	
	filters := make(map[string]interface{})
	if typeVal := c.Query("type"); typeVal != "" {
		filters["type"] = typeVal
	}
	if isConsumedStr := c.Query("is_consumed"); isConsumedStr != "" {
		if isConsumedStr == "true" {
			filters["is_consumed"] = true
		} else if isConsumedStr == "false" {
			filters["is_consumed"] = false
		}
	}
	
	stats, err := h.repo.GetStatistics(startDate, endDate, filters)
	if err != nil {
		response.InternalError(c, "")
		return
	}
	
	response.Success(c, stats)
}

// DailyTrend 获取近30天每天的消费趋势
func (h *BillHandler) DailyTrend(c *gin.Context) {
	data, err := h.repo.GetDailyTrend()
	if err != nil {
		response.InternalError(c, "")
		return
	}
	response.Success(c, data)
}

// MonthlyTrend 获取近12个月每月的消费趋势
func (h *BillHandler) MonthlyTrend(c *gin.Context) {
	data, err := h.repo.GetMonthlyTrend()
	if err != nil {
		response.InternalError(c, "")
		return
	}
	response.Success(c, data)
}

// CategoryRanking 获取近12个月不同种类消费排名（全部）
func (h *BillHandler) CategoryRanking(c *gin.Context) {
	data, err := h.repo.GetCategoryRanking()
	if err != nil {
		response.InternalError(c, "")
		return
	}
	response.Success(c, data)
}

// Refund 退款操作
func (h *BillHandler) Refund(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的账单 ID")
		return
	}
	
	// 检查账单是否存在
	bill, err := h.repo.FindByID(id)
	if err != nil {
		response.NotFound(c, "账单不存在")
		return
	}
	
	// 仅支出类型支持退款
	if bill.Type != "expense" {
		response.BadRequest(c, "仅支出类型支持退款")
		return
	}
	
	var req model.RefundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 验证退款金额
	newRefund := bill.Refund + req.Amount
	if newRefund > bill.Amount {
		response.BadRequest(c, "退款金额不能超过原金额")
		return
	}
	
	// 更新退款信息，类型设为1（退款）
	if err := h.repo.UpdateRefundInfo(id, newRefund, 1); err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 重新加载
	bill, _ = h.repo.FindByID(id)
	response.Success(c, bill.ToVO())
}

// ChargeBack 代付操作
func (h *BillHandler) ChargeBack(c *gin.Context) {
	id, err := GetIDParam(c, "id")
	if err != nil {
		response.BadRequest(c, "无效的账单 ID")
		return
	}
	
	// 检查账单是否存在
	bill, err := h.repo.FindByID(id)
	if err != nil {
		response.NotFound(c, "账单不存在")
		return
	}
	
	var req model.ChargeBackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	// 验证代付金额不能超过原金额
	if req.Amount > bill.Amount {
		response.BadRequest(c, "代付金额不能超过原金额")
		return
	}
	
	// 更新代付信息，类型设为2（代付）
	if err := h.repo.UpdateRefundInfo(id, req.Amount, 2); err != nil {
		response.InternalError(c, "")
		return
	}
	
	// 重新加载
	bill, _ = h.repo.FindByID(id)
	response.Success(c, bill.ToVO())
}

