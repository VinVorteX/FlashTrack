package utils

import (
	"errors"
	"strings"
	"time"

	"github.com/VinVorteX/flashtrack/config"
	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID    uint   `json:"user_id"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	SocietyID uint   `json:"society_id"`
	jwt.RegisteredClaims
}

// ParseJWT parses and validates a JWT token, returning the user info
func ParseJWT(tokenString string) (*models.User, error) {
	// Remove "Bearer " prefix if present
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	if tokenString == "" {
		return nil, errors.New("token is empty")
	}

	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		// Get secret from environment
		cfg := config.LoadConfig()
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	// Return user info from claims
	return &models.User{
		ID:        claims.UserID,
		Email:     claims.Email,
		SocietyID: claims.SocietyID,
	}, nil
}

// GenerateJWT creates a new JWT token for a user
func GenerateJWT(user *models.User, secret string, duration time.Duration) (string, error) {
	claims := &Claims{
		UserID:    user.ID,
		Email:     user.Email,
		Role:      user.Role,
		SocietyID: user.SocietyID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
