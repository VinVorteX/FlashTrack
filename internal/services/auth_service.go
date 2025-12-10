package services

import (
	"errors"
	"time"

	"github.com/VinVorteX/flashtrack/config"
	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/VinVorteX/flashtrack/internal/repository"
	"github.com/VinVorteX/flashtrack/internal/utils"
)

func Register(user models.User) error {
	hashed := utils.HashPassword(user.Password)
	user.Password = hashed
	return repository.CreateUser(user)
}

func Login(email, password string) (string, models.User, error) {
	user, err := repository.FindUserByEmail(email)
	if err != nil {
		return "", models.User{}, errors.New("user not found")
	}

	if !utils.CheckPassword(user.Password, password) {
		return "", models.User{}, errors.New("wrong password")
	}

	cfg := config.LoadConfig()
	token, err := utils.GenerateJWT(&user, cfg.JWTSecret, 24*time.Hour)
	if err != nil {
		return "", models.User{}, err
	}

	return token, user, nil
}
