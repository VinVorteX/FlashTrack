package controllers

import (
    "github.com/VinVorteX/flashtrack/internal/models"
    "github.com/VinVorteX/flashtrack/internal/services"
    "github.com/VinVorteX/flashtrack/pkg/database"
    "github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
    var body models.User

    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(400, gin.H{"error": "invalid request"})
        return
    }

    if err := services.Register(body); err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{"message": "registered"})
}

func Login(c *gin.Context) {
    var body struct {
        Email    string
        Password string
    }

    c.BindJSON(&body)

    token, user, err := services.Login(body.Email, body.Password)
    if err != nil {
        c.JSON(401, gin.H{"error": err.Error()})
        return
    }

    // Get society name
    var society models.Society
    societyName := "Unknown"
    if err := database.DB.Select("name").First(&society, user.SocietyID).Error; err == nil {
        societyName = society.Name
    }

    c.JSON(200, gin.H{
        "token": token,
        "user": gin.H{
            "id":           user.ID,
            "name":         user.Name,
            "email":        user.Email,
            "role":         user.Role,
            "society_id":   user.SocietyID,
            "society_name": societyName,
        },
    })
}
