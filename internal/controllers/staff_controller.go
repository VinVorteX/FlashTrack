package controllers

import (
	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/VinVorteX/flashtrack/pkg/database"
	"github.com/gin-gonic/gin"
	"strconv"
)

func ResolveComplaint(c *gin.Context) {
	user := c.MustGet("user").(*models.User)
	complaintID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid complaint ID"})
		return
	}

	// Get complaint
	var complaint models.Complaint
	if err := database.DB.First(&complaint, complaintID).Error; err != nil {
		c.JSON(404, gin.H{"error": "complaint not found"})
		return
	}

	// Verify complaint is assigned to this staff member
	if complaint.StaffID == nil || *complaint.StaffID != user.ID {
		c.JSON(403, gin.H{"error": "you can only resolve complaints assigned to you"})
		return
	}

	// Verify same society
	if complaint.SocietyID != user.SocietyID {
		c.JSON(403, gin.H{"error": "access denied"})
		return
	}

	// Update status to resolved
	complaint.Status = "resolved"
	if err := database.DB.Save(&complaint).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to resolve complaint"})
		return
	}

	// No points awarded yet - wait for user feedback
	// Points will be awarded when user submits feedback

	c.JSON(200, gin.H{
		"message": "complaint resolved successfully - awaiting user feedback",
		"complaint": complaint,
	})
}
