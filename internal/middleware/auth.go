package middleware

import (
    "github.com/VinVorteX/flashtrack/internal/repository"
    "github.com/VinVorteX/flashtrack/internal/utils"
    "github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")

        userFromToken, err := utils.ParseJWT(token)
        if err != nil {
            c.JSON(401, gin.H{"error": "invalid token"})
            c.Abort()
            return
        }

        // Fetch full user data from database to get role
        user, err := repository.FindUserByEmail(userFromToken.Email)
        if err != nil {
            c.JSON(401, gin.H{"error": "user not found"})
            c.Abort()
            return
        }

        c.Set("user", &user)
        c.Next()
    }
}
