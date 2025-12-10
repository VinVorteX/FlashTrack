package controllers

import (
	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/VinVorteX/flashtrack/internal/services"
	"github.com/VinVorteX/flashtrack/pkg/database"
	"github.com/gin-gonic/gin"
)

var notifService = &services.NotificationService{}

func GetStaffMembers(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	var staff []models.User
	if err := database.DB.Where("role = ? AND society_id = ?", "staff", user.SocietyID).Select("id", "name", "email", "role").Find(&staff).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch staff members"})
		return
	}

	c.JSON(200, staff)
}

func AssignStaff(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	// Only admins can assign staff
	if user.Role != "admin" {
		c.JSON(403, gin.H{"error": "only admins can assign staff"})
		return
	}

	var body struct {
		ComplaintID uint `json:"complaint_id" binding:"required"`
		StaffID     uint `json:"staff_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	// Verify complaint exists and belongs to same society
	var complaint models.Complaint
	if err := database.DB.First(&complaint, body.ComplaintID).Error; err != nil {
		c.JSON(404, gin.H{"error": "complaint not found"})
		return
	}

	if complaint.SocietyID != user.SocietyID {
		c.JSON(403, gin.H{"error": "cannot assign staff to complaints from other societies"})
		return
	}

	// Verify staff exists, is actually staff role, and belongs to same society
	var staff models.User
	if err := database.DB.First(&staff, body.StaffID).Error; err != nil {
		c.JSON(404, gin.H{"error": "staff not found"})
		return
	}

	if staff.Role != "staff" {
		c.JSON(400, gin.H{"error": "selected user is not a staff member"})
		return
	}

	if staff.SocietyID != user.SocietyID {
		c.JSON(403, gin.H{"error": "cannot assign staff from other societies"})
		return
	}

	// Update complaint
	complaint.StaffID = &body.StaffID
	complaint.Status = "in-progress"

	if err := database.DB.Save(&complaint).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to assign staff"})
		return
	}

	// Send notification to staff
	if err := notifService.NotifyStaffAssignment(body.StaffID, &complaint); err != nil {
		// Log error but don't fail the request
		c.JSON(200, gin.H{
			"complaint": complaint,
			"message":   "staff assigned successfully, but notification failed",
		})
		return
	}

	c.JSON(200, gin.H{
		"complaint": complaint,
		"message":   "staff assigned and notified successfully",
	})
}
