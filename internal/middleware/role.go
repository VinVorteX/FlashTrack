package middleware

import (
	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/gin-gonic/gin"
)

// RoleMiddleware restricts access based on user roles
func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := c.MustGet("user").(*models.User)

		// Check if user's role is in allowed roles
		allowed := false
		for _, role := range allowedRoles {
			if user.Role == role {
				allowed = true
				break
			}
		}

		if !allowed {
			c.JSON(403, gin.H{"error": "access denied: insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}
