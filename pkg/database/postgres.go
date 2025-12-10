package database

import (
	"github.com/VinVorteX/flashtrack/config"
	"github.com/VinVorteX/flashtrack/internal/models"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect(cfg config.Config) {
	db, err := gorm.Open(postgres.Open(cfg.DBUrl), &gorm.Config{})
	if err != nil {
		panic("failed to connect to database")
	}

	db.AutoMigrate(
		&models.User{},
		&models.Complaint{},
		&models.Society{},
		&models.Category{},
		&models.Notification{},
		&models.Feedback{},
		&models.StaffPoints{},
	)

	DB = db
}
