package middleware

import (
	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/gin-gonic/gin"
)

func TenantMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		u := c.MustGet("user").(*models.User)
		c.Set("society_id", u.SocietyID)
		c.Next()
	}
}
