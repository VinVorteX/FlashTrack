package repository

import (
    "github.com/VinVorteX/flashtrack/internal/models"
    "github.com/VinVorteX/flashtrack/pkg/database"
)

func CreateUser(user models.User) error {
    return database.DB.Create(&user).Error
}

func FindUserByEmail(email string) (models.User, error) {
    var user models.User
    result := database.DB.Where("email = ?", email).First(&user)
    return user, result.Error
}

func FindAdminBySociety(societyID uint) (models.User, error) {
    var user models.User
    result := database.DB.Where("society_id = ? AND role = ?", societyID, "admin").First(&user)
    return user, result.Error
}
