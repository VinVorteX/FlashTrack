package controllers

import (
	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/VinVorteX/flashtrack/pkg/database"
	"github.com/gin-gonic/gin"
)

func SubmitFeedback(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	var body struct {
		ComplaintID uint   `json:"complaint_id" binding:"required"`
		Rating      int    `json:"rating" binding:"required,min=1,max=5"`
		Comment     string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	// Get complaint
	var complaint models.Complaint
	if err := database.DB.First(&complaint, body.ComplaintID).Error; err != nil {
		c.JSON(404, gin.H{"error": "complaint not found"})
		return
	}

	// Verify user owns this complaint
	if complaint.ResidentID != user.ID {
		c.JSON(403, gin.H{"error": "you can only provide feedback for your own complaints"})
		return
	}

	// Verify complaint is resolved
	if complaint.Status != "resolved" {
		c.JSON(400, gin.H{"error": "can only provide feedback for resolved complaints"})
		return
	}

	// Check if feedback already exists
	var existingFeedback models.Feedback
	if err := database.DB.Where("complaint_id = ?", body.ComplaintID).First(&existingFeedback).Error; err == nil {
		c.JSON(400, gin.H{"error": "feedback already submitted for this complaint"})
		return
	}

	// Calculate points based on rating (2 points per star)
	points := body.Rating * 2

	// Create feedback
	feedback := models.Feedback{
		ComplaintID: body.ComplaintID,
		UserID:      user.ID,
		StaffID:     *complaint.StaffID,
		Rating:      body.Rating,
		Comment:     body.Comment,
		Points:      points,
	}

	if err := database.DB.Create(&feedback).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to submit feedback"})
		return
	}

	// Award points to staff based on user feedback
	var staffPoints models.StaffPoints
	if err := database.DB.Where("staff_id = ?", *complaint.StaffID).FirstOrCreate(&staffPoints, models.StaffPoints{StaffID: *complaint.StaffID}).Error; err == nil {
		staffPoints.TotalPoints += points
		staffPoints.TasksCompleted += 1
		database.DB.Save(&staffPoints)
	}

	c.JSON(200, gin.H{
		"message":  "feedback submitted successfully",
		"feedback": feedback,
	})
}

func GetStaffPoints(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	var staffPoints models.StaffPoints
	if err := database.DB.Where("staff_id = ?", user.ID).First(&staffPoints).Error; err != nil {
		// Return zero points if not found
		c.JSON(200, gin.H{
			"total_points":    0,
			"tasks_completed": 0,
		})
		return
	}

	c.JSON(200, staffPoints)
}

func CheckPendingFeedback(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	var body struct {
		ComplaintIDs []uint `json:"complaint_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	// Get complaint IDs that already have feedback
	var existingFeedbacks []models.Feedback
	database.DB.Where("complaint_id IN ? AND user_id = ?", body.ComplaintIDs, user.ID).Find(&existingFeedbacks)

	// Create map of complaint IDs with feedback
	feedbackExists := make(map[uint]bool)
	for _, fb := range existingFeedbacks {
		feedbackExists[fb.ComplaintID] = true
	}

	// Find complaint IDs that need feedback
	var pending []uint
	for _, id := range body.ComplaintIDs {
		if !feedbackExists[id] {
			pending = append(pending, id)
		}
	}

	c.JSON(200, gin.H{"pending": pending})
}

func GetFeedbackForAdmin(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	type FeedbackResponse struct {
		models.Feedback
		ComplaintTitle string `json:"complaint_title"`
		UserName       string `json:"user_name"`
		StaffName      string `json:"staff_name"`
	}

	var feedbacks []models.Feedback
	query := database.DB.Joins("JOIN complaints ON feedbacks.complaint_id = complaints.id").
		Where("complaints.society_id = ?", user.SocietyID).
		Order("feedbacks.created_at DESC")

	if err := query.Find(&feedbacks).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch feedbacks"})
		return
	}

	var response []FeedbackResponse
	for _, fb := range feedbacks {
		var complaint models.Complaint
		var resident models.User
		var staff models.User

		database.DB.Select("title").First(&complaint, fb.ComplaintID)
		database.DB.Select("name").First(&resident, fb.UserID)
		database.DB.Select("name").First(&staff, fb.StaffID)

		response = append(response, FeedbackResponse{
			Feedback:       fb,
			ComplaintTitle: complaint.Title,
			UserName:       resident.Name,
			StaffName:      staff.Name,
		})
	}

	c.JSON(200, response)
}
