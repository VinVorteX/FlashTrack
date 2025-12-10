package controllers

import (
	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/VinVorteX/flashtrack/pkg/database"
	"github.com/gin-gonic/gin"
)

// GetComplaints retrieves all complaints for the user's society with related data
func GetComplaints(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	var complaints []models.Complaint
	query := database.DB.Where("society_id = ?", user.SocietyID)

	// Filter based on role
	switch user.Role {
	case "user":
		// Users see only their own complaints
		query = query.Where("resident_id = ?", user.ID)
	case "staff":
		// Staff see complaints assigned to them
		query = query.Where("staff_id = ?", user.ID)
	case "admin":
		// Admins see all complaints in their society
		// No additional filter needed
	}

	if err := query.Order("created_at DESC").Find(&complaints).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch complaints"})
		return
	}

	// Prepare response with resident and staff details
	type ComplaintResponse struct {
		models.Complaint
		ResidentName string  `json:"resident_name"`
		StaffName    *string `json:"staff_name,omitempty"`
		CategoryName string  `json:"category_name"`
	}

	var response []ComplaintResponse
	// Ensure we always return an array, never null
	if len(complaints) == 0 {
		c.JSON(200, []ComplaintResponse{})
		return
	}
	for _, complaint := range complaints {
		// Get resident name
		var resident models.User
		database.DB.Select("name").First(&resident, complaint.ResidentID)

		// Get staff name if assigned
		var staffName *string
		if complaint.StaffID != nil {
			var staff models.User
			if err := database.DB.Select("name").First(&staff, *complaint.StaffID).Error; err == nil {
				staffName = &staff.Name
			}
		}

		// Get category name
		var category models.Category
		categoryName := "General"
		if err := database.DB.Select("name").First(&category, complaint.CategoryID).Error; err == nil {
			categoryName = category.Name
		}

		response = append(response, ComplaintResponse{
			Complaint:    complaint,
			ResidentName: resident.Name,
			StaffName:    staffName,
			CategoryName: categoryName,
		})
	}

	// Return array directly for frontend compatibility
	c.JSON(200, response)
}

func CreateComplaint(c *gin.Context) {
	var body struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description" binding:"required"`
		CategoryID  uint   `json:"category_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	user := c.MustGet("user").(*models.User)

	complaint := models.Complaint{
		Title:       body.Title,
		Description: body.Description,
		Status:      "pending",
		ResidentID:  user.ID,
		SocietyID:   user.SocietyID,
		CategoryID:  body.CategoryID,
	}

	if err := database.DB.Create(&complaint).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to create complaint"})
		return
	}

	// Get category name
	var category models.Category
	categoryName := "General"
	if err := database.DB.Select("name").First(&category, complaint.CategoryID).Error; err == nil {
		categoryName = category.Name
	}

	// Return complaint with additional details
	c.JSON(200, gin.H{
		"id":            complaint.ID,
		"title":         complaint.Title,
		"description":   complaint.Description,
		"status":        complaint.Status,
		"resident_id":   complaint.ResidentID,
		"resident_name": user.Name,
		"staff_id":      complaint.StaffID,
		"staff_name":    nil,
		"society_id":    complaint.SocietyID,
		"category_id":   complaint.CategoryID,
		"category_name": categoryName,
		"created_at":    complaint.CreatedAt,
		"updated_at":    complaint.UpdatedAt,
	})
}
