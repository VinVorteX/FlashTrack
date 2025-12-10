package config

import "os"

type Config struct {
	DBUrl string
	Port string
	JWTSecret string
}

func LoadConfig() *Config{
	return &Config{
		DBUrl: os.Getenv("DB_URL"),
		Port: os.Getenv("PORT"),
		JWTSecret: os.Getenv("JWT_SECRET"),
	}
}